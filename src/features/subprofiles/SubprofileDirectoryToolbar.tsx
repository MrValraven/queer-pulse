import { SkeletonLine, type ActiveFilter } from "../../shared/components/ui";
import {
  AppliedChipsRow,
  FilterResultsTop,
  FilterSortControl,
  FiltersToggleButton,
  type FilterPageState,
} from "../../shared/components/filterPage";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubprofileFilterSectionKey } from "./subprofileDirectoryFilterSections";
import { SORT_OPTIONS } from "./subprofileDirectorySort";
import type { SubprofileDirectoryFilters } from "./useSubprofileDirectoryFilters";

/**
 * The top of the persona results column: the live count beside the Filters
 * button and the sort, then a chip for everything narrowing the grid. The
 * search box is the hero's, so its term shows here as a "Search: {term}"
 * chip; the Filters badge counts the sidebar's own filters only.
 *
 * The count row is the filter page's `aria-live` region, so it is what tells
 * a screen reader how many personas a refinement left behind. It shimmers
 * only while the first page loads; when that fetch fails the error panel
 * below speaks for the directory, so the row holds no count.
 */
export function SubprofileDirectoryToolbar({
  directory,
  isCountKnown,
  isShowingControls,
  filterPage,
  activeFilters,
  resultCount,
}: {
  directory: SubprofileDirectoryFilters;
  /** False while the fetch is in flight or failed, so a count of 0 is never
   *  shown as an answer to a question that has not been answered yet. */
  isCountKnown: boolean;
  /** The directory has something to filter. False drops the Filters button
   *  (the sidebar folds away with it); the sort is always shown. */
  isShowingControls: boolean;
  filterPage: FilterPageState<SubprofileFilterSectionKey>;
  /** Everything narrowing the grid, the search term included. */
  activeFilters: readonly ActiveFilter[];
  /** The figure the count row says, worked out by `SubprofileDirectoryBrowse`
   *  so the filters sheet's "Show N personas" says the same number. */
  resultCount: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <>
      <FilterResultsTop
        count={
          isCountKnown ? (
            <Translation
              i18nKey="subprofiles:directory.resultCount"
              values={{ count: resultCount }}
              slots={{
                count: (
                  <b>
                    <em>
                      <RollingNumber
                        value={fmt.number(resultCount)}
                        numericValue={resultCount}
                      />
                    </em>
                  </b>
                ),
              }}
            />
          ) : directory.isLoading ? (
            <SkeletonLine width={110} height={14} />
          ) : null
        }
        filtersButton={
          isShowingControls ? (
            <FiltersToggleButton
              isMobile={filterPage.isMobile}
              isPanelOpen={filterPage.isPanelOpen}
              onTogglePanel={filterPage.togglePanel}
              onOpenSheet={filterPage.openSheet}
              activeCount={directory.sidebarActiveCount}
            />
          ) : undefined
        }
        // Always on screen, so it never pops in or out with the sidebar.
        controls={
          <FilterSortControl
            label={t("subprofiles:directory.sort.label")}
            value={directory.sort}
            options={SORT_OPTIONS.map((option) => ({
              value: option.value,
              label: t(option.labelKey),
            }))}
            onChange={directory.setSort}
            isLabelHiddenOnPhone
          />
        }
      />

      <AppliedChipsRow
        chips={activeFilters.map((filter) => ({
          key: filter.key,
          // The hook builds every label as a string; `ActiveFilter` only
          // types it as a ReactNode, so this narrows it back.
          label: typeof filter.label === "string" ? filter.label : filter.key,
          onRemove: filter.onRemove,
        }))}
      />
    </>
  );
}
