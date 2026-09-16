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

/** Which first-contact refusal this error is, or null for anything else. */
export function firstContactErrorReason(
  error: unknown,
): FirstContactErrorReason | null {
  if (!(error instanceof ApiError)) return null;
  const code = (error.data as { code?: string } | null)?.code;
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
 * recipient's first name).
 */
export function messageRequestErrorKey(error: unknown): string | null {
  const reason = firstContactErrorReason(error);
  return reason ? MESSAGE_REQUEST_ERROR_KEY[reason] : null;
}
