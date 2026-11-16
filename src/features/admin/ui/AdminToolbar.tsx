import type { ReactNode } from "react";
import styles from "./AdminToolbar.module.css";

/**
 * Class names that give the shared controls the toolbar height. A page passes
 * each one as the `className` of the shared control: `search` on `SearchInput`,
 * `chips` on `FilterChips` or `ChipSelect`, `select` on `Select`.
 */
export const adminToolbarClasses = {
  search: styles.search,
  chips: styles.chips,
  select: styles.select,
};

interface AdminToolbarProps {
  /** The controls: search field, chips, selects, buttons. */
  children: ReactNode;
  /** Right-aligned actions. */
  end?: ReactNode;
  /** Result count shown after the controls. */
  count?: ReactNode;
  /** Accessible name for the group of controls. */
  label: string;
  className?: string;
}

/**
 * Layout for a page's filter bar. Wraps on narrow screens, pushes `end` to the
 * right and shows a quiet result count. It holds no state; the page owns the
 * search, chip and select values.
 */
export function AdminToolbar({
  children,
  end,
  count,
  label,
  className,
}: AdminToolbarProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={[styles.toolbar, className].filter(Boolean).join(" ")}
    >
      {children}
      {count !== undefined && count !== null && (
        <span className={styles.count} aria-live="polite">
          {count}
        </span>
      )}
      {end && <div className={styles.end}>{end}</div>}
    </div>
  );
}
