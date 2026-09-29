import { FiLock, FiMessageCircle, FiWifiOff } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ActiveThreadStatus } from "./activeThreadResolution";
import styles from "./MessagesPage.module.css";

interface MessagesEmptyPanelProps {
  /** Why no conversation is showing (ENG-403): nothing requested yet, a
   *  requested thread still loading by id, one the member cannot read, or
   *  one whose read failed for a transient reason. */
  status?: ActiveThreadStatus;
  /** Mobile only: returns to the conversation list. */
  onBack?: () => void;
  /** Re-runs the failed by-id read (the `failed` status). */
  onRetry?: () => void;
}

/** Thread-pane state when no conversation is open: the idle welcome, a
 *  requested thread still loading, a requested thread that is unavailable,
 *  or one whose read failed and can be retried. The composer never renders
 *  here, so nothing typed can reach another conversation while the requested
 *  one resolves. */
export function MessagesEmptyPanel({
  status = "none",
  onBack,
  onRetry,
}: MessagesEmptyPanelProps) {
  const { t } = useTranslation();
  const backAction = onBack
    ? { label: t("messages:conversation.backToList"), onClick: onBack }
    : undefined;
  if (status === "loading") {
    return (
      <div className={styles.emptyPanel} aria-busy="true">
        <EmptyState
          icon={<FiMessageCircle />}
          title={t("messages:conversation.openingTitle")}
          secondaryAction={backAction}
        />
      </div>
    );
  }
  if (status === "failed") {
    // A transient failure (a 5xx, a timeout, no connection): the thread may
    // well exist, so the copy speaks to the connection and offers a retry.
    return (
      <div className={styles.emptyPanel}>
        <EmptyState
          icon={<FiWifiOff />}
          title={t("messages:conversation.loadFailedTitle")}
          description={t("messages:conversation.loadFailedBody")}
          action={
            onRetry
              ? { label: t("shared:loadError.retryCta"), onClick: onRetry }
              : undefined
          }
          secondaryAction={backAction}
        />
      </div>
    );
  }
  if (status === "unavailable") {
    return (
      <div className={styles.emptyPanel}>
        <EmptyState
          icon={<FiLock />}
          title={t("messages:conversation.unavailableTitle")}
          description={t("messages:conversation.unavailableBody")}
          action={backAction}
        />
      </div>
    );
  }
  return (
    <div className={styles.emptyPanel}>
      <EmptyState
        icon={<FiMessageCircle />}
        title={t("messages:conversation.emptyPanelTitle")}
        description={t("messages:conversation.emptyPanelBody")}
      />
    </div>
  );
}
