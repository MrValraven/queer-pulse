import { useAuth } from "../../app/providers/authContext";
import { LoadErrorState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useBanEvasionAssessments } from "./AdminBanEvasionSignals";
import type { JoinRequestView } from "./api/useJoinRequests";
import type { useJoinRequestAssignment } from "./useJoinRequestAssignment";
import type { useJoinRequestQueueDecisions } from "./useJoinRequestQueueDecisions";
import {
  AdminVerifyQueueCards,
  AdminVerifyQueueSkeleton,
  AdminVerifyQueueWaitlist,
} from "./AdminVerifyQueueCards";
import { JoinRequestBulkActionBar } from "./JoinRequestBulkActionBar";
import { JoinRequestSelectAllRow } from "./JoinRequestSelectAllRow";
import styles from "./AdminMembersPage.module.css";
import { ModerationStanceNote } from "../safety/ModerationStanceNote";

/**
 * The waiting half of the join-request queue: pending cards, the waitlist, and
 * the invite link of anyone approved in this session.
 *
 * Split out of `AdminVerifyQueue` when the Decided tab arrived, so that
 * component stays the tab layout between the two halves. Every decision still
 * lives in `useJoinRequestQueueDecisions`, held by the parent so switching tabs
 * cannot throw away a decision this session took.
 */
export function AdminVerifyQueueWaiting({
  pending,
  waitlisted,
  isLoading,
  hasLoadError,
  isRetrying,
  onRetry,
  decisions,
  assignment,
}: {
  pending: JoinRequestView[];
  waitlisted: JoinRequestView[];
  isLoading: boolean;
  /** The pending or waitlisted read failed with nothing loaded (DES-424). */
  hasLoadError: boolean;
  /** A retry of a failed read is in flight. */
  isRetrying: boolean;
  onRetry: () => void;
  decisions: ReturnType<typeof useJoinRequestQueueDecisions>;
  /** OPS-04's claim/release, held by the parent alongside the queries whose
   *  "Assigned to me" filter it changes. */
  assignment: ReturnType<typeof useJoinRequestAssignment>;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  // One assessment call covers every row on screen, pending and waitlisted
  // alike: a waitlisted applicant is exactly the one a reviewer comes back to
  // later, so the signal has to still be there when they do.
  const banEvasionBySubjectId = useBanEvasionAssessments([
    ...pending.map((item) => item.id),
    ...waitlisted.map((item) => item.id),
  ]);

  if (isLoading) return <AdminVerifyQueueSkeleton />;

  const waitlistedRows = decisions.displayedWaitlisted(waitlisted);
  // `isPartial`: some rows are on screen, so the copy names the missing part
  // and the panel keeps its distance from the stance note below it. A retry
  // keeps the panel mounted, so focus stays on its Retry button.
  const renderLoadError = (isPartial: boolean) => (
    <LoadErrorState
      compact
      headingLevel={2}
      className={isPartial ? styles.queueLoadError : undefined}
      isRetrying={isRetrying}
      onRetry={onRetry}
      title={
        <Translation
          i18nKey={
            isPartial
              ? "admin:members.verify.partialLoadError.title"
              : "admin:members.verify.loadError.title"
          }
          components={{ em: <em /> }}
        />
      }
      description={t(
        isPartial
          ? "admin:members.verify.partialLoadError.body"
          : "admin:members.verify.loadError.body",
      )}
    />
  );

  if (
    decisions.queue.length === 0 &&
    decisions.approved.length === 0 &&
    waitlistedRows.length === 0
  ) {
    // Nothing on screen and a read failed: the queue is unknown, so it
    // shows the error state.
    if (hasLoadError) return renderLoadError(false);
    return (
      <div className={styles.queueEmpty}>
        <p className={styles.queueIntro}>{t("admin:members.verify.empty")}</p>
      </div>
    );
  }

  return (
    <div>
      {/* One half loaded and the other failed: keep the loaded rows and say
          what is missing above them. */}
      {hasLoadError && renderLoadError(true)}
      <ModerationStanceNote variant="applicants" />
      <p className={styles.queueIntro}>{t("admin:members.verify.intro")}</p>
      <p className={styles.queueIntroEm}>
        <em>{t("admin:members.verify.introEm")}</em>
      </p>

      {/* Above the cards, so the set it names ("the requests waiting here") is
          the set directly under it. */}
      {decisions.queue.length > 1 && (
        <JoinRequestSelectAllRow
          visibleCount={decisions.queue.length}
          selectedVisibleCount={
            decisions.queue.filter((item) =>
              decisions.selection.selectedIds.has(item.id),
            ).length
          }
          isAtCap={decisions.selection.atSelectionCap}
          onToggleAll={decisions.selection.toggleSelectAll}
        />
      )}

      <AdminVerifyQueueCards
        approved={decisions.approved}
        queue={decisions.queue}
        leavingIds={decisions.leaving}
        decidingId={decisions.decidingId}
        selectedIds={decisions.selection.selectedIds}
        isAtSelectionCap={decisions.selection.atSelectionCap}
        onApprove={(item) => decisions.resolve(item, "approved")}
        onDecline={decisions.requestDecline}
        onWaitlist={(item) => decisions.resolve(item, "waitlisted")}
        onToggleSelect={decisions.selection.toggleSelected}
        banEvasionBySubjectId={banEvasionBySubjectId}
        currentUserId={user?.id ?? null}
        isAssignmentBusy={assignment.isPending}
        onClaim={(item) => assignment.claim(item.id)}
        onRelease={(item) => assignment.release(item.id)}
      />

      {decisions.selection.selectedIds.size > 0 && (
        <JoinRequestBulkActionBar
          selectedIds={decisions.selection.selectedIds}
          rows={decisions.queue}
          onClear={decisions.selection.resetSelection}
          onOutcome={decisions.handleBulkOutcome}
        />
      )}

      {waitlistedRows.length > 0 && (
        <AdminVerifyQueueWaitlist
          items={waitlistedRows}
          decidingId={decisions.decidingId}
          onApprove={(item) => decisions.resolve(item, "approved")}
          onDecline={decisions.requestDecline}
          banEvasionBySubjectId={banEvasionBySubjectId}
          currentUserId={user?.id ?? null}
          isAssignmentBusy={assignment.isPending}
          onClaim={(item) => assignment.claim(item.id)}
          onRelease={(item) => assignment.release(item.id)}
        />
      )}
    </div>
  );
}
