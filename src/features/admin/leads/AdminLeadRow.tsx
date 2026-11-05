import { useId } from "react";
import { FiClock, FiFileText, FiMapPin } from "react-icons/fi";
import { Link } from "react-router-dom";
import { formatDate } from "../../../shared/lib/date";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { LeadListItemDTO } from "./api/leads.types";
import { lisbonLeadDay } from "./leadDates";
import { LEAD_TYPE_LABEL_KEY } from "./leadLabels.data";
import { LeadLinkIcons } from "./LeadLinkIcons";
import { adminLeadPath } from "./leadPaths";
import { LeadPersonaThumb } from "./LeadPersonaThumb";
import { LEAD_FOLLOW_UP_DATE_OPTIONS } from "./leadsList.data";
import { LeadStagePill } from "./LeadStagePill";
import styles from "./AdminLeads.module.css";

/**
 * One lead in the list. The whole row is a single link to the lead page,
 * named "Open <name>" and described by everything else it shows: type,
 * stage, location, links, the follow-up (in the warn tone when due), how
 * many notes it holds and the linked persona. Desktop reads it as one line;
 * a narrow list stacks it into a card: name on the left, the stage and the
 * persona stacked on the right, and the details across the full width.
 */
export function AdminLeadRow({ row }: { row: LeadListItemDTO }) {
  const { t, language } = useTranslation();
  const typeId = useId();
  const stageId = useId();
  const detailsId = useId();
  const followUpDate =
    row.followUpOn === null
      ? null
      : formatDate(row.followUpOn, language, LEAD_FOLLOW_UP_DATE_OPTIONS);
  const persona = row.linkedPersona;
  // A closed lead (On board, Not now) can keep an old date that no longer
  // counts as due; it reads muted, as history.
  const isPastFollowUp =
    !row.isFollowUpDue &&
    row.followUpOn !== null &&
    row.followUpOn < lisbonLeadDay();

  return (
    <Link
      to={adminLeadPath(row.id)}
      className={styles.row}
      aria-label={t("admin:leads.action.openLead", { name: row.name })}
      aria-describedby={`${typeId} ${stageId} ${detailsId}`}
    >
      <span className={styles.rowName}>
        <span className={styles.rowTitle}>{row.name}</span>
        <span id={typeId} className={styles.rowType}>
          {t(LEAD_TYPE_LABEL_KEY[row.type])}
        </span>
      </span>
      <div className={styles.rowAside}>
        <span id={stageId} className={styles.rowStage}>
          <LeadStagePill stage={row.stage} />
        </span>
        <div className={styles.rowPersona}>
          {persona !== null ? (
            <LeadPersonaThumb persona={persona} size={32} />
          ) : null}
        </div>
      </div>
      <span id={detailsId} className={styles.rowDetails}>
        {row.location !== null ? (
          <span className={`${styles.rowMeta} ${styles.rowLocation}`}>
            <FiMapPin className={styles.rowMetaIcon} aria-hidden />
            <span className={styles.rowMetaText}>{row.location}</span>
          </span>
        ) : null}
        <span className={styles.rowLinks}>
          <LeadLinkIcons links={row.links} linkCount={row.linkCount} />
        </span>
        {followUpDate !== null ? (
          <span
            className={styles.followUp}
            data-due={row.isFollowUpDue || undefined}
            data-past={isPastFollowUp || undefined}
          >
            {isPastFollowUp ? null : (
              <FiClock className={styles.rowMetaIcon} aria-hidden />
            )}
            <span>
              {row.isFollowUpDue
                ? t("admin:leads.list.followUpDue", { date: followUpDate })
                : t("admin:leads.list.followUpOn", { date: followUpDate })}
            </span>
          </span>
        ) : null}
        <span className={`${styles.rowMeta} ${styles.rowNotes}`}>
          <FiFileText className={styles.rowMetaIcon} aria-hidden />
          <span>
            {t("admin:leads.list.noteCount", { count: row.noteCount })}
          </span>
        </span>
        {persona !== null ? (
          <span className="visuallyHidden">
            {t("admin:leads.list.personaLinked", {
              name: persona.displayName,
            })}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
