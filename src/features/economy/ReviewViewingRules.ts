import type { HousingViewingReviewPairDTO } from "./api/housingReviews.api";

/**
 * A review has to say something. The same floor governs the first submission
 * and every later correction, because both write the same column: a form that
 * let an edit shrink a review below what submitting one requires would be two
 * different answers to "what may a review contain".
 *
 * Its own module rather than a second export from `ReviewViewingForm`, so that
 * file stays a component-only module and keeps fast refresh working.
 */
export const HOUSING_REVIEW_MIN_LENGTH = 20;

export function isHousingReviewLongEnough(text: string): boolean {
  return text.trim().length >= HOUSING_REVIEW_MIN_LENGTH;
}

/**
 * Has the member's own review already gone public, so the edit window is shut?
 *
 * ONE PLACE READS THE WIRE FIELD, and this is it. The pair DTO's
 * `isYourReviewRevealed` is computed by the backend from the same predicate
 * `PATCH /housing-reviews/:reviewId` gates on, so a save control offered while
 * this returns `false` is a control the endpoint will accept. Reading the raw
 * field at each call site would put the absent-field decision below in two
 * places and let them drift.
 *
 * WHAT AN ABSENT FIELD MEANS, AND WHY IT FAILS THIS WAY. The field is optional
 * on the wire: the hand-authored demo fixtures do not carry it, and a backend
 * that has not shipped it omits it. Absence falls back to the counterparty
 * signals, which is exactly the gate this surface used before the field
 * existed. That is the honest floor rather than a default in either direction.
 * Answering "public" would take the correction away from every member on an
 * older backend and from every demo reader, over a field nobody sent. Answering
 * "still private" would go the other way and offer a save on a review the
 * counterparty has visibly already answered, which the wire does say. The
 * fallback keeps the strictly-better half of the old behaviour and no more, and
 * the 409 in `ReviewViewingEditPanel` still catches whatever it misses.
 *
 * `counterpartyReview` is read beside `counterpartySubmitted` because the two
 * arrive together and either one being present means both parties filed, which
 * reveals both reviews at once.
 */
export function hasHousingReviewGonePublic(
  pair: HousingViewingReviewPairDTO | null | undefined,
): boolean {
  if (!pair) return false;
  if (typeof pair.isYourReviewRevealed === "boolean") {
    return pair.isYourReviewRevealed;
  }
  return (
    Boolean(pair.counterpartySubmitted) || pair.counterpartyReview !== null
  );
}
