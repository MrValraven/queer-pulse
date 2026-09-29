import { FiX } from "react-icons/fi";
import { Button, IconButton } from "../ui";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./PwaUpdateCard.module.css";

interface PwaUpdateCardProps {
  /** Apply the waiting worker and reload onto the new build. */
  onReload: () => void;
  /** Apply the waiting worker and reload onto the Changelog. */
  onShowChanges: () => void;
  /** Dismiss the card until the next time a new build is detected. */
  onDismiss: () => void;
  /** True once Reload was tapped: swaps the label to "Updating…". */
  updating: boolean;
}

/**
 * Persistent "a new version is ready" card, pinned to the bottom-right corner.
 * Unlike a toast, it does not time out: a service-worker update asks for a
 * decision, so the card stays put until the user reloads or dismisses it.
 * Rendered by PwaUpdatePrompt, which owns the registration and `needRefresh`
 * state. Deliberately its own small component so it never touches the shared
 * Toast.
 *
 * The body copy stays generic on purpose: this bundle is the OLD build, so it
 * cannot know what the new one ships. "What changed" reloads onto the
 * Changelog, where the new build describes itself.
 */
export function PwaUpdateCard({
  onReload,
  onShowChanges,
  onDismiss,
  updating,
}: PwaUpdateCardProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.card} role="status" aria-live="polite">
      <div className={styles.header}>
        <span className={styles.eyebrow}>
          <span className={styles.dot} aria-hidden />
          {t("nav:updateEyebrow")}
        </span>
        <IconButton
          size="sm"
          className={styles.close}
          aria-label={t("nav:updateDismiss")}
          onClick={onDismiss}
          disabled={updating}
        >
          <FiX aria-hidden />
        </IconButton>
      </div>

      <p className={styles.headline}>
        {t("nav:updateHeadline")}{" "}
        <em className={styles.accent}>{t("nav:updateHeadlineAccent")}</em>
      </p>
      <p className={styles.body}>
        {t("nav:updateBody")}{" "}
        <button
          type="button"
          className={styles.link}
          onClick={onShowChanges}
          disabled={updating}
        >
          {t("nav:updateWhatChanged")}
        </button>
      </p>

      <div className={styles.actions}>
        <Button
          variant="primary"
          className={styles.reload}
          onClick={onReload}
          disabled={updating}
        >
          {updating ? t("nav:updating") : t("nav:updateReload")}
        </Button>
        <button
          type="button"
          className={styles.later}
          onClick={onDismiss}
          disabled={updating}
        >
          {t("nav:updateLater")}
        </button>
      </div>
    </div>
  );
}
