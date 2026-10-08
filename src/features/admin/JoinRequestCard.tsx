import { FiCheckCircle, FiClock, FiFlag } from "react-icons/fi";
import { AdminBanEvasionFlag } from "./AdminBanEvasionFlag";
import { JoinRequestDecisionActions } from "./JoinRequestDecisionActions";
import { JoinRequestFacts } from "./JoinRequestFacts";
import { JoinRequestFollowUp } from "./JoinRequestFollowUp";
import { JoinRequestSelectCheckbox } from "./JoinRequestSelectCheckbox";
import { JoinRequestUnvouchedPrompt } from "./JoinRequestUnvouchedPrompt";
import type { BanEvasionAssessmentDTO } from "./api/adminInvites.api";
import {
  QueueAssignmentControl,
  QueueOverdueChip,
} from "./QueueAssignmentControls";
import { queueRowUrgency } from "./queueClock";
import { AdminAvatar } from "./ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRequestView } from "./api/useJoinRequests";
import styles from "./AdminMembersPage.module.css";

/**
 * One pending applicant in the mod review queue: everything a reviewer needs to
 * make the call (their name, the email we'd reach them on, their city, their
 * own words, and the 18+ attestation record) plus the decisions. When nobody
 * here vouches for the applicant, a quiet prompt says what to look at, and an
 * "Email {name} for more details" action opens a ready-made follow-up email
 * the reviewer sends from their own mail app.
 */
export function JoinRequestCard({
  item,
  leaving,
  stage,
  selected,
  disableSelect = false,
  onApprove,
  onDecline,
  onWaitlist,
  onToggleSelect,
  isBusy = false,
  banEvasion,
  currentUserId,
  isAssignmentBusy = false,
  onClaim,
  onRelease,
}: {
  item: JoinRequestView;
  leaving: boolean;
  stage: "pending" | "waitlisted";
  /** Bulk-selection checkbox state, only meaningful (and only rendered)
   *  while `stage === "pending"`; waitlisted rows aren't part of the same
   *  bulk batch (Task 6). */
  selected: boolean;
  /** True at the bulk cap when this row is outside the selection. */
  disableSelect?: boolean;
  onApprove: () => void;
  onDecline: () => void;
  onWaitlist?: () => void;
  onToggleSelect: (id: string) => void;
  /** True while this card's own decision is in flight, so the three buttons
   *  render a real disabled state and a second click cannot fire a second
   *  review of the same request. */
  isBusy?: boolean;
  /** Ban-evasion signals for this applicant, when the queue has them.
   *  Undefined while they load, and for the great majority of applicants,
   *  where there is nothing to say. Advisory: the panel never gates a
   *  decision, it only tells the reviewer which removed account to read. */
  banEvasion?: BanEvasionAssessmentDTO;
  /** OPS-04. The signed-in reviewer, so "you have this" can be told apart from
   *  "a colleague has this". Null while the session is still loading. */
  currentUserId: string | null;
  /** True while a claim/release for any row in this queue is in flight. */
  isAssignmentBusy?: boolean;
  onClaim: () => void;
  onRelease: () => void;
}) {
  const { t } = useTranslation();
  const urgency = queueRowUrgency(item.dueAt);
  const isSelectedPending = stage === "pending" && selected;
  return (
    <div
      className={`${styles.queueCard} ${leaving ? styles.queueCardLeaving : ""} ${isSelectedPending ? styles.queueCardSelected : ""}`}
    >
      <div className={styles.queueHead}>
        {/* Initials only, never a photo: an applicant has no account and so
            no avatar of their own, and the demo portrait registry is keyed by
            name, so it would put a stranger's face on the record a reviewer is
            deciding about. */}
        <AdminAvatar initials={item.initials} tone={item.tone} size="md" />
        <div className={styles.queueHeadText}>
          <div className={styles.queueName}>{item.name}</div>
          <div className={styles.queueApplied}>{item.appliedLine}</div>
          {/* OPS-04. The stored due date speaks only once it matters: a row
              past due shows the red chip alone, since it already says how
              late; a row in its last day shows the amber wait; any other row
              lets the "Applied" line above carry the age. A request with no
              stored clock reads neutral and shows nothing here. */}
          {urgency !== "neutral" && (
            <div className={styles.queueStatusRow}>
              {urgency === "overdue" ? (
                <QueueOverdueChip dueAt={item.dueAt} />
              ) : (
                <span
                  className={`${styles.queueWaiting} ${styles["queueWaiting--approaching"]}`}
                >
                  <FiClock aria-hidden />
                  {t("admin:members.verify.waitingDays", {
                    count: item.daysWaiting,
                  })}
                </span>
              )}
            </div>
          )}
        </div>
        {stage === "pending" && (
          <JoinRequestSelectCheckbox
            applicantName={item.name}
            requestId={item.id}
            isSelected={selected}
            isDisabled={disableSelect}
            onToggleSelect={onToggleSelect}
          />
        )}
      </div>

      {/* OPS-04. Sits directly under the applicant's name, above the triage
          signals, because "who is already on this" is the first thing a second
          reviewer needs to know: reading the case and then finding out a
          colleague had it is the exact waste the claim exists to prevent. */}
      <QueueAssignmentControl
        assignedStaffId={item.assignedStaffId}
        assignedStaffName={item.assignedStaffName}
        currentUserId={currentUserId}
        rowLabel={item.name}
        isBusy={isAssignmentBusy}
        onClaim={onClaim}
        onRelease={onRelease}
      />

      {item.flagLabels.length > 0 && (
        <div className={styles.queueFlags}>
          <FiFlag aria-hidden />
          {item.flagLabels.join(" · ")}
        </div>
      )}
      {item.priorDeclineLine && (
        <div className={styles.queueHistory}>{item.priorDeclineLine}</div>
      )}
      {/* Sits with the other triage signals, above the facts a reviewer reads
          to make the call, so it frames the reading rather than arriving
          after it as a verdict. */}
      <AdminBanEvasionFlag assessment={banEvasion} />

      <JoinRequestFacts item={item} />
      {!item.hasResolvedReference && (
        <JoinRequestUnvouchedPrompt
          applicantName={item.name}
          hasApplicantName={item.hasName}
          hasSocialProfile={item.socialProfile !== null}
        />
      )}

      <p className={styles.queueMsg}>“{item.message}”</p>

      <div className={styles.queueAttest}>
        <FiCheckCircle aria-hidden />
        {item.ageLine}
      </div>

      <p className={styles.queueReminder}>
        {t("admin:members.verify.identityReminder")}
      </p>

      <JoinRequestFollowUp
        applicantName={item.name}
        hasApplicantName={item.hasName}
        applicantEmail={item.email}
        isDisabled={isBusy}
        onWaitlist={stage === "pending" ? onWaitlist : undefined}
      />

      <JoinRequestDecisionActions
        stage={stage}
        isBusy={isBusy}
        onApprove={onApprove}
        onDecline={onDecline}
        onWaitlist={onWaitlist}
      />
    </div>
  );
}
