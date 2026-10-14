import type { StudioPlayerActions } from "./studioPlayerContext";

/** Action proxies that never change identity: each call reaches the latest
 *  render's actions through `latest`, so the context value is not rebuilt as
 *  playback state changes. */
export function createStableActions(
  latest: () => StudioPlayerActions,
): StudioPlayerActions {
  return {
    playRelease: (releaseId, startTrackId, startAtSeconds) =>
      latest().playRelease(releaseId, startTrackId, startAtSeconds),
    playReleases: (releaseIds) => latest().playReleases(releaseIds),
    playTracks: (items, startTrackId, source, startAtSeconds) =>
      latest().playTracks(items, startTrackId, source, startAtSeconds),
    togglePlay: () => latest().togglePlay(),
    next: () => latest().next(),
    previous: () => latest().previous(),
    seek: (seconds) => latest().seek(seconds),
    retry: () => latest().retry(),
    stop: () => latest().stop(),
    playNext: (trackId) => latest().playNext(trackId),
    addToQueue: (trackId) => latest().addToQueue(trackId),
    moveUserItem: (fromIndex, toIndex) =>
      latest().moveUserItem(fromIndex, toIndex),
    moveUpcomingSourceItem: (fromIndex, toIndex) =>
      latest().moveUpcomingSourceItem(fromIndex, toIndex),
    removeEntry: (queueEntryId) => latest().removeEntry(queueEntryId),
    clearUserQueue: () => latest().clearUserQueue(),
    playEntry: (queueEntryId) => latest().playEntry(queueEntryId),
    toggleShuffle: () => latest().toggleShuffle(),
    cycleRepeat: () => latest().cycleRepeat(),
    setVolume: (volume) => latest().setVolume(volume),
    toggleMute: () => latest().toggleMute(),
    setCrossfadeSeconds: (seconds) => latest().setCrossfadeSeconds(seconds),
    setLoudnessEven: (isEven) => latest().setLoudnessEven(isEven),
    startSleepTimer: (option) => latest().startSleepTimer(option),
    cancelSleepTimer: () => latest().cancelSleepTimer(),
    promptRemotePlayback: () => latest().promptRemotePlayback(),
  };
}
