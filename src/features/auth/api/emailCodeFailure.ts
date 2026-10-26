/**
 * Reads a failed email-code call into one typed failure the UI can word.
 *
 * The source of truth for every reason and its extras is the contract file
 * `QUEERPULSE-EMAIL-CODE-SIGN-IN-CONTRACT-2026-10-26.md`. A reason added there
 * lands here and in both catalogs (en + pt) together.
 *
 * The backend sends `{ reason, ...extras }` as the error body, which the client
 * keeps whole on `ApiError.data`. This reader takes `reason` and the extras
 * straight off that body for every status, the 503 `email_send_failed`
 * included. It deliberately leaves the shared `reasonFor()` alone: that helper
 * reads `message`, gives up on any 5xx, and has many callers.
 */
import { ApiError } from "../../../shared/api/client";

export const EMAIL_CODE_REASONS = [
  "email_invalid",
  "too_many_codes",
  "network_busy",
  "resend_too_soon",
  "email_send_failed",
  "code_incorrect",
  "code_expired",
  "code_used_up",
  "code_replaced",
  "code_already_used",
  "too_many_attempts",
  "account_recovery_review",
  "name_required",
  "email_code_unavailable",
] as const;
export type EmailCodeReason = (typeof EMAIL_CODE_REASONS)[number];

export const SIGNUP_REJECTED_REASONS = [
  "invite_required",
  "invite_invalid",
  "invite_email_mismatch",
  "invite_inviter_inactive",
  "age_attestation_required",
  "account_suppressed",
  "email_in_use",
  "registration_disabled",
] as const;
export type SignupRejectedReason = (typeof SIGNUP_REJECTED_REASONS)[number];

export type EmailCodeFieldFailure =
  | {
      kind: "reason";
      reason: EmailCodeReason;
      attemptsLeft?: number;
      retryAt?: string;
      resendAvailableAt?: string;
    }
  /** A 429 with no reason: the per-IP throttler answered. */
  | { kind: "throttled" }
  /** The request never got an answer: fetch threw, or the client timed out (408). */
  | { kind: "network" }
  | { kind: "unexpected"; status: number };

export interface SignupFailure {
  kind: "signup";
  reason: SignupRejectedReason;
  statusUrl?: string;
}

export type EmailCodeFailure = EmailCodeFieldFailure | SignupFailure;

const EMAIL_CODE_REASON_SET: ReadonlySet<string> = new Set(EMAIL_CODE_REASONS);
const SIGNUP_REJECTED_REASON_SET: ReadonlySet<string> = new Set(
  SIGNUP_REJECTED_REASONS,
);

function isEmailCodeReason(value: unknown): value is EmailCodeReason {
  return typeof value === "string" && EMAIL_CODE_REASON_SET.has(value);
}

function isSignupRejectedReason(value: unknown): value is SignupRejectedReason {
  return typeof value === "string" && SIGNUP_REJECTED_REASON_SET.has(value);
}

function stringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

/** The error body as a record, or an empty one when it is missing or not an
 *  object (a malformed-JSON 422 carries the raw text). */
function bodyOf(error: ApiError): Record<string, unknown> {
  const { data } = error;
  return typeof data === "object" && data !== null
    ? (data as Record<string, unknown>)
    : {};
}

/** Only the extras the reason carries are set, so equality checks in callers
 *  and tests see exactly what the contract names. */
function reasonFailure(
  reason: EmailCodeReason,
  body: Record<string, unknown>,
): EmailCodeFieldFailure {
  const failure: Extract<EmailCodeFieldFailure, { kind: "reason" }> = {
    kind: "reason",
    reason,
  };
  if ("attemptsLeft" in body) {
    failure.attemptsLeft = numberOrUndefined(body.attemptsLeft);
  }
  if ("retryAt" in body) failure.retryAt = stringOrUndefined(body.retryAt);
  if ("resendAvailableAt" in body) {
    failure.resendAvailableAt = stringOrUndefined(body.resendAvailableAt);
  }
  return failure;
}

export function readEmailCodeFailure(error: unknown): EmailCodeFailure {
  if (!(error instanceof ApiError)) {
    if (error instanceof TypeError) return { kind: "network" };
    return { kind: "unexpected", status: 0 };
  }
  if (error.status === 408) return { kind: "network" };
  const body = bodyOf(error);
  const { reason } = body;
  if (isEmailCodeReason(reason)) return reasonFailure(reason, body);
  if (isSignupRejectedReason(reason)) {
    const statusUrl = stringOrUndefined(body.statusUrl);
    return statusUrl === undefined
      ? { kind: "signup", reason }
      : { kind: "signup", reason, statusUrl };
  }
  if (reason === undefined && error.status === 429) {
    return { kind: "throttled" };
  }
  return { kind: "unexpected", status: error.status };
}

export function isSignupFailure(
  failure: EmailCodeFailure | null,
): failure is SignupFailure {
  return failure?.kind === "signup";
}

/** For surfaces that only word field failures (the reauth dialog): a signup
 *  refusal there is a 403 nobody expects. */
export function asFieldFailure(
  failure: EmailCodeFailure,
): EmailCodeFieldFailure {
  return isSignupFailure(failure)
    ? { kind: "unexpected", status: 403 }
    : failure;
}
