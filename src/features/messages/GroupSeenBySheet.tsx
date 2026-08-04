import { Avatar, Modal } from "../../shared/components/ui";
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
  const { t } = useTranslation();

  return (
    <Modal
      title={t("messages:group.seenByTitle", { count: entries.length })}
      onClose={onClose}
    >
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
    </Modal>
  );
}
