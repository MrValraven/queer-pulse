import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";
import styles from "./BulkActionBar.module.css";

export type BulkActionBarVariant = "floating" | "inline";

export interface BulkActionBarProps {
  /** Number of selected items. The bar renders nothing when this is 0. */
  count: number;
  /** Already-translated "N selected" label (features own their i18n key). */
  label: ReactNode;
  /** Clears the selection — wired to the trailing dismiss control. */
  onClear: () => void;
  /** Translated accessible label for the trailing clear control. */
  clearLabel: string;
  /** Feature-specific action controls (Buttons, a move-to select, …). */
  children: ReactNode;
  /**
   * "floating" (default) is a fixed, bottom-centred plum pill that slides up on
   * appearance; "inline" is an in-flow plum bar that sits within the page.
   */
  variant?: BulkActionBarVariant;
  /** Optional selection cap; when reached, `capNote` is shown. */
  cap?: number;
  /** Translated note rendered once `count >= cap`. */
  capNote?: ReactNode;
  /** Translated ARIA label for the bar's region landmark. */
  ariaLabel?: string;
  /** Extra class hook for feature-specific tweaks. */
  className?: string;
}

/**
 * Shared floating/inline multi-select action bar, extracted from the divergent
 * `BulkBar` copies in `myevents` (a floating pill) and `admin/roadmap` (an
 * in-flow bar). It owns the plum chrome, the polite-live count, an optional cap
 * note and the trailing clear control; each feature supplies its own action
 * controls as `children` (rendered on the shared plum surface, so `<Button
 * variant="ghost-dark">` is the natural fit). Renders nothing while empty.
 */
export function BulkActionBar({
  count,
  label,
  onClear,
  clearLabel,
  children,
  variant = "floating",
  cap,
  capNote,
  ariaLabel,
  className,
}: BulkActionBarProps) {
  if (count === 0) return null;

  return (
    <div
      className={[
        styles.bar,
        variant === "floating" ? styles.floating : styles.inline,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="region"
      aria-label={ariaLabel}
    >
      <span className={styles.count} role="status">
        {label}
      </span>
      {cap !== undefined && count >= cap && capNote && (
        <span className={styles.capNote}>{capNote}</span>
      )}
      <div className={styles.actions}>{children}</div>
      <button
        type="button"
        className={styles.clear}
        aria-label={clearLabel}
        onClick={onClear}
      >
        {/* An icon, never a bare glyph: the multiplication sign was this
            button's only content and was NOT aria-hidden, so screen readers
            read "multiplication sign" alongside the button's own label. */}
        <FiX aria-hidden />
      </button>
    </div>
  );
}
