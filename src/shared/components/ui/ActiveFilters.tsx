import type { ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./ActiveFilters.module.css";

/** One narrowing currently in force, as its own removable chip. */
export interface ActiveFilter {
  /** Stable react key. */
  key: string;
  /** Chip label (a category, a tag name, a quoted search term). */
  label: ReactNode;
  /** Remove just this one. */
  onRemove: () => void;
}

/**
 * What is currently narrowing a list, as removable chips plus a Clear all.
 *
 * This is the answer to "what is on right now?" when the filters live behind a
 * `RefineToggle`, which is most of the time: the drawer holds the controls,
 * this row holds their state, and it stays on screen whether the drawer is open
 * or closed. Give it EVERY narrowing, the search term included, so nothing
 * shaping the results can be invisible.
 *
 * `trailing` rides at the end of the row, before "Clear all". It exists for
 * the result count on pages that have no separate results line: once the count
 * only differs from the total while something is narrowing, this row is the
 * only place it needs to appear.
 */
export function ActiveFilters({
  filters,
  onClearFilters,
  trailing,
  className,
}: {
  filters: ActiveFilter[];
  onClearFilters: () => void;
  trailing?: ReactNode;
  className?: string;
}) {
  const { t } = useTranslation();
  if (filters.length === 0) return null;

  return (
    <div className={[styles.row, className].filter(Boolean).join(" ")}>
      <span className={styles.label}>{t("shared:filters.activeLabel")}</span>
      {filters.map((filter) => (
        <button
          key={filter.key}
          type="button"
          className={styles.chip}
          onClick={filter.onRemove}
        >
          {filter.label}
          <FiX aria-hidden />
          <span className={styles.srOnly}>{t("shared:filters.remove")}</span>
        </button>
      ))}
      {trailing != null && <span className={styles.trailing}>{trailing}</span>}
      <button
        type="button"
        className={styles.clearAll}
        onClick={onClearFilters}
      >
        {t("shared:filters.clearAll")}
      </button>
    </div>
  );
}
