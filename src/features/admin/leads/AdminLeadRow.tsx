import { useId } from "react";
import { FiCheck, FiFileText, FiMapPin } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminAvatar } from "../ui";
import type { LeadListItemDTO } from "./api/leads.types";
import { LEAD_TYPE_AVATAR_TONE, LEAD_TYPE_LABEL_KEY } from "./leadLabels.data";
import { lisbonLeadDay } from "./leadDates";
import { LeadLinkIcons } from "./LeadLinkIcons";
import {
  adminLeadPath,
  LEADS_LIST_SEARCH_STATE_KEY,
  type LeadPageLocationState,
} from "./leadPaths";
import { LeadPersonaThumb } from "./LeadPersonaThumb";
import { LeadRowFollowUpMenu, LeadRowStageMenu } from "./LeadRowControls";
import { leadActivityText } from "./leadRowDates";
import styles from "./AdminLeads.module.css";

/** Up to two initials from the words of a lead's name that start with a
 *  letter: "Coletivo Maré" reads "CM", "Cave 23" reads "C". */
function initialsOf(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .map((word) => Array.from(word)[0] ?? "")
    .filter((first) => /\p{L}/u.test(first))
    .slice(0, 2)
    .join("");
  return letters === "" ? "#" : letters.toLocaleUpperCase();
}

/** The persona's picture when one is linked (with a jade check), else the
 *  lead's initials on a tint that follows its type. Decorative. */
function LeadRowAvatar({ row }: { row: LeadListItemDTO }) {
  const persona = row.linkedPersona;
  return (
    <span className={styles.rowAvatar} aria-hidden>
      {persona !== null ? (
        <>
          <LeadPersonaThumb persona={persona} size={40} />
          <span className={styles.rowAvatarBadge}>
            <FiCheck />
          </span>
        </>
      ) : (
        <AdminAvatar
          initials={initialsOf(row.name)}
          tone={LEAD_TYPE_AVATAR_TONE[row.type]}
        />
      )}
    </span>
  );
}

/** When the lead last moved ("3 days ago"), with its note count as a quiet
 *  icon and number after it. The eye reads the short form; assistive tech
 *  reads "Last activity 3 days ago, 2 notes". */
function LeadRowActivity({ row }: { row: LeadListItemDTO }) {
  const { t, language } = useTranslation();
  const formatters = useFormat();
  const activity = leadActivityText(
    row.lastEntryAt,
    lisbonLeadDay(),
    language,
    formatters,
  );
  return (
    <span className={styles.rowActivity}>
      <span className={styles.rowActivityTime} aria-hidden>
        {activity}
      </span>
      {row.noteCount > 0 ? (
        <span className={styles.rowNoteCount} aria-hidden>
          <FiFileText className={styles.rowMetaIcon} />
          {row.noteCount}
        </span>
      ) : null}
      <span className="visuallyHidden">
        {t("admin:leads.list.lastActivity", { time: activity })}
        {row.noteCount > 0
          ? `, ${t("admin:leads.list.noteCount", { count: row.noteCount })}`
          : null}
      </span>
    </span>
  );
}

/**
 * One lead in the list. The name is the link to the lead page, and its hit
 * area stretches over the whole row; the stage and the follow-up sit above
 * it as their own menus, so a lead moves on without opening it. The link is
 * named "Open <name>" and described by the rest of the row. A wide list
 * reads each row as one line of a table; a narrow one stacks it into a
 * card: name and type beside the stage, then the follow-up beside the last
 * activity, then the location beside the links.
 */
export function AdminLeadRow({ row }: { row: LeadListItemDTO }) {
  const { t } = useTranslation();
  const location = useLocation();
  const typeId = useId();
  const detailsId = useId();
  const persona = row.linkedPersona;
  const leadPageState: LeadPageLocationState = {
    [LEADS_LIST_SEARCH_STATE_KEY]: location.search,
  };

  return (
    <div className={styles.row}>
      <span className={styles.rowName}>
        <LeadRowAvatar row={row} />
        <span className={styles.rowNameText}>
          <Link
            to={adminLeadPath(row.id)}
            state={leadPageState}
            className={styles.rowLink}
            aria-label={t("admin:leads.action.openLead", { name: row.name })}
            aria-describedby={`${typeId} ${detailsId}`}
          >
            {row.name}
          </Link>
          <span id={typeId} className={styles.rowType}>
            {t(LEAD_TYPE_LABEL_KEY[row.type])}
          </span>
        </span>
      </span>
      <span className={styles.rowStage}>
        <LeadRowStageMenu row={row} />
      </span>
      <span className={styles.rowDetails}>
        <span id={detailsId} className={styles.rowDetailsText}>
          {row.location !== null ? (
            <span className={`${styles.rowMeta} ${styles.rowLocation}`}>
              <FiMapPin className={styles.rowMetaIcon} aria-hidden />
              <span className={styles.rowMetaText}>{row.location}</span>
            </span>
          ) : (
            <span className={styles.rowLocation} aria-hidden />
          )}
          <span className={styles.rowLinks}>
            <LeadLinkIcons links={row.links} linkCount={row.linkCount} />
          </span>
          <LeadRowActivity row={row} />
          {persona !== null ? (
            <span className="visuallyHidden">
              {t("admin:leads.list.personaLinked", {
                name: persona.displayName,
              })}
            </span>
          ) : null}
        </span>
        <span className={styles.rowFollowUp}>
          <LeadRowFollowUpMenu row={row} />
        </span>
      </span>
    </div>
  );
}
