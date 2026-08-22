import { useTranslation } from "../../shared/i18n/useTranslation";
import { useJoinRequests } from "./api/useJoinRequests";
import { useJoinRequestQueueDecisions } from "./useJoinRequestQueueDecisions";
import {
  AdminVerifyQueueCards,
  AdminVerifyQueueSkeleton,
  AdminVerifyQueueWaitlist,
} from "./AdminVerifyQueueCards";
import { JoinRequestDeclineModal } from "./JoinRequestDeclineModal";
import { JoinRequestBulkActionBar } from "./JoinRequestBulkActionBar";
import styles from "./AdminMembersPage.module.css";

/**
 * Moderator review of incoming platform join requests. Sourced from
 * useJoinRequests (GET /join-requests?status=pending), with approve/decline wired
 * to useReviewJoinRequest (PATCH /join-requests/:id). The mutation invalidates the
 * ["join-requests"] query so the list refetches; declines drop the row locally
 * with a short leave animation so the action reads instantly in either mode.
 *
 * Approvals do *not* drop: the response carries an invite code, and while
 * approval fires an automatic invite email, the reviewer can still copy that
 * link and send it as a backup. The approved card is held in local state so
 * it survives the refetch that removes the row from the pending list.
 *
 * Every decision, its toast and its local bookkeeping live in
 * `useJoinRequestQueueDecisions`; the card lists live in
 * `AdminVerifyQueueCards`. This component is the layout between them.
 */
export function AdminVerifyQueue() {
  const { t } = useTranslation();
  const { data, isLoading } = useJoinRequests("pending");
  const { data: waitlisted } = useJoinRequests("waitlisted");
  const decisions = useJoinRequestQueueDecisions(data ?? []);

  if (isLoading) return <AdminVerifyQueueSkeleton />;

  const waitlistedRows = decisions.displayedWaitlisted(waitlisted ?? []);

  if (
    decisions.queue.length === 0 &&
    decisions.approved.length === 0 &&
    waitlistedRows.length === 0
  ) {
    return (
      <div className={styles.queueEmpty}>
        <p className={styles.queueIntro}>{t("admin:members.verify.empty")}</p>
      </div>
    );
  }

  return (
    <div>
      <p className={styles.queueIntro}>{t("admin:members.verify.intro")}</p>
      <p className={styles.queueIntroEm}>
        <em>{t("admin:members.verify.introEm")}</em>
      </p>

      <AdminVerifyQueueCards
        approved={decisions.approved}
        queue={decisions.queue}
        leavingIds={decisions.leaving}
        decidingId={decisions.decidingId}
        selectedIds={decisions.selection.selectedIds}
        onApprove={(item) => decisions.resolve(item, "approved")}
        onDecline={decisions.requestDecline}
        onWaitlist={(item) => decisions.resolve(item, "waitlisted")}
        onToggleSelect={decisions.selection.toggleSelected}
      />

      {decisions.selection.selectedIds.size > 0 && (
        <JoinRequestBulkActionBar
          selectedIds={decisions.selection.selectedIds}
          onClear={() => decisions.selection.setSelectedIds(new Set())}
          onSuccess={decisions.handleBulkSuccess}
        />
      )}

      {waitlistedRows.length > 0 && (
        <AdminVerifyQueueWaitlist
          items={waitlistedRows}
          decidingId={decisions.decidingId}
          onApprove={(item) => decisions.resolve(item, "approved")}
          onDecline={decisions.requestDecline}
        />
      )}

      {decisions.decliningItem && (
        <JoinRequestDeclineModal
          applicantName={decisions.decliningItem.name}
          pending={decisions.isPending}
          onConfirm={decisions.confirmDecline}
          onClose={decisions.closeDecline}
        />
      )}
    </div>
  );
}
