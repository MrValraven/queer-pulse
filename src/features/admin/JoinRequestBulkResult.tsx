import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRequestView } from "./api/useJoinRequests";
import type { JoinRequestBulkOutcome } from "./useJoinRequestBulkDecision";
import styles from "./JoinRequestBulk.module.css";

/**
 * What one bulk call actually did, for a reviewer to act on.
 *
 * Only rendered when at least one id FAILED. `POST /admin/join-requests/bulk`
 * reviews each id on its own, so a batch commonly comes back half-applied, and
 * "5 approved" over a result where two were refused is a lie a reviewer only
 * discovers when the rows reappear. Every failure is named: the applicant, and
 * the server's own reason (usually "Join request has already been reviewed",
 * which a colleague working the same queue produces).
 *
 * ANNOUNCED, NOT COLOURED. The panel is a live region and every fact is in the
 * text, so a screen reader gets the same result a sighted reviewer does; the
 * coral heading is decoration on top of a sentence that already says it.
 *
 * The failed rows are still selected when this renders (see
 * `useJoinRequestQueueDecisions.handleBulkOutcome`), so "try again" needs no
 * re-selection.
 */
export function JoinRequestBulkResult({
  outcome,
  rows,
  onDismiss,
}: {
  outcome: JoinRequestBulkOutcome;
  /** The queue rows on screen, to put a name on a failed id. */
  rows: JoinRequestView[];
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const nameById = new Map(rows.map((row) => [row.id, row.name]));

  return (
    <div
      className={styles.resultPanel}
      role="status"
      aria-live="polite"
      aria-label={t("admin:members.verify.bulk.result.title")}
    >
      <h3 className={styles.resultTitle}>
        {t("admin:members.verify.bulk.result.title")}
      </h3>
      <p className={styles.resultSummary}>
        {outcome.succeeded.length === 0
          ? t("admin:members.verify.bulk.result.noneSucceeded")
          : t("admin:members.verify.bulk.result.succeeded", {
              count: outcome.succeeded.length,
            })}
      </p>

      <p className={styles.resultFailedTitle}>
        {t("admin:members.verify.bulk.result.failedTitle", {
          count: outcome.failed.length,
        })}
      </p>
      <ul className={styles.resultList}>
        {outcome.failed.map((failure) => (
          <li className={styles.resultItem} key={failure.id}>
            <span className={styles.resultName}>
              {nameById.get(failure.id) ??
                t("admin:members.verify.bulk.result.unknownApplicant", {
                  id: failure.id,
                })}
            </span>
            <span className={styles.resultReason}>{failure.reason}</span>
          </li>
        ))}
      </ul>

      <p className={styles.resultNote}>
        {t("admin:members.verify.bulk.result.retryNote")}
      </p>
      <div className={styles.resultActions}>
        <Button variant="ghost" size="md" onClick={onDismiss}>
          {t("admin:members.verify.bulk.result.dismissCta")}
        </Button>
      </div>
    </div>
  );
}
