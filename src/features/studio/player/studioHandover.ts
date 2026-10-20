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

/** A release the artist marked "Play without gaps" swaps gaplessly between
 *  consecutive playable tracks (live albums and split mixes stay seamless):
 *  the next track's stream names the current track in `gaplessAfterTrackId`.
 *  Every other handover crossfades, an unknown value included. */
export function canCrossfadeBetween(
  current: Pick<StudioQueueItem, "trackId">,
  gaplessAfterTrackId: string | null,
): boolean {
  return gaplessAfterTrackId !== current.trackId;
}
