import { ApiError } from "../../../shared/api/client";
import {
  causeErrorKey,
  type CauseErrorCopy,
  type CauseErrorOverrides,
} from "../../../shared/api/causeErrorKey";

/**
 * Machine codes the backend puts on a refused first-contact request
 * (`POST /messages/request`, `POST /connections`). Mirrors
 * queerpulse-backend `src/connections/request-limits.ts`.
 */
export const FIRST_CONTACT_ERROR_CODE = {
  dailyLimit: "CONNECTION_REQUEST_DAILY_LIMIT",
  pendingLimit: "CONNECTION_REQUEST_PENDING_LIMIT",
  paused: "CONNECTION_REQUESTS_PAUSED",
  recipientConnectionsOnly: "RECIPIENT_NOT_ACCEPTING_REQUESTS",
} as const;

export type FirstContactErrorReason = keyof typeof FIRST_CONTACT_ERROR_CODE;

/**
 * A business, persona or company mailbox only replies: the backend refuses a
 * conversation it would start with this 403 code. Kept apart from
 * `FIRST_CONTACT_ERROR_CODE`, whose reasons each have a connect-form view.
 */
export const IDENTITY_CANNOT_INITIATE_CODE = "IDENTITY_CANNOT_INITIATE";

/**
 * The requester blocked this member: a message request, a connection request
 * or an enquiry answers with this 409 code until they unblock. Mirrors
 * `UNBLOCK_TO_CONTACT` in queerpulse-backend. A block by the OTHER member is a
 * plain 404, worded as "not available", so nothing tells the requester they
 * were blocked.
 */
export const UNBLOCK_TO_CONTACT_CODE = "UNBLOCK_TO_CONTACT";

/** The message-request line for the requester's own block. */
export const UNBLOCK_FIRST_KEY = "messages:request.error.unblockFirst";

function errorCodeOf(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  return (error.data as { code?: string } | null)?.code ?? null;
}

/** Which first-contact refusal this error is, or null for anything else. */
export function firstContactErrorReason(
  error: unknown,
): FirstContactErrorReason | null {
  const code = errorCodeOf(error);
  if (!code) return null;
  const match = (
    Object.entries(FIRST_CONTACT_ERROR_CODE) as Array<
      [FirstContactErrorReason, string]
    >
  ).find(([, value]) => value === code);
  return match ? match[0] : null;
}

const MESSAGE_REQUEST_ERROR_KEY: Record<FirstContactErrorReason, string> = {
  dailyLimit: "messages:request.error.dailyLimit",
  pendingLimit: "messages:request.error.pendingLimit",
  paused: "messages:request.error.paused",
  recipientConnectionsOnly: "messages:request.error.recipientConnectionsOnly",
};

/**
 * The warm, specific catalog key for a refused message request, or null so
 * the caller keeps its own generic copy. Keys take a `{name}` param (the
 * recipient's first name); the reply-only mailbox refusal ignores it.
 */
export function messageRequestErrorKey(error: unknown): string | null {
  const code = errorCodeOf(error);
  if (code === IDENTITY_CANNOT_INITIATE_CODE) {
    return "messages:mailbox.failure.cannotStart";
  }
  if (code === UNBLOCK_TO_CONTACT_CODE) return UNBLOCK_FIRST_KEY;
  const reason = firstContactErrorReason(error);
  return reason ? MESSAGE_REQUEST_ERROR_KEY[reason] : null;
}

/**
 * The lines a refused message request can say beyond the shared causes: the
 * coded first-contact refusals, the reply-only mailbox, the requester's own
 * block (`UNBLOCK_TO_CONTACT`), and the two uncoded statuses
 * `POST /messages/request` sends: 404 the recipient is not available (a handle
 * that does not exist, an inactive account, a takedown, a member hidden from
 * the requester or one who blocked them, all worded alike), and 429 the
 * 15-per-minute burst throttle, which the daily and pending caps above share
 * a status with. A restricted account, an inactive membership, an offline
 * request and a server fault read as the shared lines.
 */
export const MESSAGE_REQUEST_CAUSE_OVERRIDES: CauseErrorOverrides = {
  [FIRST_CONTACT_ERROR_CODE.dailyLimit]: MESSAGE_REQUEST_ERROR_KEY.dailyLimit,
  [FIRST_CONTACT_ERROR_CODE.pendingLimit]:
    MESSAGE_REQUEST_ERROR_KEY.pendingLimit,
  [FIRST_CONTACT_ERROR_CODE.paused]: MESSAGE_REQUEST_ERROR_KEY.paused,
  [FIRST_CONTACT_ERROR_CODE.recipientConnectionsOnly]:
    MESSAGE_REQUEST_ERROR_KEY.recipientConnectionsOnly,
  [IDENTITY_CANNOT_INITIATE_CODE]: "messages:mailbox.failure.cannotStart",
  [UNBLOCK_TO_CONTACT_CODE]: UNBLOCK_FIRST_KEY,
  404: "messages:request.error.notFound",
  429: "messages:request.error.rateLimited",
};

/**
 * The catalog line naming why a message request failed. Interpolate it with
 * `t(copy.key, { name: firstName, ...copy.values })`: the first-contact lines
 * take the recipient's first name as `{name}`.
 */
export function messageRequestCause(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, MESSAGE_REQUEST_CAUSE_OVERRIDES);
}
