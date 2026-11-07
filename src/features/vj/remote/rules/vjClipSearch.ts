/**
 * Clip search on the remote grid (design 7.4): the search field shows once a
 * pack holds more than 24 clips, matching ignores accents, case and spacing,
 * and results keep pack order.
 */

/** Search shows when a pack holds MORE than this many clips. */
export const VJ_SEARCH_MIN_CLIPS = 24;

export function isVjSearchAvailable(clipCount: number): boolean {
  return clipCount > VJ_SEARCH_MIN_CLIPS;
}

const COMBINING_MARKS = /\p{M}/gu;
const WHITESPACE_RUNS = /\s+/g;

/** NFD, strips combining marks, lower case, trims and collapses spaces. */
export function normalizeVjSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .trim()
    .replace(WHITESPACE_RUNS, " ");
}

/**
 * The clips whose title holds every word of the query, in pack order.
 * `isFavoritesOnly` keeps favorites alone; an empty query keeps every clip.
 */
export function filterVjClips<
  Clip extends { title: string; isFavorite: boolean },
>(
  clips: readonly Clip[],
  query: string,
  options: { isFavoritesOnly: boolean },
): Clip[] {
  const normalizedQuery = normalizeVjSearch(query);
  const queryWords = normalizedQuery === "" ? [] : normalizedQuery.split(" ");
  return clips.filter((clip) => {
    if (options.isFavoritesOnly && !clip.isFavorite) return false;
    if (queryWords.length === 0) return true;
    const normalizedTitle = normalizeVjSearch(clip.title);
    return queryWords.every((queryWord) => normalizedTitle.includes(queryWord));
  });
}
