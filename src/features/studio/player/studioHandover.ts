import type { StudioQueueItem } from "./studioPlayerContext";

/** Spec 4.3: fetch the next stream at max(duration - 20 s, duration / 2). */
export const PRELOAD_LEAD_SECONDS = 20;
/** A URL this close to expiry is fetched again (the refresh-before-play rule). */
export const STREAM_EXPIRY_MARGIN_MS = 30_000;

export function preloadStartSeconds(durationSeconds: number): number {
  return Math.max(
    durationSeconds - PRELOAD_LEAD_SECONDS,
    durationSeconds * 0.5,
  );
}

export function crossfadeStartSeconds(
  durationSeconds: number,
  crossfadeSeconds: number,
): number {
  return Math.max(0, durationSeconds - crossfadeSeconds);
}

export function isPreloadFresh(expiresAtMs: number, nowMs: number): boolean {
  return (
    Number.isFinite(expiresAtMs) &&
    expiresAtMs - nowMs > STREAM_EXPIRY_MARGIN_MS
  );
}

/** Crossfade never joins consecutive positions of one release (live albums
 *  and split mixes stay seamless). Without the release's tracklist, two
 *  tracks of one release swap gaplessly. */
export function canCrossfadeBetween(
  current: Pick<StudioQueueItem, "trackId" | "releaseId">,
  next: Pick<StudioQueueItem, "trackId" | "releaseId">,
  releaseTrackIds: readonly string[] | null,
): boolean {
  if (current.releaseId !== next.releaseId) return true;
  if (!releaseTrackIds) return false;
  const currentPosition = releaseTrackIds.indexOf(current.trackId);
  const nextPosition = releaseTrackIds.indexOf(next.trackId);
  if (currentPosition === -1 || nextPosition === -1) return false;
  return nextPosition !== currentPosition + 1;
}
