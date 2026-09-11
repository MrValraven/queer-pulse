import { ApiError } from "../../shared/api/client";
import type { TFunction } from "../../shared/i18n/types";

/**
 * Why an RSVP was refused, said plainly and without leaking (LOC-08).
 *
 * The server answers a barred or blocked member with a 403 rather than a 404,
 * on the reasoning that they already know the gathering exists (they were
 * standing on its page), and pretending otherwise would only make them press
 * the button again.
 *
 * WHAT IT NEVER SAYS. Not who barred them, not who blocked whom, not when, and
 * not why: a host has to be able to close their own door without the decision
 * becoming a message, and a person who blocked somebody must never learn that
 * the other side just tried to join their evening. "The host has removed you
 * from this gathering" is the whole of it, and it is deliberately the same
 * sentence for a bar and for a host-side removal, so the difference between
 * the two is not readable from the outside either.
 *
 * A 400 is a state fact about the gathering itself (it is closed, it is full
 * with no waitlist) and is safe to pass through as the server phrased it.
 * The one the page can predict, the host's RSVP cutoff having passed, is
 * matched and said in the reader's own language.
 * Anything else falls back to the generic retry line.
 */

/** The backend's sentence for an RSVP after the cutoff: `RSVPS_CLOSED_MESSAGE`
 *  in `queerpulse-backend/src/events/gathering-extras.ts`. */
const RSVPS_CLOSED_MESSAGE = "RSVPs for this gathering have closed";

/** Did the server refuse because the host's RSVP cutoff has passed? Also the
 *  answer to a member raising their guest count after the cutoff. */
export function isRsvpsClosedError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 400 &&
    error.message.includes(RSVPS_CLOSED_MESSAGE)
  );
}

/** A failed "Anything we should know?" save on the gathering page: the closed
 *  cutoff in the reader's language, and the form's own retry line otherwise. */
export function rsvpDetailsSaveErrorMessage(
  error: unknown,
  t: TFunction,
): string {
  return isRsvpsClosedError(error)
    ? t("gatherings:rsvpControl.closedToast")
    : t("gatherings:rsvpDetails.saveErrorToast");
}

export function rsvpErrorMessage(error: unknown, t: TFunction): string {
  if (isRsvpsClosedError(error)) return t("gatherings:rsvpControl.closedToast");
  if (error instanceof ApiError) {
    if (error.status === 403) return t("gatherings:rsvpControl.refusedToast");
    if (error.status === 400 && error.message) return error.message;
    if (error.status === 404) return t("gatherings:rsvpControl.goneToast");
  }
  return t("gatherings:rsvpControl.errorToast");
}
