import { useState, type ReactNode } from "react";
import { FiList, FiMap, FiSliders } from "react-icons/fi";
import {
  Button,
  ModalSheet,
  SegmentedControl,
} from "../../shared/components/ui";
import { useMediaQuery } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  LocalFilterFields,
  type LocalFilterFieldsProps,
} from "./LocalFilterFields";
import s from "./LocalFilterBar.module.css";

/**
 * Shared filter bar for the Local page (both list + map views). On desktop it's
 * an inline bar that scrolls away with the page: one row of search, "use my
 * location", a "Refine" toggle and the List/Map switcher, with every filter
 * group (place type, sort, safe spaces, access, vibe) in the drawer below. On
 * phones that row collapses behind a single "Filters" sheet, and the List/Map
 * switcher rides in a compact sticky bar so it stays reachable while scrolled.
 */
export function LocalFilterBar({
  view,
  onViewChange,
  activeFilterCount,
  resultCount,
  activeFiltersSlot,
  ...fields
}: LocalFilterFieldsProps & {
  /** Current List/Map view — the switcher rides in the mobile sticky bar. */
  view: string;
  onViewChange: (next: string) => void;
  /** Total active filters, surfaced on the collapsed "Filters" control. */
  activeFilterCount: number;
  /** How many places the current filters surface — shown on the sheet's close CTA. */
  resultCount: number;
  /** The active-filter chips, shown under the search row so what is currently
   *  narrowing the list reads at a glance with the drawer shut. Desktop only:
   *  the mobile bar is a compact sticky toolbar with no room for a wrapping
   *  chip row, so there they sit in the results header instead. */
  activeFiltersSlot?: ReactNode;
}) {
  const { t } = useTranslation();
  // On phones the full filter set lives in a bottom sheet so the sticky bar
  // stays a compact one-row toolbar instead of eating 200–260px of viewport.
  const isMobile = useMediaQuery(mediaMax("mobile"));
  const [sheetOpen, setSheetOpen] = useState(false);

  const viewSwitcher = (
    <SegmentedControl
      label={t("marketing:local.view.toggleAria")}
      options={[
        {
          value: "list",
          label: t("marketing:local.view.list"),
          icon: <FiList />,
        },
        {
          value: "map",
          label: t("marketing:local.view.map"),
          icon: <FiMap />,
        },
      ]}
      value={view}
      onChange={onViewChange}
    />
  );

  if (isMobile) {
    return (
      <>
        <div className={s.mobileBar}>
          <div className="wrap">
            <div className={s.mobileBarRow}>
              <button
                type="button"
                className={s.filtersButton}
                aria-haspopup="dialog"
                aria-expanded={sheetOpen}
                onClick={() => setSheetOpen(true)}
              >
                <FiSliders aria-hidden />
                {t("marketing:local.filter.filters")}
                {activeFilterCount > 0 && (
                  <span className={s.filtersCount} aria-hidden>
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {viewSwitcher}
            </div>
          </div>
        </div>
        {sheetOpen && (
          <ModalSheet
            onClose={() => setSheetOpen(false)}
            ariaLabel={t("marketing:local.filter.filters")}
          >
            <div className={s.sheetHead}>
              <h2 className={s.sheetTitle}>
                {t("marketing:local.filter.filters")}
              </h2>
            </div>
            <LocalFilterFields {...fields} variant="sheet" />
            <div className={s.sheetActions}>
              <Button variant="primary" onClick={() => setSheetOpen(false)}>
                {t("marketing:local.filter.showResults", {
                  count: resultCount,
                })}
              </Button>
            </div>
          </ModalSheet>
        )}
      </>
    );
  }

  return (
    <div className={s.bar}>
      <div className="wrap">
        <LocalFilterFields {...fields} viewSlot={viewSwitcher} />
        {activeFiltersSlot}
      </div>
    </div>
  );
}
