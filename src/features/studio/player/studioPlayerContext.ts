import { createContext, useContext } from "react";
import type { ImageSlotTint } from "../../../shared/components/ui";
import type {
  StudioChapterView,
  StudioSyncedLyricView,
} from "../api/studio.adapters";
import type { StudioRadioFilter } from "../api/studio.types";
import type { StudioContentWarningId } from "../api/studioSafety.types";

export interface StudioQueueItem {
  trackId: string;
  title: string;
  durationSeconds: number | null;
  trackHref: string;
  releaseId: string;
  releaseTitle: string;
  coverUrl: string | null;
  tint: ImageSlotTint;
  artistId: string;
  artistName: string;
  artistHref: string;
  /** Unique per queue entry; the same track may appear twice. */
  queueEntryId: string;
  /** From the track (contract F.2); hide explicit skips these. */
  isExplicit: boolean;
  /** Studio artist kinds: a podcast episode (skip 15/30, speed, no crossfade
   *  or gapless around it). Optional so older builders, fixtures and saved
   *  queues stay valid; a missing value reads as music. */
  isEpisode?: boolean;
  /** v3: the release's private preview link. Every stream read of this
   *  entry passes it, so a preview plays through the preview route. */
  previewToken?: string;
  /** Studio safety: the track's content warnings (artist and staff, D7
   *  order). Optional so older builders, fixtures and saved queues stay
   *  valid; a missing value reads as none. */
  contentWarnings?: StudioContentWarningId[];
}

/** A track ready to queue: every queue field except the entry id, which the
 *  player stamps when the track joins the queue. */
export type StudioQueueTrack = Omit<StudioQueueItem, "queueEntryId">;

export type StudioRepeatMode = "off" | "all" | "one";

export interface StudioQueueSource {
  /** "radio" refills itself when it runs out (contract F.1). */
  kind: "release" | "playlist" | "artist" | "tracks" | "radio";
  /** Release title, playlist name, artist name; "" for "tracks". */
  label: string;
  href: string | null;
  /** The filter a radio plays (Discovery's bar label reads it). */
  radioFilter?: StudioRadioFilter;
}

export interface StudioQueueView {
  source: StudioQueueSource | null;
  current: StudioQueueItem | null;
  /** "Your queue", in play order. */
  userItems: StudioQueueItem[];
  /** The source after the current item, in play order (shuffled when
   *  isShuffled). */
  upcomingSourceItems: StudioQueueItem[];
  isShuffled: boolean;
  repeat: StudioRepeatMode;
}

export type StudioSleepTimerOption =
  { kind: "minutes"; minutes: 15 | 30 | 45 | 60 } | { kind: "endOfTrack" };

export type StudioSleepTimerState =
  null | { kind: "minutes"; endsAt: number } | { kind: "endOfTrack" };

export interface StudioPlayerPreferences {
  /** 0..1, default 1. */
  volume: number;
  isMuted: boolean;
  /** Integer 0..12, default 0 (off). */
  crossfadeSeconds: number;
  /** Default true. */
  isLoudnessEven: boolean;
}

export interface StudioRemoteState {
  /** A device is reachable (or the AirPlay picker exists). */
  isAvailable: boolean;
  isConnected: boolean;
}

/** The member's server player settings the player decides on (contract
 *  F.2), mirrored from Open pages' useStudioPlaybackSettings(). */
export interface StudioPlaybackSettings {
  autoplayNext: boolean;
  hideExplicit: boolean;
  /** Studio safety (spec 6.3): pause before a warned track. Missing reads
   *  as on, the default. */
  askBeforeWarnings?: boolean;
}

/** A radio in the browser: the filter it plays and the whole list it
 *  reshuffles from at the end of the queue. Nothing about it reaches the
 *  server. The pool holds tracks; each refill stamps fresh entry ids. */
export interface StudioRadioSession {
  filter: StudioRadioFilter;
  pool: StudioQueueTrack[];
}

export type StudioPlaybackStatus =
  "idle" | "loading" | "playing" | "paused" | "error";

export interface StudioPlayerActions {
  playRelease: (
    releaseId: string,
    startTrackId?: string,
    startAtSeconds?: number,
  ) => Promise<void>;
  /** Several releases as one queue, in the order given (the artist page's Play all). */
  playReleases: (releaseIds: string[]) => Promise<void>;
  /** A ready-made list as one queue, in the order given (a playlist, its
   *  shuffle, or a radio), starting at `startTrackId` when given. Reads no
   *  release. */
  playTracks: (
    items: StudioQueueTrack[],
    startTrackId?: string,
    source?: StudioQueueSource,
    /** Artist kinds: where the first track starts (a show notes timestamp,
     *  a `&t=` link). 0 when left out. */
    startAtSeconds?: number,
  ) => Promise<void>;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  retry: () => void;
  stop: () => void;
  /** Studio safety (spec 6.3): Play it. The member agrees to hear the warned
   *  track that waits; it loads and plays. */
  playWarnedTrack: () => void;
  /** Skip: move on to the next playable item (which may ask again), or
   *  stop when nothing follows. */
  skipWarnedTrack: () => void;
  /** Resolves false when the track has no playable audio, is explicit while
   *  hidden, or the read fails. */
  playNext: (trackId: string) => Promise<boolean>;
  addToQueue: (trackId: string) => Promise<boolean>;
  moveUserItem: (fromIndex: number, toIndex: number) => void;
  moveUpcomingSourceItem: (fromIndex: number, toIndex: number) => void;
  removeEntry: (queueEntryId: string) => void;
  clearUserQueue: () => void;
  /** Jump to a row in the queue panel. */
  playEntry: (queueEntryId: string) => void;
  toggleShuffle: () => void;
  /** off, all, one, off. */
  cycleRepeat: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setCrossfadeSeconds: (seconds: number) => void;
  setLoudnessEven: (isEven: boolean) => void;
  startSleepTimer: (option: StudioSleepTimerOption) => void;
  cancelSleepTimer: () => void;
  /** Opens the browser's AirPlay or Cast picker. */
  promptRemotePlayback: () => void;
}

export interface StudioPlayerValue extends StudioPlayerActions {
  status: StudioPlaybackStatus;
  queue: StudioQueueView;
  /** current !== null */
  hasQueue: boolean;
  currentItem: StudioQueueItem | null;
  /** Previous has an item to go back to (otherwise it restarts the track). */
  hasPrevious: boolean;
  hasNext: boolean;
  /** Studio safety: the warned track waiting for Play it or Skip; null
   *  when nothing waits. It is also `currentItem`, cued. */
  pendingWarning: StudioQueueItem | null;
  isCurrentRelease: (releaseId: string) => boolean;
  isCurrentTrack: (trackId: string) => boolean;
  preferences: StudioPlayerPreferences;
  /** Mirrored from the member's server setting (contract F.2). */
  playbackSettings: StudioPlaybackSettings;
  /** Set while a radio plays (Discovery's bar label reads it). */
  radio: StudioRadioSession | null;
  /** CORS fallback active: crossfade unavailable. */
  isPlainMode: boolean;
  sleepTimer: StudioSleepTimerState;
  remote: StudioRemoteState;
  /** 200 values from 0 to 1, from the stream response. */
  currentWaveform: number[] | null;
  /** From the current track's detail query. */
  currentChapters: StudioChapterView[] | null;
  currentSyncedLyrics: StudioSyncedLyricView[] | null;
}

export interface StudioPlayerClock {
  currentTime: number;
  duration: number | null;
  /** Index into currentChapters. */
  currentChapterIndex: number | null;
  /** Index into currentSyncedLyrics. */
  currentLyricIndex: number | null;
}

export const STOPPED_PLAYER_CLOCK: StudioPlayerClock = {
  currentTime: 0,
  duration: null,
  currentChapterIndex: null,
  currentLyricIndex: null,
};

export const StudioPlayerContext = createContext<StudioPlayerValue | null>(
  null,
);
export const StudioPlayerClockContext =
  createContext<StudioPlayerClock>(STOPPED_PLAYER_CLOCK);

export function useStudioPlayer(): StudioPlayerValue {
  const value = useContext(StudioPlayerContext);
  if (!value)
    throw new Error("useStudioPlayer must be used within StudioPlayerProvider");
  return value;
}

/** The playhead, in its own context so it re-renders only the bar. */
export function useStudioPlayerClock(): StudioPlayerClock {
  return useContext(StudioPlayerClockContext);
}
