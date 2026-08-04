import { useEffect } from "react";
import { FiX } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { activeLocale } from "../../shared/i18n/locale";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SeenByEntry } from "./groupReceipts";
import styles from "./NewMessageModal.module.css";

/** "9:14 PM" for the read time on a row (locale-aware). Empty when absent (demo). */
function readTime(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(activeLocale(), { hour: "numeric", minute: "2-digit" });
}

interface GroupSeenBySheetProps {
  entries: SeenByEntry[];
  onClose: () => void;
}

/**
 * "Seen by" sheet for a group message — the members whose read watermark has
 * caught the caller's latest message, each with a read time. Opened by tapping
 * the "Seen by N" receipt under an own group message. Read-only.
 */
export function GroupSeenBySheet({ entries, onClose }: GroupSeenBySheetProps) {
  useScrollLock();
  const { t } = useTranslation();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="seen-by-title"
      >
        <div className={styles.head}>
          <h2 id="seen-by-title" className={styles.title}>
            {t("messages:group.seenByTitle", { count: entries.length })}
          </h2>
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t("messages:newMessage.close")}
          >
            <FiX />
          </button>
        </div>
        <ul className={styles.list}>
          {entries.map((entry) => (
            <li key={entry.id ?? entry.name} className={styles.row}>
              <Avatar
                initials={entry.initials}
                tint={entry.tint}
                src={entry.avatarUrl}
                size={40}
              />
              <div className={styles.rowBody}>
                <span className={styles.rowName}>{entry.name}</span>
              </div>
              {readTime(entry.at) && (
                <span className={styles.roleBadge}>{readTime(entry.at)}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
