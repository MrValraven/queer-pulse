import {
  causeErrorKey,
  type CauseErrorCopy,
  type CauseErrorOverrides,
} from "../../../shared/api/causeErrorKey";

/**
 * The words a failed messaging action says, one override map per action. Each
 * map holds only the lines the action itself can say; every other failure
 * (offline, signed out, a restricted account, an inactive membership, a rate
 * limit, a server fault) reads as the shared `shared:apiError.*` cause from
 * `shared/api/causeErrorKey.ts`. A surface resolves a result with
 * `t(copy.key, { ...copy.values, name })`.
 *
 * The first-contact message request keeps its own map beside its codes in
 * `firstContactError.ts` (`messageRequestCause`).
 */

/**
 * `POST /identity-contact/...` (a business, persona or company enquiry).
 * Every code below means the mailbox stopped being reachable between the
 * contact read and the send. The uncounted 429 is either the enquiry quota
 * or the burst throttle, and both read the same to a member; the backend
 * sends no `code` on either. A 404 is a persona or company that no longer
 * exists.
 */
export const IDENTITY_ENQUIRY_CAUSE_OVERRIDES: CauseErrorOverrides = {
  IDENTITY_BLOCKED: "messages:mailbox.contact.error.unavailable",
  IDENTITY_HAS_NO_STAFF: "messages:mailbox.contact.error.unavailable",
  IDENTITY_IS_YOUR_OWN: "messages:mailbox.contact.error.unavailable",
  IDENTITY_CANNOT_INITIATE: "messages:mailbox.contact.error.unavailable",
  IDENTITY_REMOVED: "messages:mailbox.contact.error.unavailable",
  404: "messages:mailbox.contact.error.notFound",
  429: "messages:mailbox.contact.error.rateLimited",
};

/**
 * Claim, release and take over a mailbox thread. The backend answers 400
 * `CONVERSATION_NOT_A_MAILBOX` for a thread without a shared mailbox, 403
 * `IDENTITY_NOT_STAFF` for a member who left the mailbox's team, 403
 * `IDENTITY_REMOVED` for a persona moderation removed, and an uncoded 404
 * for a thread that no longer exists.
 */
export const CONVERSATION_CLAIM_CAUSE_OVERRIDES: CauseErrorOverrides = {
  IDENTITY_NOT_STAFF: "messages:mailbox.claim.error.notStaff",
  IDENTITY_REMOVED: "messages:mailbox.claim.error.removed",
  CONVERSATION_NOT_A_MAILBOX: "messages:mailbox.claim.error.notMailbox",
  404: "messages:mailbox.claim.error.gone",
};

/**
 * The mailbox staff-name switches. 403 `IDENTITY_NOT_OWNER` (only the owner
 * flips the shared switch), 403 `IDENTITY_NOT_STAFF`, 403 `IDENTITY_REMOVED`
 * and 403 `IDENTITY_STAFF_NAMES_LOCKED` (an unlinked persona never names its
 * staff, so the switch has nothing to change).
 */
export const MAILBOX_ATTRIBUTION_CAUSE_OVERRIDES: CauseErrorOverrides = {
  IDENTITY_NOT_OWNER: "messages:mailbox.settings.error.notOwner",
  IDENTITY_NOT_STAFF: "messages:mailbox.settings.error.notStaff",
  IDENTITY_REMOVED: "messages:mailbox.settings.error.removed",
  IDENTITY_STAFF_NAMES_LOCKED: "messages:mailbox.settings.unlinkedPersonaError",
};

/**
 * Block or unblock a business, persona or company. 400 `IDENTITY_BLOCK_OWN`
 * (a mailbox the member answers for), 400 `IDENTITY_BLOCK_PERSON` (a person,
 * who is blocked from their profile) and 404 for an identity that no longer
 * exists.
 */
export const IDENTITY_BLOCK_CAUSE_OVERRIDES: CauseErrorOverrides = {
  IDENTITY_BLOCK_OWN: "messages:mailbox.block.error.own",
  IDENTITY_BLOCK_PERSON: "messages:mailbox.block.error.person",
  404: "messages:mailbox.block.error.gone",
};

export function identityEnquiryCause(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, IDENTITY_ENQUIRY_CAUSE_OVERRIDES);
}

export function conversationClaimCause(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, CONVERSATION_CLAIM_CAUSE_OVERRIDES);
}

export function mailboxAttributionCause(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, MAILBOX_ATTRIBUTION_CAUSE_OVERRIDES);
}

export function identityBlockCause(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, IDENTITY_BLOCK_CAUSE_OVERRIDES);
}

/**
 * The cause of a send that fanned out to several conversations (a share or a
 * forward) and failed for some of them. Every failure of one fan-out usually
 * has the same cause (offline, signed out, a rate limit), so the first failure
 * speaks for the batch. An empty list reads as no answer at all.
 */
export function firstFailureCause(
  failures: readonly unknown[],
): CauseErrorCopy {
  return causeErrorKey(failures[0]);
}
