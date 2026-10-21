import { ApiError } from "../../shared/api/client";
import type { TFunction } from "../../shared/i18n/types";
import { isGuestCapError, isRsvpsClosedError } from "../gatherings/rsvpErrors";
import { MAX_RSVP_GUESTS } from "../gatherings/rsvpGuestCap";

/** The server's sentence when the event filled before the accept landed. */
const EVENT_FULL_MESSAGE = "This event is full";

/** Did the server refuse the accept because the event filled first? */
function isEventFullError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 400 &&
    error.message.includes(EVENT_FULL_MESSAGE)
  );
}

/** Did the server answer that the invite is no longer open (already
 *  answered, withdrawn or declined elsewhere)? Retrying cannot help, so the
 *  accept modal closes and the card refreshes away. */
export function isInviteNoLongerOpenError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409;
}

/** The toast for a failed invite accept, in the reader's own language. */
export function acceptInviteErrorMessage(error: unknown, t: TFunction): string {
  if (isInviteNoLongerOpenError(error)) {
    return t("myevents:acceptModal.noLongerOpenToast");
  }
  if (isRsvpsClosedError(error)) return t("myevents:rsvpModal.closedToast");
  if (isEventFullError(error)) return t("myevents:acceptModal.fullToast");
  return t("myevents:acceptModal.errorToast");
}

/** The toast for a failed "Anything we should know?" save from My Events:
 *  the cutoff and the guest cap said plainly, the form's retry line
 *  otherwise. */
export function rsvpDetailsSaveErrorMessage(
  error: unknown,
  t: TFunction,
): string {
  if (isRsvpsClosedError(error)) return t("myevents:rsvpModal.closedToast");
  if (isGuestCapError(error)) {
    return t("gatherings:rsvpInvites.capToast", { max: MAX_RSVP_GUESTS });
  }
  return t("myevents:rsvpModal.saveErrorToast");
}
