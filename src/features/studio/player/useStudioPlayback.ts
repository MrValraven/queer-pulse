import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import type { StudioReleaseView } from "../api/studio.adapters";
import { studioKeys } from "../api/studioQueryKeys";
import { useStudioAccess } from "../api/useStudioAccess";
import type {
  StudioAudioEngine,
  StudioAudioEngineFactory,
  StudioAudioEvent,
  StudioDeckRefs,
} from "./studioAudioEngine";
import {
  createPlaybackCommands,
  STOPPED_PLAYHEAD,
  type PlaybackCommands,
  type PlaybackRefs,
  type StudioPlayhead,
} from "./studioPlaybackCommands";
import type {
  StudioPlaybackStatus,
  StudioPlayerActions,
  StudioPlayerClock,
  StudioPlayerValue,
  StudioSleepTimerState,
} from "./studioPlayerContext";
import { radioSessionOf } from "./studioQueue";
import { createQueueActions } from "./studioQueueActions";
import {
  EMPTY_QUEUE_STATE,
  hasPreviousItem,
  peekNext,
  studioQueueReducer,
  toQueueView,
  type StudioQueueAction,
  type StudioQueueState,
} from "./studioQueueReducer";
import { createStableActions } from "./studioStableActions";
import { createTransportActions } from "./studioTransportActions";
import {
  studioClockIndexes,
  useStudioCurrentTrackDetail,
  type StudioCurrentTrackDetail,
} from "./useStudioCurrentTrackDetail";
import { useStudioDecks, type StudioDecks } from "./useStudioDecks";
import { useStudioEpisodeRate } from "./useStudioEpisodeRate";
import {
  useStudioPlayerPreferences,
  type StudioPlayerPreferenceControls,
} from "./useStudioPlayerPreferences";
import { useStudioQueuePersistence } from "./useStudioQueuePersistence";
import {
  SLEEP_FADE_SECONDS,
  useStudioSleepTimer,
  type StudioSleepTimerControls,
} from "./useStudioSleepTimer";

/** State mirrored in a ref, so handlers built on an older render act on the
 *  latest value. */
function useMirroredState<Value>(initial: Value) {
  const [value, setValue] = useState(initial);
  const ref = useRef(value);
  const set = (next: Value) => {
    ref.current = next;
    setValue(next);
  };
  return [value, ref, set] as const;
}

/** The sleep timer owns the level at the end of the track, and during its
 *  own final fade: the handover then stays a gapless swap. */
function isSleepTimerHoldingCrossfade(
  sleepTimer: StudioSleepTimerState,
  nowMs: number,
): boolean {
  if (sleepTimer === null) return false;
  if (sleepTimer.kind === "endOfTrack") return true;
  return sleepTimer.endsAt - nowMs <= SLEEP_FADE_SECONDS * 1000;
}

/** The context value and the clock, memoized: the value changes with the
 *  player's state, the clock with the playhead. The clock reads the chapter
 *  and lyric start lists only, so the detail never rides on a tick. */
function usePlayerValue(input: {
  stableActions: StudioPlayerActions;
  status: StudioPlaybackStatus;
  queueState: StudioQueueState;
  playhead: StudioPlayhead;
  preferences: StudioPlayerPreferenceControls;
  decks: StudioDecks;
  sleepTimer: StudioSleepTimerState;
  detail: StudioCurrentTrackDetail;
}): { value: StudioPlayerValue; clock: StudioPlayerClock } {
  const { stableActions, status, queueState, playhead, decks, detail } = input;
  const { preferences, playbackSettings } = input.preferences;
  const { sleepTimer } = input;
  const value = useMemo<StudioPlayerValue>(() => {
    const current = queueState.current;
    const { hideExplicit } = playbackSettings;
    return {
      ...stableActions,
      status,
      queue: toQueueView(queueState),
      hasQueue: current !== null,
      currentItem: current,
      hasPrevious: hasPreviousItem(queueState, hideExplicit),
      hasNext: peekNext(queueState, true, hideExplicit) !== null,
      isCurrentRelease: (releaseId) => current?.releaseId === releaseId,
      isCurrentTrack: (trackId) => current?.trackId === trackId,
      preferences,
      playbackSettings,
      radio: radioSessionOf(queueState.source, queueState.originalSourceItems),
      isPlainMode: decks.isPlainMode,
      sleepTimer,
      remote: decks.remote,
      currentWaveform: detail.waveform,
      currentChapters: detail.chapters,
      currentSyncedLyrics: detail.syncedLyrics,
    };
  }, [
    stableActions,
    status,
    queueState,
    preferences,
    playbackSettings,
    decks.isPlainMode,
    decks.remote,
    sleepTimer,
    detail.waveform,
    detail.chapters,
    detail.syncedLyrics,
  ]);

  const { chapterStartsSeconds, lyricStartsSeconds } = detail;
  const clock = useMemo<StudioPlayerClock>(
    () => ({
      currentTime: playhead.currentTime,
      duration: playhead.duration,
      ...studioClockIndexes(playhead.currentTime, {
        chapterStartsSeconds,
        lyricStartsSeconds,
      }),
    }),
    [playhead, chapterStartsSeconds, lyricStartsSeconds],
  );
  return { value, clock };
}

/** The engine's decks, wired to the queue, the preferences and the sleep
 *  timer. Every callback reads the latest render through the decks hook. */
function useWiredDecks(input: {
  engineFactory: StudioAudioEngineFactory;
  deckRefs: StudioDeckRefs;
  engineRef: RefObject<StudioAudioEngine | null>;
  queueState: StudioQueueState;
  readQueue: () => StudioQueueState;
  readStatus: () => StudioPlaybackStatus;
  readDuration: () => number | null;
  preferences: StudioPlayerPreferenceControls;
  sleep: StudioSleepTimerControls;
  onEngineReady: () => void;
  commandsRef: RefObject<() => PlaybackCommands>;
  handleEventRef: RefObject<(event: StudioAudioEvent) => void>;
}): StudioDecks {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { preferences, sleep, commandsRef } = input;
  return useStudioDecks({
    engineRef: input.engineRef,
    engineFactory: input.engineFactory,
    deckRefs: input.deckRefs,
    demoMode,
    nextEntryId:
      peekNext(
        input.queueState,
        false,
        preferences.playbackSettings.hideExplicit,
      )?.queueEntryId ?? null,
    durationFor: input.readDuration,
    readQueue: input.readQueue,
    readStatus: input.readStatus,
    readCrossfadeSeconds: () => preferences.readPreferences().crossfadeSeconds,
    readPlaybackSettings: preferences.readPlaybackSettings,
    releaseTrackIdsFor: (releaseId) =>
      queryClient
        .getQueryData<StudioReleaseView>(
          studioKeys.release(demoMode, releaseId),
        )
        ?.tracks.map((track) => track.id) ?? null,
    shouldHoldCrossfade: () =>
      isSleepTimerHoldingCrossfade(sleep.sleepTimer, Date.now()),
    onEvent: (event) => input.handleEventRef.current(event),
    onEngineReady: (engine) => {
      input.onEngineReady();
      preferences.applyTo(engine);
    },
    // A switch between demo and live drops the queue with its engine.
    onEngineGone: () => commandsRef.current().resetPlayback(),
    onCrossfadeStart: (next, preload, seconds) =>
      commandsRef.current().crossfadeTo(next, preload, seconds),
  });
}

/**
 * The player's state machine, composed from small hooks: the queue reducer,
 * the decks (engine, preload, crossfade), the saved queue, the device
 * preferences, the sleep timer and the current track's detail. Nothing about
 * what a member plays is sent anywhere; the queue stays in this tab.
 */
export function useStudioPlayback(
  engineFactory: StudioAudioEngineFactory,
  deckRefs: StudioDeckRefs,
): { value: StudioPlayerValue; clock: StudioPlayerClock } {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, user } = useAuth();
  const access = useStudioAccess();
  const queryClient = useQueryClient();
  const [queueState, queueRef, setQueueState] =
    useMirroredState<StudioQueueState>(EMPTY_QUEUE_STATE);
  const [status, statusRef, setStatus] =
    useMirroredState<StudioPlaybackStatus>("idle");
  const [playhead, playheadRef, setPlayhead] =
    useMirroredState<StudioPlayhead>(STOPPED_PLAYHEAD);
  const engineRef = useRef<StudioAudioEngine | null>(null);
  const timingRefs = {
    expiresAtRef: useRef(0),
    refreshCountRef: useRef(0),
    hasTriedPlainModeRef: useRef(false),
    loadTokenRef: useRef(0),
    sourceTokenRef: useRef(0),
    resumeAtRef: useRef(0),
    intentTokenRef: useRef(0),
  };
  const playRequestRef = useRef(0);
  const shouldStopRef = useRef(false);
  const handleEventRef = useRef<(event: StudioAudioEvent) => void>(() => {});
  // Function declarations hoist: this is the first render's `commands`,
  // which the restore at mount uses; the effect below keeps it current.
  const commandsRef = useRef(commands);

  const preferences = useStudioPlayerPreferences(engineRef);
  const sleep = useStudioSleepTimer({
    engineRef,
    readStatus: () => statusRef.current,
    pausePlayback: () => engineRef.current?.pause(),
  });
  const decks = useWiredDecks({
    engineFactory,
    deckRefs,
    engineRef,
    queueState,
    readQueue: () => queueRef.current,
    readStatus: () => statusRef.current,
    readDuration: () => playheadRef.current.duration,
    preferences,
    sleep,
    onEngineReady: () => {
      timingRefs.hasTriedPlainModeRef.current = false;
    },
    commandsRef,
    handleEventRef,
  });

  function dispatch(action: StudioQueueAction): StudioQueueState {
    const next = studioQueueReducer(queueRef.current, action);
    setQueueState(next);
    return next;
  }
  const refs: PlaybackRefs = {
    queueRef,
    statusRef,
    playheadRef,
    engineRef,
    ...timingRefs,
  };
  // Built per call, from handlers and effects only, so render never reads a ref.
  function commands() {
    return createPlaybackCommands(refs, {
      dispatch,
      setStatus,
      tick: (patch) => setPlayhead({ ...playheadRef.current, ...patch }),
      decks,
      sleep,
      readPlaybackSettings: preferences.readPlaybackSettings,
      demoMode,
      queryClient,
    });
  }

  // Signed in with a grant. GET /studio/me keeps its data while it
  // refetches, so this holds steady; while either read is pending the
  // session is unsettled and nothing is cleared.
  const hasStudioAccess = loggedIn && access.status === "granted";
  const persistence = useStudioQueuePersistence({
    memberId: user?.id ?? null,
    demoMode,
    isSessionSettled: !checking && !access.isPending,
    hasAccess: hasStudioAccess,
    queueState,
    isPlaying: status === "playing",
    readQueue: () => queueRef.current,
    readPositionSeconds: () => timingRefs.resumeAtRef.current,
    onRestore: (snapshot) => commandsRef.current().restoreCued(snapshot),
    // Another member's queue: stop it and empty the reducer.
    onReset: () => commandsRef.current().resetPlayback(),
  });

  // Built per call, like commands(), so render never hands the refs on.
  function buildActions(): StudioPlayerActions {
    const dependencies = {
      refs,
      playRequestRef,
      shouldStopRef,
      dispatch,
      commands,
      readPlaybackSettings: preferences.readPlaybackSettings,
      demoMode,
      queryClient,
      clearSavedQueue: persistence.clearSavedQueue,
    };
    return {
      ...createTransportActions(dependencies),
      ...createQueueActions(dependencies),
      setVolume: preferences.setVolume,
      toggleMute: preferences.toggleMute,
      setCrossfadeSeconds: preferences.setCrossfadeSeconds,
      setLoudnessEven: preferences.setLoudnessEven,
      startSleepTimer: sleep.startSleepTimer,
      cancelSleepTimer: sleep.cancelSleepTimer,
      promptRemotePlayback: () => engineRef.current?.remote?.prompt(),
    };
  }

  // Engine events and the stable action proxies reach this render's functions
  // through refs. The first render's builder serves a child's effect that
  // plays at mount, before this component's effects run.
  const buildActionsRef = useRef(buildActions);
  useEffect(() => {
    handleEventRef.current = (event) => commands().handleEvent(event);
    commandsRef.current = commands;
    buildActionsRef.current = buildActions;
  });

  // Hide explicit switched on mid-session: a radio drops its explicit
  // entries, so its refill carries on. It runs again as each track starts,
  // so an explicit entry that was playing leaves once it is done.
  const { hideExplicit } = preferences.playbackSettings;
  const currentEntryId = queueState.current?.queueEntryId ?? null;
  useEffect(() => {
    if (hideExplicit) commandsRef.current().dropHiddenRadioItems();
  }, [hideExplicit, currentEntryId]);

  const shouldStop = !loggedIn || (!access.isPending && !access.hasAccess);
  useEffect(() => {
    shouldStopRef.current = shouldStop;
    if (shouldStop && queueRef.current.current !== null)
      commandsRef.current().resetPlayback();
  }, [shouldStop, queueRef]);

  const stableActions = useMemo(
    // eslint-disable-next-line react-hooks/refs -- the proxies read the ref only when an action runs, from a handler or an effect
    () => createStableActions(() => buildActionsRef.current()),
    [],
  );
  // A preview item skips the detail read, so an owner previewing their own release sees no lyrics or chapters.
  const detail = useStudioCurrentTrackDetail(
    queueState.current?.trackId ?? null,
    queueState.current?.previewToken === undefined,
  );
  // Studio artist kinds: speed applies to episodes only (spec 5.6).
  useStudioEpisodeRate(
    engineRef,
    queueState.current?.isEpisode === true,
    decks.isPlainMode,
    status,
  );
  return usePlayerValue({
    stableActions,
    status,
    queueState,
    playhead,
    preferences,
    decks,
    sleepTimer: sleep.sleepTimer,
    detail,
  });
}
