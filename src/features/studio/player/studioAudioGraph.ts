import {
  FLAT_EQUALIZER_GAINS,
  isFlatEqualizer,
  readEqualizerGains,
  subscribeEqualizerGains,
} from "./studioPlayerPreferences";

/** One deck's nodes: loudness (the track gain) then fade (crossfade, sleep
 *  timer), both into the master. */
export interface StudioDeckNodes {
  loudness: GainNode;
  fade: GainNode;
}

export interface StudioAudioGraph {
  context: AudioContext;
  /** Routes an element into the graph. A media element can be routed once
   *  in its life; null when the browser refuses. */
  connect: (element: HTMLAudioElement) => StudioDeckNodes | null;
  setMasterLevel: (level: number) => void;
  /** True once the context runs. */
  resume: () => Promise<boolean>;
  close: () => void;
  onStateChange: (
    listener: (state: string) => void,
    signal: AbortSignal,
  ) => void;
}

const MASTER_RAMP_SECONDS = 0.05;

export function gainFromDb(gainDb: number): number {
  return 10 ** (gainDb / 20);
}

// Read through a function so TypeScript keeps no stale narrowing across an
// await (the state changes underneath it).
const stateOf = (context: BaseAudioContext): string => context.state;

/** Points in an equal-power curve past its start: enough for a smooth fade,
 *  small enough to build on every handover. */
const EQUAL_POWER_CURVE_STEPS = 128;

/** Cancels what is scheduled from `now`, then schedules. Where the browser
 *  has `cancelAndHoldAtTime` (Chrome, Safari), a running curve stops at `now`
 *  and holds the level it reached; the spec lets a new event start exactly
 *  where the held curve ends. Elsewhere `cancelScheduledValues` cancels a
 *  curve that is still running too; a browser that keeps it refuses any event
 *  inside it, so on a refusal the whole timeline is cleared and the schedule
 *  runs again. */
function scheduleAfterCancel(
  param: AudioParam,
  now: number,
  schedule: () => void,
): void {
  if (typeof param.cancelAndHoldAtTime === "function")
    param.cancelAndHoldAtTime(now);
  else param.cancelScheduledValues(now);
  try {
    schedule();
  } catch {
    param.cancelScheduledValues(0);
    schedule();
  }
}

/** A linear ramp from `from` (or the current value) to `to`; zero seconds
 *  sets the value at once. */
export function rampParam(
  param: AudioParam,
  context: BaseAudioContext,
  target: { to: number; seconds: number; from?: number },
): void {
  // Read before the cancel: cancelling a running curve can restore the value
  // from before it, so a ramp from a later read would jump and click.
  const level = target.from ?? param.value;
  const now = context.currentTime;
  scheduleAfterCancel(param, now, () => {
    if (target.seconds <= 0) {
      param.setValueAtTime(target.to, now);
      return;
    }
    param.setValueAtTime(level, now);
    param.linearRampToValueAtTime(target.to, now + target.seconds);
  });
}

/** A quarter sine (fading in from 0) or quarter cosine (fading out from
 *  `fromLevel`): the squares of a pair sum to one, so two decks fading
 *  across each other keep a steady loudness. The ends are exact. */
export function equalPowerCurve(
  direction: "in" | "out",
  fromLevel = 1,
  steps = EQUAL_POWER_CURVE_STEPS,
): Float32Array {
  const stepCount = Math.max(1, Math.round(steps));
  const curve = new Float32Array(stepCount + 1);
  for (let index = 0; index <= stepCount; index += 1) {
    const angle = (index / stepCount) * (Math.PI / 2);
    curve[index] =
      direction === "in" ? Math.sin(angle) : fromLevel * Math.cos(angle);
  }
  curve[stepCount] = direction === "in" ? 1 : 0;
  return curve;
}

/** An equal-power fade over `seconds`: in from 0 to 1, or out from the
 *  current level to 0. A browser that refuses value curves gets a linear
 *  ramp to the same end; zero seconds sets the end value at once. */
export function equalPowerParam(
  param: AudioParam,
  context: BaseAudioContext,
  fade: { direction: "in" | "out"; seconds: number },
): void {
  const level = param.value;
  const endLevel = fade.direction === "in" ? 1 : 0;
  if (fade.seconds <= 0) {
    rampParam(param, context, { to: endLevel, seconds: 0 });
    return;
  }
  const curve = equalPowerCurve(fade.direction, level);
  const now = context.currentTime;
  try {
    scheduleAfterCancel(param, now, () =>
      param.setValueCurveAtTime(curve, now, fade.seconds),
    );
  } catch {
    rampParam(param, context, {
      from: fade.direction === "in" ? 0 : level,
      to: endLevel,
      seconds: fade.seconds,
    });
  }
}

// ── Equaliser (PRD-14) ────────────────────────────────────────────────────

export interface StudioEqualizerBand {
  type: BiquadFilterType;
  frequencyHz: number;
  /** Peaking bands only; the shelves ignore it. */
  q: number;
}

/** Five bands, low to high: a low shelf for weight, three broad peaks for
 *  body, voice and presence, a high shelf for air. Broad Q values keep the
 *  curves smooth, so a preset colours the sound and never rings. */
export const STUDIO_EQUALIZER_BANDS: readonly StudioEqualizerBand[] = [
  { type: "lowshelf", frequencyHz: 80, q: 0.7 },
  { type: "peaking", frequencyHz: 250, q: 0.9 },
  { type: "peaking", frequencyHz: 1000, q: 0.9 },
  { type: "peaking", frequencyHz: 3500, q: 0.9 },
  { type: "highshelf", frequencyHz: 10000, q: 0.7 },
];

const EQUALIZER_RAMP_SECONDS = 0.05;
/** Past the ramp to flat, so the chain leaves the graph at unity gain. */
const EQUALIZER_BYPASS_DELAY_MS = 90;

/** The preamp turns the signal down by the largest boost, so a boosted band
 *  never pushes a loud master past full scale. */
function preampDbOf(gainsDb: readonly number[]): number {
  return -Math.max(0, ...gainsDb);
}

interface EqualizerChain {
  preamp: GainNode;
  filters: BiquadFilterNode[];
}

/** The equaliser between the master and the speakers. Flat keeps it out of
 *  the graph (master straight to the destination); the chain is built on
 *  the first non-flat setting and removed again once the gains reach flat.
 *  It only filters what plays: nothing is re-encoded. */
function createEqualizerStage(context: AudioContext, master: GainNode) {
  let chain: EqualizerChain | null = null;
  let bypassTimer: ReturnType<typeof setTimeout> | null = null;
  const clearBypassTimer = () => {
    if (bypassTimer !== null) clearTimeout(bypassTimer);
    bypassTimer = null;
  };
  // Every node starts at unity, so the rewire itself changes nothing the
  // ear can hear; the ramp that follows moves the sound.
  const buildChain = (): EqualizerChain => {
    const preamp = context.createGain();
    const filters = STUDIO_EQUALIZER_BANDS.map((band) => {
      const filter = context.createBiquadFilter();
      filter.type = band.type;
      filter.frequency.value = band.frequencyHz;
      filter.Q.value = band.q;
      filter.gain.value = 0;
      return filter;
    });
    let previous: AudioNode = preamp;
    for (const filter of filters) {
      previous.connect(filter);
      previous = filter;
    }
    previous.connect(context.destination);
    master.disconnect();
    master.connect(preamp);
    return { preamp, filters };
  };
  const removeChain = () => {
    if (!chain) return;
    master.disconnect();
    master.connect(context.destination);
    chain.preamp.disconnect();
    chain.filters.forEach((filter) => filter.disconnect());
    chain = null;
  };
  const rampChain = (target: EqualizerChain, gainsDb: readonly number[]) => {
    target.filters.forEach((filter, index) =>
      rampParam(filter.gain, context, {
        to: gainsDb[index] ?? 0,
        seconds: EQUALIZER_RAMP_SECONDS,
      }),
    );
    rampParam(target.preamp.gain, context, {
      to: gainFromDb(preampDbOf(gainsDb)),
      seconds: EQUALIZER_RAMP_SECONDS,
    });
  };
  return {
    apply: (gainsDb: readonly number[]) => {
      clearBypassTimer();
      if (isFlatEqualizer(gainsDb)) {
        if (!chain) return;
        rampChain(chain, FLAT_EQUALIZER_GAINS);
        bypassTimer = setTimeout(() => {
          bypassTimer = null;
          removeChain();
        }, EQUALIZER_BYPASS_DELAY_MS);
        return;
      }
      try {
        chain ??= buildChain();
      } catch {
        // A browser without biquad filters keeps the plain route.
        return;
      }
      rampChain(chain, gainsDb);
    },
    dispose: clearBypassTimer,
  };
}

// ── The playing stream (PRD-14 format line) ──────────────────────────────

/** The routed element that most recently started playing, and its URL.
 *  Memory only; Now playing's format line reads the stream header from it. */
let playingStream: { element: HTMLAudioElement; url: string } | null = null;
const playingStreamListeners = new Set<() => void>();

function setPlayingStream(next: typeof playingStream): void {
  if (
    next?.element === playingStream?.element &&
    next?.url === playingStream?.url
  )
    return;
  playingStream = next;
  playingStreamListeners.forEach((listener) => listener());
}

/** For useSyncExternalStore: the signed URL of the stream that plays now
 *  through the graph, or null (plain mode, a silent hold, nothing yet). */
export function readPlayingStreamUrl(): string | null {
  return playingStream?.url ?? null;
}

export function subscribePlayingStreamUrl(listener: () => void): () => void {
  playingStreamListeners.add(listener);
  return () => playingStreamListeners.delete(listener);
}

function watchPlayingStream(
  element: HTMLAudioElement,
  signal: AbortSignal,
): void {
  element.addEventListener(
    "playing",
    () => {
      const url = element.currentSrc || element.src;
      setPlayingStream(/^https?:/i.test(url) ? { element, url } : null);
    },
    { signal },
  );
  element.addEventListener(
    "emptied",
    () => {
      if (playingStream?.element === element) setPlayingStream(null);
    },
    { signal },
  );
}

export function createAudioGraph(
  context: AudioContext | null,
): StudioAudioGraph | null {
  if (!context) return null;
  const master = context.createGain();
  master.connect(context.destination);
  const lifetime = new AbortController();
  const equalizer = createEqualizerStage(context, master);
  equalizer.apply(readEqualizerGains());
  const stopEqualizer = subscribeEqualizerGains(() =>
    equalizer.apply(readEqualizerGains()),
  );
  return {
    context,
    connect: (element) => {
      try {
        const source = context.createMediaElementSource(element);
        const loudness = context.createGain();
        const fade = context.createGain();
        source.connect(loudness);
        loudness.connect(fade);
        fade.connect(master);
        watchPlayingStream(element, lifetime.signal);
        return { loudness, fade };
      } catch {
        return null;
      }
    },
    setMasterLevel: (level) =>
      rampParam(master.gain, context, {
        to: level,
        seconds: MASTER_RAMP_SECONDS,
      }),
    resume: async () => {
      if (stateOf(context) === "running") return true;
      try {
        await context.resume();
      } catch {
        return false;
      }
      return stateOf(context) === "running";
    },
    close: () => {
      stopEqualizer();
      equalizer.dispose();
      lifetime.abort();
      setPlayingStream(null);
      void context.close().catch(() => undefined);
    },
    onStateChange: (listener, signal) =>
      context.addEventListener(
        "statechange",
        () => listener(stateOf(context)),
        { signal },
      ),
  };
}

/** Safari 17 and later: ask for a playback audio session, so the lock screen
 *  and the mute switch treat Studio as music. A no-op elsewhere. */
export function preferPlaybackAudioSession(): void {
  try {
    const session = (
      navigator as Navigator & { audioSession?: { type: string } }
    ).audioSession;
    if (session) session.type = "playback";
  } catch {
    // An older browser keeps its default session.
  }
}
