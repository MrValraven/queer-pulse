import { expect } from "vitest";
import { ApiError } from "../../shared/api/client";
import { magazine as englishMagazine } from "../../shared/i18n/catalogs/en/magazine";
import { magazine as portugueseMagazine } from "../../shared/i18n/catalogs/pt/magazine";
import { shared as englishShared } from "../../shared/i18n/catalogs/en/shared";
import { shared as portugueseShared } from "../../shared/i18n/catalogs/pt/shared";

/**
 * Builders for the wire shapes a magazine request can fail with, used by the
 * four magazine error-mapper tests. Each mirrors a body the backend really
 * sends; the `file:line` it copies is named on each builder.
 */

/** A coded service refusal: `codedErrorBody` through `AllExceptionsFilter`
 *  (queerpulse-backend `common/coded-error.ts`). */
export function codedRefusal(
  status: number,
  code: string,
  message = "A sentence the backend may reword at any time",
): ApiError {
  return new ApiError(status, message, {
    statusCode: status,
    error: "Refused",
    code,
    message,
  });
}

/** A coded field-check 400, as `MagazineValidationCodeInterceptor`
 *  (queerpulse-backend `magazine/magazine-validation-code.interceptor.ts`)
 *  rewrites it: `code` is the first coded failure, `codes` every one in
 *  message order. The API client joins `message` with ", ". */
export function fieldCheckRefusal(codes: readonly string[]): ApiError {
  const sentences = codes.map((code) => `${code.toLowerCase()} sentence`);
  return new ApiError(400, sentences.join(", "), {
    statusCode: 400,
    error: "Bad Request",
    message: sentences,
    code: codes[0],
    codes: [...codes],
  });
}

/** An uncoded refusal with Nest's default string body. */
export function uncodedRefusal(status: number, message: string): ApiError {
  return new ApiError(status, message, { statusCode: status, message });
}

/** `ActiveMemberGuard` (queerpulse-backend
 *  `auth/guards/active-member.guard.ts`), code `ACTIVE_MEMBERSHIP_REQUIRED`
 *  (`common/coded-error.ts`). */
export const INACTIVE_MEMBER_REFUSAL = codedRefusal(
  403,
  "ACTIVE_MEMBERSHIP_REQUIRED",
  "Active membership required",
);

/** The CsrfGuard's 403 (queerpulse-backend `security/csrf.guard.ts`) as it
 *  reaches a mapper: the API client already re-fetched the token and retried
 *  once, and the second answer was refused the same way. Code `CSRF_REJECTED`
 *  (`common/coded-error.ts`). */
export const CSRF_REFUSAL = codedRefusal(
  403,
  "CSRF_REJECTED",
  "Invalid or missing CSRF token",
);

/** The same CSRF refusal from a backend that predates the code (deploy skew):
 *  a bare 403 with Nest's default string body. */
export const LEGACY_CSRF_REFUSAL = uncodedRefusal(
  403,
  "Invalid or missing CSRF token",
);

/** `StorageKeyOwnershipInterceptor` (queerpulse-backend
 *  `storage/storage-key-ownership.interceptor.ts`) for a key another member
 *  uploaded, code `UPLOAD_NOT_YOURS` (`common/coded-error.ts`). */
export const UPLOAD_NOT_YOURS_REFUSAL = codedRefusal(
  403,
  "UPLOAD_NOT_YOURS",
  "Referenced upload does not belong to you",
);

/** A moderation restriction (`NotRestrictedGuard`, code `ACCOUNT_RESTRICTED`). */
export const RESTRICTED_REFUSAL = codedRefusal(403, "ACCOUNT_RESTRICTED");

/** The platform lock (queerpulse-backend `common/platform-lockdown.guard.ts`). */
export const PLATFORM_LOCKED_REFUSAL = new ApiError(
  503,
  "QueerPulse is down for planned maintenance.",
  {
    statusCode: 503,
    error: "Service Unavailable",
    code: "PLATFORM_LOCKED",
    message: "QueerPulse is down for planned maintenance.",
  },
);

/**
 * Express's body-limit 413 as it reaches the client. body-parser raises an
 * `http-errors` 413 before any controller runs; the backend answers it with
 * the code `PAYLOAD_TOO_LARGE` (`common/coded-error.ts`).
 */
export const BODY_TOO_LARGE_REFUSAL = codedRefusal(
  413,
  "PAYLOAD_TOO_LARGE",
  "request entity too large",
);

/** The same 413 from a backend that predates the code: `{ statusCode,
 *  message }` only, with no `code` and no `error`. */
export const LEGACY_BODY_TOO_LARGE_REFUSAL = new ApiError(
  413,
  "request entity too large",
  { statusCode: 413, message: "request entity too large" },
);

/** A fetch that never got an answer (offline, DNS, CORS). */
export const NO_ANSWER = new TypeError("Failed to fetch");

function catalogsFor(
  namespace: string,
): readonly [Record<string, unknown>, Record<string, unknown>] | null {
  if (namespace === "magazine") return [englishMagazine, portugueseMagazine];
  if (namespace === "shared") return [englishShared, portugueseShared];
  return null;
}

/** Fails unless `fullKey` has a line in both the English and the Portuguese
 *  catalog, so a mapper can never point at copy that does not exist. */
export function expectKeyInBothCatalogs(fullKey: string): void {
  const [namespace = "", key = ""] = fullKey.split(":");
  const catalogs = catalogsFor(namespace);
  expect(catalogs, `unknown namespace in ${fullKey}`).not.toBeNull();
  for (const catalog of catalogs ?? []) {
    expect(Object.hasOwn(catalog, key), `${fullKey} is missing`).toBe(true);
  }
}
