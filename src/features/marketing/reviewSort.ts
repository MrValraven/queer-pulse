import type { Review } from "./directoryPlaces";

/**
 * Client-side review sort modes.
 *
 * "newest" is the default and does no reordering of its own: the server already
 * sends the list recency-ordered (live payloads also carry `createdAt`), so
 * newest-first means "the order the server sent", plus any just-posted review
 * the optimistic update prepended.
 *
 * "oldest" is the exact inverse of that incoming order rather than a
 * `createdAt` comparison, because the demo fixture carries no `createdAt` at
 * all: reversing the server's order gives the right answer in both modes,
 * where a date sort would collapse the whole demo list into one tie.
 *
 * "helpful" ranks by the members-found-this-helpful count, which is a real,
 * member-driven number again now that the vote control writes to it. Reviews
 * with no votes keep their incoming recency order behind the voted ones,
 * because the sort is stable.
 */
export type ReviewSort = "newest" | "oldest" | "highest" | "lowest" | "helpful";

/** Star-rating filter value: "all", or a stringified 1–5 star rating (the
 *  `<select>`/chip value type, kept as a string to match the shared chip
 *  controls' `value: string` API). */
export type ReviewStarFilter = string;

/**
 * Content filters, applied on top of the star filter. Multi-select and ANDed:
 * each active chip narrows the list further, so "photos" + "reply" means
 * reviews that have both. Values are the `<ChipSelect>` `Set<string>` members.
 */
export type ReviewContentFilter = "photos" | "reply";

/** Does the review carry a photo the gallery can actually show? */
function hasPhoto(review: Review): boolean {
  return Boolean(review.photoUrl);
}

/** Has the listing's owner answered this review publicly? */
function hasOwnerReply(review: Review): boolean {
  return Boolean(review.ownerReply);
}

/** 5★→1★ counts, e.g. { 5: 12, 4: 3, 3: 0, 2: 1, 1: 0 }. Shared by the rating
 *  distribution bars and the review star-filter chips (which show the same
 *  per-star counts next to each option). */
export function countByStar(reviews: Review[]): Record<number, number> {
  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const review of reviews) {
    const stars = Math.min(5, Math.max(1, Math.round(review.stars)));
    counts[stars] = (counts[stars] ?? 0) + 1;
  }
  return counts;
}

/**
 * How many reviews each content filter would match, over the unfiltered list.
 * The controls use these both to label a chip and to drop it entirely when the
 * count is zero, since a chip that can only ever empty the list is a trap.
 */
export function countByContent(
  reviews: Review[],
): Record<ReviewContentFilter, number> {
  return {
    photos: reviews.filter(hasPhoto).length,
    reply: reviews.filter(hasOwnerReply).length,
  };
}

/**
 * Apply the star filter, then the content filters, then the sort, over a
 * **copy** of `reviews`: never mutates the source array (which is
 * `place.reviews`, owned by the caller). `Array.prototype.sort` is a stable
 * sort in all supported engines, so the star sorts keep the incoming (recency)
 * order inside each star bucket.
 */
export function sortAndFilterReviews(
  reviews: Review[],
  sort: ReviewSort,
  starFilter: ReviewStarFilter,
  contentFilters: ReadonlySet<ReviewContentFilter> = new Set(),
): Review[] {
  const byStar =
    starFilter === "all"
      ? reviews
      : reviews.filter(
          (review) => Math.round(review.stars) === Number(starFilter),
        );

  const filtered = byStar.filter(
    (review) =>
      (!contentFilters.has("photos") || hasPhoto(review)) &&
      (!contentFilters.has("reply") || hasOwnerReply(review)),
  );

  // "newest": the server's own order, untouched (see ReviewSort above).
  if (sort === "newest") return [...filtered];

  if (sort === "oldest") return [...filtered].reverse();

  if (sort === "helpful") {
    return [...filtered].sort(
      (first, second) => second.helpful - first.helpful,
    );
  }

  return [...filtered].sort((first, second) =>
    sort === "highest"
      ? second.stars - first.stars
      : first.stars - second.stars,
  );
}
