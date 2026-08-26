import { FiClock, FiUserPlus } from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { isQueueRowOverdue, overdueByLabel } from "./queueClock";
import { AdminChip } from "./ui";
import styles from "./QueueAssignment.module.css";

/**
 * The two OPS-04 controls, in the moderation queue's own visual language so a
 * reviewer moving between queues reads the same signals.
 *
 * `QueueOverdueChip` is the `AdminChip tone="danger"` the report card already
 * uses for `slaOverdue`; `QueueAssignmentControl` is the assignee line plus
 * claim/release button the report drawer already uses. Both are here rather
 * than copied into each queue so the four of them cannot drift apart.
 */

/**
 * The "Overdue" chip, rendered only when the row actually is. A row with no
 * clock (`dueAt` null — see `queueClock.ts`) renders nothing at all rather
 * than a reassuring "on time" it has no basis for.
 *
 * The chip says how far past due as well as that it is, because red alone is
 * not information: two days late and two months late need different responses.
 */
export function QueueOverdueChip({ dueAt }: { dueAt: string | null }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  if (!isQueueRowOverdue(dueAt)) return null;
  const lateness = overdueByLabel(dueAt, fmt);
  return (
    <AdminChip tone="danger">
      <FiClock aria-hidden />{" "}
      {lateness
        ? t("admin:queueClock.overdueBy", { age: lateness })
        : t("admin:queueClock.overdue")}
    </AdminChip>
  );
}

/**
 * Who holds this row, and the one action available to the person reading.
 *
 * Three states, mirroring the report drawer:
 *  - unassigned, so anyone can claim it;
 *  - held by you, so you can give it back;
 *  - held by someone else, which is the whole point of the feature: it names
 *    them and offers no button, because taking a row out of a colleague's
 *    hands is a conversation, not a click. An admin who genuinely must can do
 *    it through the API, which is where that override belongs.
 *
 * `rowLabel` names the specific row in the button's accessible name, so a
 * screen-reader user working a list of twenty "Claim" buttons hears which one
 * each belongs to.
 */
export function QueueAssignmentControl({
  assignedStaffId,
  assignedStaffName,
  currentUserId,
  rowLabel,
  isBusy = false,
  onClaim,
  onRelease,
}: {
  assignedStaffId: string | null;
  /** Absent on an unclaimed row. "Deleted member" after the holder's erasure. */
  assignedStaffName?: string;
  /** The signed-in staff member, so "held by you" can be distinguished from
   *  "held by a colleague". Null while the session is still loading. */
  currentUserId: string | null;
  /** Names the row in the button's accessible name, e.g. the applicant's name. */
  rowLabel: string;
  isBusy?: boolean;
  onClaim: () => void;
  onRelease: () => void;
}) {
  const { t } = useTranslation();
  const isMine = assignedStaffId !== null && assignedStaffId === currentUserId;

  return (
    <div className={styles.assignment}>
      <span className={styles.assignedTo}>
        <FiUserPlus aria-hidden />
        {assignedStaffId === null
          ? t("admin:queueAssignment.unassigned")
          : isMine
            ? t("admin:queueAssignment.assignedToYou")
            : t("admin:queueAssignment.assignedTo", {
                name: assignedStaffName ?? t("admin:queueAssignment.someone"),
              })}
      </span>
      {assignedStaffId === null && (
        <button
          type="button"
          className={styles.cta}
          disabled={isBusy}
          onClick={onClaim}
          aria-label={t("admin:queueAssignment.claimAria", { row: rowLabel })}
        >
          {t("admin:queueAssignment.claimCta")}
        </button>
      )}
      {isMine && (
        <button
          type="button"
          className={styles.cta}
          disabled={isBusy}
          onClick={onRelease}
          aria-label={t("admin:queueAssignment.releaseAria", { row: rowLabel })}
        >
          {t("admin:queueAssignment.releaseCta")}
        </button>
      )}
    </div>
  );
}
