import type { Review } from "./directoryPlaces";

/**
 * Client-side review sort modes. There is no `createdAt`/date field on the FE
 * `Review` type (see `directoryPlaces.ts`), so "most recent" is intentionally
 * not offered here — only fields that actually exist on the review.
 */
export type ReviewSort = "helpful" | "highest" | "lowest";

/** Star-rating filter value: "all", or a stringified 1–5 star rating (the
 *  `<select>`/chip value type, kept as a string to match the shared chip
 *  controls' `value: string` API). */
export type ReviewStarFilter = string;

/**
 * Apply the star filter then the sort, over a **copy** of `reviews` — never
 * mutates the source array (which is `place.reviews`, owned by the caller).
 * `Array.prototype.sort` is a stable sort in all supported engines, so the
 * default "helpful" mode preserves the backend's existing helpful-desc/
 * recency tiebreak order exactly (unchanged behaviour when controls are
 * hidden or left at their defaults).
 */
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

  return [...filtered].sort((a, b) => {
    if (sort === "highest") return b.stars - a.stars;
    if (sort === "lowest") return a.stars - b.stars;
    return b.helpful - a.helpful; // "helpful" — the default, matches backend order
  });
}
