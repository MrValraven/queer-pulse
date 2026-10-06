import { FiX } from "react-icons/fi";
import { Button, IconButton } from "../ui";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./PwaUpdateCard.module.css";

/**
 * Where a tapped Reload stands. "activating" waits for the new worker to take
 * over, which can honestly take several seconds; "reloading" is the moment the
 * page reloads onto it.
 */
export type UpdatePhase = "idle" | "activating" | "reloading";

interface PwaUpdateCardProps {
  /** Apply the waiting worker and reload onto the new build. */
  onReload: () => void;
  /** Apply the waiting worker and reload onto the Changelog. */
  onShowChanges: () => void;
  /** Dismiss the card until the next time a new build is detected. */
  onDismiss: () => void;
  /**
   * Anything past "idle" means Reload was tapped: the label reads
   * "Updating…", the other controls lock, and the divider above the buttons
   * fills as a progress line.
   */
  phase: UpdatePhase;
  /**
   * The waiting build's version (e.g. "v1.43.0"), once /version.json has
   * answered with a well-formed one. Named in the headline accent when set.
   */
  nextVersion?: string;
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
 * Changelog, where the new build describes itself. The headline accent does
 * name the new build's version, read from /version.json by
 * useNextBuildVersion, and falls back to the generic accent until (or unless)
 * that answer arrives.
 */
export function PwaUpdateCard({
  onReload,
  onShowChanges,
  onDismiss,
  phase,
  nextVersion,
}: PwaUpdateCardProps) {
  const { t } = useTranslation();
  const isUpdating = phase !== "idle";

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
          disabled={isUpdating}
        >
          <FiX aria-hidden />
        </IconButton>
      </div>

      <p className={styles.headline}>
        {t("nav:updateHeadline")}{" "}
        <em className={styles.accent}>
          {nextVersion
            ? t("nav:updateHeadlineAccentVersion", { version: nextVersion })
            : t("nav:updateHeadlineAccent")}
        </em>
      </p>
      <p className={styles.body}>
        {t("nav:updateBody")}{" "}
        <button
          type="button"
          className={styles.link}
          onClick={onShowChanges}
          disabled={isUpdating}
        >
          {t("nav:updateWhatChanged")}
        </button>
      </p>

      <div className={styles.actions}>
        {/* The divider above the buttons doubles as the progress line. It is
            decoration only: the button label and this card's live region
            already announce the update. */}
        <span className={styles.progress} data-phase={phase} aria-hidden />
        <Button
          variant="primary"
          className={styles.reload}
          onClick={onReload}
          disabled={isUpdating}
        >
          {isUpdating ? t("nav:updating") : t("nav:updateReload")}
        </Button>
        <button
          type="button"
          className={styles.later}
          onClick={onDismiss}
          disabled={isUpdating}
        >
          {t("nav:updateLater")}
        </button>
      </div>
    </div>
  );
}
