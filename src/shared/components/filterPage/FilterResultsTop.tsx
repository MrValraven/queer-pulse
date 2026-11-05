import { useId, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse, Select } from "../ui";
import styles from "./FilterPage.module.css";

interface FilterResultsTopProps {
  /** The results search box, on its own row above the count. Give a
   *  SearchInput `className={filterPageClassNames.search}` so it takes the
   *  row's width up to 480px. Pass nothing while the page has nothing to
   *  search; the row folds away. */
  search?: ReactNode;
  /** The result-count sentence. It is announced politely as a whole each
   *  time it changes, so keep it one short sentence; a `<b><em>` inside it
   *  renders the number large, serif and coral. */
  count: ReactNode;
  /** A `FiltersToggleButton`, or nothing while the sidebar is unavailable;
   *  it fades out and back in as that flips. */
  filtersButton?: ReactNode;
  /** The page's controls after the Filters button: a `FilterSortControl`,
   *  a view toggle, a link or a primary action. */
  controls?: ReactNode;
}

/** The top of the results column: an optional search row, then the count on
 *  the left with the Filters button and the page's controls on the right. A
 *  page renders it first inside `FilterPageLayout`'s results column, above
 *  `AppliedChipsRow`. */
export function FilterResultsTop({
  search,
  count,
  filtersButton,
  controls,
}: FilterResultsTopProps) {
  const { reducedMotion } = useMotionPrefs();
  const hasSearch = search !== undefined && search !== null && search !== false;
  const hasFiltersButton =
    filtersButton !== undefined &&
    filtersButton !== null &&
    filtersButton !== false;
  return (
    <>
      <Collapse isOpen={hasSearch}>
        <div className={styles.searchRow}>{search}</div>
      </Collapse>

      <div className={styles.topRow}>
        {/* The count answers the search as it is typed, so it is announced
            as well as redrawn. Atomic, because the sentence only means
            anything whole. */}
        <div className={styles.count} aria-live="polite" aria-atomic="true">
          {count}
        </div>
        <div className={styles.topControls}>
          <AnimatePresence initial={false}>
            {hasFiltersButton && (
              <m.span
                key="filters"
                className={styles.filtersBtnSlot}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {filtersButton}
              </m.span>
            )}
          </AnimatePresence>
          {controls}
        </div>
      </div>
    </>
  );
}

interface FilterSortOption<Value extends string> {
  value: Value;
  label: ReactNode;
}

interface FilterSortControlProps<Value extends string> {
  /** The visible "Sort" label, which also names the select. */
  label: string;
  value: Value;
  options: readonly FilterSortOption<Value>[];
  onChange: (value: Value) => void;
  /** Below 760px, hides the visible label (it still names the select for
   *  screen readers) and splits the row with the Filters button into two
   *  equal halves, the select's text ellipsised to fit. Off by default, so
   *  every other page keeps its label and its wrapping row. */
  isLabelHiddenOnPhone?: boolean;
}

/** The labelled sort select for `FilterResultsTop`'s `controls`. A page
 *  passes its sort keys as `options` and gets the chosen key back. */
export function FilterSortControl<Value extends string>({
  label,
  value,
  options,
  onChange,
  isLabelHiddenOnPhone = false,
}: FilterSortControlProps<Value>) {
  const labelId = useId();
  return (
    <div
      className={[styles.sort, isLabelHiddenOnPhone && styles.sortHalfOnPhone]
        .filter(Boolean)
        .join(" ")}
    >
      <span id={labelId} className={styles.sortLabel}>
        {label}
      </span>
      <Select
        size="sm"
        labelledBy={labelId}
        options={options}
        value={value}
        onChange={(next) => {
          if (next !== null) onChange(next as Value);
        }}
      />
    </div>
  );
}
