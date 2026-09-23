import { parseListingDate } from "./directoryPlaces";

/**
 * After six months a confirmation stops being evidence and becomes a date.
 *
 * One number, read by every surface that judges how old a listing's last
 * "still accurate" press is: the public freshness stamp on the detail page,
 * the owner's console band, and the owner editor's confirm card.
 */
export const STALE_AFTER_DAYS = 180;

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** What the last confirmation is worth right now. `"unconfirmed"` covers both
 *  a missing timestamp and an unparseable one: in either case there is no
 *  evidence anyone checked the listing since it was written. */
export type ListingFreshness = "unconfirmed" | "fresh" | "stale";

/**
 * Whole days between the last confirmation and `now`, or `null` when there is
 * no usable timestamp.
 *
 * A timestamp in the future reads as zero days old, so a clock skew can never
 * make a listing look staler or fresher than "confirmed today". Parsing goes
 * through `parseListingDate`, which reads a bare `"YYYY-MM-DD"` as local
 * midnight.
 */
export function listingConfirmationAgeInDays(
  detailsConfirmedAt: string | null | undefined,
  now: Date,
): number | null {
  const confirmedAt = parseListingDate(detailsConfirmedAt);
  if (!confirmedAt) return null;
  return Math.floor(
    Math.max(0, now.getTime() - confirmedAt.getTime()) / MILLISECONDS_PER_DAY,
  );
}

/**
 * The three-way read used by the visitor-facing surfaces: never confirmed,
 * confirmed within the window, or confirmed so long ago that the date is
 * history.
 *
 * Callers that need a middle tier (the owner editor's confirm card escalates
 * at ninety days) read `listingConfirmationAgeInDays` and apply their own
 * thresholds against `STALE_AFTER_DAYS`.
 */
export function listingFreshnessOf(
  detailsConfirmedAt: string | null | undefined,
  now: Date,
): ListingFreshness {
  const ageInDays = listingConfirmationAgeInDays(detailsConfirmedAt, now);
  if (ageInDays === null) return "unconfirmed";
  return ageInDays > STALE_AFTER_DAYS ? "stale" : "fresh";
}
