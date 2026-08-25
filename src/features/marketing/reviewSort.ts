import type { Review } from "./directoryPlaces";

/**
 * Client-side review sort modes.
 *
 * "newest" is the default and does no reordering of its own: the server already
 * sends the list recency-ordered (live payloads also carry `createdAt`), so
 * newest-first means "the order the server sent", plus any just-posted review
 * the optimistic update prepended.
 *
 * "helpful" ranks by the members-found-this-helpful count, which is a real,
 * member-driven number again now that the vote control writes to it. Reviews
 * with no votes keep their incoming recency order behind the voted ones,
 * because the sort is stable.
 */
export type ReviewSort = "newest" | "highest" | "lowest" | "helpful";

/** Star-rating filter value: "all", or a stringified 1–5 star rating (the
 *  `<select>`/chip value type, kept as a string to match the shared chip
 *  controls' `value: string` API). */
export type ReviewStarFilter = string;

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
 * Apply the star filter then the sort, over a **copy** of `reviews`: never
 * mutates the source array (which is `place.reviews`, owned by the caller).
 * `Array.prototype.sort` is a stable sort in all supported engines, so the
 * star sorts keep the incoming (recency) order inside each star bucket.
 */
export function sortAndFilterReviews(
  reviews: Review[],
  sort: ReviewSort,
  starFilter: ReviewStarFilter,
): Review[] {
  const filtered =
    starFilter === "all"
      ? reviews
      : reviews.filter(
          (review) => Math.round(review.stars) === Number(starFilter),
        );

  // "newest": the server's own order, untouched (see ReviewSort above).
  if (sort === "newest") return [...filtered];

  if (sort === "helpful") {
    return [...filtered].sort(
      (first, second) => second.helpful - first.helpful,
    );
  }

  return [...filtered].sort((first, second) =>
    sort === "highest" ? second.stars - first.stars : first.stars - second.stars,
  );
}
