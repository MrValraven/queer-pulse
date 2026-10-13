import type { StudioReleaseView } from "../api/studio.adapters";
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
