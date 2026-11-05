import type { ReactNode } from "react";
import styles from "./FilterPage.module.css";

interface FilterPageLayoutProps {
  /** Below the mobile cutover the sidebar is not rendered at all: filters
   *  live in `FiltersSheet` there, opened from `FiltersToggleButton`. */
  isMobile: boolean;
  /** The desktop sidebar is shown (the member's "Hide filters" choice,
   *  from `useFilterPageState`). */
  isPanelOpen: boolean;
  /** The page has filters to offer right now. False hides the sidebar with
   *  the same slide as "Hide filters" (and the page then renders no Filters
   *  button and no search). Defaults to true. */
  isSidebarAvailable?: boolean;
  /** The sidebar content, normally a `FilterSidebarPanel` of
   *  `FilterSection`s. */
  sidebar: ReactNode;
  /** The results column: `FilterResultsTop`, `AppliedChipsRow`, then the
   *  page's own grid, empty states and pager. It is one grid item, so wrap
   *  several nodes in one element. */
  children: ReactNode;
}

/** The two-column desktop layout: a sticky 280px filters sidebar beside the
 *  results column, collapsing to the results alone on mobile. A page renders
 *  it inside `FilterPageFrame`, under the header. */
export function FilterPageLayout({
  isMobile,
  isPanelOpen,
  isSidebarAvailable = true,
  sidebar,
  children,
}: FilterPageLayoutProps) {
  const isSidebarShown = isPanelOpen && isSidebarAvailable;
  return (
    <div
      className={[styles.grid, !isMobile && !isSidebarShown && styles.gridFull]
        .filter(Boolean)
        .join(" ")}
    >
      {!isMobile && (
        /* Kept mounted so the sidebar can slide and fade out.
           The column is the sticky, clipping container (grid track eases to
           0), and `inert` drops the hidden filters from tab/AT reach. */
        <div
          className={[
            styles.filtersCol,
            !isSidebarShown && styles.filtersColHidden,
          ]
            .filter(Boolean)
            .join(" ")}
          inert={!isSidebarShown || undefined}
        >
          {sidebar}
        </div>
      )}

      {children}
    </div>
  );
}
