import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRequestView } from "./api/useJoinRequests";
import { JoinRequestBulkDeclineModal } from "./JoinRequestBulkDeclineModal";
import { JoinRequestBulkResult } from "./JoinRequestBulkResult";
import { useJoinRequestBulkDecision } from "./useJoinRequestBulkDecision";
import { JOIN_REQUEST_BULK_ACTION_CAP } from "../auth/api/joinRequest.api";
import styles from "./AdminMembersPage.module.css";

/**
 * The bulk-action bar for the join-request queue's multi-select: approve,
 * waitlist and decline, matching the three decisions already on a single card.
 *
 * Every one of them goes through a confirmation naming the count and the action
 * before anything reaches the server, and a decline names the reason that will
 * be recorded against all of them. These are real people's applications and no
 * decision here is undoable from this screen.
 *
 * The decision itself lives in `useJoinRequestBulkDecision`, which keeps the
 * partial result whole. See `JoinRequestBulkResult` for why a bulk call
 * regularly half-applies.
 */
export function JoinRequestBulkActionBar({
  selectedIds,
  rows,
  onClear,
  onOutcome,
}: {
  selectedIds: Set<string>;
  /** The pending rows on screen, so a failed id can be named. */
  rows: JoinRequestView[];
  onClear: () => void;
  /** Succeeded ids leave the queue; failed ids stay selected for a retry. */
  onOutcome: (succeededIds: string[], failedIds: string[]) => void;
}) {
  const { t } = useTranslation();
  const ids = Array.from(selectedIds);
  const count = ids.length;
  const decision = useJoinRequestBulkDecision({ ids, onOutcome });
  const isDecliningOpen = decision.confirming === "declined";
  // Approve and waitlist share the plain ConfirmDialog; a decline needs the
  // reason picker, so it gets its own modal below.
  const simpleConfirmStatus =
    decision.confirming !== null && !isDecliningOpen
      ? decision.confirming
      : null;
  const simpleConfirmCopyKey = simpleConfirmStatus
    ? decision.confirmCopyKey
    : null;

  return (
    <>
      <div
        className={styles.bulkBar}
        role="region"
        aria-label={t("admin:members.verify.bulk.ariaLabel")}
      >
        <span className={styles.bulkCount} role="status">
          {t("admin:members.verify.bulk.selectedCount", { count })}
        </span>
        {count >= JOIN_REQUEST_BULK_ACTION_CAP && (
          <span className={styles.bulkCapNote}>
            {t("admin:members.verify.bulk.capNote", {
              cap: JOIN_REQUEST_BULK_ACTION_CAP,
            })}
          </span>
        )}
        <div className={styles.bulkActions}>
          <Button
            variant="jade"
            onClick={() => decision.request("approved")}
            disabled={decision.pending}
          >
            {t("admin:members.verify.bulk.approveCta")}
          </Button>
          <Button
            variant="ghost-dark"
            onClick={() => decision.request("waitlisted")}
            disabled={decision.pending}
          >
            {t("admin:members.verify.bulk.waitlistCta")}
          </Button>
          <Button
            variant="danger"
            onClick={() => decision.request("declined")}
            disabled={decision.pending}
          >
            {t("admin:members.verify.bulk.declineCta")}
          </Button>
          <Button
            variant="ghost-dark"
            onClick={onClear}
            disabled={decision.pending}
          >
            {t("admin:members.verify.bulk.clearCta")}
          </Button>
        </div>
      </div>

      {decision.outcome && (
        <JoinRequestBulkResult
          outcome={decision.outcome}
          rows={rows}
          onDismiss={decision.dismissOutcome}
        />
      )}

      {simpleConfirmStatus && simpleConfirmCopyKey && (
        <ConfirmDialog
          open
          onClose={decision.cancel}
          onConfirm={() => void decision.run(simpleConfirmStatus)}
          loading={decision.pending}
          title={t(`${simpleConfirmCopyKey}.title`, { count })}
          description={t(`${simpleConfirmCopyKey}.body`, { count })}
          confirmLabel={t(`${simpleConfirmCopyKey}.confirmCta`)}
          cancelLabel={t("admin:common.cancel")}
        />
      )}

      {isDecliningOpen && (
        <JoinRequestBulkDeclineModal
          count={count}
          pending={decision.pending}
          onConfirm={(reason) => void decision.run("declined", reason)}
          onClose={decision.cancel}
        />
      )}
    </>
  );
}
