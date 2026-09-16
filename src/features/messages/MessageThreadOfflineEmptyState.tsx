import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MessagesPage.module.css";

/**
 * PRD-375, gap 6: shown in place of the (empty) message log when the offline
 * stand-in session opens a thread the device never saved. There is nothing
 * to read and no network to fetch it with, so page 0 would otherwise stay
 * pending forever behind a blank pane. Styled as the same centred
 * system-event pill the log already uses for "You created the group" etc.
 * (`SystemMessagePill.tsx`), so it reads as familiar chat chrome, staying
 * small on purpose. Carries its own `role="status"`: the log around it sets
 * `aria-live="off"` so ordinary history stays silent, which would otherwise
 * swallow this announcement too.
 */
export function MessageThreadOfflineEmptyState() {
  const { t } = useTranslation();
  return (
    <div className={styles.systemRow} role="status">
      <span className={styles.systemPill}>
        {t("messages:thread.offlineUnsaved")}
      </span>
    </div>
  );
}
