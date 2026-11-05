import { useRef, type ReactNode } from "react";
import { Collapse } from "../ui";
import { RollingNumber } from "../ui/RollingNumber";
import { useFormat } from "../../i18n/format";
import { Translation } from "../../i18n/Translation";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./FilterPage.module.css";

interface FilterSidebarPanelProps {
  /** Rendered inside `FiltersSheet`: drops the sticky desktop sizing so the
   *  sections flow in the sheet's own scroll. */
  isInSheet?: boolean;
  /** How many filters are applied. Above zero, a closing "Clear all filters"
   *  row folds in under the sections with this tally. */
  appliedCount: number;
  onClearAll: () => void;
  /** An accessible name for the panel's `aside` landmark, for a page with
   *  more than one complementary region. */
  ariaLabel?: string;
  /** The page's `FilterSection`s, in render order. */
  children: ReactNode;
}

/** The filters panel: one paper surface whose `FilterSection`s read as
 *  divided rows, closed by the clear-all row. A page passes the same panel as
 *  `FilterPageLayout`'s `sidebar` and, with `isInSheet`, as the body of
 *  `FiltersSheet`. */
export function FilterSidebarPanel({
  isInSheet = false,
  appliedCount,
  onClearAll,
  ariaLabel,
  children,
}: FilterSidebarPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  // Nothing selected means nothing to clear, so the row would offer a no-op
  // beside a "0 applied" that reads as a count of something.
  const hasSomethingToClear = appliedCount > 0;
  // The clear-all row folds away (and goes inert) once the filters are
  // cleared, which would drop focus to the page body. Focus moves up to the
  // panel's first section header, or its first enabled control when a page
  // builds its sections by hand.
  const handleClearAll = () => {
    onClearAll();
    focusFirstPanelControl(panelRef.current);
  };
  return (
    <aside
      ref={panelRef}
      className={isInSheet ? styles.filtersSheet : styles.filters}
      aria-label={ariaLabel}
    >
      {children}
      <Collapse isOpen={hasSomethingToClear}>
        <ClearAllRow appliedCount={appliedCount} onClearAll={handleClearAll} />
      </Collapse>
    </aside>
  );
}

/** Focuses the first `FilterSection` header in `panel`, falling back to the
 *  first enabled button or input that sits outside the clear-all row. */
function focusFirstPanelControl(panel: HTMLElement | null) {
  if (!panel) return;
  const sectionHeader = panel.querySelector<HTMLElement>(
    "[data-filter-section-header]",
  );
  if (sectionHeader) {
    sectionHeader.focus();
    return;
  }
  const clearRow = panel.querySelector(`.${styles.clearRow}`);
  const firstControl = Array.from(
    panel.querySelectorAll<HTMLElement>(
      "button:not([disabled]), input:not([disabled])",
    ),
  ).find((control) => !clearRow?.contains(control));
  firstControl?.focus();
}

/** The panel's closing row: "Clear all filters" beside the applied-filter
 *  tally, whose number rolls as filters are ticked and unticked. */
function ClearAllRow({
  appliedCount,
  onClearAll,
}: {
  appliedCount: number;
  onClearAll: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.clearRow}>
      <button type="button" onClick={onClearAll}>
        {t("shared:filterPage.clearAllCta")}
      </button>
      <span>
        <Translation
          i18nKey="shared:filterPage.appliedCount"
          values={{ count: appliedCount }}
          slots={{
            count: (
              <RollingNumber
                value={fmt.number(appliedCount)}
                numericValue={appliedCount}
              />
            ),
          }}
        />
      </span>
    </div>
  );
}
