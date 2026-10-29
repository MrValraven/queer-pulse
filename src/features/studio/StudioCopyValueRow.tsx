import { FiCheck, FiCopy } from "react-icons/fi";
import { Button } from "../../shared/components/ui/Button";
import { useToast } from "../../shared/components/feedback/useToast";
import { useClipboard } from "../../shared/hooks/useClipboard";
import styles from "./StudioCopyValueRow.module.css";

interface StudioCopyValueRowProps {
  label: string;
  value: string;
  /** The visible button text. */
  copyLabel: string;
  /** The button's accessible name; it contains `copyLabel` (WCAG 2.5.3). */
  copyAriaLabel: string;
  copiedToast: string;
  copyFailedToast: string;
  /** The id of text that describes the value (a hint under the row). */
  describedBy?: string;
}

/** A labelled value (a payment reference, say) with a button that copies it.
 *  When the clipboard refuses, an error toast says so and the value stays on
 *  screen, selectable in one tap. The value never goes into an accessible
 *  name, and nothing records a copy. */
export function StudioCopyValueRow({
  label,
  value,
  copyLabel,
  copyAriaLabel,
  copiedToast,
  copyFailedToast,
  describedBy,
}: StudioCopyValueRowProps) {
  const { showToast } = useToast();
  const { copy, copied } = useClipboard();

  async function copyValue() {
    const didCopy = await copy(value);
    if (didCopy) showToast(copiedToast, "success");
    else showToast(copyFailedToast, "error");
  }

  return (
    <div className={styles.row}>
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value} translate="no">
          {value}
        </span>
      </span>
      <Button
        variant="ghost"
        size="sm"
        className={styles.copyButton}
        data-copied={copied ? "true" : undefined}
        aria-label={copyAriaLabel}
        aria-describedby={describedBy}
        onClick={() => void copyValue()}
      >
        {/* The name and the visible text stay the same in both states: the
         *  success toast (role=status) is the one announcement. Only the
         *  icon and the data-copied tint change. */}
        {copied ? <FiCheck aria-hidden /> : <FiCopy aria-hidden />}
        {copyLabel}
      </Button>
    </div>
  );
}
