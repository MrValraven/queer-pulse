import { useId, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatDate } from "../../../shared/lib/date";
import type { NowInsights } from "../api/nowInsights.api";
import styles from "./NowHistoryDisclosure.module.css";

export interface NowHistoryDisclosureProps {
  history: NowInsights["history"];
}

/**
 * The "Before this" disclosure inside the Now card: a chevron, the label, and
 * a count in a small round pill, opening onto the statuses that came before.
 *
 * Owner-only (the card only mounts it for the owner), so there is no
 * `isSelf` prop here. Renders nothing when there is no history to look back
 * on: the row simply isn't there for a member on their first status.
 */
export function NowHistoryDisclosure({ history }: NowHistoryDisclosureProps) {
  const { t, language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  if (history.length === 0) return null;

  return (
    <div className={styles.disclosure}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <FiChevronRight
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          aria-hidden
        />
        <span className={styles.label}>
          {t("members:content.now.history.label")}
        </span>
        <span className={styles.count}>
          <span aria-hidden="true">{history.length}</span>
          <span className="visuallyHidden">
            {t("members:content.now.history.count", { count: history.length })}
          </span>
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-label={t("members:content.now.history.label")}
        className={styles.panel}
        hidden={!isOpen}
      >
        <ul className={styles.list}>
          {history.map((entry) => (
            <li
              key={`${entry.startedAt}-${entry.endedAt}`}
              className={styles.entry}
            >
              <p className={styles.entryText}>{entry.text}</p>
              <p className={styles.entryRange}>
                {t("members:content.now.history.ran", {
                  started: formatDate(entry.startedAt, language),
                  ended: formatDate(entry.endedAt, language),
                })}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
