import type { SavedItem } from "../../../app/providers/useSaved";
import {
  STUDIO_PLAYLIST_LIMITS,
  type StudioLikedTrackEntryDTO,
  type StudioLikedTracksPageDTO,
} from "./studio.types";
import { DEMO_WITHDRAWN_TRACK_IDS } from "./studioDemo.data";
import { demoPublishedTracks } from "./studioDemoPlaylists";

/** Liked songs in the demo, built from the demo member's own saved store the
 *  way the server builds it from `saved_item`. Demo only: every caller
 *  reaches this module through a dynamic import. */

export const DEMO_LIKED_PAGE_SIZE = STUDIO_PLAYLIST_LIMITS.likedTracksPerPage;

const SAVED_TRACK_PREFIX = "studio_track:";

/** The saved store keeps no save time, so every demo like reads this one. */
const DEMO_LIKED_AT = "2026-10-01T12:00:00.000Z";

/** One page of the demo member's likes: every `studio_track:` save in store
 *  order (newest first), a published track as an available row, anything
 *  else unavailable, named withdrawn only for a release our team took down.
 *  The cursor is the next row's index; the counts cover every available
 *  row, as the server's do. */
export function demoLikedTracksPage(
  saved: SavedItem[],
  cursor: string | null,
): StudioLikedTracksPageDTO {
  const tracksById = demoPublishedTracks();
  const likes = saved.filter((item) => item.id.startsWith(SAVED_TRACK_PREFIX));
  const entries = likes.map((item, index): StudioLikedTrackEntryDTO => {
    const trackId = item.id.slice(SAVED_TRACK_PREFIX.length);
    const track = tracksById.get(trackId) ?? null;
    return {
      entryId: `demo-liked-${trackId}`,
      position: index + 1,
      addedAt: DEMO_LIKED_AT,
      isAvailable: track !== null,
      track,
      ...(track === null && DEMO_WITHDRAWN_TRACK_IDS.has(trackId)
        ? { unavailableReason: "withdrawn" as const }
        : {}),
      trackId,
      savedTitle: item.title,
    };
  });
  const availableTracks = entries.flatMap((entry) =>
    entry.track ? [entry.track] : [],
  );
  const parsedOffset = cursor ? Number(cursor) : 0;
  const offset =
    Number.isInteger(parsedOffset) && parsedOffset > 0 ? parsedOffset : 0;
  const nextOffset = offset + DEMO_LIKED_PAGE_SIZE;
  const hasMore = nextOffset < entries.length;
  return {
    items: entries.slice(offset, nextOffset),
    pageInfo: { nextCursor: hasMore ? String(nextOffset) : null, hasMore },
    trackCount: availableTracks.length,
    totalDurationSeconds: availableTracks.reduce(
      (sum, track) => sum + (track.durationSeconds ?? 0),
      0,
    ),
  };
}
