import type { ReactNode } from "react";
import styles from "./AdminTable.module.css";

/**
 * Class names for tables built from divs and for row lists, so they share the
 * header, row, cell, number and selected styling of `AdminTable`.
 */
export const adminTableClasses = {
  headRow: styles.headRow,
  row: styles.row,
  cell: styles.cell,
  numeric: styles.numeric,
  isSelected: styles.isSelected,
};

interface AdminTableProps {
  /** The `thead` and `tbody`. */
  children: ReactNode;
  /** Accessible name for the scroll region. */
  label: string;
  density?: "comfortable" | "compact";
  /** Keeps the header row visible while the wrapper scrolls vertically. */
  isStickyHeader?: boolean;
  /** Drops the wrapper's own border, corner and shadow, for a table placed
   *  inside an `AdminPanel` with flush padding. */
  isBare?: boolean;
  caption?: ReactNode;
}

/**
 * Native table inside a horizontal scroller. The wrapper scrolls sideways and
 * is focusable, so a keyboard user can reach columns that do not fit; the page
 * itself never scrolls sideways. Mark a selected row with `aria-selected="true"`
 * and a number column with the `numeric` class from `adminTableClasses`.
 */
export function AdminTable({
  children,
  label,
  density = "comfortable",
  isStickyHeader = false,
  isBare = false,
  caption,
}: AdminTableProps) {
  const wrapClassName = [
    styles.wrap,
    density === "compact" && styles.compact,
    isStickyHeader && styles.sticky,
    isBare && styles.bare,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div
      className={wrapClassName}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the table scrolls horizontally, so the wrapper is deliberately focusable: without it a keyboard-only user cannot scroll to the columns that do not fit. Same justification as FeatureUsageTable.tsx.
      tabIndex={0}
      role="region"
      aria-label={label}
    >
      <table className={styles.table} aria-label={label}>
        {caption && <caption className={styles.caption}>{caption}</caption>}
        {children}
      </table>
    </div>
  );
}
