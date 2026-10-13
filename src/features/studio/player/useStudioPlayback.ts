import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { studioReleaseQueryOptions } from "../api/useStudioRelease";
import { useStudioAccess } from "../api/useStudioAccess";
import type {
  StudioAudioEngine,
  StudioAudioEngineFactory,
  StudioAudioEvent,
} from "./studioAudioEngine";
import {
  createPlaybackCommands,
  IDLE,
  STOPPED_CLOCK,
} from "./studioPlaybackCommands";
import { queueFromRelease, startIndexFor } from "./studioQueue";
import type {
  StudioPlayerActions,
  StudioPlayerClock,
  StudioPlayerState,
  StudioPlayerValue,
  StudioQueueItem,
} from "./studioPlayerContext";

/** Previous restarts the track when more than this much has played. */
const RESTART_THRESHOLD_SECONDS = 3;
/** Fetch a fresh URL before resuming when the signed one is this close to expiry. */
const EXPIRY_MARGIN_MS = 30_000;
const RELEASE_STALE_MS = 60_000;

/**
 * The player's whole state machine. Playback lives in memory only: nothing
 * about what a member plays is sent anywhere or stored.
 */
export function useStudioPlayback(
  engineFactory: StudioAudioEngineFactory,
  audioElementRef: RefObject<HTMLAudioElement | null>,
): { value: StudioPlayerValue; clock: StudioPlayerClock } {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const access = useStudioAccess();
  const queryClient = useQueryClient();
  const [state, setState] = useState<StudioPlayerState>(IDLE);
  const [clock, setClock] = useState<StudioPlayerClock>(STOPPED_CLOCK);
  const stateRef = useRef(state);
  const clockRef = useRef(clock);
  const engineRef = useRef<StudioAudioEngine | null>(null);
  const expiresAtRef = useRef(0);
  const refreshCountRef = useRef(0);
  const loadTokenRef = useRef(0);
  const sourceTokenRef = useRef(0);
  const resumeAtRef = useRef(0);
  const playRequestRef = useRef(0);
  const shouldStopRef = useRef(false);

  function commit(patch: Partial<StudioPlayerState>) {
    stateRef.current = { ...stateRef.current, ...patch };
    setState(stateRef.current);
  }
  function tick(patch: Partial<StudioPlayerClock>) {
    clockRef.current = { ...clockRef.current, ...patch };
    setClock(clockRef.current);
  }

  // Built per call, from handlers and effects only, so render never reads a ref.
  function commands() {
    return createPlaybackCommands(
      {
        stateRef,
        clockRef,
        engineRef,
        expiresAtRef,
        refreshCountRef,
        loadTokenRef,
        sourceTokenRef,
        resumeAtRef,
      },
      commit,
      tick,
      demoMode,
      queryClient,
    );
  }
  function handleEvent(event: StudioAudioEvent) {
    commands().handleEvent(event);
  }

  async function playQueue(releaseIds: string[], startTrackId?: string) {
    // A stop, a sign-out, a skip or a newer Play while the releases load
    // wins. The current track keeps its events meanwhile.
    playRequestRef.current += 1;
    const request = playRequestRef.current;
    const loadTokenAtStart = loadTokenRef.current;
    // A release that cannot be read (taken down since the page loaded) is
    // skipped. When none can, the page that offered Play shows its own
    // error, so the player stays as it was.
    const results = await Promise.allSettled(
      releaseIds.map((releaseId) => {
        const options = studioReleaseQueryOptions(demoMode, releaseId);
        return queryClient.fetchQuery({
          ...options,
          staleTime: options.staleTime ?? RELEASE_STALE_MS,
        });
      }),
    );
    const queue: StudioQueueItem[] = results.flatMap((result) =>
      result.status === "fulfilled" ? queueFromRelease(result.value) : [],
    );
    // A sign-out or a withdrawn grant while the releases loaded wins too,
    // even when nothing was playing for the stop effect to clear.
    const isSuperseded =
      request !== playRequestRef.current ||
      loadTokenAtStart !== loadTokenRef.current ||
      shouldStopRef.current;
    if (isSuperseded || queue.length === 0) return;
    refreshCountRef.current = 0;
    await commands().loadTrack(queue, startIndexFor(queue, startTrackId), 0);
  }

  const actions: StudioPlayerActions = {
    playRelease: (releaseId, startTrackId) =>
      playQueue([releaseId], startTrackId),
    playReleases: (releaseIds) => playQueue(releaseIds),
    togglePlay: () => {
      const engine = engineRef.current;
      const current = stateRef.current;
      if (!engine || current.queue.length === 0) return;
      // The track is already on its way; a second press waits for it.
      if (current.status === "loading") return;
      if (current.status === "playing") engine.pause();
      else if (current.status === "error") commands().retry();
      else if (Date.now() > expiresAtRef.current - EXPIRY_MARGIN_MS)
        commands().reloadCurrent();
      else void engine.play();
    },
    next: () => {
      const { queue, currentIndex } = stateRef.current;
      if (currentIndex + 1 >= queue.length) return;
      refreshCountRef.current = 0;
      void commands().loadTrack(queue, currentIndex + 1, 0);
    },
    previous: () => {
      const { queue, currentIndex } = stateRef.current;
      if (
        clockRef.current.currentTime > RESTART_THRESHOLD_SECONDS ||
        currentIndex === 0
      ) {
        commands().seek(0);
        return;
      }
      refreshCountRef.current = 0;
      void commands().loadTrack(queue, currentIndex - 1, 0);
    },
    seek: (seconds) => commands().seek(seconds),
    retry: () => commands().retry(),
    stop: () => commands().stop(),
  };

  // Engine events and the stable action proxies always reach this render's
  // functions through refs, so neither the engine nor the context value is
  // rebuilt as playback state changes.
  const handleEventRef = useRef(handleEvent);
  const actionsRef = useRef(actions);
  useEffect(() => {
    handleEventRef.current = handleEvent;
    actionsRef.current = actions;
  });

  useEffect(() => {
    const engine = engineFactory({
      element: audioElementRef.current,
      isSimulated: demoMode,
      durationFor: () => clockRef.current.duration,
    });
    engineRef.current = engine;
    const unsubscribe = engine.subscribe((event) =>
      handleEventRef.current(event),
    );
    const latestActions = actionsRef;
    return () => {
      unsubscribe();
      engine.reset();
      engine.dispose?.();
      engineRef.current = null;
      // A switch between demo and live drops the queue with its engine.
      latestActions.current.stop();
    };
  }, [engineFactory, audioElementRef, demoMode]);

  const shouldStop = !loggedIn || (!access.isPending && !access.hasAccess);
  useEffect(() => {
    shouldStopRef.current = shouldStop;
    if (shouldStop && stateRef.current.queue.length > 0)
      actionsRef.current.stop();
  }, [shouldStop]);

  const stableActions = useMemo<StudioPlayerActions>(
    () => ({
      playRelease: (releaseId, startTrackId) =>
        actionsRef.current.playRelease(releaseId, startTrackId),
      playReleases: (releaseIds) => actionsRef.current.playReleases(releaseIds),
      togglePlay: () => actionsRef.current.togglePlay(),
      next: () => actionsRef.current.next(),
      previous: () => actionsRef.current.previous(),
      seek: (seconds) => actionsRef.current.seek(seconds),
      retry: () => actionsRef.current.retry(),
      stop: () => actionsRef.current.stop(),
    }),
    [],
  );

  const value = useMemo<StudioPlayerValue>(() => {
    const currentItem = state.queue[state.currentIndex] ?? null;
    return {
      ...state,
      ...stableActions,
      currentItem,
      hasPrevious: state.currentIndex > 0,
      hasNext: state.currentIndex + 1 < state.queue.length,
      isCurrentRelease: (releaseId) => currentItem?.releaseId === releaseId,
      isCurrentTrack: (trackId) => currentItem?.trackId === trackId,
    };
  }, [state, stableActions]);

  return { value, clock };
}
