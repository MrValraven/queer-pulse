export type StudioAudioEvent =
  | { type: "time"; seconds: number }
  | { type: "duration"; seconds: number }
  | { type: "playing" }
  | { type: "paused" }
  /** The browser refused to start playback without a gesture. */
  | { type: "blocked" }
  | { type: "ended" }
  | { type: "failed" };

/** What the provider drives. Live wraps the one <audio> element; demo has no
 *  audio files, so it runs a silent clock; tests pass a fake. */
export interface StudioAudioEngine {
  load: (sourceUrl: string, startAtSeconds: number) => void;
  /** Never rejects: a blocked autoplay reads as blocked, a play cut short by
   *  the next load is dropped, anything else reads as failed. */
  play: () => Promise<void>;
  pause: () => void;
  seek: (seconds: number) => void;
  reset: () => void;
  subscribe: (listener: (event: StudioAudioEvent) => void) => () => void;
  /** Detaches the engine from its element for good (the provider's cleanup). */
  dispose?: () => void;
}

export type StudioAudioEngineFactory = (options: {
  element: HTMLAudioElement | null;
  isSimulated: boolean;
  durationFor: () => number | null;
}) => StudioAudioEngine;

function createListeners() {
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

/**
 * The <audio> element loads the signed URL directly. It never sets
 * `crossOrigin`, so byte-range requests work without bucket CORS.
 */
export function createElementAudioEngine(
  element: HTMLAudioElement,
): StudioAudioEngine {
  const { emit, subscribe } = createListeners();
  const detach = new AbortController();
  const listen = (type: string, handler: () => void) =>
    element.addEventListener(type, handler, { signal: detach.signal });
  // The one start position still waiting for its source's metadata. A newer
  // load or a reset replaces it, so an older load's seek never lands.
  let pendingStartSeconds = 0;
  listen("loadedmetadata", () => {
    if (pendingStartSeconds > 0) element.currentTime = pendingStartSeconds;
    pendingStartSeconds = 0;
  });
  listen("timeupdate", () =>
    emit({ type: "time", seconds: element.currentTime }),
  );
  listen("durationchange", () => {
    if (Number.isFinite(element.duration))
      emit({ type: "duration", seconds: element.duration });
  });
  listen("playing", () => emit({ type: "playing" }));
  listen("pause", () => emit({ type: "paused" }));
  listen("ended", () => emit({ type: "ended" }));
  // The single source of `failed` for a broken source: the pending play()
  // rejects for the same failure, and that path stays quiet.
  listen("error", () => {
    if (element.getAttribute("src")) emit({ type: "failed" });
  });
  return {
    load: (sourceUrl, startAtSeconds) => {
      pendingStartSeconds = startAtSeconds;
      element.src = sourceUrl;
      element.load();
    },
    play: async () => {
      try {
        await element.play();
      } catch (error) {
        const errorName = error instanceof DOMException ? error.name : "";
        // AbortError: a newer load replaced this source before it started.
        // element.error: the error listener has already reported it.
        if (errorName === "AbortError" || element.error) return;
        emit(
          errorName === "NotAllowedError"
            ? { type: "blocked" }
            : { type: "failed" },
        );
      }
    },
    pause: () => element.pause(),
    seek: (seconds) => {
      element.currentTime = seconds;
    },
    reset: () => {
      pendingStartSeconds = 0;
      element.pause();
      element.removeAttribute("src");
      element.load();
    },
    subscribe,
    dispose: () => detach.abort(),
  };
}

const SIMULATED_TICK_MS = 250;

/** Demo playback: a clock that advances while "playing" and ends on time. */
export function createSimulatedAudioEngine(
  durationFor: () => number | null,
): StudioAudioEngine {
  const { emit, subscribe } = createListeners();
  let seconds = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  const halt = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };
  return {
    load: (_sourceUrl, startAtSeconds) => {
      halt();
      seconds = startAtSeconds;
      const duration = durationFor();
      if (duration !== null) emit({ type: "duration", seconds: duration });
      emit({ type: "time", seconds });
    },
    play: () => {
      halt();
      // Like the <audio> element, playing a finished track starts it over.
      const startDuration = durationFor();
      if (startDuration !== null && seconds >= startDuration) seconds = 0;
      emit({ type: "playing" });
      timer = setInterval(() => {
        seconds += SIMULATED_TICK_MS / 1000;
        const duration = durationFor();
        if (duration !== null && seconds >= duration) {
          halt();
          emit({ type: "ended" });
          return;
        }
        emit({ type: "time", seconds });
      }, SIMULATED_TICK_MS);
      return Promise.resolve();
    },
    pause: () => {
      halt();
      emit({ type: "paused" });
    },
    seek: (target) => {
      seconds = target;
      emit({ type: "time", seconds });
    },
    reset: () => {
      halt();
      seconds = 0;
    },
    subscribe,
    dispose: halt,
  };
}

export const createDefaultAudioEngine: StudioAudioEngineFactory = ({
  element,
  isSimulated,
  durationFor,
}) =>
  isSimulated || !element
    ? createSimulatedAudioEngine(durationFor)
    : createElementAudioEngine(element);
