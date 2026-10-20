import type { QueryClient } from "@tanstack/react-query";
import type { RefObject } from "react";
import { STUDIO_CROSSFADE_MAX_SECONDS } from "../api/studio.types";
import {
  fetchStudioStream,
  rememberStreamAnalysis,
  streamAnalysisOf,
} from "../api/studioStream";
import type { StudioAudioEngine } from "./studioAudioEngine";
import {
  canCrossfadeBetween,
  crossfadeStartSeconds,
  isPreloadFresh,
  preloadStartSeconds,
} from "./studioHandover";
import { isEpisodeTransition } from "./studioEpisodePlay";
import { trackGainDb } from "./studioLoudness";
import type {
  StudioPlaybackSettings,
  StudioPlaybackStatus,
  StudioQueueItem,
  StudioRemoteState,
} from "./studioPlayerContext";
import { peekNext, type StudioQueueState } from "./studioQueueReducer";
import { isWarningGated, warningGateOf } from "./studioWarningGate";

export interface StudioPreloadedStream {
  queueEntryId: string;
  expiresAtMs: number;
  gainDb: number;
}

/** What the preloader reads; always the latest values. */
export interface StudioDeckSources {
  demoMode: boolean;
  durationFor: () => number | null;
  readQueue: () => StudioQueueState;
  readStatus: () => StudioPlaybackStatus;
  readCrossfadeSeconds: () => number;
  /** Autoplay next and hide explicit (contract F.2). */
  readPlaybackSettings: () => StudioPlaybackSettings;
  /** The release's tracklist from the query cache, or null. */
  releaseTrackIdsFor: (releaseId: string) => string[] | null;
  /** True while a crossfade would fight another fade (the sleep timer is set
   *  to the end of the track, or its own fade is running). The handover then
   *  stays a gapless swap. */
  shouldHoldCrossfade: () => boolean;
  onCrossfadeStart: (
    next: StudioQueueItem,
    preload: StudioPreloadedStream,
    crossfadeSeconds: number,
  ) => void;
}

export interface StudioDeckControls {
  /** The preload for this entry while its URL is fresh; null (and the idle
   *  deck cleared) otherwise. */
  takePreload: (queueEntryId: string) => StudioPreloadedStream | null;
  cancelPreload: () => void;
  /** A seek inside the crossfade window turns this track's crossfade into a
   *  gapless swap. Call it before engine.seek: the simulated engine emits
   *  its `time` event synchronously inside seek, and that event already
   *  checks the crossfade window. */
  noteSeek: (seconds: number) => void;
  noteTrackStarted: () => void;
}

export interface StudioDeckPreloader extends StudioDeckControls {
  handleTime: (seconds: number) => void;
  dropFailedPreload: () => void;
  followNextEntry: (nextEntryId: string | null) => void;
}

/** The member's crossfade length, held to the setting's range. */
function crossfadeSecondsOf(sources: StudioDeckSources): number {
  return Math.min(STUDIO_CROSSFADE_MAX_SECONDS, sources.readCrossfadeSeconds());
}

export function createDeckPreloader(
  refs: {
    engineRef: RefObject<StudioAudioEngine | null>;
    sourcesRef: RefObject<StudioDeckSources>;
    remoteRef: RefObject<StudioRemoteState>;
  },
  queryClient: QueryClient,
  now: () => number = () => Date.now(),
): StudioDeckPreloader {
  let preload: StudioPreloadedStream | null = null;
  let attemptedEntryId: string | null = null;
  let preloadToken = 0;
  let isCrossfadeBlocked = false;

  function cancelPreload() {
    preloadToken += 1;
    attemptedEntryId = null;
    preload = null;
    refs.engineRef.current?.cancelPreload();
  }

  async function startPreload(next: StudioQueueItem) {
    const engine = refs.engineRef.current;
    if (!engine) return;
    attemptedEntryId = next.queueEntryId;
    preloadToken += 1;
    const token = preloadToken;
    const { demoMode } = refs.sourcesRef.current;
    try {
      // A preview entry reads its stream through its preview link (v3).
      const stream = await fetchStudioStream(
        demoMode,
        next.trackId,
        next.previewToken,
      );
      // Every fetch refreshes the cached analysis, so an empty analysis
      // written earlier gives way to the measured one.
      const analysis = streamAnalysisOf(stream);
      rememberStreamAnalysis(queryClient, demoMode, next.trackId, analysis);
      const sources = refs.sourcesRef.current;
      const settings = sources.readPlaybackSettings();
      const latestNext = peekNext(
        sources.readQueue(),
        false,
        settings.hideExplicit,
      );
      const isStale =
        token !== preloadToken ||
        refs.engineRef.current !== engine ||
        latestNext?.queueEntryId !== next.queueEntryId ||
        isWarningGated(next, warningGateOf(settings));
      if (isStale) return;
      // The engine applies this gain only while "Even out loudness" is on.
      const gainDb = trackGainDb(analysis);
      engine.preload(stream.url, gainDb);
      preload = {
        queueEntryId: next.queueEntryId,
        expiresAtMs: Date.parse(stream.expiresAt),
        gainDb,
      };
    } catch {
      // A failed preload is tried once; the swap then loads the track the
      // usual way (with its own refresh and error handling).
    }
  }

  function maybeCrossfade(
    seconds: number,
    durationSeconds: number,
    current: StudioQueueItem,
    next: StudioQueueItem,
  ) {
    const sources = refs.sourcesRef.current;
    const engine = refs.engineRef.current;
    const crossfadeSeconds = crossfadeSecondsOf(sources);
    const ready = preload;
    if (crossfadeSeconds <= 0 || !engine || !ready || isCrossfadeBlocked)
      return;
    // The sleep timer's fade owns the level: the swap stays gapless.
    if (sources.shouldHoldCrossfade()) return;
    if (ready.queueEntryId !== next.queueEntryId || !engine.hasPreload())
      return;
    if (engine.isPlainMode() || !isPreloadFresh(ready.expiresAtMs, now()))
      return;
    if (seconds < crossfadeStartSeconds(durationSeconds, crossfadeSeconds))
      return;
    const releaseTrackIds = sources.releaseTrackIdsFor(current.releaseId);
    if (!canCrossfadeBetween(current, next, releaseTrackIds)) return;
    isCrossfadeBlocked = true;
    preload = null;
    attemptedEntryId = null;
    sources.onCrossfadeStart(
      next,
      ready,
      Math.max(0.5, Math.min(crossfadeSeconds, durationSeconds - seconds)),
    );
  }

  function handleTime(seconds: number) {
    const sources = refs.sourcesRef.current;
    const durationSeconds = sources.durationFor();
    const settings = sources.readPlaybackSettings();
    // Autoplay next off: the track ends paused, so nothing follows it, and a
    // preload made before the switch is let go.
    if (!settings.autoplayNext) {
      if (preload !== null || attemptedEntryId !== null) cancelPreload();
      return;
    }
    const queue = sources.readQueue();
    const current = queue.current;
    const next = peekNext(queue, false, settings.hideExplicit);
    if (!refs.engineRef.current || !current || !next) return;
    // Studio safety (spec 6.3): a warned next track waits for Play it, so
    // nothing pre-buffers or crossfades into it; a preload made before the
    // gate applied is let go.
    if (isWarningGated(next, warningGateOf(settings))) {
      if (preload !== null || attemptedEntryId !== null) cancelPreload();
      return;
    }
    // Artist kinds: no preload next to an episode, so neither a crossfade
    // nor a gapless swap joins an episode to its neighbour (spec 5.6).
    if (isEpisodeTransition(current, next)) return;
    if (durationSeconds === null || durationSeconds <= 0) return;
    // Repeat one replays on the same deck: nothing to preload.
    if (next.queueEntryId === current.queueEntryId) return;
    if (
      sources.readStatus() !== "playing" ||
      refs.remoteRef.current.isConnected
    )
      return;
    if (
      seconds >= preloadStartSeconds(durationSeconds) &&
      attemptedEntryId !== next.queueEntryId
    )
      void startPreload(next);
    maybeCrossfade(seconds, durationSeconds, current, next);
  }

  function takePreload(queueEntryId: string): StudioPreloadedStream | null {
    const engine = refs.engineRef.current;
    const ready = preload;
    preload = null;
    attemptedEntryId = null;
    const isUsable =
      engine !== null &&
      ready !== null &&
      ready.queueEntryId === queueEntryId &&
      engine.hasPreload() &&
      isPreloadFresh(ready.expiresAtMs, now());
    if (isUsable) return ready;
    preloadToken += 1;
    engine?.cancelPreload();
    return null;
  }

  return {
    cancelPreload,
    handleTime,
    takePreload,
    noteSeek: (seconds) => {
      const sources = refs.sourcesRef.current;
      const durationSeconds = sources.durationFor();
      const crossfadeSeconds = crossfadeSecondsOf(sources);
      isCrossfadeBlocked =
        durationSeconds !== null &&
        crossfadeSeconds > 0 &&
        seconds >= crossfadeStartSeconds(durationSeconds, crossfadeSeconds);
    },
    noteTrackStarted: () => {
      isCrossfadeBlocked = false;
    },
    dropFailedPreload: () => {
      preload = null;
    },
    followNextEntry: (nextEntryId) => {
      const isStalePreload =
        preload !== null && preload.queueEntryId !== nextEntryId;
      const isStaleAttempt =
        attemptedEntryId !== null && attemptedEntryId !== nextEntryId;
      if (isStalePreload || isStaleAttempt) cancelPreload();
    },
  };
}
