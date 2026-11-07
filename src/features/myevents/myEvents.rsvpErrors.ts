import { ApiError } from "../../shared/api/client";
import { causeErrorKey } from "../../shared/api/causeErrorKey";
import type { TFunction } from "../../shared/i18n/types";
import {
  causeMessage,
  sentenceCauseKey,
  type SentenceCause,
} from "../gatherings/gatheringActionErrors";
import {
  isGuestCapError,
  isRsvpsClosedError,
  rsvpDetailsSaveErrorMessage as gatheringRsvpDetailsSaveErrorMessage,
} from "../gatherings/rsvpErrors";
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

/** The accept route's refusals that carry no machine `code` (`event-invites
 *  .service.ts`), matched by their English sentence: an event cancelled
 *  since the invite went out (a 409, like "already answered", so it has to be
 *  checked first), an invite addressed to somebody else, and a missing
 *  visibility choice. */
const ACCEPT_INVITE_SENTENCE_CAUSES: readonly SentenceCause[] = [
  {
    status: 409,
    sentence: "This event has been cancelled",
    key: "myevents:acceptModal.eventCancelledToast",
  },
  {
    status: 403,
    sentence: "This invite is not addressed to you",
    key: "myevents:acceptModal.notYoursToast",
  },
  {
    status: 400,
    sentence: "Choose who can see you are going",
    key: "myevents:acceptModal.chooseVisibilityToast",
  },
];

/** The toast for a failed invite accept, in the reader's own language. */
export function acceptInviteErrorMessage(error: unknown, t: TFunction): string {
  const sentenceKey = sentenceCauseKey(error, ACCEPT_INVITE_SENTENCE_CAUSES);
  if (sentenceKey) return t(sentenceKey);
  if (isInviteNoLongerOpenError(error)) {
    return t("myevents:acceptModal.noLongerOpenToast");
  }
  if (isRsvpsClosedError(error)) return t("myevents:rsvpModal.closedToast");
  if (isEventFullError(error)) return t("myevents:acceptModal.fullToast");
  return causeMessage(t, causeErrorKey(error));
}

/** The cause line for a My Events action that is a plain fetch or write with
 *  no refusal of its own (the calendar feed link, the join link): offline,
 *  signed out, a missing target, a rate limit, a server fault. */
export function myEventsActionErrorMessage(
  error: unknown,
  t: TFunction,
): string {
  return causeMessage(t, causeErrorKey(error));
}

/** The toast for a failed "Anything we should know?" save from My Events:
 *  the cutoff and the guest cap said plainly, then the same refusals and
 *  shared cause lines the event page's save reads. */
export function rsvpDetailsSaveErrorMessage(
  error: unknown,
  t: TFunction,
): string {
  if (isRsvpsClosedError(error)) return t("myevents:rsvpModal.closedToast");
  if (isGuestCapError(error)) {
    return t("gatherings:rsvpInvites.capToast", { max: MAX_RSVP_GUESTS });
  }
  return gatheringRsvpDetailsSaveErrorMessage(error, t);
}
