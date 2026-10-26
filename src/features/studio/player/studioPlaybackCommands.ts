import type { QueryClient } from "@tanstack/react-query";
import type { RefObject } from "react";
import { onStudioAccessLost, studioKeys } from "../api/studioQueryKeys";
import { isStudioTrackWithheld } from "../api/studioSafety.api";
import {
  fetchStudioStream,
  rememberStreamAnalysis,
  streamAnalysisOf,
} from "../api/studioStream";
import type { StudioStreamAnalysis } from "../api/studio.types";
import { studioReasonOf } from "../studioReason";
import type {
  StudioAudioEngine,
  StudioAudioEvent,
  StudioHandoverMode,
} from "./studioAudioEngine";
import type {
  StudioDeckControls,
  StudioPreloadedStream,
} from "./studioDeckPreload";
import { trackGainDb } from "./studioLoudness";
import { clearStudioPlayerAnnouncement } from "./studioPlayerAnnouncer";
import {
  resetPlaybackSignals,
  setPlaybackSignals,
  takeMediaFailureReason,
} from "./studioPlaybackSignals";
import type {
  StudioBufferedRange,
  StudioPlaybackSettings,
  StudioPlaybackStatus,
  StudioQueueItem,
} from "./studioPlayerContext";
import {
  peekNext,
  type StudioQueueAction,
  type StudioQueueState,
} from "./studioQueueReducer";
import type { StudioQueueSnapshot } from "./studioQueueStorage";
import { isWarningGated, warningGateOf } from "./studioWarningGate";

export interface StudioPlayhead {
  currentTime: number;
  duration: number | null;
  /** Loaded spans of the active deck. Optional so hand-built playheads stay
   *  valid. */
  bufferedRanges?: readonly StudioBufferedRange[];
  /** Seeks and restarts so far, so a seek bar can tell another control's
   *  seek from its own. Optional so hand-built playheads stay valid. */
  seekCount?: number;
}
export const STOPPED_PLAYHEAD: StudioPlayhead = {
  currentTime: 0,
  duration: null,
  bufferedRanges: [],
};

export interface PlaybackRefs {
  queueRef: RefObject<StudioQueueState>;
  statusRef: RefObject<StudioPlaybackStatus>;
  playheadRef: RefObject<StudioPlayhead>;
  engineRef: RefObject<StudioAudioEngine | null>;
  expiresAtRef: RefObject<number>;
  refreshCountRef: RefObject<number>;
  /** Plain mode is tried once per engine. */
  hasTriedPlainModeRef: RefObject<boolean>;
  loadTokenRef: RefObject<number>;
  /** The load token whose source the engine holds. Events count only while
   *  it matches loadTokenRef, so a superseded source cannot move the queue. */
  sourceTokenRef: RefObject<number>;
  /** Where a refresh or Retry picks up: the load's start, then the playhead
   *  while it plays, or the last seek. */
  resumeAtRef: RefObject<number>;
  /** Bumped by what the member asks for (stop, next, previous, a jump, a new
   *  queue) and by a reset. A release read still loading gives way to it; a
   *  natural swap to the next track leaves it alone. */
  intentTokenRef: RefObject<number>;
}

export interface PlaybackEffects {
  dispatch: (action: StudioQueueAction) => StudioQueueState;
  setStatus: (status: StudioPlaybackStatus) => void;
  tick: (patch: Partial<StudioPlayhead>) => void;
  decks: StudioDeckControls;
  sleep: {
    onTime: (seconds: number, durationSeconds: number | null) => void;
    consumeTrackEnd: () => boolean;
    cancelSleepTimer: () => void;
  };
  /** Autoplay next and hide explicit, read at event time (contract F.2). */
  readPlaybackSettings: () => StudioPlaybackSettings;
  demoMode: boolean;
  queryClient: QueryClient;
}

/** Hide explicit switched on while a radio plays (contract F.2): explicit
 *  entries leave the radio's source and its pool, so the reducer's refill
 *  keeps the radio going past an explicit tail. The entry that plays now
 *  finishes and keeps its place in both orders (shuffle off finds it); it
 *  leaves once the next track plays. The same state comes back when nothing
 *  changes. */
export function withoutHiddenRadioItems(
  state: StudioQueueState,
): StudioQueueState {
  if (state.source?.kind !== "radio") return state;
  const currentEntryId = state.current?.queueEntryId ?? null;
  const isKept = (item: StudioQueueItem) =>
    !item.isExplicit || item.queueEntryId === currentEntryId;
  const sourceItems = state.sourceItems.filter(isKept);
  const originalSourceItems = state.originalSourceItems.filter(isKept);
  const isUnchanged =
    sourceItems.length === state.sourceItems.length &&
    originalSourceItems.length === state.originalSourceItems.length;
  if (isUnchanged) return state;
  const keptBeforeOrAtIndex = state.sourceItems
    .slice(0, state.sourceIndex + 1)
    .filter(isKept).length;
  return {
    ...state,
    sourceItems,
    originalSourceItems,
    sourceIndex: keptBeforeOrAtIndex - 1,
  };
}

/** Loading a track: the stream read, the refresh, the plain-mode retry. */
function createTrackLoader(
  refs: PlaybackRefs,
  effects: PlaybackEffects,
  /** Studio safety: a queued track our team withheld since it was queued. */
  onWithheld: (item: StudioQueueItem) => void,
) {
  function beginTrack(item: StudioQueueItem, startAtSeconds: number): number {
    refs.loadTokenRef.current += 1;
    refs.resumeAtRef.current = startAtSeconds;
    effects.decks.noteTrackStarted();
    effects.tick({
      currentTime: startAtSeconds,
      duration: item.durationSeconds,
      bufferedRanges: [],
    });
    return refs.loadTokenRef.current;
  }

  async function loadEntry(
    item: StudioQueueItem,
    startAtSeconds: number,
    shouldPlay = true,
  ): Promise<void> {
    const engine = refs.engineRef.current;
    if (!engine) return;
    const token = beginTrack(item, startAtSeconds);
    // Silence the old source while the new URL loads; its events no longer
    // match the token, so they are dropped.
    engine.pause();
    effects.decks.cancelPreload();
    if (!shouldPlay) {
      // Cued: the stream is read when the member presses play.
      refs.expiresAtRef.current = 0;
      engine.reset();
      effects.setStatus("paused");
      return;
    }
    effects.setStatus("loading");
    // A new attempt: the bar's last reason and the autoplay note clear.
    setPlaybackSignals({ failureReason: null, isAutoplayBlocked: false });
    try {
      // A preview entry reads its stream through its preview link (v3).
      const stream = await fetchStudioStream(
        effects.demoMode,
        item.trackId,
        item.previewToken,
      );
      // Every fetch refreshes the cached analysis, so an empty analysis
      // written earlier gives way to the measured one.
      const analysis = streamAnalysisOf(stream);
      rememberStreamAnalysis(
        effects.queryClient,
        effects.demoMode,
        item.trackId,
        analysis,
      );
      if (token !== refs.loadTokenRef.current) return;
      refs.expiresAtRef.current = Date.parse(stream.expiresAt);
      refs.sourceTokenRef.current = token;
      engine.load(stream.url, startAtSeconds, trackGainDb(analysis));
    } catch (error) {
      // A withdrawn grant re-reads GET /studio/me; the gate then shows the
      // teaser and the player stops.
      onStudioAccessLost(effects.queryClient, error);
      if (token !== refs.loadTokenRef.current) return;
      // Studio safety (spec 5.3): a track withheld since it was queued
      // leaves the queue and playback moves on, like a hidden track.
      if (isStudioTrackWithheld(error)) {
        onWithheld(item);
        return;
      }
      fail("stream", error);
      return;
    }
    await engine.play();
  }

  function reloadCurrent() {
    const queue = refs.queueRef.current;
    // Studio safety: a warned track that waits loads only through Play it.
    if (queue.pendingWarning) return;
    const current = queue.current;
    if (current) void loadEntry(current, refs.resumeAtRef.current);
  }

  /** One silent refresh of the signed URL, resuming at the same second. A
   *  second media failure retries once on plain elements (the CORS fallback);
   *  after that, or for a failed stream read, the error shows with Retry and
   *  its reason (ENG-02): the stream read's own error, or the media
   *  element's. */
  function fail(source: "stream" | "media", error?: unknown) {
    if (refs.refreshCountRef.current < 1) {
      refs.refreshCountRef.current += 1;
      reloadCurrent();
      return;
    }
    const engine = refs.engineRef.current;
    if (
      source === "media" &&
      !refs.hasTriedPlainModeRef.current &&
      engine?.enterPlainMode()
    ) {
      refs.hasTriedPlainModeRef.current = true;
      reloadCurrent();
      return;
    }
    setPlaybackSignals({
      failureReason:
        source === "stream" ? studioReasonOf(error) : takeMediaFailureReason(),
      isBuffering: false,
    });
    effects.setStatus("error");
  }

  function handoverTo(
    item: StudioQueueItem,
    preload: StudioPreloadedStream,
    mode: StudioHandoverMode,
  ) {
    const engine = refs.engineRef.current;
    if (!engine) return;
    const token = beginTrack(item, 0);
    refs.sourceTokenRef.current = token;
    refs.expiresAtRef.current = preload.expiresAtMs;
    refs.refreshCountRef.current = 0;
    engine.handover(mode);
  }

  /** A track that ends with nothing to play next. engine.pause brings the
   *  level back up after a sleep fade (and stays quiet on an ended element),
   *  and the next Play, or a reload after the URL expires, starts at 0. */
  function endPaused() {
    refs.engineRef.current?.pause();
    refs.resumeAtRef.current = 0;
    effects.setStatus("paused");
  }

  function replayCurrent(shouldPlay: boolean) {
    const engine = refs.engineRef.current;
    if (!engine) return;
    refs.resumeAtRef.current = 0;
    effects.decks.noteTrackStarted();
    effects.tick({
      currentTime: 0,
      seekCount: (refs.playheadRef.current.seekCount ?? 0) + 1,
    });
    engine.seek(0);
    if (shouldPlay) {
      void engine.play();
      return;
    }
    engine.pause();
    effects.setStatus("paused");
  }

  return {
    beginTrack,
    loadEntry,
    reloadCurrent,
    fail,
    handoverTo,
    replayCurrent,
    endPaused,
  };
}

/** The engine events that move playback, read for the current source only. */
function createEventHandler(
  refs: PlaybackRefs,
  effects: PlaybackEffects,
  loader: ReturnType<typeof createTrackLoader>,
  advance: (isManual: boolean, shouldPlay?: boolean) => void,
) {
  function onEnded() {
    // The sleep timer's end of track is read before any handover, so the
    // next track is cued and stays silent.
    const isStoppingForSleep = effects.sleep.consumeTrackEnd();
    // Autoplay next off (contract F.2): the track ends paused and nothing is
    // dispatched; repeat one still replays it.
    const isRepeatOne = refs.queueRef.current.repeat === "one";
    if (!effects.readPlaybackSettings().autoplayNext && !isRepeatOne) {
      loader.endPaused();
      return;
    }
    advance(false, !isStoppingForSleep);
  }

  return function handleEvent(event: StudioAudioEvent) {
    switch (event.type) {
      // The decks hook keeps these: casting state, the dropped preload and
      // the plain-mode flag. Plain mode also counts as tried for this engine.
      case "remote":
      case "preloadFailed":
        return;
      case "plainMode":
        refs.hasTriedPlainModeRef.current = true;
        return;
    }
    if (refs.sourceTokenRef.current !== refs.loadTokenRef.current) return;
    const status = refs.statusRef.current;
    switch (event.type) {
      case "time":
        if (status === "playing") refs.resumeAtRef.current = event.seconds;
        effects.tick({ currentTime: event.seconds });
        effects.sleep.onTime(event.seconds, refs.playheadRef.current.duration);
        return;
      case "duration":
        effects.tick({ duration: event.seconds });
        return;
      case "buffered":
        effects.tick({ bufferedRanges: event.ranges });
        return;
      case "playing":
        refs.refreshCountRef.current = 0;
        // Playing again, however it restarted (a load that finished, the
        // system's media keys): an offline pause has nothing left to resume.
        setPlaybackSignals({
          failureReason: null,
          isAutoplayBlocked: false,
          isPausedForOffline: false,
          offlinePausedAtMs: null,
        });
        effects.setStatus("playing");
        return;
      case "paused":
        if (status === "playing") effects.setStatus("paused");
        return;
      case "blocked":
        // ENG-02: the bar says "Tap play to start" instead of going quiet.
        if (status === "playing" || status === "loading") {
          setPlaybackSignals({ isAutoplayBlocked: true, isBuffering: false });
          effects.setStatus("paused");
        }
        return;
      case "ended":
        onEnded();
        return;
      case "failed":
        loader.fail("media");
        return;
    }
  };
}

/**
 * Loading, failure, engine events, the queue's moves, seek and reset for
 * useStudioPlayback. Every read goes through the refs, so commands built on
 * an older render still act on the latest queue and playhead.
 */
export function createPlaybackCommands(
  refs: PlaybackRefs,
  effects: PlaybackEffects,
) {
  const loader = createTrackLoader(refs, effects, dropWithheld);

  /** The next track: a gapless swap when it is preloaded and fresh, else a
   *  normal load (playing, or cued for the sleep timer's end of track). */
  function advance(isManual: boolean, shouldPlay = true) {
    const before = refs.queueRef.current;
    const settings = effects.readPlaybackSettings();
    const { hideExplicit } = settings;
    const upcoming = peekNext(before, isManual, hideExplicit);
    if (!upcoming) {
      if (!isManual) loader.endPaused();
      return;
    }
    const gate = warningGateOf(settings);
    const after = effects.dispatch(
      isManual
        ? { type: "next", hideExplicit, gate }
        : { type: "trackEnded", hideExplicit, gate },
    );
    if (upcoming.queueEntryId === before.current?.queueEntryId) {
      // A warned entry that waits stays paused at its start.
      loader.replayCurrent(shouldPlay && !after.pendingWarning);
      return;
    }
    const current = after.current;
    if (!current) return;
    refs.refreshCountRef.current = 0;
    // Spec 6.3: a warned track waits for Play it. It is cued, so no stream
    // is read and nothing about it is pre-buffered.
    if (after.pendingWarning) {
      void loader.loadEntry(current, 0, false);
      return;
    }
    // A natural end was playing by definition (the element may have
    // reported a pause first); a skip swaps only while the track plays.
    const wasPlaying = !isManual || refs.statusRef.current === "playing";
    const preload =
      shouldPlay && wasPlaying
        ? effects.decks.takePreload(current.queueEntryId)
        : null;
    if (preload) loader.handoverTo(current, preload, "gapless");
    else void loader.loadEntry(current, 0, shouldPlay);
  }

  function crossfadeTo(
    next: StudioQueueItem,
    preload: StudioPreloadedStream,
    crossfadeSeconds: number,
  ) {
    const settings = effects.readPlaybackSettings();
    const { hideExplicit } = settings;
    const gate = warningGateOf(settings);
    // The queue moves only when the faded-in entry is still the next one,
    // and never into a warned track that waits for Play it.
    const upcoming = peekNext(refs.queueRef.current, false, hideExplicit);
    if (
      upcoming?.queueEntryId !== next.queueEntryId ||
      isWarningGated(next, gate)
    ) {
      effects.decks.cancelPreload();
      return;
    }
    effects.dispatch({ type: "trackEnded", hideExplicit, gate });
    loader.handoverTo(next, preload, { crossfadeSeconds });
  }

  const handleEvent = createEventHandler(refs, effects, loader, advance);

  function seek(seconds: number) {
    const ceiling = refs.playheadRef.current.duration ?? Math.max(seconds, 0);
    const target = Math.min(Math.max(0, seconds), ceiling);
    // Before the engine's seek: the simulated engine emits its time event
    // inside seek, and that event already checks the crossfade window.
    effects.decks.noteSeek(target);
    refs.engineRef.current?.seek(target);
    refs.resumeAtRef.current = target;
    effects.tick({
      currentTime: target,
      seekCount: (refs.playheadRef.current.seekCount ?? 0) + 1,
    });
  }

  /** Stop, sign-out, an emptied queue and a demo/live switch: the sleep
   *  timer goes with the queue. */
  function resetPlayback() {
    effects.sleep.cancelSleepTimer();
    refs.intentTokenRef.current += 1;
    refs.loadTokenRef.current += 1;
    refs.refreshCountRef.current = 0;
    refs.resumeAtRef.current = 0;
    refs.expiresAtRef.current = 0;
    effects.decks.cancelPreload();
    refs.engineRef.current?.reset();
    effects.dispatch({ type: "reset" });
    resetPlaybackSignals();
    clearStudioPlayerAnnouncement();
    effects.setStatus("idle");
    effects.tick(STOPPED_PLAYHEAD);
  }

  /** A queued track our team withheld since: it leaves the queue, and the
   *  next playable item loads (or waits at the gate). An emptied queue
   *  stops. */
  function dropWithheld(item: StudioQueueItem) {
    const settings = effects.readPlaybackSettings();
    const after = effects.dispatch({
      type: "remove",
      queueEntryId: item.queueEntryId,
      hideExplicit: settings.hideExplicit,
      gate: warningGateOf(settings),
    });
    const next = after.current;
    if (!next) {
      resetPlayback();
      return;
    }
    refs.refreshCountRef.current = 0;
    void loader.loadEntry(next, 0, !after.pendingWarning);
  }

  function dropHiddenRadioItems() {
    const before = refs.queueRef.current;
    const filtered = withoutHiddenRadioItems(before);
    if (filtered === before) return;
    // No gate: only upcoming radio entries go, the current entry never
    // changes here, so the state keeps its own warning question.
    effects.dispatch({ type: "restore", state: filtered });
    // A move that changes nothing still runs the reducer's radio refill, for
    // a radio whose remaining entries were all explicit.
    effects.dispatch({ type: "moveUpcomingSource", fromIndex: -1, toIndex: 0 });
  }

  /** DES-28: a restored track shows its waveform before Play. Only the
   *  analysis is kept; the signed URL is read again on Play, so the expiry
   *  rule stays as it was. A failed read leaves the plain slider, as before.
   *  Nothing about this reaches the server beyond the stream read Play
   *  would make anyway. */
  async function prefetchRestoredAnalysis(item: StudioQueueItem) {
    const cached = effects.queryClient.getQueryData<StudioStreamAnalysis>(
      studioKeys.streamAnalysis(effects.demoMode, item.trackId),
    );
    if (cached?.waveformPeaks) return;
    try {
      const stream = await fetchStudioStream(
        effects.demoMode,
        item.trackId,
        item.previewToken,
      );
      rememberStreamAnalysis(
        effects.queryClient,
        effects.demoMode,
        item.trackId,
        streamAnalysisOf(stream),
      );
    } catch {
      // The waveform waits for Play, which reports its own failure.
    }
  }

  /** A saved queue comes back paused at its second; the stream is read on
   *  play (an expired-at of 0 makes togglePlay reload). */
  function restoreCued(snapshot: StudioQueueSnapshot) {
    const current = snapshot.state.current;
    if (!current) return;
    // A restored warned track asks again: this tab's consent is new.
    const restored = effects.dispatch({
      type: "restore",
      state: snapshot.state,
      gate: warningGateOf(effects.readPlaybackSettings()),
    });
    refs.expiresAtRef.current = 0;
    effects.setStatus("paused");
    if (restored.pendingWarning) {
      // It waits for Play it, which starts it at 0:00. No track begins.
      refs.resumeAtRef.current = 0;
      effects.tick({ currentTime: 0, duration: current.durationSeconds });
      return;
    }
    loader.beginTrack(current, snapshot.positionSeconds);
    void prefetchRestoredAnalysis(current);
  }

  return {
    loadEntry: loader.loadEntry,
    reloadCurrent: loader.reloadCurrent,
    retry: () => {
      refs.refreshCountRef.current = 0;
      setPlaybackSignals({ failureReason: null });
      loader.reloadCurrent();
    },
    advance,
    crossfadeTo,
    handleEvent,
    seek,
    resetPlayback,
    restoreCued,
    dropHiddenRadioItems,
  };
}

export type PlaybackCommands = ReturnType<typeof createPlaybackCommands>;
