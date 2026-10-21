import type { RefObject } from "react";
import type {
  StudioBufferedRange,
  StudioRemoteState,
} from "./studioPlayerContext";

export type StudioAudioEvent =
  | { type: "time"; seconds: number }
  | { type: "duration"; seconds: number }
  /** The loaded spans of the active deck changed. */
  | { type: "buffered"; ranges: readonly StudioBufferedRange[] }
  | { type: "playing" }
  | { type: "paused" }
  /** The browser refused to start playback without a gesture. */
  | { type: "blocked" }
  | { type: "ended" }
  | { type: "failed" }
  /** The idle deck's source could not load; nothing is preloaded now. */
  | { type: "preloadFailed" }
  /** The session plays plain elements from now on (no crossfade, loudness
   *  only attenuates). */
  | { type: "plainMode" }
  | { type: "remote"; state: StudioRemoteState };

export type StudioHandoverMode = "gapless" | { crossfadeSeconds: number };

export interface StudioRemotePlayback {
  /** Opens the browser's AirPlay or Cast picker. */
  prompt: () => void;
  state: () => StudioRemoteState;
}

/** What the player drives. Live runs two <audio> decks through Web Audio;
 *  demo has no audio files, so it runs a silent clock; tests pass a fake. */
export interface StudioAudioEngine {
  /** Loads the active deck. `gainDb` is the track's loudness gain. */
  load: (sourceUrl: string, startAtSeconds: number, gainDb: number) => void;
  /** Never rejects: a blocked autoplay reads as blocked, a play cut short by
   *  the next load is dropped, anything else reads as failed. */
  play: () => Promise<void>;
  pause: () => void;
  seek: (seconds: number) => void;
  reset: () => void;
  /** Creates or resumes the audio context. Called synchronously inside a
   *  member's gesture (autoplay rules). */
  unlock: () => void;
  /** Loads the idle deck with the next track, without playing it. */
  preload: (sourceUrl: string, gainDb: number) => void;
  cancelPreload: () => void;
  hasPreload: () => boolean;
  /** The idle deck takes over: at once, or with a crossfade. */
  handover: (mode: StudioHandoverMode) => void;
  setVolume: (volume: number) => void;
  setMuted: (isMuted: boolean) => void;
  setLoudnessEven: (isEven: boolean) => void;
  /** Artist kinds: playback speed for both decks, pitch kept. Optional, so
   *  test fakes and older engines stay valid; the player calls it with 1
   *  for music. */
  setPlaybackRate?: (rate: number) => void;
  /** Fades the active deck to silence; true when the fade ran its course,
   *  false when it was cancelled. The caller pauses afterwards. */
  fadeOut: (seconds: number) => Promise<boolean>;
  cancelFadeOut: () => void;
  /** Retries on fresh elements with no crossOrigin and no graph. False when
   *  the engine already plays plain (or has nothing to fall back from). */
  enterPlainMode: () => boolean;
  isPlainMode: () => boolean;
  readonly remote: StudioRemotePlayback | null;
  subscribe: (listener: (event: StudioAudioEvent) => void) => () => void;
  /** Detaches the engine from its elements for good (the provider's cleanup). */
  dispose?: () => void;
}

export type StudioDeckElements = readonly [
  HTMLAudioElement | null,
  HTMLAudioElement | null,
];
export type StudioDeckRefs = readonly [
  RefObject<HTMLAudioElement | null>,
  RefObject<HTMLAudioElement | null>,
];

export type StudioAudioEngineFactory = (options: {
  decks: StudioDeckElements;
  isSimulated: boolean;
  durationFor: () => number | null;
}) => StudioAudioEngine;

export function createListeners() {
  const listeners = new Set<(event: StudioAudioEvent) => void>();
  return {
    emit: (event: StudioAudioEvent) =>
      listeners.forEach((listener) => listener(event)),
    subscribe: (listener: (event: StudioAudioEvent) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

const SIMULATED_TICK_MS = 250;

/** Demo playback: a clock that advances while "playing" and ends on time.
 *  Every control works on it: preload and handover restart the clock for the
 *  next track, fades finish on a timer, levels are accepted and ignored. */
export function createSimulatedAudioEngine(
  durationFor: () => number | null,
): StudioAudioEngine {
  const { emit, subscribe } = createListeners();
  let seconds = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  let hasPreloaded = false;
  let fadeTimer: ReturnType<typeof setTimeout> | null = null;
  let settleFade: ((isComplete: boolean) => void) | null = null;
  // Artist kinds: an episode's speed moves the simulated clock as well.
  let playbackRate = 1;
  const halt = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };
  const endFade = (isComplete: boolean) => {
    if (fadeTimer) clearTimeout(fadeTimer);
    fadeTimer = null;
    const settle = settleFade;
    settleFade = null;
    settle?.(isComplete);
  };
  const startClock = () => {
    halt();
    emit({ type: "playing" });
    timer = setInterval(() => {
      seconds += (SIMULATED_TICK_MS / 1000) * playbackRate;
      const duration = durationFor();
      if (duration !== null && seconds >= duration) {
        halt();
        emit({ type: "ended" });
        return;
      }
      emit({ type: "time", seconds });
    }, SIMULATED_TICK_MS);
  };
  return {
    load: (_sourceUrl, startAtSeconds) => {
      halt();
      endFade(false);
      seconds = startAtSeconds;
      const duration = durationFor();
      if (duration !== null) {
        emit({ type: "duration", seconds: duration });
        emit({
          type: "buffered",
          ranges: [{ startSeconds: 0, endSeconds: duration }],
        });
      }
      emit({ type: "time", seconds });
    },
    play: () => {
      // Like the <audio> element, playing a finished track starts it over.
      const duration = durationFor();
      if (duration !== null && seconds >= duration) seconds = 0;
      startClock();
      return Promise.resolve();
    },
    pause: () => {
      halt();
      endFade(false);
      emit({ type: "paused" });
    },
    seek: (target) => {
      seconds = target;
      emit({ type: "time", seconds });
    },
    reset: () => {
      halt();
      endFade(false);
      seconds = 0;
      hasPreloaded = false;
    },
    unlock: () => {},
    preload: () => {
      hasPreloaded = true;
    },
    cancelPreload: () => {
      hasPreloaded = false;
    },
    hasPreload: () => hasPreloaded,
    handover: () => {
      hasPreloaded = false;
      seconds = 0;
      const duration = durationFor();
      if (duration !== null)
        emit({
          type: "buffered",
          ranges: [{ startSeconds: 0, endSeconds: duration }],
        });
      emit({ type: "time", seconds });
      if (!timer) startClock();
    },
    setVolume: () => {},
    setMuted: () => {},
    setLoudnessEven: () => {},
    setPlaybackRate: (rate) => {
      playbackRate = rate;
    },
    fadeOut: (fadeSeconds) =>
      new Promise<boolean>((resolve) => {
        endFade(false);
        settleFade = resolve;
        fadeTimer = setTimeout(() => endFade(true), fadeSeconds * 1000);
      }),
    cancelFadeOut: () => endFade(false),
    enterPlainMode: () => false,
    isPlainMode: () => false,
    remote: null,
    subscribe,
    dispose: () => {
      halt();
      endFade(false);
    },
  };
}
