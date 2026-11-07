import { ApiError } from "../../shared/api/client";
import {
  causeErrorKey,
  type CauseErrorCopy,
  type CauseErrorOverrides,
} from "../../shared/api/causeErrorKey";
import type { TFunction } from "../../shared/i18n/types";

/**
 * Why an event action failed, said as the specific cause: the one error-copy
 * helper for the host tools (invites, announcements, requests, guest list,
 * bans, export) and the guest actions that are not an RSVP create (cancel,
 * withdraw an invite, share plans, album photos).
 *
 * Resolution is `causeErrorKey` (offline, signed out, restricted, an inactive
 * membership, a missing target, conflict, rate limited, server fault ...) with this file's own
 * lines on top. A line is chosen by the backend's machine `code` first, then
 * by HTTP status, and only where the backend sends neither does it match the
 * refusal's English sentence (a `SentenceCause`, each marked below). That is
 * the same compromise `rsvpErrors.ts` makes: the events backend throws plain
 * `BadRequestException('...')` for these, with no `code`, so the sentence is
 * the only thing that tells two 400s apart. When the backend grows a code for
 * one, move it into an overrides map and drop the sentence.
 */

/** A refusal the backend identifies only by its English sentence (no `code`).
 *  Matched on the status plus a case-insensitive fragment of the sentence. */
export interface SentenceCause {
  status: number;
  sentence: string;
  key: string;
}

function readsSentence(error: unknown, cause: SentenceCause): boolean {
  return (
    error instanceof ApiError &&
    error.status === cause.status &&
    error.message.toLowerCase().includes(cause.sentence.toLowerCase())
  );
}

/** The catalog key of the first sentence cause `error` matches, or null. */
export function sentenceCauseKey(
  error: unknown,
  causes: readonly SentenceCause[],
): string | null {
  const match = causes.find((cause) => readsSentence(error, cause));
  return match ? match.key : null;
}

/** The cause line for `error`: a matched sentence, else `causeErrorKey` with
 *  the given overrides (machine code, then status, then the shared lines). */
export function actionCauseCopy(
  error: unknown,
  causes: readonly SentenceCause[],
  overrides?: CauseErrorOverrides,
): CauseErrorCopy {
  const key = sentenceCauseKey(error, causes);
  if (key) return { key };
  return causeErrorKey(error, overrides);
}

/** Resolves a cause line in the reader's language, filling in its values. */
export function causeMessage(t: TFunction, copy: CauseErrorCopy): string {
  return t(copy.key, copy.values);
}

/**
 * `queerpulse-backend/src/events`: `event-invites.service.ts` ("Only a
 * published event can send invites"), `event-announcements.service.ts`
 * ("Write something to send"), `rsvp.service.ts` (the waitlist promote
 * refusals and `HOST_ALWAYS_GOING_MESSAGE`) and `event-bans.service.ts`
 * (the three refusals to ban).
 */
const HOST_TOOL_SENTENCE_CAUSES: readonly SentenceCause[] = [
  {
    status: 400,
    sentence: "Only a published event can send invites",
    key: "gatherings:actionError.notPublished",
  },
  {
    status: 400,
    sentence: "Write something to send",
    key: "gatherings:actionError.announceEmpty",
  },
  {
    status: 400,
    sentence: "That member is not on the waitlist",
    key: "gatherings:actionError.notOnWaitlist",
  },
  {
    status: 400,
    sentence: "The event is at capacity",
    key: "gatherings:actionError.atCapacity",
  },
  {
    status: 400,
    sentence: "You cannot bar yourself",
    key: "gatherings:actionError.cannotBanYourself",
  },
  {
    status: 400,
    sentence: "The host cannot be barred",
    key: "gatherings:actionError.cannotBanHost",
  },
  {
    status: 400,
    sentence: "Remove them as a co-host first",
    key: "gatherings:actionError.cannotBanCohost",
  },
  {
    status: 400,
    sentence: "The host is always going to their own event",
    key: "gatherings:actionError.hostSeatHeld",
  },
];

/** Every host tool answers a 403 for somebody who is not the host or a
 *  co-host ("Only the host or a co-host can do that"). A moderation
 *  restriction is also a 403, but `causeErrorKey` names that one first. */
export const HOST_TOOL_OVERRIDES: CauseErrorOverrides = {
  403: "gatherings:actionError.hostOnly",
};

/** An invite request answer (approve or decline) that finds the request
 *  already answered or withdrawn: the one 409 the route sends
 *  (`REQUEST_NOT_APPROVABLE_MESSAGE` / `INVITE_NOT_OPEN_MESSAGE`). */
const INVITE_REQUEST_OVERRIDES: CauseErrorOverrides = {
  ...HOST_TOOL_OVERRIDES,
  409: "gatherings:actionError.requestNotOpen",
};

/** The cause line for a failed host action: invite members, announce, message
 *  attendees, remove or promote a guest, ban, lift a ban, export the list. */
export function hostToolErrorCopy(error: unknown): CauseErrorCopy {
  return actionCauseCopy(error, HOST_TOOL_SENTENCE_CAUSES, HOST_TOOL_OVERRIDES);
}

export function hostToolErrorMessage(error: unknown, t: TFunction): string {
  return causeMessage(t, hostToolErrorCopy(error));
}

/** The cause line for approving or declining an invite request. */
export function inviteRequestErrorMessage(
  error: unknown,
  t: TFunction,
): string {
  return causeMessage(
    t,
    actionCauseCopy(error, HOST_TOOL_SENTENCE_CAUSES, INVITE_REQUEST_OVERRIDES),
  );
}

/** Cancelling your own RSVP. The host cannot cancel the seat they always
 *  hold (`HOST_ALWAYS_GOING_MESSAGE`, a 400); a missing event is a 404. */
const CANCEL_RSVP_SENTENCE_CAUSES: readonly SentenceCause[] = [
  {
    status: 400,
    sentence: "The host is always going to their own event",
    key: "gatherings:actionError.hostAlwaysGoing",
  },
];

const CANCEL_RSVP_OVERRIDES: CauseErrorOverrides = {
  404: "gatherings:rsvpControl.goneToast",
};

export function rsvpCancelErrorMessage(error: unknown, t: TFunction): string {
  return causeMessage(
    t,
    actionCauseCopy(error, CANCEL_RSVP_SENTENCE_CAUSES, CANCEL_RSVP_OVERRIDES),
  );
}

/** Withdrawing an invite you sent: a 409 means it was answered or taken back
 *  already (`INVITE_NOT_OPEN_MESSAGE`). */
const WITHDRAW_INVITE_OVERRIDES: CauseErrorOverrides = {
  409: "gatherings:rsvpInvites.withdrawNotOpenToast",
};

export function inviteWithdrawErrorMessage(
  error: unknown,
  t: TFunction,
): string {
  return causeMessage(t, causeErrorKey(error, WITHDRAW_INVITE_OVERRIDES));
}

/**
 * Sharing plans opens a direct conversation and sends the message in it.
 * `CONVERSATION_REQUIRES_CONNECTION` is the coded refusal for a member the
 * sender is not connected to; the uncoded 403 is a block in either direction
 * ("You cannot start a conversation with this member"), which the app does
 * not tell either side apart on purpose.
 */
const SHARE_PLANS_OVERRIDES: CauseErrorOverrides = {
  CONVERSATION_REQUIRES_CONNECTION: "gatherings:sharePlans.errorNotConnected",
  403: "gatherings:sharePlans.errorCannotMessage",
};

export function sharePlansErrorMessage(error: unknown, t: TFunction): string {
  return causeMessage(t, causeErrorKey(error, SHARE_PLANS_OVERRIDES));
}

/** Removing an album photo: 403 "You cannot remove this photo" (not the
 *  uploader and not a host), 404 "Photo not found" (already gone). */
const REMOVE_PHOTO_OVERRIDES: CauseErrorOverrides = {
  403: "gatherings:photos.removeNotAllowed",
  404: "gatherings:photos.removeGone",
};

export function photoRemoveErrorMessage(error: unknown, t: TFunction): string {
  return causeMessage(t, causeErrorKey(error, REMOVE_PHOTO_OVERRIDES));
}

/** Attaching an uploaded photo: 403 "Only organizers can add event photos",
 *  409 for a photo already on another event or no longer available (the two
 *  share one status, and either way a fresh upload is the way forward). */
const ATTACH_PHOTO_OVERRIDES: CauseErrorOverrides = {
  403: "gatherings:photos.attachHostOnly",
  409: "gatherings:photos.attachConflict",
};

export function photoAttachErrorMessage(error: unknown, t: TFunction): string {
  return causeMessage(t, causeErrorKey(error, ATTACH_PHOTO_OVERRIDES));
}

/** The cause line for a lineup invite answer or leave that carried no server
 *  reason of its own (offline, a fault, a gone invite), so the toast never
 *  collapses into one retry sentence. */
export function causeFallbackMessage(error: unknown, t: TFunction): string {
  return causeMessage(t, causeErrorKey(error));
}
