import {
  causeErrorKey,
  type CauseErrorCopy,
  type CauseErrorOverrides,
} from "../../shared/api/causeErrorKey";

/**
 * The cause lines for the auth feature's member-triggered writes: asking for an
 * invite, creating, revoking and resending one, labelling one, and the
 * onboarding saves. Each action hands `causeErrorKey` the lines only it can
 * say, keyed by the machine `code` the backend sends (queerpulse-backend
 * `membership/join-requests.service.ts`, `membership/invites.service.ts`) or,
 * where the backend sends no code, by status. Everything else (no connection,
 * signed out, restricted account, not an active member, server fault, timeout)
 * comes from the shared `shared:apiError.*` lines.
 */

/**
 * `POST /join-requests` (public, no session). Codes: `JOIN_REQUESTS_CLOSED`
 * (an admin paused requests mid-fill) and `REAPPLICATION_COOLDOWN` (a decline
 * within the last 30 days). The 409 duplicate and the 403 `UNDER_18` are
 * handled by the form itself, as a confirmation and a pause screen. The
 * throttle is 3 requests per hour per IP, so the 429 line says to wait.
 */
export const REQUEST_INVITE_ERROR_OVERRIDES: CauseErrorOverrides = {
  JOIN_REQUESTS_CLOSED: "auth:requestInvite.closedError",
  REAPPLICATION_COOLDOWN: "auth:requestInvite.cooldownError",
  400: "auth:requestInvite.error.invalid",
  429: "auth:requestInvite.rateLimitedError",
};

export function requestInviteErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, REQUEST_INVITE_ERROR_OVERRIDES);
}

/**
 * `POST /invites`. `INVITE_QUOTA_EXCEEDED` is the monthly allowance. The
 * `CreateInviteDto` 400 covers a malformed pinned email and over-long notes;
 * the 429 is the route's 10 per minute throttle. `INVITE_ACCESS_DISABLED`
 * (our team paused the member's invites) is not mapped here: the panel hands
 * over to its paused view instead of showing a line.
 */
export const CREATE_INVITE_ERROR_OVERRIDES: CauseErrorOverrides = {
  INVITE_QUOTA_EXCEEDED: "auth:invite.link.error.quota",
  400: "auth:invite.link.error.invalid",
  429: "auth:invite.link.error.rateLimited",
};

export function createInviteErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, CREATE_INVITE_ERROR_OVERRIDES);
}

/**
 * `DELETE /invites/:code`. The backend answers 404 for a code that is not the
 * member's own (or does not exist) and 409 for an invite already accepted or
 * expired; neither carries a code.
 */
export const REVOKE_INVITE_ERROR_OVERRIDES: CauseErrorOverrides = {
  404: "auth:invite.sentList.resendError.notFound",
  409: "auth:invite.sentList.revokeError.notRevocable",
};

export function revokeInviteErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, REVOKE_INVITE_ERROR_OVERRIDES);
}

/**
 * `POST /invites/:code/resend`. `INVITE_ACCESS_DISABLED` is the pause, ahead of
 * the code lookup. The 403 line is kept from the earlier mapper for a refusal
 * that is neither a restriction nor an inactive membership; 404 and 409 carry
 * no code (404 not the member's, 409 accepted, revoked or still valid).
 */
export const RESEND_INVITE_ERROR_OVERRIDES: CauseErrorOverrides = {
  INVITE_ACCESS_DISABLED: "auth:invite.sentList.resendError.paused",
  403: "auth:invite.sentList.resendError.notYours",
  404: "auth:invite.sentList.resendError.notFound",
  409: "auth:invite.sentList.resendError.notResendable",
};

export function resendInviteErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, RESEND_INVITE_ERROR_OVERRIDES);
}

/**
 * `PATCH /invites/:code/private-note`. 404 is a code that is not the
 * member's own; the DTO caps the note at 120 characters (400).
 */
export const INVITE_PRIVATE_NOTE_ERROR_OVERRIDES: CauseErrorOverrides = {
  400: "auth:invite.sentList.privateNote.error.tooLong",
  404: "auth:invite.sentList.resendError.notFound",
};

export function invitePrivateNoteErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, INVITE_PRIVATE_NOTE_ERROR_OVERRIDES);
}

/**
 * `PATCH /profiles/me` from the onboarding steps (photo and name, intents,
 * work). A 404 means the account has no profile row to save to, which the
 * generic "couldn't find that" line would misattribute to a removed item.
 */
export const ONBOARDING_SAVE_ERROR_OVERRIDES: CauseErrorOverrides = {
  404: "auth:onboarding.saveError.noProfile",
};

export function onboardingSaveErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, ONBOARDING_SAVE_ERROR_OVERRIDES);
}
