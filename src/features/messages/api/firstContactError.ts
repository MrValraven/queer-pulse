import { ApiError } from "../../../shared/api/client";

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
  if (errorCodeOf(error) === IDENTITY_CANNOT_INITIATE_CODE) {
    return "messages:mailbox.failure.cannotStart";
  }
  const reason = firstContactErrorReason(error);
  return reason ? MESSAGE_REQUEST_ERROR_KEY[reason] : null;
}
