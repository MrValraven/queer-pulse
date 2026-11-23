import { useCallback } from "react";
import { ApiError } from "../../../shared/api/client";
import { useTranslation } from "../../../shared/i18n/useTranslation";

/**
 * Why an account-level moderation action was refused, and what to say about it.
 *
 * `warn`, `restrict`, `suspend` and `ban` all land on the AUTHOR of whatever
 * was reported (`AccountEnforcementService.resolveEnforcementTargetUserId`).
 * Four situations mean there is no single account to land on, and the backend
 * now refuses rather than guessing:
 *
 *  - `no_account`: nobody is behind the reported thing at all. An unclaimed
 *    directory listing, an author who has erased their account, or content
 *    that is already gone.
 *  - `ambiguous_authors`: the report covers a review and the reply posted
 *    under it, written by two different members, and it does not record which
 *    of the two was reported. Acting could sanction the wrong person.
 *  - `house_account`: it traces back to the house account, which is never a
 *    moderation target.
 *  - `staff_account`: it traces back to a staff account, which this queue
 *    cannot action at all.
 *
 * All four are DETERMINISTIC. Retrying sends the identical request and gets the
 * identical refusal, so no surface reading this may offer a retry. Every one of
 * them leaves `dismiss`, `escalate`, `hide_content` and `remove_content`
 * available on the same report: there is always a way forward.
 *
 * ## The contract: `code`, never the prose
 *
 * ```json
 * { "statusCode": 400, "error": "Bad Request",
 *   "code": "ENFORCEMENT_TARGET_UNRESOLVED",
 *   "target": "no_account" | "ambiguous_authors",
 *   "message": "<moderator-facing sentence, safe to show verbatim>" }
 *
 * { "statusCode": 403, "error": "Forbidden",
 *   "code": "ENFORCEMENT_TARGET_PROTECTED",
 *   "target": "house_account" | "staff_account",
 *   "message": "<moderator-facing sentence, safe to show verbatim>" }
 * ```
 *
 * `code` is the test, `target` is the discriminator, `message` is the human
 * fallback. **Branching on the message text is forbidden**, for the reason
 * `safety/api/reportSubmissionError.ts` records at length: matching English
 * prose breaks the moment the copy is reworded or localized, and fails silently
 * when it does. That module is the house pattern and this one mirrors it.
 *
 * A `target` this frontend does not know still classifies as a refusal, with
 * `target: null`. That is deliberate: a newly added backend target then gets
 * the server's own sentence and still suppresses the retry, rather than
 * falling through to "couldn't reach the safety service" and inviting a
 * moderator to retry something that will never succeed.
 */

/** The 400: the report names no single account to act on. */
const ENFORCEMENT_TARGET_UNRESOLVED_CODE = "ENFORCEMENT_TARGET_UNRESOLVED";
/** The 403: it names an account this queue may never act on. */
const ENFORCEMENT_TARGET_PROTECTED_CODE = "ENFORCEMENT_TARGET_PROTECTED";

/**
 * SEC-31: the 403 every staff report route answers when the report is about
 * the signed-in staff member or something they posted. Mirrors
 * `REPORT_ABOUT_ACTOR_CODE` in the backend's `moderation/report-about-actor.ts`.
 * Deterministic like the two codes above: another staff member decides the
 * report, so no surface may offer a retry.
 */
export const REPORT_ABOUT_ACTOR_CODE = "REPORT_ABOUT_ACTOR";

/** The catalog line for {@link REPORT_ABOUT_ACTOR_CODE}. */
export const REPORT_ABOUT_YOU_KEY = "admin:moderation.refusal.reportAboutYou";

/** True for the SEC-31 refusal, keyed on `code` alone like everything here. */
export function isReportAboutActorError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  const body = error.data as { code?: unknown } | null | undefined;
  return body?.code === REPORT_ABOUT_ACTOR_CODE;
}

/** The four discriminators the backend sends today. */
export type EnforcementTarget =
  "no_account" | "ambiguous_authors" | "house_account" | "staff_account";

const TARGET_MESSAGE_KEYS: Record<EnforcementTarget, string> = {
  no_account: "admin:moderation.refusal.noAccount",
  ambiguous_authors: "admin:moderation.refusal.ambiguousAuthors",
  house_account: "admin:moderation.refusal.houseAccount",
  staff_account: "admin:moderation.refusal.staffAccount",
};

function isKnownTarget(value: unknown): value is EnforcementTarget {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(TARGET_MESSAGE_KEYS, value)
  );
}

/** How a failed moderation action should be explained to the moderator. */
export type EnforcementRefusal =
  /**
   * The backend refused on purpose. `target` is null when it sent a
   * discriminator this build does not know; `message` is always the server's
   * own moderator-facing sentence, safe to show as sent.
   */
  | { kind: "refused"; target: EnforcementTarget | null; message: string }
  /** Anything else: a network failure, a timeout, a 5xx. */
  | { kind: "failure" };

/**
 * Classify a moderation-action error. Pure, so it is unit tested directly and
 * can be reused outside a component. Reads the parsed body off `ApiError.data`,
 * which the API client fills in from the error response; nothing is re-parsed.
 *
 * Keyed on `code` alone rather than on the HTTP status as well. Both codes are
 * unique to this one contract, so they identify it without help, and a status
 * check would only add a second thing to keep in step with the backend.
 */
export function classifyEnforcementError(error: unknown): EnforcementRefusal {
  if (!(error instanceof ApiError)) return { kind: "failure" };
  const body = error.data as
    { code?: unknown; target?: unknown } | null | undefined;
  const code = body?.code;
  if (
    code !== ENFORCEMENT_TARGET_UNRESOLVED_CODE &&
    code !== ENFORCEMENT_TARGET_PROTECTED_CODE
  ) {
    return { kind: "failure" };
  }
  return {
    kind: "refused",
    target: isKnownTarget(body?.target) ? body.target : null,
    message: error.message.trim(),
  };
}

/**
 * The one place the moderation queue turns an action error into the words it
 * shows:
 *
 * ```ts
 * const describeRefusal = useEnforcementRefusal();
 * // …
 * onError: (error) =>
 *   showToast(describeRefusal(error, t("admin:moderation.queue.serviceErrorToast")), "error"),
 * ```
 *
 * A typed refusal returns our own localized two-sentence explanation; an
 * unrecognized `target` returns the server's sentence; everything else returns
 * the caller's `fallbackMessage` unchanged, so genuine outages keep saying so.
 *
 * Whatever this returns must be announced rather than only shown. `showToast`
 * is already live-region backed.
 */
export function useEnforcementRefusal(): (
  error: unknown,
  fallbackMessage: string,
) => string {
  const { t } = useTranslation();
  // Resolved during render, deliberately, for the reason
  // `useReportSubmissionError` documents: it queues the lazy `admin` chunk when
  // the queue mounts rather than at the instant a refusal arrives, and the
  // caller KEEPS the string this hands back, so a value read inside the
  // callback would be frozen at whatever the catalog held right then.
  const noAccountLine = t(TARGET_MESSAGE_KEYS.no_account);
  const ambiguousAuthorsLine = t(TARGET_MESSAGE_KEYS.ambiguous_authors);
  const houseAccountLine = t(TARGET_MESSAGE_KEYS.house_account);
  const staffAccountLine = t(TARGET_MESSAGE_KEYS.staff_account);
  const reportAboutYouLine = t(REPORT_ABOUT_YOU_KEY);
  return useCallback(
    (error: unknown, fallbackMessage: string) => {
      // SEC-31, read first: it is a 403 like `staff_account`, with its own line.
      if (isReportAboutActorError(error)) {
        if (reportAboutYouLine !== REPORT_ABOUT_YOU_KEY) {
          return reportAboutYouLine;
        }
        return error instanceof Error && error.message.trim()
          ? error.message.trim()
          : fallbackMessage;
      }
      const refusal = classifyEnforcementError(error);
      if (refusal.kind === "failure") return fallbackMessage;
      const { target } = refusal;
      if (target) {
        const line = {
          no_account: noAccountLine,
          ambiguous_authors: ambiguousAuthorsLine,
          house_account: houseAccountLine,
          staff_account: staffAccountLine,
        }[target];
        // `t()` echoes the key back while its namespace is still loading, and
        // a raw `admin:moderation.refusal.noAccount` in front of a moderator
        // is worse than the server's own sentence. Fall back rather than echo,
        // the same guard `QueryErrorToastBridge` uses.
        if (line !== TARGET_MESSAGE_KEYS[target]) return line;
      }
      return refusal.message || fallbackMessage;
    },
    [
      noAccountLine,
      ambiguousAuthorsLine,
      houseAccountLine,
      staffAccountLine,
      reportAboutYouLine,
    ],
  );
}

/* ── Bulk ────────────────────────────────────────────────────────────────── */

/**
 * `PATCH /mod/reports/bulk` never throws for a partial batch: a refused report
 * lands in `failed[]` as `{ id, reason, code? }`. `reason` is the server's
 * sentence; `code` is present when the refusal carried one (SEC-31 follow-up).
 * A code with a line of its own here (`localizedByCode`) reads in the
 * moderator's language; every other reason is shown exactly as the server sent
 * it. Do NOT text-match a `reason` back to a case to recover the structure:
 * that is the prose-matching this whole module exists to avoid, and it would
 * silently start mislabelling refusals the first time the backend rewords one.
 *
 * Distinct reasons only, because a batch of twenty refused for one reason
 * should say that reason once, and at most two, because a toast is not a
 * report. The count in the surrounding copy carries the rest.
 */
export function summarizeBulkFailures(
  failed: { reason: string; code?: string }[],
  maxReasons = 2,
  localizedByCode: Readonly<Partial<Record<string, string>>> = {},
): string {
  return [
    ...new Set(
      failed.map(
        (failure) =>
          (failure.code ? localizedByCode[failure.code] : undefined) ??
          failure.reason,
      ),
    ),
  ]
    .slice(0, maxReasons)
    .join("; ");
}

/**
 * {@link summarizeBulkFailures} with the coded lines this build knows,
 * resolved during render for the reason `useEnforcementRefusal` gives. Today
 * that is SEC-31's report-about-you line; a key still loading falls back to
 * the server's sentence.
 */
export function useBulkFailureSummary(): (
  failed: { reason: string; code?: string }[],
) => string {
  const { t } = useTranslation();
  const reportAboutYouLine = t(REPORT_ABOUT_YOU_KEY);
  return useCallback(
    (failed: { reason: string; code?: string }[]) =>
      summarizeBulkFailures(
        failed,
        2,
        reportAboutYouLine === REPORT_ABOUT_YOU_KEY
          ? {}
          : { [REPORT_ABOUT_ACTOR_CODE]: reportAboutYouLine },
      ),
    [reportAboutYouLine],
  );
}
