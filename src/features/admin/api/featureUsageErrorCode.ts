import { ApiError } from "../../../shared/api/client";
import type { FeatureUsageRangeIssue } from "../featureUsageRange";

/**
 * Every reason the feature usage endpoints can fail, named so the page can
 * say exactly what went wrong. The range codes mirror the backend's
 * `feature_usage_*` codes with the prefix dropped and the rest camelCased;
 * the last four come from the HTTP status or the transport.
 */
export type FeatureUsageErrorCode =
  | FeatureUsageRangeIssue
  | "rangeConflictingParams"
  | "rangeInvalidDate"
  | "rangeInvalidDays"
  | "unknownFeature"
  | "featureNotTracked"
  | "forbidden"
  | "network"
  | "server"
  | "unknown";

const WIRE_CODE_PREFIX = "feature_usage_";

const BACKEND_CODES: ReadonlySet<FeatureUsageErrorCode> = new Set([
  "rangeIncomplete",
  "rangeReversed",
  "rangeTooLong",
  "rangeBeforeRetention",
  "rangeIncludesToday",
  "rangeConflictingParams",
  "rangeInvalidDate",
  "rangeInvalidDays",
  "unknownFeature",
  "featureNotTracked",
]);

function isBackendCode(code: string): code is FeatureUsageErrorCode {
  return (BACKEND_CODES as ReadonlySet<string>).has(code);
}

function snakeToCamel(snake: string): string {
  return snake.replace(/_([a-z])/g, (_match, letter: string) =>
    letter.toUpperCase(),
  );
}

/** The specific cause of a failed feature usage request. */
export function featureUsageErrorCode(error: unknown): FeatureUsageErrorCode {
  if (error instanceof ApiError) {
    const wireCode = (error.data as { code?: unknown } | null | undefined)
      ?.code;
    if (typeof wireCode === "string" && wireCode.startsWith(WIRE_CODE_PREFIX)) {
      const code = snakeToCamel(wireCode.slice(WIRE_CODE_PREFIX.length));
      if (isBackendCode(code)) return code;
    }
    if (error.status === 403) return "forbidden";
    if (error.status === 408) return "network";
    if (error.status >= 500) return "server";
    return "unknown";
  }
  // `fetch` rejects with a TypeError when the server cannot be reached.
  if (error instanceof TypeError) return "network";
  return "unknown";
}

/** The catalog key that words `code`. An unrecognised failure falls back to
 *  the panel's existing load error line. */
export function featureUsageErrorKey(code: FeatureUsageErrorCode): string {
  return code === "unknown"
    ? "admin:featureUsage.loadError"
    : `admin:featureUsage.error.${code}`;
}
