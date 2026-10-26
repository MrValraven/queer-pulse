/**
 * Email code sign-in: the four calls behind "sign in with a 6-digit code".
 *
 * The source of truth for every route, body and reason here is the contract
 * file `QUEERPULSE-EMAIL-CODE-SIGN-IN-CONTRACT-2026-10-26.md`. Change it there
 * first, then here and in the backend together.
 *
 * Every route is `VERSION_NEUTRAL` under `/auth` (no `/v1`): the requester and
 * refresh cookies are scoped to `path=/auth`, so the browser only attaches them
 * to unversioned paths. Each call validates the success body, so a renamed
 * backend field surfaces as an `ApiError(422)` naming the field.
 */
import { apiPostUnversioned } from "../../../shared/api/client";
import type { Language } from "../../../shared/i18n/types";

export interface EmailCodeChallenge {
  challengeId: string;
  expiresAt: string;
  resendAvailableAt: string;
}

export interface ReauthCodeChallenge extends EmailCodeChallenge {
  email: string;
}

export interface EmailCodeVerifyRequest {
  challengeId: string;
  code: string;
  invite?: string;
  ageAttested?: boolean;
  termsVersion?: string;
  redirect?: string;
  firstName?: string;
  lastName?: string;
}

export interface EmailCodeVerifyResult {
  redirectTo: string;
}

export interface ReauthCodeVerifyResult {
  reauthToken: string;
  expiresAt: string;
}

/** Narrow a body to an object and confirm each named field is a string,
 *  throwing an Error that names the first field that is missing or mistyped. */
function requireStringFields<T>(data: unknown, fields: readonly string[]): T {
  if (typeof data !== "object" || data === null) {
    throw new Error("expected a JSON object body");
  }
  const record = data as Record<string, unknown>;
  for (const field of fields) {
    if (typeof record[field] !== "string") {
      throw new Error(`expected "${field}" to be a string`);
    }
  }
  return data as T;
}

const CHALLENGE_FIELDS = [
  "challengeId",
  "expiresAt",
  "resendAvailableAt",
] as const;

function validateChallenge(data: unknown): EmailCodeChallenge {
  return requireStringFields<EmailCodeChallenge>(data, CHALLENGE_FIELDS);
}

function validateReauthChallenge(data: unknown): ReauthCodeChallenge {
  return requireStringFields<ReauthCodeChallenge>(data, [
    ...CHALLENGE_FIELDS,
    "email",
  ]);
}

function validateVerifyResult(data: unknown): EmailCodeVerifyResult {
  return requireStringFields<EmailCodeVerifyResult>(data, ["redirectTo"]);
}

function validateReauthVerifyResult(data: unknown): ReauthCodeVerifyResult {
  return requireStringFields<ReauthCodeVerifyResult>(data, [
    "reauthToken",
    "expiresAt",
  ]);
}

/** POST /auth/email-code/request. Public. Same answer for every address. */
export function requestEmailCode(
  email: string,
  locale: Language,
): Promise<EmailCodeChallenge> {
  return apiPostUnversioned(
    "/auth/email-code/request",
    { email, locale },
    validateChallenge,
  );
}

/** POST /auth/email-code/verify. Public. Sets the auth cookies on success. */
export function verifyEmailCode(
  request: EmailCodeVerifyRequest,
): Promise<EmailCodeVerifyResult> {
  return apiPostUnversioned(
    "/auth/email-code/verify",
    request,
    validateVerifyResult,
  );
}

/** POST /auth/email-code/reauth/request. Signed in. Sends to the caller's
 *  own account address and echoes it back for the dialog copy. */
export function requestReauthCode(
  locale: Language,
): Promise<ReauthCodeChallenge> {
  return apiPostUnversioned(
    "/auth/email-code/reauth/request",
    { locale },
    validateReauthChallenge,
  );
}

/** POST /auth/email-code/reauth/verify. Signed in. Mints a reauth token. */
export function verifyReauthCode(
  challengeId: string,
  code: string,
): Promise<ReauthCodeVerifyResult> {
  return apiPostUnversioned(
    "/auth/email-code/reauth/verify",
    { challengeId, code },
    validateReauthVerifyResult,
  );
}
