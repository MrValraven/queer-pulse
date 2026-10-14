import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { fetchStudioStream } from "../../api/studioStream";
import { useStudioPlayer } from "../../player/studioPlayerContext";

export type TimingAudioSource =
  | { kind: "file"; file: File }
  | { kind: "track"; trackId: string; durationSeconds: number | null };

const SILENT_CLOCK_FALLBACK_SECONDS = 300;

/** A quick pause or seek aborts a play: nothing is wrong. A blocked play
 *  just leaves the tool paused; anything else is an audio error. */
function handlePlayRejected(
  error: unknown,
  setIsPlaying: (isPlaying: boolean) => void,
  setHasError: (hasError: boolean) => void,
) {
  if (error instanceof DOMException && error.name === "AbortError") return;
  if (error instanceof DOMException && error.name === "NotAllowedError")
    setIsPlaying(false);
  else setHasError(true);
}

interface SilentClock {
  startedAt: number;
  offset: number;
  duration: number;
}

function silentClockSeconds(clock: SilentClock): number {
  const elapsed = clock.startedAt
    ? (performance.now() - clock.startedAt) / 1000
    : 0;
  return Math.min(clock.duration, clock.offset + elapsed);
}

/** Smooth time for the preview while playing; the silent clock stops itself
 *  at its duration. */
function useSmoothTime({
  isPlaying,
  currentTimeNow,
  audioRef,
  clockRef,
  setCurrentTime,
  setIsPlaying,
}: {
  isPlaying: boolean;
  currentTimeNow: () => number;
  audioRef: RefObject<HTMLAudioElement | null>;
  clockRef: RefObject<SilentClock>;
  setCurrentTime: (seconds: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
}) {
  useEffect(() => {
    if (!isPlaying) return;
    let frame = requestAnimationFrame(function tick() {
      const now = currentTimeNow();
      const clock = clockRef.current;
      if (!audioRef.current && now >= clock.duration) {
        clock.offset = clock.duration;
        clock.startedAt = 0;
        setCurrentTime(clock.duration);
        setIsPlaying(false);
        return;
      }
      setCurrentTime(now);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [
    isPlaying,
    currentTimeNow,
    audioRef,
    clockRef,
    setCurrentTime,
    setIsPlaying,
  ]);
}

/** The main player may still be loading when the tool starts: pause it as
 *  soon as it reports playing. togglePlay only pauses from "playing". */
function useYieldMainPlayer(isToolPlaying: boolean) {
  const { status, togglePlay } = useStudioPlayer();
  useEffect(() => {
    if (isToolPlaying && status === "playing") togglePlay();
  }, [isToolPlaying, status, togglePlay]);
}

/** Adds the listeners; the returned function stops the element and removes
 *  them again. */
function bindAudioListeners(
  audio: HTMLAudioElement,
  listeners: Record<string, () => void>,
): () => void {
  const entries = Object.entries(listeners);
  for (const [type, listener] of entries)
    audio.addEventListener(type, listener);
  return () => {
    audio.pause();
    for (const [type, listener] of entries)
      audio.removeEventListener(type, listener);
    audio.removeAttribute("src");
    audio.load();
  };
}

/** Hands over a seek made while the stream was being read again, once. */
function takePendingSeek(
  pendingSeekRef: RefObject<number | null>,
): number | null {
  const pendingSeek = pendingSeekRef.current;
  pendingSeekRef.current = null;
  return pendingSeek;
}

/**
 * Loads the source into an audio element, or the silent clock when there is
 * no audio URL. When a signed stream URL expires it reads the stream once
 * more and carries on from the same time.
 */
function useTimingSource(source: TimingAudioSource) {
  const { demoMode } = useDemoMode();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clockRef = useRef<SilentClock>({
    startedAt: 0,
    offset: 0,
    duration: SILENT_CLOCK_FALLBACK_SECONDS,
  });
  const [isSilentClock, setIsSilentClock] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  // Also set by play() and pause() so a pause during a retry counts at once.
  const isPlayingRef = useRef(false);
  const lastTimeRef = useRef(0);
  // True from an expired-URL error until the new element is ready: play() on
  // the dead element would only raise a second, false error.
  const isRetryingRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);
  const [initialSource] = useState(source); // fixed for one dialog

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const timingSource = initialSource;
    setIsReady(false);
    setHasError(false);
    setIsSilentClock(false);
    setIsPlaying(false); // a new source starts paused
    isPlayingRef.current = false;
    // A new source starts its clock from zero.
    Object.assign(clockRef.current, {
      startedAt: 0,
      offset: 0,
      duration: SILENT_CLOCK_FALLBACK_SECONDS,
    });
    lastTimeRef.current = 0;
    pendingSeekRef.current = null;
    setCurrentTime(0);
    let objectUrl: string | null = null;
    let isCancelled = false;
    let hasRetried = false;
    // True while the retry's stream is being read: the old element may still
    // fire errors that no longer matter.
    let isFetchingRetry = false;
    let detach: (() => void) | null = null;
    const attach = (url: string, resumeSeconds: number) => {
      detach?.();
      const audio = new Audio(url);
      audio.preload = "auto";
      // Safari drops a currentTime set before the metadata is there.
      const onMetadata = () => {
        audio.removeEventListener("loadedmetadata", onMetadata);
        const target = takePendingSeek(pendingSeekRef) ?? resumeSeconds;
        if (target > 0) audio.currentTime = target;
      };
      let hasResumed = false;
      const onCanPlay = () => {
        setIsReady(true);
        if (!isRetryingRef.current || hasResumed) return;
        hasResumed = true;
        isRetryingRef.current = false;
        setHasError(false);
        const lateSeek = takePendingSeek(pendingSeekRef);
        if (lateSeek !== null) audio.currentTime = lateSeek;
        // The latest intent wins: a pause during the gap stays paused.
        if (!isPlayingRef.current) return;
        void audio.play().then(
          () => setIsPlaying(true),
          (error: unknown) =>
            handlePlayRejected(error, setIsPlaying, setHasError),
        );
      };
      const onError = () => {
        // An expired signed URL fails mid-session: read the stream once more.
        const giveUp = () => {
          isRetryingRef.current = false;
          setIsPlaying(false);
          setHasError(true);
        };
        if (isFetchingRetry) return;
        if (timingSource.kind !== "track" || hasRetried) {
          giveUp();
          return;
        }
        hasRetried = true;
        isFetchingRetry = true;
        const resumeAt = audio.currentTime;
        // The clock holds this time until the new element is ready.
        lastTimeRef.current = resumeAt;
        isRetryingRef.current = true;
        setIsReady(false);
        void fetchStudioStream(demoMode, timingSource.trackId)
          .then((stream) => {
            if (isCancelled) return;
            isFetchingRetry = false;
            if (stream.url) attach(stream.url, resumeAt);
            else giveUp();
          })
          .catch(() => {
            if (isCancelled) return;
            isFetchingRetry = false;
            giveUp();
          });
      };
      audioRef.current = audio;
      detach = bindAudioListeners(audio, {
        loadedmetadata: onMetadata,
        canplay: onCanPlay,
        error: onError,
        ended: () => setIsPlaying(false),
      });
    };
    if (timingSource.kind === "file") {
      objectUrl = URL.createObjectURL(timingSource.file);
      attach(objectUrl, 0);
    } else {
      void fetchStudioStream(demoMode, timingSource.trackId)
        .then((stream) => {
          if (isCancelled) return;
          if (stream.url) attach(stream.url, 0);
          else {
            clockRef.current.duration =
              timingSource.durationSeconds ?? SILENT_CLOCK_FALLBACK_SECONDS;
            setIsSilentClock(true);
            setIsReady(true);
          }
        })
        .catch(() => {
          if (!isCancelled) setHasError(true);
        });
    }
    return () => {
      isCancelled = true;
      isRetryingRef.current = false;
      detach?.();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      audioRef.current = null;
    };
  }, [initialSource, demoMode]);

  return {
    audioRef,
    clockRef,
    isPlayingRef,
    isRetryingRef,
    lastTimeRef,
    pendingSeekRef,
    isSilentClock,
    isReady,
    hasError,
    setHasError,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
  };
}

/**
 * The timing tool's own playback: a local file through an object URL, a
 * saved track through its stream URL, or, with no audio (demo), a silent
 * clock. Starting it pauses the main player.
 */
export function useTimingAudio(source: TimingAudioSource) {
  const player = useStudioPlayer();
  const {
    audioRef,
    clockRef,
    isPlayingRef,
    isRetryingRef,
    lastTimeRef,
    pendingSeekRef,
    isSilentClock,
    isReady,
    hasError,
    setHasError,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
  } = useTimingSource(source);

  const currentTimeNow = useCallback((): number => {
    const audio = audioRef.current;
    if (!audio) return silentClockSeconds(clockRef.current);
    // The retried element reads 0 until its metadata is in: hold the last time.
    if (!isRetryingRef.current) lastTimeRef.current = audio.currentTime;
    return lastTimeRef.current;
  }, [audioRef, clockRef, isRetryingRef, lastTimeRef]);

  useSmoothTime({
    isPlaying,
    currentTimeNow,
    audioRef,
    clockRef,
    setCurrentTime,
    setIsPlaying,
  });

  useYieldMainPlayer(isPlaying);

  const play = useCallback(() => {
    if (isRetryingRef.current) return;
    if (player.status === "playing") player.togglePlay();
    if (audioRef.current) {
      // Set at once so an error while this play is pending keeps the intent.
      isPlayingRef.current = true;
      void audioRef.current.play().then(
        () => setIsPlaying(true),
        (error: unknown) => {
          // The retry's new element resumes the play by itself.
          if (isRetryingRef.current) return;
          isPlayingRef.current = false;
          handlePlayRejected(error, setIsPlaying, setHasError);
        },
      );
      return;
    }
    const clock = clockRef.current;
    if (clock.offset >= clock.duration) clock.offset = 0;
    clockRef.current.startedAt = performance.now();
    isPlayingRef.current = true;
    setIsPlaying(true);
  }, [
    player,
    audioRef,
    clockRef,
    isPlayingRef,
    isRetryingRef,
    setIsPlaying,
    setHasError,
  ]);

  const pause = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    else {
      clockRef.current.offset = currentTimeNow();
      clockRef.current.startedAt = 0;
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
    setCurrentTime(currentTimeNow());
  }, [
    currentTimeNow,
    audioRef,
    clockRef,
    isPlayingRef,
    setIsPlaying,
    setCurrentTime,
  ]);

  const seek = useCallback(
    (seconds: number) => {
      const target = Math.max(0, seconds);
      if (isRetryingRef.current) {
        // The element is being replaced: the new one starts from here.
        pendingSeekRef.current = target;
        lastTimeRef.current = target;
      } else if (audioRef.current) audioRef.current.currentTime = target;
      else {
        clockRef.current.offset = target;
        if (clockRef.current.startedAt)
          clockRef.current.startedAt = performance.now();
      }
      setCurrentTime(target);
    },
    [
      audioRef,
      clockRef,
      isRetryingRef,
      lastTimeRef,
      pendingSeekRef,
      setCurrentTime,
    ],
  );

  return {
    currentTime,
    currentTimeNow,
    isPlaying,
    isReady,
    isSilentClock,
    hasError,
    play,
    pause,
    seek,
  };
}
