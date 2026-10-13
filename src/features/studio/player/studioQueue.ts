import type {
  StudioReleaseView,
  StudioSearchTrackView,
} from "../api/studio.adapters";
import type { StudioQueueItem } from "./studioPlayerContext";

/** A release's tracks that have confirmed audio, in tracklist order. */
export function queueFromRelease(
  release: StudioReleaseView,
): StudioQueueItem[] {
  return release.tracks
    .filter((track) => track.hasAudio)
    .map((track) => ({
      trackId: track.id,
      title: track.title,
      durationSeconds: track.durationSeconds,
      trackHref: track.href,
      releaseId: release.id,
      releaseTitle: release.title,
      coverUrl: release.coverUrl,
      tint: release.tint,
      artistId: release.artist.id,
      artistName: release.artist.name,
      artistHref: release.artist.href,
    }));
}

export function startIndexFor(
  queue: StudioQueueItem[],
  startTrackId?: string,
): number {
  if (!startTrackId) return 0;
  const index = queue.findIndex((item) => item.trackId === startTrackId);
  return index >= 0 ? index : 0;
}

/** One playlist track as a queue item; its release card carries the cover
 *  and the artist. */
export function queueItemFromTrack(
  track: StudioSearchTrackView,
): StudioQueueItem {
  return {
    trackId: track.id,
    title: track.title,
    durationSeconds: track.durationSeconds,
    trackHref: track.href,
    releaseId: track.release.id,
    releaseTitle: track.release.title,
    coverUrl: track.release.coverUrl,
    tint: track.release.tint,
    artistId: track.release.artist.id,
    artistName: track.release.artist.name,
    artistHref: track.release.artist.href,
  };
}

/** Tracks with confirmed audio, in the order given. */
export function queueFromTracks(
  tracks: StudioSearchTrackView[],
): StudioQueueItem[] {
  return tracks.filter((track) => track.hasAudio).map(queueItemFromTrack);
}

/** Shuffle (Fisher and Yates), computed in the browser and sent nowhere.
 *  Returns a new array; `random` is a seam for tests. */
export function shuffledQueue(
  items: StudioQueueItem[],
  random: () => number = Math.random,
): StudioQueueItem[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    const other = shuffled[swapIndex];
    if (current === undefined || other === undefined) continue;
    shuffled[index] = other;
    shuffled[swapIndex] = current;
  }
  return shuffled;
}
