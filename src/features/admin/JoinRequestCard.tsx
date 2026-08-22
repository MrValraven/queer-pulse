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
import { AdminAvatar } from "./ui";
import { portrait } from "./adminPeople.data";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRequestView } from "./api/useJoinRequests";
import styles from "./AdminMembersPage.module.css";

/**
 * How urgently a pending request's wait time should read, against the
 * 3-business-day SLA the guideline audit settled on: under 2 days is
 * neutral, 2-3 is approaching, past 3 is overdue.
 */
function waitingTone(daysWaiting: number): "neutral" | "approaching" | "overdue" {
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
        <AdminAvatar
          initials={item.initials}
          tone={item.tone}
          size="md"
          src={portrait(item.name)}
        />
        <div>
          <div className={styles.queueName}>{item.name}</div>
          <div className={styles.queueApplied}>{item.appliedLine}</div>
          <span
            className={`${styles.queueWaiting} ${styles[`queueWaiting--${waitingTone(item.daysWaiting)}`]}`}
          >
            <FiClock aria-hidden />
            {t("admin:members.verify.waitingDays", { count: item.daysWaiting })}
          </span>
        </div>
      </div>

      {item.flagLabels.length > 0 && (
        <div className={styles.queueFlags}>
          <FiFlag aria-hidden />
          {item.flagLabels.join(" · ")}
        </div>
      )}
      {item.priorDeclineLine && (
        <div className={styles.queueHistory}>{item.priorDeclineLine}</div>
      )}

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

      <div className={styles.queueActions}>
        <Button variant="ghost" size="md" disabled={isBusy} onClick={onDecline}>
          {t("admin:members.verify.declineCta")}
        </Button>
        {stage === "pending" && onWaitlist && (
          <Button
            variant="ghost"
            size="md"
            disabled={isBusy}
            onClick={onWaitlist}
          >
            {t("admin:members.verify.waitlistCta")}
          </Button>
        )}
        <Button variant="jade" size="md" disabled={isBusy} onClick={onApprove}>
          {t("admin:members.verify.approveCta")}
        </Button>
      </div>
    </div>
  );
}
