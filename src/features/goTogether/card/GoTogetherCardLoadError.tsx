import { useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PanelHeader } from "./GoTogetherStatePanels";
import styles from "./GoTogetherCard.module.css";

/**
 * The card failed to load for a reason other than Go together being off. It
 * says so inside the card's frame and offers Retry, so a grouped member can
 * get back to their group and a waiting member can find Stop looking.
 * A Retry that fails again is announced in a polite status region, since
 * the panel itself looks the same as before.
 */
export function GoTogetherCardLoadError({
  isRetrying,
  onRetry,
}: {
  isRetrying: boolean;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  // Counted during render when a retry ends. This panel only stays mounted
  // while the card still has no data, so every ended retry here failed.
  const [wasRetrying, setWasRetrying] = useState(isRetrying);
  const [failedRetryCount, setFailedRetryCount] = useState(0);
  if (wasRetrying !== isRetrying) {
    setWasRetrying(isRetrying);
    if (!isRetrying) setFailedRetryCount((previous) => previous + 1);
  }
  return (
    <>
      <PanelHeader
        icon={FiAlertCircle}
        title={t("goTogether:card.loadError.title")}
        body={t("goTogether:card.loadError.body")}
      />
      <div className={styles.actions}>
        {/* Stays enabled while retrying, so focus never drops off it. */}
        <Button
          variant="ghost"
          onClick={() => {
            if (!isRetrying) onRetry();
          }}
          aria-busy={isRetrying || undefined}
        >
          {t(
            isRetrying
              ? "goTogether:card.loadError.retrying"
              : "goTogether:card.loadError.retry",
          )}
        </Button>
      </div>
      <p role="status" className={styles.srOnly}>
        {failedRetryCount > 0 && (
          // A new key per failure re-adds the text, so a second failure is
          // announced too.
          <span key={failedRetryCount}>
            {t("goTogether:card.loadError.retryFailed")}
          </span>
        )}
      </p>
    </>
  );
}
