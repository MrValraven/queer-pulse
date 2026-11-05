import { useMemo, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { SearchInput, SkeletonLine } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import {
  AppliedChipsRow,
  FilterPageLayout,
  FilterResultsTop,
  FilterSortControl,
  FiltersSheet,
  FiltersToggleButton,
  filterPageClassNames,
  type AppliedFilterChip,
  type FilterPageState,
} from "../../shared/components/filterPage";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CommunitiesFilterSidebar } from "./CommunitiesFilterSidebar";
import { SORT_OPTIONS } from "./communitiesDiscover.data";
import type { CommunitiesFilterSectionKey } from "./communitiesFilterSections";
import { useCommunitiesActiveFilters } from "./useCommunitiesActiveFilters";
import type { DiscoverCommunities } from "./useDiscoverCommunities";
import styles from "./CommunitiesPage.module.css";

/**
 * The `/communities` filter layout, shared by both tabs: the sticky filters
 * sidebar beside the results column (search, live count, Filters button,
 * sort, applied chips, then the tab's own grid as `children`), plus the
 * mobile filters sheet. The view state comes in as `filterPage`, owned by
 * `CommunitiesHubPage`, so switching tabs keeps the open sections and the
 * shown or hidden sidebar along with the filters themselves.
 */
export function CommunitiesFilterLayout({
  discover,
  filterPage,
  isPending = false,
  children,
}: {
  discover: DiscoverCommunities;
  filterPage: FilterPageState<CommunitiesFilterSectionKey>;
  /** The host holds its grid on skeletons past the list's own fetch (the
   *  "My communities" tab waits on the membership map), so the count waits
   *  with it. */
  isPending?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const activeFilters = useCommunitiesActiveFilters({
    searchInput: discover.searchInput,
    setSearchInput: discover.setSearchInput,
    filter: discover.filter,
    setFilter: discover.setFilter,
    isOpenOnly: discover.isOpenOnly,
    setIsOpenOnly: discover.setIsOpenOnly,
    isBusyOnly: discover.isBusyOnly,
    setIsBusyOnly: discover.setIsBusyOnly,
    tagIds: discover.tagIds,
    setTagIds: discover.setTagIds,
    sort: discover.sort,
    setSort: discover.setSort,
  });
  // The chips show sidebar selections only, as on the members directory: the
  // search term sits in its own box and the sort in its own select, both on
  // screen beside the chips.
  const chips = useMemo<AppliedFilterChip[]>(
    () =>
      activeFilters.flatMap((activeFilter) =>
        activeFilter.key === "q" ||
        activeFilter.key.startsWith("sort:") ||
        typeof activeFilter.label !== "string"
          ? []
          : [
              {
                key: activeFilter.key,
                label: activeFilter.label,
                onRemove: activeFilter.onRemove,
              },
            ],
      ),
    [activeFilters],
  );

  const resultCount =
    discover.gridItems.length + (discover.isShowingFeatured ? 1 : 0);
  const isCountLoading = discover.isShowingSkeletons || isPending;
  // Not known while the grid still shows the previous sort or filter's rows
  // either: that count belongs to the run being replaced.
  const isCountKnown = !isCountLoading && !discover.isShowingStaleResults;
  // A member who belongs to no communities gets the tab's empty state, and
  // filtering an empty pool is an affordance for nothing, so the sidebar,
  // search, Filters button and sort step away. They stay while the pool is
  // not known to be empty yet, and whenever a refinement is on, so a search
  // that found nothing can always be cleared.
  const isShowingControls =
    !isCountKnown || resultCount > 0 || discover.hasActiveRefinement;

  // Clears what the sidebar and the search box hold, as the members
  // directory's "Clear all filters" does. The sort stays: it orders the list
  // and narrows nothing.
  const clearAllFilters = () => {
    discover.setFilter("all");
    discover.setIsOpenOnly(false);
    discover.setIsBusyOnly(false);
    discover.setTagIds([]);
    discover.setSearchInput("");
  };

  const sidebarProps = {
    discover,
    appliedCount: chips.length,
    onClearAll: clearAllFilters,
    sectionsOpen: filterPage.sectionsOpen,
    onToggleSection: filterPage.toggleSection,
  };

  return (
    <>
      <FilterPageLayout
        isMobile={filterPage.isMobile}
        isPanelOpen={filterPage.isPanelOpen}
        isSidebarAvailable={isShowingControls}
        sidebar={<CommunitiesFilterSidebar {...sidebarProps} />}
      >
        <div>
          <FilterResultsTop
            search={
              isShowingControls ? (
                <SearchInput
                  className={filterPageClassNames.search}
                  value={discover.searchInput}
                  onChange={discover.setSearchInput}
                  // The full placeholder runs past a phone-width field (the
                  // field ends it in an ellipsis), so phones get the short
                  // "Search communities" phrase the field is labelled with.
                  placeholder={
                    filterPage.isMobile
                      ? t("communities:discover.search.ariaLabel")
                      : t("communities:discover.search.placeholder")
                  }
                  ariaLabel={t("communities:discover.search.ariaLabel")}
                />
              ) : undefined
            }
            count={
              <CommunitiesResultCount
                count={resultCount}
                isLoading={isCountLoading || discover.isShowingStaleResults}
                isShown={isShowingControls}
              />
            }
            filtersButton={
              isShowingControls ? (
                <FiltersToggleButton
                  isMobile={filterPage.isMobile}
                  isPanelOpen={filterPage.isPanelOpen}
                  onTogglePanel={filterPage.togglePanel}
                  onOpenSheet={filterPage.openSheet}
                  activeCount={chips.length}
                />
              ) : undefined
            }
            controls={
              <CommunitiesSortControl
                discover={discover}
                isShown={isShowingControls}
              />
            }
          />

          <AppliedChipsRow chips={chips} />

          {children}
        </div>
      </FilterPageLayout>

      {filterPage.isMobile && filterPage.isSheetOpen && (
        <FiltersSheet
          title={t("communities:discover.filtersSheetLabel")}
          showResultsLabel={<ShowResultsLabel count={resultCount} />}
          onClose={filterPage.closeSheet}
        >
          <CommunitiesFilterSidebar isInSheet {...sidebarProps} />
        </FiltersSheet>
      )}
    </>
  );
}

/** The live count sentence, "12 communities", with the number large, serif
 *  and coral. A shimmer stands in while the first page is still loading and
 *  while the grid still shows the previous run's rows. It fades out with the
 *  sort when an empty pool hands the column to the tab's empty state, which
 *  already says there is nothing here. */
function CommunitiesResultCount({
  count,
  isLoading,
  isShown,
}: {
  count: number;
  isLoading: boolean;
  isShown: boolean;
}) {
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence initial={false}>
      {isShown && (
        <m.div
          key="count"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {isLoading ? (
            <SkeletonLine width={140} height={20} />
          ) : (
            <Translation
              i18nKey="communities:discover.resline.count"
              values={{ count }}
              slots={{
                count: (
                  <b>
                    <em>
                      <RollingNumber
                        value={fmt.number(count)}
                        numericValue={count}
                      />
                    </em>
                  </b>
                ),
              }}
            />
          )}
        </m.div>
      )}
    </AnimatePresence>
  );
}

/** The sort select, fading out with the Filters button when an empty pool
 *  leaves nothing to order. */
function CommunitiesSortControl({
  discover,
  isShown,
}: {
  discover: DiscoverCommunities;
  isShown: boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence initial={false}>
      {isShown && (
        <m.div
          key="sort"
          className={styles.sortSlot}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{
            duration: reducedMotion ? 0 : 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <FilterSortControl
            label={t("communities:discover.sort.label")}
            value={discover.sort}
            options={SORT_OPTIONS.map((option) => ({
              value: option,
              label: t(`communities:discover.sort.${option}`),
            }))}
            onChange={discover.setSort}
          />
        </m.div>
      )}
    </AnimatePresence>
  );
}

/** The filters sheet's footer button text, "Show 12 communities". */
function ShowResultsLabel({ count }: { count: number }) {
  const fmt = useFormat();
  return (
    <Translation
      i18nKey="communities:discover.showResultsCta"
      values={{ count }}
      slots={{
        count: <RollingNumber value={fmt.number(count)} numericValue={count} />,
      }}
    />
  );
}
