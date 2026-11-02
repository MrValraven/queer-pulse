import type { ReactNode } from "react";
import {
  DirectoryResultsCount,
  type DirectoryResultsCountProps,
} from "./DirectoryResultsCount";
import { DirectoryFiltersToggle } from "./DirectoryFiltersToggle";
import { DirectorySortControl } from "./DirectorySortControl";
import { DirectoryViewSwitcher } from "./DirectoryViewSwitcher";
import { countActiveLocalFilters } from "./localActiveFilterCount";
import type { LocalFilterFieldsProps } from "./LocalFilterFields";
import { LocalSearch } from "./LocalSearchField";
import styles from "./DirectoryLayout.module.css";
import pageStyles from "./DirectoryPage.module.css";

export interface DirectoryResultsTopProps {
  filterFieldProps: LocalFilterFieldsProps;
  view: string;
  onViewChange: (next: string) => void;
  countProps: DirectoryResultsCountProps;
  /** The "use my location" control. Absent on the Online tab. */
  nearMeSlot?: ReactNode;
  /** The active-filter chips, with "Clear all". */
  activeFiltersSlot: ReactNode;
  /** The "Businesses we partner with" row, under the chips. */
  partnersSlot?: ReactNode;
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  /** The sidebar's id, for the toggle's `aria-controls`. */
  panelId: string;
}

/**
 * The top of the desktop results column, in the members directory's order:
 * the search field (with the List/Map/Online switcher at the row's end),
 * then the count on the left and the controls that shape the results on the
 * right (near-me, the Filters toggle, the sort), then the chips of what is
 * narrowing the results right now. As the column narrows, the controls fold
 * their labels down to icons (DirectoryLayout.module.css) and the count wraps
 * its own text, so the controls always keep to one line. The notes under
 * near-me and the sort each take a full line of the row, under the count and
 * the controls together. `data-view` lets the label folds follow the tab:
 * the Online tab has no near-me, so its Filters label keeps its text longer.
 */
export function DirectoryResultsTop({
  filterFieldProps,
  view,
  onViewChange,
  countProps,
  nearMeSlot,
  activeFiltersSlot,
  partnersSlot,
  isPanelOpen,
  onTogglePanel,
  panelId,
}: DirectoryResultsTopProps) {
  return (
    <div className={styles.resultsTop} data-view={view}>
      <div className={styles.searchRow}>
        <div className={styles.search}>
          <LocalSearch
            query={filterFieldProps.query}
            onQueryChange={filterFieldProps.onQueryChange}
          />
        </div>
        <DirectoryViewSwitcher
          view={view}
          onViewChange={onViewChange}
          className={styles.viewSwitcher}
          labelClassName={styles.switcherLabel}
        />
      </div>

      <div className={styles.topRow}>
        <DirectoryResultsCount {...countProps} className={styles.topCount} />
        {/* Boxless, like the near-me wrapper inside it, so every control and
            note is an item of `.topRow`: the controls sit on the count's
            line, and each note takes a full line of its own under them
            (DirectoryPage.module.css `.topNearMe`, `.sortNoteSlot`). */}
        <div className={styles.topControls}>
          <div className={pageStyles.topNearMe}>{nearMeSlot}</div>
          <DirectoryFiltersToggle
            isPanelOpen={isPanelOpen}
            onToggle={onTogglePanel}
            activeCount={countActiveLocalFilters(filterFieldProps)}
            panelId={panelId}
          />
          <DirectorySortControl
            sort={filterFieldProps.sort}
            onSortChange={filterFieldProps.onSortChange}
            isLocationOn={filterFieldProps.isLocationOn}
          />
        </div>
      </div>

      {activeFiltersSlot}
      {partnersSlot}
    </div>
  );
}
