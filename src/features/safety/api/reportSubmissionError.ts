import { useCallback } from "react";
import { ApiError } from "../../../shared/api/client";
import { useTranslation } from "../../../shared/i18n/useTranslation";

/**
 * What a failed `POST /reports` should say to the member (TS-05).
 *
 * The backend refuses a filing with 429 in three different situations, and only
 * two of them are written for a member to read:
 *
 *  1. The 60-second burst throttle (`@Throttle({ limit: 10, ttl: 60s })` served
 *     by `HttpThrottlerGuard`). `@nestjs/throttler` raises its own
 *     `ThrottlerException`, whose message is a framework exception string. That
 *     is developer wording. It must never reach a member.
 *  2. The rolling daily cap (`REPORT_DAILY_LIMIT` filings in 24 hours).
 *  3. The rolling per-subject cap (`REPORT_PER_SUBJECT_LIMIT` filings against
 *     one subject in 7 days).
 *
 * Cases 2 and 3 are the platform's own refusals, and their copy is the entire
 * point: it tells the member that the reports they already sent are with the
 * moderation team. Flattening it into a generic "couldn't send that" toast
 * throws the explanation away and invites them to keep retrying something the
 * server will keep refusing.
 *
 * ## The contract: `code`, never the prose
 *
 * A cap refusal is thrown with an OBJECT body carrying a typed discriminator:
 *
 * ```json
 * { "statusCode": 429, "error": "Too Many Requests",
 *   "code": "REPORT_FLOOD_CAP", "cap": "daily" | "subject",
 *   "message": "<member-facing copy, show verbatim>" }
 * ```
 *
 * `code === "REPORT_FLOOD_CAP"` is the whole test. It covers BOTH caps, and the
 * throttler's refusal carries no `code` at all, so presence alone separates
 * them. `message` is the human payload and is shown as sent. `cap` is additive
 * detail: do not branch on it and do not show it.
 *
 * **Branching on the message text is forbidden here.** Matching English prose
 * breaks the moment the copy is reworded or localized, and it silently starts
 * showing framework wording to members when it does. This module reads `code`
 * and nothing else. `INVITE_QUOTA_EXCEEDED` in the backend's
 * `membership/invites.service.ts` is the house precedent and records the same
 * history: the frontend used to run a regex against an English sentence, and
 * the typed code replaced it. `PLATFORM_LOCKED`, `ACCOUNT_RESTRICTED` and
 * `BANNED_FROM_COMMUNITY` are read the same way elsewhere in this app.
 *
 * `AllExceptionsFilter.normalizeErrorBody` spreads the thrown body first and
 * only fills in a missing `statusCode`/`error`/`message`, so `code` reaches the
 * wire untouched, and `ApiError.data` hands it over already parsed.
 */

/** The backend's typed discriminator for a rolling flood-cap refusal. Mirrors
 *  `REPORT_FLOOD_CAP_CODE` in the backend's `reports/report-flood-limits.ts`;
 *  one code covers both the daily and the per-subject cap. */
const REPORT_FLOOD_CAP_CODE = "REPORT_FLOOD_CAP";

/** How a failed report submission should be explained to the member. */
export type ReportSubmissionRefusal =
  /** A rolling flood cap. `message` is server-authored member-facing copy. */
  | { kind: "cap"; message: string }
  /** The burst throttle: refused, but with no copy worth showing. */
  | { kind: "burst" }
  /** Anything else: a network failure, a 4xx, a 5xx. */
  | { kind: "failure" };

/**
 * Classify a report-submission error. Pure, so it can be unit tested and reused
 * outside a component. Reads the parsed body off `ApiError.data`, which the API
 * client fills in from the error response (see `shared/api/client.ts`); nothing
 * is re-parsed here.
 */
export function classifyReportSubmissionError(
  error: unknown,
): ReportSubmissionRefusal {
  if (!(error instanceof ApiError) || error.status !== 429) {
    return { kind: "failure" };
  }
  const code = (error.data as { code?: unknown } | null | undefined)?.code;
  if (code !== REPORT_FLOOD_CAP_CODE) {
    return { kind: "burst" };
  }
  return { kind: "cap", message: error.message.trim() };
}

/**
 * The one place every report surface turns a submission error into the words it
 * shows. Hand it the error and the surface's own generic failure copy:
 *
 * ```ts
 * const describeReportError = useReportSubmissionError();
 * // …
 * onError: (error) => showToast(describeReportError(error, t("safety:flag.error")), "error"),
 * ```
 *
 * A flood-cap refusal returns the server's own explanation verbatim; the burst
 * throttle returns a human `safety` string; everything else returns the
 * surface's `fallbackMessage` unchanged, so no existing failure copy moves.
 *
 * Whatever this returns must be announced, never only shown: `showToast` is
 * already live-region backed, and the surfaces that render an inline panel
 * carry `role="alert"` on the paragraph holding this text.
 */
export function useReportSubmissionError(): (
  error: unknown,
  fallbackMessage: string,
) => string {
  const { t } = useTranslation();
  // Resolved during render, deliberately, for two reasons. It queues the
  // `safety` namespace chunk the moment a report surface mounts rather than at
  // the instant a refusal arrives, and it re-renders the surface once that
  // chunk lands. Callers KEEP whatever the returned function hands them (a
  // toast string, a panel line), so a value resolved inside the callback would
  // be frozen at whatever the catalog held right then.
  const tooFastMessage = t("safety:report.tooFast");
  return useCallback(
    (error: unknown, fallbackMessage: string) => {
      const refusal = classifyReportSubmissionError(error);
      if (refusal.kind === "cap") return refusal.message;
      if (refusal.kind === "burst") {
        // `t()` echoes the key back while its namespace is still loading, and a
        // raw `safety:report.tooFast` in front of a member is worse than the
        // surface's own generic wording. Fall back rather than echo, the same
        // guard `QueryErrorToastBridge` uses.
        return tooFastMessage === "safety:report.tooFast"
          ? fallbackMessage
          : tooFastMessage;
      }
      return fallbackMessage;
    },
    [tooFastMessage],
  );
}
