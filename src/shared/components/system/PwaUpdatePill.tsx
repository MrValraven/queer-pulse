import { Button } from "../ui";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./PwaUpdatePill.module.css";

interface PwaUpdatePillProps {
  /** Apply the waiting worker and reload onto the new build. */
  onReload: () => void;
  /** Dismiss the pill until the next time a new build is detected. */
  onDismiss: () => void;
  /** True once Reload was tapped — swaps the label to "Updating…". */
  updating: boolean;
}

/**
 * Persistent "a new version is ready" prompt. Unlike a toast, it does not
 * time out — a service-worker update asks for a decision, so the pill stays put
 * until the user either reloads or dismisses it. Rendered by PwaUpdatePrompt,
 * which owns the registration and `needRefresh` state. Deliberately its own
 * small component so it never touches the shared Toast.
 */
export function PwaUpdatePill({
  onReload,
  onDismiss,
  updating,
}: PwaUpdatePillProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.pill} role="status" aria-live="polite">
      <span className={styles.label}>
        {updating ? t("nav:updating") : t("nav:updateAvailable")}
      </span>
      <div className={styles.actions}>
        <Button variant="ghost-dark" onClick={onReload} disabled={updating}>
          {t("nav:updateReload")}
        </Button>
        <button
          type="button"
          className={styles.dismiss}
          onClick={onDismiss}
          aria-label={t("nav:updateDismiss")}
          disabled={updating}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
