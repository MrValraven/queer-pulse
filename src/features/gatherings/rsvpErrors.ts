import { ApiError } from "../../shared/api/client";
import type { CauseErrorOverrides } from "../../shared/api/causeErrorKey";
import { reasonFor } from "../../shared/api/errorMessage";
import type { TFunction } from "../../shared/i18n/types";
import {
  actionCauseCopy,
  causeMessage,
  sentenceCauseKey,
  type SentenceCause,
} from "./gatheringActionErrors";
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
 * The refusals the page can predict (the host's RSVP cutoff, an event that is
 * not open, over, or full) are matched and said in the reader's own language.
 * Anything else reads the shared cause line for its status (`causeErrorKey`):
 * offline, signed out, restricted, rate limited, a server fault.
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

/** The refusals `rsvp.service.ts` and `member-event-invites.service.ts` send
 *  as a plain 400 with no machine `code`, matched by their English sentence
 *  (see `gatheringActionErrors.ts` for why). */
const RSVP_SENTENCE_CAUSES: readonly SentenceCause[] = [
  {
    status: 400,
    sentence: "Event is not open for RSVPs",
    key: "gatherings:rsvpControl.notOpenToast",
  },
  {
    status: 400,
    sentence: "This event has already happened",
    key: "gatherings:rsvpControl.endedToast",
  },
  {
    status: 400,
    sentence: "This event is full",
    key: "gatherings:rsvpControl.fullToast",
  },
  {
    status: 400,
    sentence: "The host is always going to their own event",
    key: "gatherings:actionError.hostAlwaysGoing",
  },
];

/** The 403 on an RSVP is a host removal or a block (one sentence for both, on
 *  purpose); a moderation restriction and an inactive membership are also
 *  403s, which `causeErrorKey` names ahead of this line. A 404 is an event
 *  that is gone. */
const RSVP_OVERRIDES: CauseErrorOverrides = {
  403: "gatherings:rsvpControl.refusedToast",
  404: "gatherings:rsvpControl.goneToast",
};

/** Saving the "Anything we should know?" details of an RSVP: the cutoff, the
 *  guest cap, a raise past the seats left, or no RSVP to save onto. */
const RSVP_DETAILS_SENTENCE_CAUSES: readonly SentenceCause[] = [
  {
    status: 400,
    sentence: "There is not enough room left for that many guests",
    key: "gatherings:rsvpDetails.notEnoughRoomToast",
  },
  {
    status: 404,
    sentence: "You do not have an active RSVP",
    key: "gatherings:rsvpDetails.noActiveRsvpToast",
  },
  ...RSVP_SENTENCE_CAUSES,
];

/** Sending invites from an RSVP: the event not published or over, and the
 *  403 for a member who has no going or maybe RSVP. */
const RSVP_INVITE_SENTENCE_CAUSES: readonly SentenceCause[] = [
  {
    status: 400,
    sentence: "Only a published event can send invites",
    key: "gatherings:actionError.notPublished",
  },
  {
    status: 400,
    sentence: "This event has already happened",
    key: "gatherings:rsvpControl.endedToast",
  },
  {
    status: 403,
    sentence: "RSVP going or maybe to invite your connections",
    key: "gatherings:rsvpInvites.needRsvpToast",
  },
];

/** A failed "Anything we should know?" save on the event page: the closed
 *  cutoff and the guest cap in the reader's language, then the other known
 *  refusals, then the shared cause (offline, a fault, a rate limit). */
export function rsvpDetailsSaveErrorMessage(
  error: unknown,
  t: TFunction,
): string {
  if (isRsvpsClosedError(error)) return t("gatherings:rsvpControl.closedToast");
  if (isGuestCapError(error)) {
    return t("gatherings:rsvpInvites.capToast", { max: MAX_RSVP_GUESTS });
  }
  return causeMessage(t, actionCauseCopy(error, RSVP_DETAILS_SENTENCE_CAUSES));
}

/** A refused invite send in the reader's language: the cutoff, the cap, the
 *  other known refusals, then the shared cause. */
export function rsvpInviteSendErrorMessage(
  error: unknown,
  t: TFunction,
): string {
  if (isRsvpsClosedError(error)) return t("gatherings:rsvpControl.closedToast");
  if (isGuestCapError(error)) {
    return t("gatherings:rsvpInvites.capToast", { max: MAX_RSVP_GUESTS });
  }
  return causeMessage(t, actionCauseCopy(error, RSVP_INVITE_SENTENCE_CAUSES));
}

/** `language` is the reader's UI language, from `useTranslation()`. */
export function rsvpErrorMessage(
  error: unknown,
  t: TFunction,
  language: string,
): string {
  if (isRsvpsClosedError(error)) return t("gatherings:rsvpControl.closedToast");
  const sentenceKey = sentenceCauseKey(error, RSVP_SENTENCE_CAUSES);
  if (sentenceKey) return t(sentenceKey);
  if (error instanceof ApiError && error.status === 400) {
    // A 400 the page cannot predict: an English reader gets the server's own
    // sentence, every other language the shared invalid-details line.
    const isEnglishReader = language.toLowerCase().startsWith("en");
    const serverReason = isEnglishReader ? reasonFor(error) : null;
    if (serverReason) return serverReason;
  }
  return causeMessage(t, actionCauseCopy(error, [], RSVP_OVERRIDES));
}
