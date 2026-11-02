import { useId, type ReactNode } from "react";
import { useLocalStorage } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { DirectoryResultsCountProps } from "./DirectoryResultsCount";
import { DirectoryResultsTop } from "./DirectoryResultsTop";
import {
  LocalFilterFields,
  type LocalFilterFieldsProps,
} from "./LocalFilterFields";
import styles from "./DirectoryLayout.module.css";

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * The directory's results frame, in the members directory's layout. On
 * desktop: a sticky 280px filter sidebar on the left and the results column
 * beside it, on all three tabs. "Hide filters" eases the sidebar's track to
 * nothing so the list, the map or the Online view takes the full width; the
 * choice persists per device, and hiding the sidebar keeps every filter
 * applied. On phones the sidebar column is left out and `mobileTopSlot` (the
 * results header) takes the place of the desktop rows above the results.
 *
 * The results keep one parent and one position in both modes, so crossing the
 * breakpoint (an iPad turning, a window resizing) keeps them mounted: the map
 * keeps its camera and full screen, and the list keeps its window and scroll.
 */
export function DirectoryDesktopLayout({
  isMobile,
  mobileTopSlot,
  filterFieldProps,
  view,
  onViewChange,
  countProps,
  nearMeSlot,
  activeFiltersSlot,
  partnersSlot,
  children,
}: {
  isMobile: boolean;
  /** What sits above the results on phones: the results header. */
  mobileTopSlot: ReactNode;
  filterFieldProps: LocalFilterFieldsProps;
  view: string;
  onViewChange: (next: string) => void;
  countProps: DirectoryResultsCountProps;
  /** The "use my location" control. Absent on the Online tab. */
  nearMeSlot?: ReactNode;
  activeFiltersSlot: ReactNode;
  /** The "Businesses we partner with" row, under the chips on desktop.
   *  Phones get it through `mobileTopSlot`. */
  partnersSlot?: ReactNode;
  /** The results themselves: the list, the map or the Online view. */
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const panelId = useId();
  const [isPanelOpen, setIsPanelOpen] = useLocalStorage<boolean>(
    "qp.local.filtersPanelOpen",
    true,
    isBoolean,
  );
  const gridClassName = [styles.grid, !isPanelOpen && styles.gridFull]
    .filter(Boolean)
    .join(" ");

  // Phones drop the classes, so the column is a plain block there and the
  // views keep the page-band padding they carry on phones.
  return (
    <div className={isMobile ? undefined : gridClassName}>
      {/* Kept mounted on desktop so the sidebar slides and fades as it hides.
          The column is the sticky, clipping container (its grid track eases
          to 0), and `inert` takes the hidden filters out of tab and
          assistive tech reach. Phones reach the filters through the sticky
          toolbar's sheet. */}
      {!isMobile && (
        <div
          className={[
            styles.filtersCol,
            !isPanelOpen && styles.filtersColHidden,
          ]
            .filter(Boolean)
            .join(" ")}
          inert={!isPanelOpen || undefined}
        >
          <aside
            id={panelId}
            className={styles.filters}
            aria-label={t("marketing:local.filter.filters")}
          >
            <div className={styles.bands}>
              <LocalFilterFields {...filterFieldProps} variant="sidebar" />
            </div>
          </aside>
        </div>
      )}

      <div className={isMobile ? undefined : styles.results}>
        {isMobile ? (
          mobileTopSlot
        ) : (
          <DirectoryResultsTop
            filterFieldProps={filterFieldProps}
            view={view}
            onViewChange={onViewChange}
            countProps={countProps}
            nearMeSlot={nearMeSlot}
            activeFiltersSlot={activeFiltersSlot}
            partnersSlot={partnersSlot}
            isPanelOpen={isPanelOpen}
            onTogglePanel={() => setIsPanelOpen((isOpen) => !isOpen)}
            panelId={panelId}
          />
        )}
        <div className={isMobile ? undefined : styles.resultsBody}>
          {children}
        </div>
      </div>
    </div>
  );
}
