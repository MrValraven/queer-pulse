import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  PlatformLogPartyView,
  PlatformLogRowView,
} from "./api/platformLog.adapters";
import { adminTableClasses } from "../ui";
import styles from "./AdminPlatformLogPage.module.css";

function PartyName({
  party,
  onFilterMember,
}: {
  party: PlatformLogPartyView;
  onFilterMember: (party: PlatformLogPartyView) => void;
}) {
  const { t } = useTranslation();
  if (!party.isFilterable || !party.userId) {
    return <b className={styles.party}>{party.label}</b>;
  }
  return (
    <button
      type="button"
      className={styles.partyButton}
      aria-label={t("admin:platformLog.party.filterHint", {
        name: party.label,
      })}
      title={t("admin:platformLog.party.filterHint", { name: party.label })}
      onClick={() => onFilterMember(party)}
    >
      {party.label}
    </button>
  );
}

export function PlatformLogRow({
  row,
  isToday,
  onFilterMember,
}: {
  row: PlatformLogRowView;
  /** Older rows sit under a dated heading, so they show the clock time. */
  isToday: boolean;
  onFilterMember: (party: PlatformLogPartyView) => void;
}) {
  const { t } = useTranslation();
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const noteId = useId();
  const Icon = row.icon;
  const subjectClassName = row.subject?.isFallback
    ? `${styles.subject} ${styles.subjectFallback}`
    : styles.subject;

  return (
    <li className={`${adminTableClasses.row} ${styles.row}`}>
      <span className={`${styles.icon} ${styles[`icon_${row.tone}`]}`}>
        <Icon aria-hidden />
      </span>
      <div className={styles.body}>
        <p className={styles.sentence}>
          <PartyName party={row.actor} onFilterMember={onFilterMember} />{" "}
          {row.verb}
          {row.target ? (
            <>
              {" "}
              <PartyName party={row.target} onFilterMember={onFilterMember} />
            </>
          ) : null}
          {row.subject ? (
            <>
              {/* The spaces sit outside the hidden dot so a screen reader
                  still hears a word break before the subject. */}{" "}
              <span className={styles.separator} aria-hidden>
                ·
              </span>{" "}
              {row.subject.to ? (
                <Link to={row.subject.to} className={subjectClassName}>
                  {row.subject.label}
                </Link>
              ) : (
                <em className={subjectClassName}>{row.subject.label}</em>
              )}
            </>
          ) : null}
        </p>
        <p className={styles.meta}>
          <span>{t(`admin:platformLog.category.${row.category}`)}</span>
          <time dateTime={row.occurredAt} title={row.exactTime}>
            {isToday ? row.relativeTime : row.clockTime}
          </time>
          {row.note ? (
            <button
              type="button"
              className={styles.noteToggle}
              aria-expanded={isNoteOpen}
              aria-controls={noteId}
              onClick={() => setIsNoteOpen((isOpen) => !isOpen)}
            >
              {isNoteOpen
                ? t("admin:platformLog.note.hide")
                : t("admin:platformLog.note.show")}
            </button>
          ) : null}
        </p>
        {row.note ? (
          // The id sits on a wrapper that stays mounted, so the toggle's
          // aria-controls always resolves while the note folds in and out.
          <div id={noteId}>
            <Collapse isOpen={isNoteOpen}>
              <p className={styles.note}>{row.note}</p>
            </Collapse>
          </div>
        ) : null}
      </div>
    </li>
  );
}
