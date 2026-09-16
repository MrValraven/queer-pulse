import { FiAlertCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./MessagesPage.module.css";

/**
 * DES-183: a compact inline strip above STALE (already-cached) inbox rows
 * when a refresh fails, as opposed to the full `LoadErrorState` panel, which
 * only renders when there is nothing cached to fall back to (see
 * `MessagesThreadListBody`). A member with a full inbox never sees "No
 * conversations yet" on a refetch failure; they see their rows, plus this
 * line, plus a way to retry.
 */
export function InboxLoadErrorStrip({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div
      className={styles.inboxLoadErrorStrip}
      role="status"
      aria-live="polite"
    >
      <FiAlertCircle aria-hidden="true" className={styles.inboxLoadErrorIcon} />
      <span className={styles.inboxLoadErrorText}>
        {t("messages:thread.loadErrorInline")}
      </span>
      <Button variant="ghost" size="sm" onClick={onRetry}>
        {t("shared:loadError.retryCta")}
      </Button>
    </div>
  );
}
