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

export function createAudioGraph(
  context: AudioContext | null,
): StudioAudioGraph | null {
  if (!context) return null;
  const master = context.createGain();
  master.connect(context.destination);
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
