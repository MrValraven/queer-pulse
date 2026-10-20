import { DEFAULT_PLAYER_PREFERENCES } from "../features/studio/player/studioPlayerPreferences";
import {
  STOPPED_PLAYER_CLOCK,
  type StudioPlayerClock,
  type StudioPlayerValue,
  type StudioQueueItem,
} from "../features/studio/player/studioPlayerContext";

/** A complete, inert player value for component tests: every action is a
 *  no-op that a test overrides with vi.fn() where it asserts on it. */
export function createStudioPlayerTestValue(
  current: StudioQueueItem | null = null,
): StudioPlayerValue {
  const doNothing = () => {};
  const resolved = () => Promise.resolve();
  return {
    status: current ? "paused" : "idle",
    queue: {
      source: null,
      current,
      userItems: [],
      upcomingSourceItems: [],
      isShuffled: false,
      repeat: "off",
    },
    hasQueue: current !== null,
    currentItem: current,
    hasPrevious: false,
    hasNext: false,
    pendingWarning: null,
    isCurrentRelease: (releaseId) => current?.releaseId === releaseId,
    isCurrentTrack: (trackId) => current?.trackId === trackId,
    preferences: { ...DEFAULT_PLAYER_PREFERENCES, crossfadeSeconds: 0 },
    playbackSettings: { autoplayNext: true, hideExplicit: false },
    radio: null,
    isPlainMode: false,
    sleepTimer: null,
    remote: { isAvailable: false, isConnected: false },
    currentWaveform: null,
    currentChapters: null,
    currentSyncedLyrics: null,
    playRelease: resolved,
    playReleases: resolved,
    playTracks: resolved,
    togglePlay: doNothing,
    next: doNothing,
    previous: doNothing,
    seek: doNothing,
    retry: doNothing,
    stop: doNothing,
    playWarnedTrack: doNothing,
    skipWarnedTrack: doNothing,
    playNext: () => Promise.resolve(true),
    addToQueue: () => Promise.resolve(true),
    moveUserItem: doNothing,
    moveUpcomingSourceItem: doNothing,
    removeEntry: doNothing,
    clearUserQueue: doNothing,
    playEntry: doNothing,
    toggleShuffle: doNothing,
    cycleRepeat: doNothing,
    setVolume: doNothing,
    toggleMute: doNothing,
    setCrossfadeSeconds: doNothing,
    setLoudnessEven: doNothing,
    startSleepTimer: doNothing,
    cancelSleepTimer: doNothing,
    promptRemotePlayback: doNothing,
  };
}

export function testPlayerClock(
  patch: Partial<StudioPlayerClock> = {},
): StudioPlayerClock {
  return { ...STOPPED_PLAYER_CLOCK, ...patch };
}
