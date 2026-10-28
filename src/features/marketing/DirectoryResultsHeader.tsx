import type { ReactNode } from "react";
import {
  DirectoryResultsCount,
  type DirectoryResultsCountProps,
} from "./DirectoryResultsCount";
import s from "./DirectoryPage.module.css";

/**
 * The phone results header shared by both Local views: the "showing X of Y
 * places" count on the left, the "use my location" control on the right, and
 * the active-filter chips below. On desktop the page skips this header: the
 * count rides the filter bar's search row with the controls that shape the
 * results (see `DirectoryPage`), and so do the near-me control and the chips.
 */
export function DirectoryResultsHeader({
  nearMeSlot,
  activeFiltersSlot,
  ...countProps
}: DirectoryResultsCountProps & {
  /** The "use my location" control. The caller passes it in so this header
   *  stays presentational and the member's position never travels further
   *  than the one component that owns it. Filled on phones only: on desktop
   *  the control rides the search row (see `DirectoryPage`). */
  nearMeSlot?: ReactNode;
  /** The active-filter chips. Filled on phones only: on desktop they ride the
   *  filter bar, under the search row that sets them (see `DirectoryPage`). */
  activeFiltersSlot?: ReactNode;
}) {
  return (
    <div className={s.resultsHeader}>
      <div className="wrap">
        <div className={s.resultsRow}>
          <DirectoryResultsCount {...countProps} />

          {nearMeSlot && <div className={s.resultsControls}>{nearMeSlot}</div>}
        </div>

        {activeFiltersSlot}
      </div>
    </div>
  );
}
