import { normalizeCategory } from "./localCategories";
import type { DirectoryPlace } from "./directoryPlaces";

/** Below this many same-category matches, broaden to same-hood (any category) too. */
const MIN_SAME_CATEGORY = 2;

/**
 * The places related to `place`, best first: same category, then (when there
 * are too few) same neighbourhood in any category, same-hood matches sorted to
 * the front. A place without a hood has no neighbourhood to match, so an empty
 * hood never counts as a match and never widens the pool; with too few
 * same-category peers the list is empty and the caller renders nothing.
 */
export function relatedPlacesFor(
  place: DirectoryPlace,
  places: DirectoryPlace[],
): DirectoryPlace[] {
  const hasHood = place.hood.trim() !== "";
  const isSameHood = (candidate: DirectoryPlace) =>
    hasHood && candidate.hood === place.hood;

  const placeCategory = normalizeCategory(place.cat);
  const sameCategory = places.filter(
    (candidate) =>
      candidate.slug !== place.slug &&
      normalizeCategory(candidate.cat) === placeCategory,
  );
  if (!hasHood && sameCategory.length < MIN_SAME_CATEGORY) return [];

  let pool = sameCategory;
  if (hasHood && sameCategory.length < MIN_SAME_CATEGORY) {
    pool = [...sameCategory];
    for (const candidate of places) {
      if (
        candidate.slug !== place.slug &&
        isSameHood(candidate) &&
        !pool.some((existing) => existing.slug === candidate.slug)
      ) {
        pool.push(candidate);
      }
    }
  }

  return [...pool].sort(
    (first, second) =>
      (isSameHood(first) ? 0 : 1) - (isSameHood(second) ? 0 : 1),
  );
}
