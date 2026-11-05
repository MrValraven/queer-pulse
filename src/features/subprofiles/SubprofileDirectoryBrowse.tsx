import {
  FilterPageLayout,
  FiltersSheet,
  useFilterPageState,
} from "../../shared/components/filterPage";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { SubprofileDirectoryFilterSidebar } from "./SubprofileDirectoryFilterSidebar";
import { SubprofileDirectoryResults } from "./SubprofileDirectoryResults";
import { SubprofileDirectoryToolbar } from "./SubprofileDirectoryToolbar";
import { SUBPROFILE_FILTER_SECTION_KEYS } from "./subprofileDirectoryFilterSections";
import { useSubprofileDirectoryActiveFilters } from "./useSubprofileDirectoryActiveFilters";
import type { SubprofileDirectoryFilters } from "./useSubprofileDirectoryFilters";
import styles from "./SubprofileDirectoryPage.module.css";

/**
 * The hub's "everyone" tab: the searchable, filterable grid of standalone
 * (unlinked + published) personas, on the members directory's layout. The
 * filters sidebar sits beside the results column on desktop and folds into
 * a bottom sheet below the mobile cutover.
 *
 * Extracted from `SubprofileDirectoryPage` when the hub grew its second tab,
 * so neither tab's body has to know the other exists. The refine state comes
 * in from the page, which shares it with the hero's search and quick chips.
 * The sidebar and section open states persist per device, so they survive
 * the tab switch.
 */
export function SubprofileDirectoryBrowse({
  directory,
}: {
  /** The page's `useSubprofileDirectoryFilters()`, shared with the hero. */
  directory: SubprofileDirectoryFilters;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const filterPage = useFilterPageState({
    panelStorageKey: "qp.subprofiles.filtersPanelOpen",
    sectionsStorageKey: "qp.subprofiles.filterSections",
    sectionKeys: SUBPROFILE_FILTER_SECTION_KEYS,
  });
  const { isLoading, isError, isFetchNextPageError } = directory;
  // ENG-501: react-query also sets `isError` when only the next page failed.
  // The error panel is for a directory with nothing loaded; loaded cards stay
  // and the pager below retries the page that failed.
  const hasNothingLoadedError = isError && !isFetchNextPageError;
  const isCountKnown = !isLoading && !hasNothingLoadedError;

  // `professionGroups` is built from every fetched persona and every counted
  // profession, so an empty one is an empty directory: filtering nothing is an affordance for nothing, and
  // the page's own empty state says more than a sidebar would. Kept while the
  // first fetch is still in flight (the pool isn't known to be empty yet) and
  // kept whenever something is narrowing, so a search can always be cleared.
  const isPoolEmpty = directory.professionGroups.length === 0;
  const isShowingControls =
    !isCountKnown || !isPoolEmpty || directory.hasActiveRefinement;

  // The chips row shows everything narrowing the grid, the hero's search
  // term included. The Filters badge and the sidebar's Clear all tally only
  // the sidebar's own filters, off the hook's one count.
  const activeFilters = useSubprofileDirectoryActiveFilters(directory);
  const appliedCount = directory.sidebarActiveCount;

  // Search and every sidebar filter run on the server, so its total is the
  // exact answer, and Show more leaves it unchanged.
  const resultCount = directory.total;

  const sidebarFor = (isInSheet: boolean) => (
    <SubprofileDirectoryFilterSidebar
      directory={directory}
      isCountKnown={isCountKnown}
      appliedCount={appliedCount}
      sectionsOpen={filterPage.sectionsOpen}
      onToggleSection={filterPage.toggleSection}
      isInSheet={isInSheet}
    />
  );

  return (
    <>
      <FilterPageLayout
        isMobile={filterPage.isMobile}
        isPanelOpen={filterPage.isPanelOpen}
        isSidebarAvailable={isShowingControls}
        sidebar={sidebarFor(false)}
      >
        {/* The results column is the grid's size container, so the card
            columns follow the room the sidebar leaves them. */}
        <div className={styles.results}>
          <SubprofileDirectoryToolbar
            directory={directory}
            isCountKnown={isCountKnown}
            isShowingControls={isShowingControls}
            filterPage={filterPage}
            activeFilters={activeFilters}
            resultCount={resultCount}
          />
          <SubprofileDirectoryResults
            directory={directory}
            hasNothingLoadedError={hasNothingLoadedError}
          />
        </div>
      </FilterPageLayout>

      {/* ModalSheet portals out of the frame, and owns its own enter and
          exit, so it mounts only while open, as on the members directory. */}
      {filterPage.isMobile && filterPage.isSheetOpen && (
        <FiltersSheet
          title={t("subprofiles:directory.filtersSheetLabel")}
          showResultsLabel={
            <Translation
              i18nKey="subprofiles:directory.showResultsCta"
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
          }
          onClose={filterPage.closeSheet}
        >
          {sidebarFor(true)}
        </FiltersSheet>
      )}
    </>
  );
}
