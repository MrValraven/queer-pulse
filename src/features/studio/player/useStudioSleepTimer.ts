import { useEffect, useState, type RefObject } from "react";
import type { StudioAudioEngine } from "./studioAudioEngine";
import type {
  StudioPlaybackStatus,
  StudioSleepTimerOption,
  StudioSleepTimerState,
} from "./studioPlayerContext";

export const SLEEP_FADE_SECONDS = 10;
const EARLY_MARGIN_MS = 250;

export interface StudioSleepTimerOptions {
  engineRef: RefObject<StudioAudioEngine | null>;
  readStatus: () => StudioPlaybackStatus;
  pausePlayback: () => void;
}

export interface StudioSleepTimerControls {
  sleepTimer: StudioSleepTimerState;
  startSleepTimer: (option: StudioSleepTimerOption) => void;
  cancelSleepTimer: () => void;
  /** Every time event of the current track (end of track fades here). */
  onTime: (seconds: number, durationSeconds: number | null) => void;
  /** True once when this track's end should stop playback (end of track). */
  consumeTrackEnd: () => boolean;
}

function createSleepTimerControls(
  initialOptions: StudioSleepTimerOptions,
  publish: (state: StudioSleepTimerState) => void,
) {
  let latestOptions = initialOptions;
  const readOptions = () => latestOptions;
  let current: StudioSleepTimerState = null;
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let fadeToken = 0;
  let isFading = false;
  const set = (state: StudioSleepTimerState) => {
    current = state;
    publish(state);
  };
  const clearTimer = () => {
    if (timerId) clearTimeout(timerId);
    timerId = null;
  };
  const stopFade = () => {
    fadeToken += 1;
    if (isFading) readOptions().engineRef.current?.cancelFadeOut();
    isFading = false;
  };
  const finish = () => {
    clearTimer();
    fadeToken += 1;
    isFading = false;
    set(null);
  };
  const cancel = () => {
    clearTimer();
    stopFade();
    if (current !== null) set(null);
  };
  const armTimer = (endsAt: number) => {
    timerId = setTimeout(
      beginFinalFade,
      Math.max(0, endsAt - Date.now() - SLEEP_FADE_SECONDS * 1000),
    );
  };
  function beginFinalFade() {
    timerId = null;
    const { engineRef, readStatus, pausePlayback } = readOptions();
    const engine = engineRef.current;
    const endsAt = current?.kind === "minutes" ? current.endsAt : Date.now();
    const leftMs = endsAt - Date.now();
    if (leftMs > SLEEP_FADE_SECONDS * 1000 + EARLY_MARGIN_MS) {
      armTimer(endsAt);
      return;
    }
    if (!engine || readStatus() !== "playing") {
      finish();
      return;
    }
    if (leftMs <= 0) {
      pausePlayback();
      finish();
      return;
    }
    fadeToken += 1;
    const token = fadeToken;
    isFading = true;
    void engine
      .fadeOut(Math.min(SLEEP_FADE_SECONDS, leftMs / 1000))
      .then((isComplete) => {
        if (token !== fadeToken) return;
        if (!isComplete) {
          // The engine ended the fade itself (pause, skip) and restored the level.
          finish();
          return;
        }
        isFading = false;
        pausePlayback();
        finish();
      });
  }
  return {
    startSleepTimer: (option: StudioSleepTimerOption) => {
      cancel();
      if (option.kind === "endOfTrack") {
        set({ kind: "endOfTrack" });
        return;
      }
      const endsAt = Date.now() + option.minutes * 60_000;
      set({ kind: "minutes", endsAt });
      armTimer(endsAt);
    },
    cancelSleepTimer: cancel,
    onTime: (seconds: number, durationSeconds: number | null) => {
      if (current?.kind !== "endOfTrack" || durationSeconds === null) return;
      const remaining = durationSeconds - seconds;
      if (isFading && remaining > SLEEP_FADE_SECONDS) {
        stopFade();
        return;
      }
      if (isFading || remaining <= 0 || remaining > SLEEP_FADE_SECONDS) return;
      if (readOptions().readStatus() !== "playing") return;
      isFading = true;
      fadeToken += 1;
      const token = fadeToken;
      const fade = readOptions().engineRef.current?.fadeOut(remaining);
      void fade?.then((isComplete) => {
        if (!isComplete && token === fadeToken) isFading = false;
      });
    },
    consumeTrackEnd: () => {
      if (current?.kind !== "endOfTrack") return false;
      finish();
      return true;
    },
    updateOptions: (options: StudioSleepTimerOptions) => {
      latestOptions = options;
    },
    dispose: () => {
      clearTimer();
      fadeToken += 1;
    },
  };
}

/** The sleep timer (spec 7.8): it lives in memory only. */
export function useStudioSleepTimer(
  options: StudioSleepTimerOptions,
): StudioSleepTimerControls {
  const [sleepTimer, setSleepTimer] = useState<StudioSleepTimerState>(null);
  const [controls] = useState(() =>
    createSleepTimerControls(options, setSleepTimer),
  );
  useEffect(() => {
    controls.updateOptions(options);
  });
  useEffect(() => () => controls.dispose(), [controls]);
  return {
    sleepTimer,
    startSleepTimer: controls.startSleepTimer,
    cancelSleepTimer: controls.cancelSleepTimer,
    onTime: controls.onTime,
    consumeTrackEnd: controls.consumeTrackEnd,
  };
}
