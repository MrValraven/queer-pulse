import { ApiError } from "./client";
import { isAccountRestricted } from "./errorMessage";

/**
 * The shared cause classifier: turns any failed action into the catalog key
 * of the specific reason it failed, so a surface can say what happened and
 * what to do next.
 *
 * It generalizes the per-feature mappers (`writerApplicationError.ts`,
 * `firstContactError.ts`): a feature hands in an optional override map with
 * the lines only it can say, and every other failure falls back to a shared
 * `shared:apiError.*` cause. Pure, so it runs outside React and in tests.
 *
 * Resolution order, first match wins:
 *
 *  1. Not an `ApiError` at all: fetch threw before any status (offline, DNS,
 *     CORS), so the request never reached us. `noConnection`.
 *  2. `overrides[code]`, where `code` is the machine `code` the backend put on
 *     the response body (`ApiError.data.code`, see `shared/api/client.ts`).
 *  3. Causes the backend identifies on any endpoint, which a feature's status
 *     override must not hide: a moderation restriction (`ACCOUNT_RESTRICTED`),
 *     an inactive membership (`ACTIVE_MEMBERSHIP_REQUIRED`) and a refused
 *     security check (`CSRF_REJECTED`).
 *  4. `overrides[status]`, the feature's own line for an uncoded status.
 *  5. The shared line for the status, ending in `refused` with `{status}`.
 *
 * Machine codes only: this module never reads the backend's English prose.
 * A bare 403 with no code (an older backend, or a role check) is `forbidden`.
 */

/** A catalog key, plus the values its text interpolates (if any). */
export interface CauseErrorCopy {
  key: string;
  values?: Record<string, string | number>;
}

/**
 * A feature's own lines, consulted before the shared causes. Keys are either a
 * backend machine `code` (`"REPORT_FLOOD_CAP"`) or an HTTP status (`404`, or
 * `"404"`); values are full catalog keys (`"economy:listing.error.closed"`).
 * A code entry wins over a status entry for the same error.
 */
export type CauseErrorOverrides = Readonly<Partial<Record<string, string>>>;

/** Every shared cause line this module can return. */
export const SHARED_CAUSE_KEY = {
  noConnection: "shared:apiError.noConnection",
  timedOut: "shared:apiError.timedOut",
  signedOut: "shared:apiError.signedOut",
  accountRestricted: "shared:apiError.accountRestricted",
  notActive: "shared:apiError.notActive",
  securityCheck: "shared:apiError.securityCheck",
  forbidden: "shared:apiError.forbidden",
  notFound: "shared:apiError.notFound",
  gone: "shared:apiError.reasonGone",
  conflict: "shared:apiError.reasonConflict",
  invalid: "shared:apiError.reasonInvalid",
  tooLarge: "shared:apiError.reasonTooLarge",
  rateLimited: "shared:apiError.reasonRateLimited",
  serverFault: "shared:apiError.serverFault",
  refused: "shared:apiError.refused",
} as const;

/**
 * The machine code `ActiveMemberGuard` puts on its 403 (queerpulse-backend
 * `common/coded-error.ts`, `PLATFORM_ERROR_CODE`).
 */
export const NOT_ACTIVE_MEMBER_CODE = "ACTIVE_MEMBERSHIP_REQUIRED";

/**
 * The machine code every `CsrfGuard` refusal carries (queerpulse-backend
 * `common/coded-error.ts`, `PLATFORM_ERROR_CODE`). The API client already
 * re-fetched its token and retried once before a caller sees it, so the answer
 * is always the same: copy what you wrote, reload and try again.
 */
export const CSRF_REJECTED_CODE = "CSRF_REJECTED";

/**
 * The machine code `StorageKeyOwnershipInterceptor` puts on its 403 when the
 * body names an upload the caller does not own (queerpulse-backend
 * `common/coded-error.ts`, `PLATFORM_ERROR_CODE`).
 */
export const UPLOAD_NOT_YOURS_CODE = "UPLOAD_NOT_YOURS";

/** The machine `code` on an `ApiError`'s parsed body, or null when it has none. */
export function apiErrorCode(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const body = error.data;
  if (typeof body !== "object" || body === null) return null;
  const code = (body as { code?: unknown }).code;
  return typeof code === "string" && code.length > 0 ? code : null;
}

function overrideFor(
  overrides: CauseErrorOverrides | undefined,
  lookupKey: string | number,
): string | null {
  if (!overrides) return null;
  const overrideKey = String(lookupKey);
  if (!Object.hasOwn(overrides, overrideKey)) return null;
  return overrides[overrideKey] ?? null;
}

function isNotActiveMember(error: ApiError): boolean {
  return error.status === 403 && apiErrorCode(error) === NOT_ACTIVE_MEMBER_CODE;
}

/**
 * The cause line for an HTTP status alone, for a failure that has a status
 * but no `ApiError` (a direct storage `PUT` through `XMLHttpRequest`).
 * `overrides[status]` wins; machine codes do not apply here.
 */
export function causeErrorKeyForStatus(
  status: number,
  overrides?: CauseErrorOverrides,
): CauseErrorCopy {
  const statusOverride = overrideFor(overrides, status);
  if (statusOverride) return { key: statusOverride };
  switch (status) {
    case 400:
    case 422:
      return { key: SHARED_CAUSE_KEY.invalid };
    case 401:
      return { key: SHARED_CAUSE_KEY.signedOut };
    case 403:
      return { key: SHARED_CAUSE_KEY.forbidden };
    case 404:
      return { key: SHARED_CAUSE_KEY.notFound };
    case 408:
      return { key: SHARED_CAUSE_KEY.timedOut };
    case 409:
      return { key: SHARED_CAUSE_KEY.conflict };
    case 410:
      return { key: SHARED_CAUSE_KEY.gone };
    case 413:
      return { key: SHARED_CAUSE_KEY.tooLarge };
    case 429:
      return { key: SHARED_CAUSE_KEY.rateLimited };
    default:
      if (status >= 500) return { key: SHARED_CAUSE_KEY.serverFault };
      return { key: SHARED_CAUSE_KEY.refused, values: { status } };
  }
}

/**
 * The catalog key naming why `error` happened. Resolve it with
 * `t(copy.key, copy.values)`.
 *
 *   causeErrorKey(new TypeError("Failed to fetch"))
 *     → { key: "shared:apiError.noConnection" }
 *   causeErrorKey(new ApiError(404, "Not Found"), {
 *     404: "economy:listing.error.closed",
 *   })
 *     → { key: "economy:listing.error.closed" }
 *   causeErrorKey(new ApiError(418, "?"))
 *     → { key: "shared:apiError.refused", values: { status: 418 } }
 */
export function causeErrorKey(
  error: unknown,
  overrides?: CauseErrorOverrides,
): CauseErrorCopy {
  if (!(error instanceof ApiError)) {
    return { key: SHARED_CAUSE_KEY.noConnection };
  }
  const code = apiErrorCode(error);
  if (code !== null) {
    const codeOverride = overrideFor(overrides, code);
    if (codeOverride) return { key: codeOverride };
  }
  if (isAccountRestricted(error)) {
    return { key: SHARED_CAUSE_KEY.accountRestricted };
  }
  if (isNotActiveMember(error)) {
    return { key: SHARED_CAUSE_KEY.notActive };
  }
  if (apiErrorCode(error) === CSRF_REJECTED_CODE) {
    return { key: SHARED_CAUSE_KEY.securityCheck };
  }
  return causeErrorKeyForStatus(error.status, overrides);
}
