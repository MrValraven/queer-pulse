import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../app/providers/authContext";
import type { StudioPlaybackPreferencesDTO } from "../api/studio.types";
import { postStudioPlay } from "../api/studioListening.api";
import { isListeningHistoryOnIn } from "../api/studioPlaybackPatch";
import { studioKeys } from "../api/studioQueryKeys";
import { useStudioPlaybackRow } from "../api/useStudioPlaybackPreferences";
import type { StudioQueueItem } from "./studioPlayerContext";
import {
  clearStudioRecentlyPlayed,
  readStudioRecentlyPlayed,
  recordStudioRecentlyPlayed,
  subscribeStudioListeningMemory,
  type StudioRecentlyPlayedEntry,
} from "./studioListeningMemory";
import { maybeShowStudioListeningNotice } from "./studioListeningNoticeStore";
import { readActiveCrossfadeSeconds } from "./studioPlayerPreferences";
import { useStudioListeningSwitchMigration } from "./useStudioListeningSwitchMigration";

/** A play counts after 30 seconds of listening, or when a shorter track
 *  plays to its end (PRD-18, contract 11). */
export const RECENTLY_PLAYED_AFTER_SECONDS = 30;
/** The last playhead read can fall up to a poll short of the end; a
 *  crossfade adds its own length on top. */
const TRACK_END_TOLERANCE_SECONDS = 1.5;
const POSITION_POLL_INTERVAL_MS = 1000;
/** A larger forward step between two reads is a seek, and adds nothing. */
const MAX_LISTENED_STEP_SECONDS = 4;

const EMPTY_ENTRIES: readonly StudioRecentlyPlayedEntry[] = [];

export interface StudioRecentlyPlayedControls {
  /** Newest first, one row per track, at most 50. Empty when signed out or
   *  while listening history is paused. */
  entries: readonly StudioRecentlyPlayedEntry[];
  /** Removes the whole list from this device. */
  clear: () => void;
}

/** The signed-in member's recently played tracks on this device. Rows only
 *  carry the track id and when it played, so a surface resolves each track
 *  through its usual query. The list stays on this device; the server keeps
 *  its own history from the counted plays. */
export function useStudioRecentlyPlayed(): StudioRecentlyPlayedControls {
  const { user } = useAuth();
  const memberId = user?.id ?? null;
  const isHistoryOn = isListeningHistoryOnIn(useStudioPlaybackRow());
  const storedEntries = useSyncExternalStore(
    subscribeStudioListeningMemory,
    () => readStudioRecentlyPlayed(memberId),
  );
  const entries = isHistoryOn ? storedEntries : EMPTY_ENTRIES;
  return useMemo(
    () => ({ entries, clear: clearStudioRecentlyPlayed }),
    [entries],
  );
}

export interface StudioRecentlyPlayedRecorderOptions {
  memberId: string | null;
  /** Signed in with Studio access, the session settled. */
  canRecord: boolean;
  /** Demo never counts, and remembers from the demo playback row. */
  demoMode: boolean;
  current: StudioQueueItem | null;
  isPlaying: boolean;
  readPositionSeconds: () => number;
}

interface TrackedPlay {
  /** The member the play started under; a record for anyone else is skipped. */
  memberId: string | null;
  trackId: string;
  durationSeconds: number | null;
  /** A preview link's track is unreleased, so it is never counted and stays
   *  off the list. */
  isRecordable: boolean;
  /** A podcast episode is remembered and never counted. */
  isEpisode: boolean;
  isRecorded: boolean;
  listenedSeconds: number;
  furthestSeconds: number;
  lastPositionSeconds: number | null;
}

function hasReachedTrackEnd(tracked: TrackedPlay): boolean {
  const { durationSeconds } = tracked;
  if (durationSeconds === null || !Number.isFinite(durationSeconds))
    return false;
  // The crossfade widens the check only when it fits in half the track, so
  // a long crossfade never counts a short track that was barely heard.
  const crossfadeSeconds = readActiveCrossfadeSeconds();
  const toleranceSeconds =
    TRACK_END_TOLERANCE_SECONDS +
    (crossfadeSeconds <= durationSeconds / 2 ? crossfadeSeconds : 0);
  return (
    tracked.furthestSeconds >= Math.max(durationSeconds - toleranceSeconds, 0)
  );
}

function trackedPlayOf(
  item: StudioQueueItem | null,
  memberId: string | null,
): TrackedPlay | null {
  if (!item) return null;
  return {
    memberId,
    trackId: item.trackId,
    durationSeconds: item.durationSeconds,
    isRecordable: item.previewToken === undefined,
    isEpisode: item.isEpisode === true,
    isRecorded: false,
    listenedSeconds: 0,
    furthestSeconds: 0,
    lastPositionSeconds: null,
  };
}

/** Mounted by the queue persistence: while a track plays it reads the
 *  playhead once a second, and after 30 seconds of listening or at the
 *  track's end it does two things apart (contract 11). It counts the play on
 *  the server: live only, and only for a released music track (a preview
 *  link's track and an episode stay uncounted). The count also feeds the
 *  member's listening history there while it is on. And it
 *  remembers the track in this device's recently played list, only while the
 *  loaded playback row says history is on. Signed out, without access, or
 *  after Quick Exit, it does neither. */
export function useStudioRecentlyPlayedRecorder(
  options: StudioRecentlyPlayedRecorderOptions,
): void {
  const { memberId, canRecord, demoMode, current, isPlaying } = options;
  const shouldRecord = canRecord && memberId !== null;
  useStudioListeningSwitchMigration({ demoMode, isEnabled: shouldRecord });
  const queryClient = useQueryClient();
  const queryClientRef = useRef(queryClient);
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
    queryClientRef.current = queryClient;
  });
  const trackedRef = useRef<TrackedPlay | null>(null);
  const currentEntryId = current?.queueEntryId ?? null;

  useEffect(() => {
    trackedRef.current = trackedPlayOf(
      optionsRef.current.current,
      optionsRef.current.memberId,
    );
  }, [currentEntryId]);

  useEffect(() => {
    if (!shouldRecord || !isPlaying) return;
    const tracked = trackedRef.current;
    // A new baseline: a seek made while paused adds nothing.
    if (tracked) tracked.lastPositionSeconds = null;
    const readPlayhead = () => {
      const play = trackedRef.current;
      if (!play || play.isRecorded || !play.isRecordable) return;
      const position = optionsRef.current.readPositionSeconds();
      if (!Number.isFinite(position)) return;
      const step =
        play.lastPositionSeconds === null
          ? 0
          : position - play.lastPositionSeconds;
      play.lastPositionSeconds = position;
      // Only a listening step moves the counts, so a seek, or the previous
      // track's playhead read once before it resets, never does.
      if (step <= 0 || step > MAX_LISTENED_STEP_SECONDS) return;
      play.listenedSeconds += step;
      play.furthestSeconds = Math.max(play.furthestSeconds, position);
      const hasCounted =
        play.listenedSeconds >= RECENTLY_PLAYED_AFTER_SECONDS ||
        hasReachedTrackEnd(play);
      const writerId = optionsRef.current.memberId;
      if (!hasCounted || !writerId || writerId !== play.memberId) return;
      play.isRecorded = true;
      const isDemo = optionsRef.current.demoMode;
      const client = queryClientRef.current;
      if (!isDemo && play.isRecordable && !play.isEpisode) {
        // Fire and forget: any failure, a 400 or a throttler 429 included,
        // stays silent and is never sent again (backend delta 1).
        void postStudioPlay(play.trackId).then(
          () => maybeShowStudioListeningNotice(client, false),
          () => undefined,
        );
      }
      // Read at this moment: a pending or failed read remembers nothing, and
      // a switch flipped since then is the one that counts.
      const row = client.getQueryData<StudioPlaybackPreferencesDTO>(
        studioKeys.playback(isDemo),
      );
      if (row === undefined || !isListeningHistoryOnIn(row)) return;
      recordStudioRecentlyPlayed(writerId, play.trackId);
      // Demo never counts, so the notice follows the remember there.
      if (isDemo) maybeShowStudioListeningNotice(client, true);
    };
    const intervalId = window.setInterval(
      readPlayhead,
      POSITION_POLL_INTERVAL_MS,
    );
    // No final read on cleanup: sign-out and loss of access end this effect
    // right after their wipe, and a read then could write the list back.
    return () => window.clearInterval(intervalId);
  }, [shouldRecord, isPlaying]);
}
