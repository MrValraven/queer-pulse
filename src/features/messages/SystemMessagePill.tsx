import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ChatSystemEvent } from "./data";
import { systemMessageText } from "./systemMessageText";
import styles from "./MessagesPage.module.css";

/** A centred event pill for a `kind: "system"` message ("You created the group",
 *  "Ana added Bea", "Cy left"). Bilingual; the pill text is plain content in the
 *  log. It carries no live-region role: history rows remount as the virtualized
 *  log scrolls, so a role here would re-read every pill on each pass. A live
 *  event is announced once by `MessageArea`'s scoped announcer instead (see
 *  `useNewIncomingAnnouncement`), using this same text builder. */
export function SystemMessagePill({ event }: { event: ChatSystemEvent }) {
  const { t } = useTranslation();
  const text = systemMessageText(event, t);
  return (
    <div className={styles.systemRow}>
      <span className={styles.systemPill}>{text}</span>
    </div>
  );
}
