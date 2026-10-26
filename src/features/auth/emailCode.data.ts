/**
 * Demo answers for email code sign-in and the reauth dialog.
 *
 * The live shapes and reasons come from the contract file
 * `QUEERPULSE-EMAIL-CODE-SIGN-IN-CONTRACT-2026-10-26.md`; these mocks mirror
 * them. Any six digits succeed, and `000000` answers `code_incorrect` so the
 * error state can be seen in demo. Loaded on demand by `useEmailCode.ts`, so
 * none of this reaches the live bundle.
 */
import { ApiError } from "../../shared/api/client";
import type {
  EmailCodeChallenge,
  EmailCodeVerifyRequest,
  EmailCodeVerifyResult,
  ReauthCodeChallenge,
  ReauthCodeVerifyResult,
} from "./api/emailCode.api";

export const DEMO_LATENCY_MS = 400;
export const DEMO_INCORRECT_CODE = "000000";
export const DEMO_ATTEMPTS_LEFT = 4;

/** The demo session's own address (`DEMO_USER.email` in AuthProvider). */
const DEMO_ACCOUNT_EMAIL = "you@queerpulse.test";

const CODE_LIFETIME_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const REAUTH_TOKEN_LIFETIME_MS = 5 * 60 * 1000;

export function demoEmailCodeChallenge(
  now: number = Date.now(),
): EmailCodeChallenge {
  return {
    challengeId: `demo-challenge-${now}`,
    expiresAt: new Date(now + CODE_LIFETIME_MS).toISOString(),
    resendAvailableAt: new Date(now + RESEND_COOLDOWN_MS).toISOString(),
  };
}

export function demoReauthCodeChallenge(
  now: number = Date.now(),
): ReauthCodeChallenge {
  return { ...demoEmailCodeChallenge(now), email: DEMO_ACCOUNT_EMAIL };
}

/** Throws the same refusal the backend sends for a wrong code. */
function rejectIncorrectCode(code: string): void {
  if (code !== DEMO_INCORRECT_CODE) return;
  throw new ApiError(400, "That code is not right.", {
    reason: "code_incorrect",
    attemptsLeft: DEMO_ATTEMPTS_LEFT,
  });
}

export function demoVerifyEmailCode(
  request: EmailCodeVerifyRequest,
): EmailCodeVerifyResult {
  rejectIncorrectCode(request.code);
  return { redirectTo: request.redirect ?? "/" };
}

export function demoVerifyReauthCode(
  code: string,
  now: number = Date.now(),
): ReauthCodeVerifyResult {
  rejectIncorrectCode(code);
  return {
    reauthToken: "demo-reauth-code",
    expiresAt: new Date(now + REAUTH_TOKEN_LIFETIME_MS).toISOString(),
  };
}

export function demoLatency(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, DEMO_LATENCY_MS);
  });
}
