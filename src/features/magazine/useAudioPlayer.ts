import { useCallback, useEffect, useRef, useState } from "react";
import { CHAPTERS, DURATION_SEC } from "./audioPlayer.data";

const SPEED_FACTOR: Record<string, number> = {
  "0.8×": 0.8,
  "1.0×": 1,
  "1.2×": 1.2,
  "1.5×": 1.5,
  "2.0×": 2,
};

export interface AudioPlayer {
  playing: boolean;
  currentTime: number;
  duration: number;
  speed: string;
  /** Index of the chapter currently playing. */
  chapterIndex: number;
  /** Remaining seconds on the sleep timer, or null when off. */
  sleepRemaining: number | null;
  togglePlay: () => void;
  setSpeed: (s: string) => void;
  /** Seek to an absolute time (clamped to [0, duration]). */
  seek: (sec: number) => void;
  /** Seek to a fraction 0–1 of the duration. */
  seekFraction: (fraction: number) => void;
  /** Nudge currentTime by a relative amount (e.g. -15, +30). */
  nudge: (delta: number) => void;
  prevChapter: () => void;
  nextChapter: () => void;
  /** Start a sleep timer for the given minutes (pauses playback at 0). */
  startSleep: (minutes: number) => void;
  cancelSleep: () => void;
}

/**
 * Drives a fully simulated playback timeline in React state — there is no real
 * `<audio>` element. A 1s interval advances `currentTime` while playing,
 * scaled by the chosen speed; the sleep timer counts down in the same tick.
 */
export function useAudioPlayer(): AudioPlayer {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(19 * 60 + 42); // open at the protocol chapter
  const [speed, setSpeed] = useState("1.0×");
  const [sleepRemaining, setSleepRemaining] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep the latest speed available to the tick without re-subscribing.
  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    if (!playing) return;
    intervalRef.current = setInterval(() => {
      const factor = SPEED_FACTOR[speedRef.current] ?? 1;
      setCurrentTime((t) => {
        const next = t + factor;
        if (next >= DURATION_SEC) {
          setPlaying(false);
          return DURATION_SEC;
        }
        return next;
      });
      setSleepRemaining((r) => {
        if (r === null) return r;
        if (r <= 1) {
          setPlaying(false);
          return null;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing]);

  const clamp = useCallback(
    (sec: number) => Math.max(0, Math.min(DURATION_SEC, sec)),
    [],
  );

  const seek = useCallback(
    (sec: number) => setCurrentTime(clamp(sec)),
    [clamp],
  );
  const seekFraction = useCallback(
    (fraction: number) => setCurrentTime(clamp(fraction * DURATION_SEC)),
    [clamp],
  );
  const nudge = useCallback(
    (delta: number) => setCurrentTime((t) => clamp(t + delta)),
    [clamp],
  );

  const togglePlay = useCallback(() => {
    setCurrentTime((t) => (t >= DURATION_SEC ? 0 : t)); // replay from start if finished
    setPlaying((p) => !p);
  }, []);

  const chapterIndex = (() => {
    let idx = 0;
    for (let i = 0; i < CHAPTERS.length; i++) {
      if (currentTime >= CHAPTERS[i]!.sec) idx = i;
    }
    return idx;
  })();

  const prevChapter = useCallback(() => {
    setCurrentTime((t) => {
      // If we're more than 3s into a chapter, restart it; otherwise step back.
      let current = 0;
      for (let i = 0; i < CHAPTERS.length; i++)
        if (t >= CHAPTERS[i]!.sec) current = i;
      const target =
        t - CHAPTERS[current]!.sec > 3 ? current : Math.max(0, current - 1);
      return CHAPTERS[target]!.sec;
    });
  }, []);

  const nextChapter = useCallback(() => {
    setCurrentTime((t) => {
      const next = CHAPTERS.find((c) => c.sec > t + 0.5);
      return next ? next.sec : DURATION_SEC;
    });
  }, []);

  const startSleep = useCallback((minutes: number) => {
    setSleepRemaining(minutes * 60);
    setPlaying(true);
  }, []);
  const cancelSleep = useCallback(() => setSleepRemaining(null), []);

  return {
    playing,
    currentTime,
    duration: DURATION_SEC,
    speed,
    chapterIndex,
    sleepRemaining,
    togglePlay,
    setSpeed,
    seek,
    seekFraction,
    nudge,
    prevChapter,
    nextChapter,
    startSleep,
    cancelSleep,
  };
}
