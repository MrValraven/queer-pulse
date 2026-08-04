import { FiBookmark } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./SaveButton.module.css";

export interface SaveButtonProps {
  saved: boolean;
  onToggle: () => void;
  /** Visible pill label. Omit for an icon-only circular toggle. */
  label?: string;
  size?: "sm" | "md";
}

/**
 * Bookmark/save toggle. A pill with a bookmark icon + label, or an icon-only
 * circle when `label` is omitted. Saved state fills the bookmark and switches to
 * jade. Consolidates the economy save buttons (flatmate/job/housing/landlord).
 * Controlled — the caller owns `saved` and the `onToggle` handler.
 */
export function SaveButton({
  saved,
  onToggle,
  label,
  size = "md",
}: SaveButtonProps) {
  const { t } = useTranslation();
  const stateLabel = t(
    saved ? "shared:saveButton.saved" : "shared:saveButton.save",
  );
  return (
    <button
      type="button"
      className={[
        styles.save,
        styles[size],
        label ? styles.pill : styles.iconOnly,
        saved && styles.on,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-pressed={saved}
      // With a visible label the text names the button; icon-only relies on this.
      aria-label={label ? undefined : stateLabel}
      onClick={onToggle}
    >
      <FiBookmark aria-hidden fill={saved ? "currentColor" : "none"} />
      {label && <span>{label}</span>}
    </button>
  );
}
