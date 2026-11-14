import type { ReactNode } from "react";
import { FiCalendar, FiClock } from "react-icons/fi";
import type { TFunction } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDate } from "../../../shared/lib/date";
import type { LeadDTO } from "./api/leads.types";
import { lisbonLeadDay } from "./leadDates";
import { LEAD_FOLLOW_UP_DATE_OPTIONS } from "./leadsList.data";
import styles from "./LeadDetails.module.css";

/** The muted line an empty field shows, so every row keeps its place. */
export function LeadNotAdded() {
  const { t } = useTranslation();
  return (
    <span className={styles.notAdded}>{t("admin:leads.details.notAdded")}</span>
  );
}

/** One label and its value in the details list. While `hasValue` is false
 *  the value reads "Not added". */
export function LeadDetailRow({
  label,
  hasValue,
  children,
}: {
  label: string;
  hasValue: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={styles.detailRow}>
      <dt className={styles.detailLabel}>{label}</dt>
      <dd className={styles.detailValue}>
        {hasValue ? children : <LeadNotAdded />}
      </dd>
    </div>
  );
}

/** What a due follow-up says, read against today in Lisbon: "Due today"
 *  on the day itself, "Overdue since <date>" once the day has passed. */
function dueFollowUpText(
  followUpOn: string,
  date: string,
  t: TFunction,
): string {
  const today = lisbonLeadDay();
  if (followUpOn === today) return t("admin:leads.details.followUpDueToday");
  if (followUpOn < today) {
    return t("admin:leads.details.followUpOverdue", { date });
  }
  return t("admin:leads.details.followUpDue", { date });
}

/**
 * The follow-up day. A due one reads "Due today" or "Overdue since <date>"
 * in the warn ink with a clock; a closed lead's old date reads quiet and
 * italic; a coming one reads with a calendar. The wrapper keeps `id` in
 * every state and takes focus in code once Clear follow-up folds away.
 */
export function LeadFollowUpValue({ lead, id }: { lead: LeadDTO; id: string }) {
  const { t, language } = useTranslation();
  const followUpOn = lead.followUpOn;
  const isDue = lead.isFollowUpDue && followUpOn !== null;
  const isPast = !isDue && followUpOn !== null && followUpOn < lisbonLeadDay();

  let shown: ReactNode;
  if (followUpOn === null) {
    shown = <LeadNotAdded />;
  } else {
    const date = formatDate(followUpOn, language, LEAD_FOLLOW_UP_DATE_OPTIONS);
    shown = (
      <span
        className={styles.followUpDate}
        data-due={isDue || undefined}
        data-past={isPast || undefined}
      >
        {isDue ? (
          <FiClock className={styles.followUpIcon} aria-hidden />
        ) : isPast ? null : (
          <FiCalendar className={styles.followUpIcon} aria-hidden />
        )}
        <span>{isDue ? dueFollowUpText(followUpOn, date, t) : date}</span>
      </span>
    );
  }

  return (
    <span id={id} tabIndex={-1} className={styles.followUpFocus}>
      {shown}
    </span>
  );
}
