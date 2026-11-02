import { useState } from "react";
import { FiSliders } from "react-icons/fi";
import { Button, ModalSheet } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DirectoryViewSwitcher } from "./DirectoryViewSwitcher";
import {
  LocalFilterFields,
  type LocalFilterFieldsProps,
} from "./LocalFilterFields";
import s from "./LocalFilterBar.module.css";

/**
 * The Local page's phone toolbar. The full filter set lives behind a single
 * "Filters" control that opens it in a bottom sheet, and the List/Map/Online
 * switcher rides beside it in a compact sticky bar, so it stays reachable
 * while scrolled. On desktop the filters sit in the sidebar beside the
 * results instead (see `DirectoryDesktopLayout`).
 */
export function LocalFilterBar({
  view,
  onViewChange,
  activeFilterCount,
  resultCount,
  ...fields
}: LocalFilterFieldsProps & {
  /** Current List/Map/Online view. The switcher rides in the sticky bar. */
  view: string;
  onViewChange: (next: string) => void;
  /** Total active filters, surfaced on the collapsed "Filters" control. */
  activeFilterCount: number;
  /** How many places the current filters surface, shown on the sheet's close CTA. */
  resultCount: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  // The sticky bar stays a compact one-row toolbar and keeps the 200 to 260px
  // of viewport the full set would take.
  const [sheetOpen, setSheetOpen] = useState(false);

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
                  <RollingNumber
                    value={fmt.number(activeFilterCount)}
                    numericValue={activeFilterCount}
                  />
                </span>
              )}
            </button>
            <DirectoryViewSwitcher view={view} onViewChange={onViewChange} />
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
              {/* One flex item, so the button's gap never splits the
                  sentence around the rolling number. */}
              <span>
                <Translation
                  i18nKey={
                    view === "online"
                      ? "marketing:local.filter.showResultsOnline"
                      : "marketing:local.filter.showResults"
                  }
                  values={{ count: resultCount }}
                  slots={{
                    count: (
                      <RollingNumber
                        value={fmt.number(resultCount)}
                        numericValue={resultCount}
                      />
                    ),
                  }}
                />
              </span>
            </Button>
          </div>
        </ModalSheet>
      )}
    </>
  );
}
