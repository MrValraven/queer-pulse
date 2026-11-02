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
 * count, the near-me control and the chips sit above the results column
 * (see `DirectoryResultsTop`).
 */
export function DirectoryResultsHeader({
  nearMeSlot,
  activeFiltersSlot,
  ...countProps
}: DirectoryResultsCountProps & {
  /** The "use my location" control. The caller passes it in so this header
   *  stays presentational and the member's position never travels further
   *  than the one component that owns it. */
  nearMeSlot?: ReactNode;
  /** The active-filter chips. */
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
