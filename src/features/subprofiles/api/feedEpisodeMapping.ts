import { MAX_ITEMS_PER_SECTION } from "../subprofileEditor.data";
import type { FeedEntryDTO, FeedEpisodeFields } from "./subprofileFeeds.api";
import type { SubprofileItemDTO, SubprofileSection } from "./subprofiles.api";

/**
 * How a feed episode becomes a persona item. The server does the real
 * mapping on publish; this is the same rule set, kept in one place so the demo
 * store writes exactly what the live API would and the review queue shows
 * each episode the way it will read on the page.
 */

/** Truncation limits for the item's title and description. */
export const ITEM_TITLE_MAX_LENGTH = 200;
export const ITEM_DESCRIPTION_MAX_LENGTH = 2000;

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;

/** `"48 min"` / `"1 h 12 min"`, or null when there is no usable duration.
 *  Rounds to the nearest minute; anything under a minute reads "1 min". */
export function formatEpisodeDuration(
  durationSeconds: number | null,
): string | null {
  if (
    durationSeconds === null ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0
  ) {
    return null;
  }
  const totalMinutes = Math.max(
    1,
    Math.round(durationSeconds / SECONDS_PER_MINUTE),
  );
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  if (hours === 0) return `${minutes} min`;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

/** `"S2 · E14"` / `"E14"`, or null without an episode number. A season with no
 *  episode number says nothing useful on its own, so it is dropped. */
export function formatEpisodeSubtitle(
  season: number | null,
  episode: number | null,
): string | null {
  if (episode === null) return null;
  return season === null ? `E${episode}` : `S${season} · E${episode}`;
}

/** `yyyy-mm` (the editor's month format) from an ISO timestamp, in UTC so the
 *  same episode lands in the same month for everyone. */
export function episodeMonth(publishedAt: string | null): string | null {
  if (!publishedAt) return null;
  const parsed = new Date(publishedAt);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 7);
}

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

/** Newest first; an undated episode sorts last. */
export function byNewestFirst(
  left: Pick<FeedEpisodeFields, "publishedAt">,
  right: Pick<FeedEpisodeFields, "publishedAt">,
): number {
  const leftTime = left.publishedAt ? Date.parse(left.publishedAt) : -Infinity;
  const rightTime = right.publishedAt
    ? Date.parse(right.publishedAt)
    : -Infinity;
  return rightTime - leftTime;
}

/** The id a published entry's persona item carries (demo store). */
export const feedItemId = (entryId: string): string => `itm-feed-${entryId}`;

/** The persona item a published entry becomes (demo store). The episode link
 *  is kept only when it is an http(s) address, mirroring the server's safe-URL
 *  rule. `now` stamps the row's first-published time. */
export function entryToItem(
  entry: FeedEntryDTO,
  section: SubprofileSection,
  now: string,
): SubprofileItemDTO {
  const link = entry.link?.trim() ?? "";
  return {
    id: feedItemId(entry.id),
    section,
    createdAt: now,
    title: truncate(entry.title, ITEM_TITLE_MAX_LENGTH),
    subtitle: formatEpisodeSubtitle(entry.season, entry.episode),
    description: entry.description
      ? truncate(entry.description, ITEM_DESCRIPTION_MAX_LENGTH)
      : null,
    url: /^https?:\/\//i.test(link) ? link : null,
    imageUrl: null,
    date: episodeMonth(entry.publishedAt),
    meta: formatEpisodeDuration(entry.durationSeconds),
    tags: [],
    isFeatured: false,
    collaborators: [],
  };
}

/** How many more items a section can take before the cap. */
export function sectionRoom(itemCount: number): number {
  return Math.max(0, MAX_ITEMS_PER_SECTION - itemCount);
}
