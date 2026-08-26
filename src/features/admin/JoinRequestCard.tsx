import {
  FiCheckCircle,
  FiClock,
  FiCompass,
  FiFlag,
  FiMail,
  FiMapPin,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { AdminBanEvasionFlag } from "./AdminBanEvasionFlag";
import type { BanEvasionAssessmentDTO } from "./api/adminInvites.api";
import {
  QueueAssignmentControl,
  QueueOverdueChip,
} from "./QueueAssignmentControls";
import { AdminAvatar } from "./ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRequestView } from "./api/useJoinRequests";
import styles from "./AdminMembersPage.module.css";

/**
 * How urgently a pending request's wait time should read, against the
 * 3-business-day SLA the guideline audit settled on: under 2 days is
 * neutral, 2-3 is approaching, past 3 is overdue.
 */
function waitingTone(
  daysWaiting: number,
): "neutral" | "approaching" | "overdue" {
  if (daysWaiting >= 3) return "overdue";
  if (daysWaiting >= 2) return "approaching";
  return "neutral";
}

/**
 * One pending applicant in the mod review queue: everything a reviewer needs to
 * make the call — their name, the email we'd reach them on, their city, their
 * own words, and the 18+ attestation record — plus the two decisions.
 */
export function JoinRequestCard({
  item,
  leaving,
  stage,
  selected,
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
  /** Bulk-selection checkbox state — only meaningful (and only rendered)
   *  while `stage === "pending"`; waitlisted rows aren't part of the same
   *  bulk batch (Task 6). */
  selected: boolean;
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
  return (
    <div
      className={`${styles.queueCard} ${leaving ? styles.queueCardLeaving : ""}`}
    >
      <div className={styles.queueHead}>
        {stage === "pending" && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(item.id)}
            aria-label={t("admin:members.verify.selectAria", {
              name: item.name,
            })}
            className={styles.queueSelect}
          />
        )}
        {/* Initials only, never a photo: an applicant has no account and so
            no avatar of their own, and the demo portrait registry is keyed by
            name — it would put a stranger's face on the record a reviewer is
            deciding about. */}
        <AdminAvatar initials={item.initials} tone={item.tone} size="md" />
        <div>
          <div className={styles.queueName}>{item.name}</div>
          <div className={styles.queueApplied}>{item.appliedLine}</div>
          <span
            className={`${styles.queueWaiting} ${styles[`queueWaiting--${waitingTone(item.daysWaiting)}`]}`}
          >
            <FiClock aria-hidden />
            {t("admin:members.verify.waitingDays", { count: item.daysWaiting })}
          </span>
          {/* OPS-04. The stored due date, distinct from the wait length beside
              it: one is how long they have waited, the other is the promise
              this queue made. A request with no stored clock renders nothing
              here rather than an "on time" nobody committed to. */}
          <QueueOverdueChip dueAt={item.dueAt} />
        </div>
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
          to make the call — so it frames the reading rather than arriving
          after it as a verdict. */}
      <AdminBanEvasionFlag assessment={banEvasion} />

      <dl className={styles.queueFacts}>
        <div className={styles.queueFact}>
          <dt className={styles.queueFactLabel}>
            <FiMail aria-hidden />
            {t("admin:members.verify.emailLabel")}
          </dt>
          <dd className={styles.queueFactValue}>
            <a href={`mailto:${item.email}`}>{item.email}</a>
          </dd>
        </div>
        <div className={styles.queueFact}>
          <dt className={styles.queueFactLabel}>
            <FiMapPin aria-hidden />
            {t("admin:members.verify.cityLabel")}
          </dt>
          <dd className={styles.queueFactValue}>
            {item.city ?? t("admin:members.verify.noCity")}
          </dd>
        </div>
        <div className={styles.queueFact}>
          <dt className={styles.queueFactLabel}>
            <FiCompass aria-hidden />
            {t("admin:members.verify.sourceLabel")}
          </dt>
          <dd className={styles.queueFactValue}>{item.sourceLabel}</dd>
        </div>
        {item.mutualMemberEmail && (
          <div className={styles.queueFact}>
            <dt className={styles.queueFactLabel}>
              <FiUserCheck aria-hidden />
              {t("admin:members.verify.mutualLabel")}
            </dt>
            <dd className={styles.queueFactValue}>
              <a href={`mailto:${item.mutualMemberEmail}`}>
                {item.mutualMemberEmail}
              </a>
            </dd>
          </div>
        )}
        {item.referenceLine && (
          <div className={styles.queueFact}>
            <dt className={styles.queueFactLabel}>
              <FiUsers aria-hidden />
              {t("admin:members.verify.referenceLabel")}
            </dt>
            <dd className={styles.queueFactValue}>
              {item.referenceMemberSlug ? (
                <Link to={`/members/${item.referenceMemberSlug}`}>
                  {item.referenceLine}
                </Link>
              ) : (
                item.referenceLine
              )}
            </dd>
          </div>
        )}
      </dl>

      <p className={styles.queueMsg}>“{item.message}”</p>

      <div className={styles.queueAttest}>
        <FiCheckCircle aria-hidden />
        {item.ageLine}
      </div>

      <p className={styles.queueReminder}>
        {t("admin:members.verify.identityReminder")}
      </p>

      {/* The three labels are `white-space: nowrap` and together outrun a
          narrow queue column, so the row wraps: the two quiet options share
          the first line and "welcome in" gets a full-width line below. */}
      <div className={styles.queueActions}>
        <Button
          variant="ghost"
          size="md"
          className={styles.queueActionSecondary}
          disabled={isBusy}
          onClick={onDecline}
        >
          {t("admin:members.verify.declineCta")}
        </Button>
        {stage === "pending" && onWaitlist && (
          <Button
            variant="ghost"
            size="md"
            className={styles.queueActionSecondary}
            disabled={isBusy}
            onClick={onWaitlist}
          >
            {t("admin:members.verify.waitlistCta")}
          </Button>
        )}
        <Button
          variant="jade"
          size="md"
          className={styles.queueActionPrimary}
          disabled={isBusy}
          onClick={onApprove}
        >
          {t("admin:members.verify.approveCta")}
        </Button>
      </div>
    </div>
  );
}
