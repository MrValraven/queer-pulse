/* The filter page: the members directory's layout (header, sticky filters
   sidebar, results top, applied chips, mobile filters sheet), shared so every
   directory-style page reads the same. A page composes it as:

     <FilterPageFrame>
       <FilterPageHeader ... />
       <FilterPageLayout sidebar={<FilterSidebarPanel>sections</FilterSidebarPanel>}>
         <div>
           <FilterResultsTop ... />
           <AppliedChipsRow ... />
           {grid}
         </div>
       </FilterPageLayout>
     </FilterPageFrame>
     {isMobile && isSheetOpen && <FiltersSheet>...</FiltersSheet>}

   with the view state from `useFilterPageState`. Kept out of the `ui`
   barrel on purpose: it is a page layout, and only filter pages need it. */
import styles from "./FilterPage.module.css";

export { FilterPageFrame } from "./FilterPageFrame";
export { FilterPageHeader, FilterPageHeaderSkeleton } from "./FilterPageHeader";
export { FilterPageLayout } from "./FilterPageLayout";
export { FilterSidebarPanel } from "./FilterSidebarPanel";
export { FilterSection } from "./FilterSection";
export { FilterOptionRow } from "./FilterOptionRow";
export { FiltersToggleButton } from "./FiltersToggleButton";
export { FilterResultsTop, FilterSortControl } from "./FilterResultsTop";
export { AppliedChipsRow, type AppliedFilterChip } from "./AppliedChipsRow";
export { FiltersSheet } from "./FiltersSheet";
export { useFilterPageState, type FilterPageState } from "./useFilterPageState";
export { FILTER_PAGE_SPRING } from "./filterPageMotion";

/** Class names a page puts on its own elements inside the filter page.
 *  `search` sizes a SearchInput passed as `FilterResultsTop`'s `search`
 *  (full row width up to 480px). `chipsStale` dims a ChipSelect inside a
 *  `FilterSection` while its counts describe the previous filter run, the
 *  way `FilterOptionRow`'s `isCountStale` dims a row's count. */
export const filterPageClassNames = {
  search: styles.directorySearch,
  chipsStale: styles.chipsStale,
} as const;
