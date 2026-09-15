import { FiEye, FiEyeOff } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { contentWarningLabels } from "./forumWarnings.helpers";

/**
 * The two pieces every warned post wears, wherever it is drawn.
 *
 * They live in one file, take their own class names from the caller, and read
 * the same labels the composer's preview reads, so the pill a member sees while
 * writing is the pill the forum publishes. A second look here would make the
 * preview a lie.
 */

/** The "Warning · medical detail, police" chip on a row or an opening post. */
export function ContentWarningPill({
  warnings,
  className,
}: {
  warnings: readonly string[] | undefined;
  className?: string;
}) {
  const { t } = useTranslation();
  const labels = contentWarningLabels(warnings, t);
  if (!labels.length) return null;
  return (
    <span className={className}>
      <FiEye aria-hidden="true" />
      {/* The composer's own key, so the two surfaces cannot drift apart. */}
      {t("forum:composePage.preview.contentWarningPill", {
        warnings: labels.join(", "),
      })}
    </span>
  );
}

/**
 * The control that uncovers warned content.
 *
 * A REAL button: focusable, pressable with Enter and Space, and announced with
 * `aria-expanded` against the passage it governs. Its label names what is
 * behind it, because "show anyway" asks somebody to consent to something
 * nobody told them about.
 */
export function ContentWarningReveal({
  warnings,
  isRevealed,
  onToggle,
  controlsId,
  className,
}: {
  warnings: readonly string[] | undefined;
  isRevealed: boolean;
  onToggle: () => void;
  /** Id of the element this covers and uncovers. */
  controlsId: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const labels = contentWarningLabels(warnings, t);
  if (!labels.length) return null;
  return (
    <button
      type="button"
      className={className}
      aria-expanded={isRevealed}
      aria-controls={controlsId}
      onClick={onToggle}
    >
      {isRevealed ? (
        <FiEyeOff aria-hidden="true" />
      ) : (
        <FiEye aria-hidden="true" />
      )}
      {isRevealed
        ? t("forum:composePage.preview.hideAgain")
        : t("forum:contentWarning.reveal", { warnings: labels.join(", ") })}
    </button>
  );
}
