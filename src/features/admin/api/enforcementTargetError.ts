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
 *  - `ambiguous_authors`: the report covers a question and the answer posted
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
  return useCallback(
    (error: unknown, fallbackMessage: string) => {
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
    [noAccountLine, ambiguousAuthorsLine, houseAccountLine, staffAccountLine],
  );
}

/* ── Bulk ────────────────────────────────────────────────────────────────── */

/**
 * `PATCH /mod/reports/bulk` never throws for a partial batch: a refused report
 * lands in `failed[]` as `{ id, reason }`, where `reason` is the message STRING
 * only. It carries no `code` and no `target`, so {@link
 * classifyEnforcementError} cannot be used there and there is nothing to
 * localize against.
 *
 * So the reasons are shown exactly as the server sent them. Do NOT text-match
 * them back to a target to recover the structure: that is the prose-matching
 * this whole module exists to avoid, and it would silently start mislabelling
 * refusals the first time the backend rewords one. Widening the bulk `failed[]`
 * entries to carry `code`/`target` is the server-side follow-up that would let
 * this speak the moderator's language too.
 *
 * Distinct reasons only, because a batch of twenty refused for one reason
 * should say that reason once, and at most two, because a toast is not a
 * report. The count in the surrounding copy carries the rest.
 */
export function summarizeBulkFailures(
  failed: { reason: string }[],
  maxReasons = 2,
): string {
  return [...new Set(failed.map((failure) => failure.reason))]
    .slice(0, maxReasons)
    .join("; ");
}
