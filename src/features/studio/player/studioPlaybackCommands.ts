import type { QueryClient } from "@tanstack/react-query";
import type { RefObject } from "react";
import { onStudioAccessLost } from "../api/studioQueryKeys";
import { fetchStudioStream } from "../api/studioStream";
import type { StudioAudioEngine, StudioAudioEvent } from "./studioAudioEngine";
import type {
  StudioPlayerClock,
  StudioPlayerState,
  StudioQueueItem,
} from "./studioPlayerContext";

export const IDLE: StudioPlayerState = {
  queue: [],
  currentIndex: 0,
  status: "idle",
};
export const STOPPED_CLOCK: StudioPlayerClock = {
  currentTime: 0,
  duration: null,
};

export interface PlaybackRefs {
  stateRef: RefObject<StudioPlayerState>;
  clockRef: RefObject<StudioPlayerClock>;
  engineRef: RefObject<StudioAudioEngine | null>;
  expiresAtRef: RefObject<number>;
  refreshCountRef: RefObject<number>;
  loadTokenRef: RefObject<number>;
  /** The load token whose source the engine holds. Events count only while
   *  it matches loadTokenRef, so a superseded source cannot move the queue. */
  sourceTokenRef: RefObject<number>;
  /** Where a refresh or Retry picks up: the load's start, then the playhead
   *  while it plays, or the last seek. */
  resumeAtRef: RefObject<number>;
}

/**
 * Loading, failure, engine events, seek and stop for useStudioPlayback. Every
 * read goes through the refs, so a command built on an older render still
 * acts on the latest queue and playhead.
 */
export function createPlaybackCommands(
  refs: PlaybackRefs,
  commit: (patch: Partial<StudioPlayerState>) => void,
  tick: (patch: Partial<StudioPlayerClock>) => void,
  demoMode: boolean,
  queryClient: QueryClient,
) {
  const {
    stateRef,
    clockRef,
    engineRef,
    expiresAtRef,
    refreshCountRef,
    loadTokenRef,
    sourceTokenRef,
    resumeAtRef,
  } = refs;

  async function loadTrack(
    queue: StudioQueueItem[],
    index: number,
    startAtSeconds: number,
  ) {
    const item = queue[index];
    const engine = engineRef.current;
    if (!item || !engine) return;
    loadTokenRef.current += 1;
    const token = loadTokenRef.current;
    // Silence the old source while the new URL loads; its events no longer
    // match the token, so they are dropped.
    engine.pause();
    resumeAtRef.current = startAtSeconds;
    commit({ queue, currentIndex: index, status: "loading" });
    tick({ currentTime: startAtSeconds, duration: item.durationSeconds });
    try {
      const stream = await fetchStudioStream(demoMode, item.trackId);
      if (token !== loadTokenRef.current) return;
      expiresAtRef.current = Date.parse(stream.expiresAt);
      sourceTokenRef.current = token;
      engine.load(stream.url, startAtSeconds);
      await engine.play();
    } catch (error) {
      // A withdrawn grant re-reads GET /studio/me; the gate then shows the
      // teaser and the player stops.
      onStudioAccessLost(queryClient, error);
      if (token === loadTokenRef.current) fail();
    }
  }

  function reloadCurrent() {
    void loadTrack(
      stateRef.current.queue,
      stateRef.current.currentIndex,
      resumeAtRef.current,
    );
  }

  /** One silent refresh of the signed URL, resuming at the same second; a
   *  second failure in a row shows the error with Retry. */
  function fail() {
    if (refreshCountRef.current >= 1) {
      commit({ status: "error" });
      return;
    }
    refreshCountRef.current += 1;
    reloadCurrent();
  }

  function handleEvent(event: StudioAudioEvent) {
    if (sourceTokenRef.current !== loadTokenRef.current) return;
    const { status } = stateRef.current;
    if (event.type === "time") {
      if (status === "playing") resumeAtRef.current = event.seconds;
      tick({ currentTime: event.seconds });
    } else if (event.type === "duration") tick({ duration: event.seconds });
    else if (event.type === "playing") {
      refreshCountRef.current = 0;
      commit({ status: "playing" });
    } else if (event.type === "paused") {
      if (status === "playing") commit({ status: "paused" });
    } else if (event.type === "blocked") {
      if (status === "playing" || status === "loading")
        commit({ status: "paused" });
    } else if (event.type === "ended") {
      const { queue, currentIndex } = stateRef.current;
      if (currentIndex + 1 < queue.length)
        void loadTrack(queue, currentIndex + 1, 0);
      else commit({ status: "paused" });
    } else fail();
  }

  function retry() {
    refreshCountRef.current = 0;
    reloadCurrent();
  }

  function seek(seconds: number) {
    const ceiling = clockRef.current.duration ?? Math.max(seconds, 0);
    const target = Math.min(Math.max(0, seconds), ceiling);
    engineRef.current?.seek(target);
    resumeAtRef.current = target;
    tick({ currentTime: target });
  }

  function stop() {
    loadTokenRef.current += 1;
    refreshCountRef.current = 0;
    resumeAtRef.current = 0;
    engineRef.current?.reset();
    commit(IDLE);
    tick(STOPPED_CLOCK);
  }

  return { loadTrack, reloadCurrent, handleEvent, retry, seek, stop };
}
