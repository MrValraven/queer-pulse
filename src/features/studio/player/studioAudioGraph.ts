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

/** A linear ramp from `from` (or the current value) to `to`; zero seconds
 *  sets the value at once. */
export function rampParam(
  param: AudioParam,
  context: BaseAudioContext,
  target: { to: number; seconds: number; from?: number },
): void {
  const now = context.currentTime;
  param.cancelScheduledValues(now);
  if (target.seconds <= 0) {
    param.setValueAtTime(target.to, now);
    return;
  }
  param.setValueAtTime(target.from ?? param.value, now);
  param.linearRampToValueAtTime(target.to, now + target.seconds);
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
