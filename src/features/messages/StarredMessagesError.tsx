// src/features/messages/StarredMessagesError.tsx
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./StarredMessagesModal.module.css";

/**
 * PRD-374: the "Starred messages" list's error state: a failed initial load
 * or a failed narrowed (`q`/`type`) refetch, either way retryable. Mirrors
 * `ConversationMediaError`'s shape (status text + a ghost retry button), kept
 * as its own small file since `ConversationMediaError` stays scoped to the
 * media gallery feature.
 */
export function StarredMessagesError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.errorState}>
      <p className={styles.statusText} role="alert">
        {t("messages:starred.loadError")}
      </p>
      <Button variant="ghost" size="sm" onClick={onRetry}>
        {t("common:error.retry")}
      </Button>
    </div>
  );
}
