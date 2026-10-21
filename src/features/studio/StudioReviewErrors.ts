import { ApiError } from "../../shared/api/client";
import { studioErrorCodeOf } from "./api/studio.api";
import type { StudioErrorCode } from "./api/studio.types";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import { studioReasonOf } from "./studioReason";

/** Refusals that mean the card already moved on: someone else decided it,
 *  or the artist or claimant changed it first. The dialog closes and the
 *  queues re-read (each mutation hook does that on every refusal). */
const SETTLED_ELSEWHERE: ReadonlySet<StudioErrorCode> = new Set([
  "studio_dispute_not_open",
  "studio_takedown_report_not_open",
  "studio_release_not_taken_down",
  "studio_claim_not_submitted",
  "studio_claim_not_decidable",
  "studio_claim_not_live",
]);

/** A coded refusal from the list above, or an uncoded 404 or 409: the card
 *  is gone or already decided by someone else. */
export function isReviewSettledElsewhere(error: unknown): boolean {
  const code = studioErrorCodeOf(error);
  if (code) return SETTLED_ELSEWHERE.has(code);
  return (
    error instanceof ApiError && (error.status === 404 || error.status === 409)
  );
}

/**
 * The line staff read when a decision fails, as a catalog key. A coded
 * refusal keeps its own sentence; an uncoded 404 or 409 says the card was
 * already decided; offline, timeout, rate limit and server failures each
 * name their cause. Only a failure with no cause we can name reads "That
 * didn't go through".
 */
export function reviewErrorKeyOf(error: unknown): string {
  if (studioErrorCodeOf(error)) return studioErrorMessageKeyOf(error);
  if (isReviewSettledElsewhere(error))
    return "studio:flagReviewLive.toast.settledElsewhere";
  if (studioReasonOf(error) === "unknown")
    return "studio:flagReviewLive.toast.actionError";
  return studioErrorMessageKeyOf(error);
}
