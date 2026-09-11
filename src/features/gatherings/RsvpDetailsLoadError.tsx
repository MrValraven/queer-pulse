import { FiAlertCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./RsvpDetailsLoadError.module.css";

/**
 * Shown in place of the RSVP details form when the member's saved answers
 * failed to load, on the gathering page and in My Events. The retry holds
 * itself busy while the refetch runs, so a second tap waits for the first.
 */
export function RsvpDetailsLoadError({
  isRetrying,
  onRetry,
}: {
  /** True while the refetch started by the retry is in flight. */
  isRetrying: boolean;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.panel} role="status" aria-busy={isRetrying}>
      <span className={styles.icon} aria-hidden>
        <FiAlertCircle />
      </span>
      <h3 className={styles.title}>
        <Translation
          i18nKey="shared:loadError.title"
          components={{ em: <em /> }}
        />
      </h3>
      <p className={styles.body}>{t("shared:loadError.body")}</p>
      <Button
        variant="primary"
        size="sm"
        // aria-disabled keeps the pressed button focused and in the tab order
        // while the refetch runs; the click guard does the holding.
        onClick={() => {
          if (!isRetrying) onRetry();
        }}
        aria-disabled={isRetrying}
        aria-busy={isRetrying}
      >
        {t("shared:loadError.retryCta")}
      </Button>
    </div>
  );
}
