import { ApiError } from "../../shared/api/client";
import { reasonFor } from "../../shared/api/errorMessage";
import type { TFunction } from "../../shared/i18n/types";
import { MAX_RSVP_GUESTS } from "./rsvpGuestCap";

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
 * with no waitlist). The backend writes it in English only, so an English
 * reader gets the server's sentence through `reasonFor`, and every other
 * language gets the generic retry line in the reader's own language.
 * The one the page can predict, the host's RSVP cutoff having passed, is
 * matched and said in the reader's own language.
 * Anything else falls back to the generic retry line.
 */

/** The backend's sentence for an RSVP after the cutoff: `RSVPS_CLOSED_MESSAGE`
 *  in `queerpulse-backend/src/events/gathering-extras.ts`. The second entry is
 *  the wording a backend deployed before the "event" rename still sends; drop
 *  it once both sides have shipped. */
const RSVPS_CLOSED_MESSAGES = [
  "RSVPs for this event have closed",
  "RSVPs for this gathering have closed",
];

/** Did the server refuse because the host's RSVP cutoff has passed? Also the
 *  answer to a member raising their guest count after the cutoff. */
export function isRsvpsClosedError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 400 &&
    RSVPS_CLOSED_MESSAGES.some((message) => error.message.includes(message))
  );
}

/** The backend's sentence for a raise or an invite past the guest cap:
 *  `RSVP_GUEST_CAP_MESSAGE` in
 *  `queerpulse-backend/src/events/gathering-extras.ts`. */
const RSVP_GUEST_CAP_MESSAGE = "You can bring up to 3 people on one RSVP";

/** Did the server refuse because guests plus open invites would pass the
 *  cap? Answers a guest-count save and an invite send alike. */
export function isGuestCapError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 400 &&
    error.message.includes(RSVP_GUEST_CAP_MESSAGE)
  );
}

/** A failed "Anything we should know?" save on the event page: the closed
 *  cutoff and the guest cap in the reader's language, and the form's own
 *  retry line otherwise. */
export function rsvpDetailsSaveErrorMessage(
  error: unknown,
  t: TFunction,
): string {
  if (isRsvpsClosedError(error)) return t("gatherings:rsvpControl.closedToast");
  if (isGuestCapError(error)) {
    return t("gatherings:rsvpInvites.capToast", { max: MAX_RSVP_GUESTS });
  }
  return t("gatherings:rsvpDetails.saveErrorToast");
}

/** A refused invite send in the reader's language: the cutoff, the cap, or
 *  the send's own retry line. */
export function rsvpInviteSendErrorMessage(
  error: unknown,
  t: TFunction,
): string {
  if (isRsvpsClosedError(error)) return t("gatherings:rsvpControl.closedToast");
  if (isGuestCapError(error)) {
    return t("gatherings:rsvpInvites.capToast", { max: MAX_RSVP_GUESTS });
  }
  return t("gatherings:rsvpInvites.sendErrorToast");
}

/** `language` is the reader's UI language, from `useTranslation()`. */
export function rsvpErrorMessage(
  error: unknown,
  t: TFunction,
  language: string,
): string {
  if (isRsvpsClosedError(error)) return t("gatherings:rsvpControl.closedToast");
  if (error instanceof ApiError) {
    if (error.status === 403) return t("gatherings:rsvpControl.refusedToast");
    if (error.status === 400) {
      const isEnglishReader = language.toLowerCase().startsWith("en");
      const serverReason = isEnglishReader ? reasonFor(error) : null;
      return serverReason ?? t("gatherings:rsvpControl.errorToast");
    }
    if (error.status === 404) return t("gatherings:rsvpControl.goneToast");
  }
  return t("gatherings:rsvpControl.errorToast");
}
