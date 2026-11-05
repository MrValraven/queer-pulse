import { PullToRefresh } from "../../shared/components/ui";
import { FilterPageLayout } from "../../shared/components/filterPage";
import type {
  AppliedChip,
  DirectoryFacetCounts,
  FilterState,
  MemberCard,
  SortKey,
} from "./memberDirectoryFilter.data";
import { type SectionKey } from "./filterSectionKeys";
import type { MemberDirectorySearch } from "./useMemberDirectoryQuery";
import { FiltersSidebar } from "./MemberFilterCards";
import { MemberResultsColumn } from "./MemberDirectorySections";

export interface MemberDirectoryLayoutProps {
  /** The name-search box's value and setter, rendered in the results column. */
  search: MemberDirectorySearch;
  filters: FilterState;
  /** Every member loaded so far. DEMO mode counts the sidebar's facets off
   *  this (there it is the whole directory); live mode uses `facets` (see
   *  `FiltersSidebar`). */
  sourceMembers: MemberCard[];
  /** LIVE: the server's per-option availability counts for the sidebar. */
  facets?: DirectoryFacetCounts;
  /** The sidebar's counts describe the previous filter run. */
  countsAreStale: boolean;
  sort: SortKey;
  onSort: (sort: SortKey) => void;
  chips: AppliedChip[];
  onApplyFilters: (filters: FilterState) => void;
  onClearAllFilters: () => void;
  onResetAll: () => void;
  isMobile: boolean;
  panelOpen: boolean;
  onTogglePanel: () => void;
  onOpenFilters: () => void;
  sectionsOpen: Record<SectionKey, boolean>;
  onToggleSection: (key: SectionKey) => void;
  loading: boolean;
  shown: MemberCard[];
  hasActiveFilters: boolean;
  totalMembers: number;
  filteredCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  onFetchNextPage: () => void;
  onRefresh: () => Promise<unknown>;
}

/** The members directory on the shared `FilterPageLayout`: the filters
 *  sidebar beside the results column, which sits inside the pull-to-refresh
 *  gesture. Extracted from `MemberDirectoryFilterPage` purely to keep that
 *  component under the 200-line single-component limit; this owns no state
 *  of its own. */
export function MemberDirectoryLayout({
  search,
  filters,
  sourceMembers,
  facets,
  countsAreStale,
  sort,
  onSort,
  chips,
  onApplyFilters,
  onClearAllFilters,
  onResetAll,
  isMobile,
  panelOpen,
  onTogglePanel,
  onOpenFilters,
  sectionsOpen,
  onToggleSection,
  loading,
  shown,
  hasActiveFilters,
  totalMembers,
  filteredCount,
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  onFetchNextPage,
  onRefresh,
}: MemberDirectoryLayoutProps) {
  return (
    <FilterPageLayout
      isMobile={isMobile}
      isPanelOpen={panelOpen}
      sidebar={
        <FiltersSidebar
          filters={filters}
          members={sourceMembers}
          facets={facets}
          countsAreStale={countsAreStale}
          appliedCount={chips.length}
          onChange={onApplyFilters}
          onClearAll={onClearAllFilters}
          sectionsOpen={sectionsOpen}
          onToggleSection={onToggleSection}
        />
      }
    >
      {/* `queryKey: ["members"]` matches useMembers' inline
          `["members", demoMode, params]` as a prefix, so it invalidates every
          filter/sort/mode variant, so a pull refresh refetches the
          directory as currently filtered. */}
      <PullToRefresh onRefresh={onRefresh}>
        <MemberResultsColumn
          search={search}
          filters={filters}
          sort={sort}
          onSort={onSort}
          chips={chips}
          onApplyFilters={onApplyFilters}
          onResetAll={onResetAll}
          isMobile={isMobile}
          panelOpen={panelOpen}
          onTogglePanel={onTogglePanel}
          onOpenFilters={onOpenFilters}
          loading={loading}
          shown={shown}
          hasActiveFilters={hasActiveFilters}
          totalMembers={totalMembers}
          filteredCount={filteredCount}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isFetchNextPageError={isFetchNextPageError}
          onFetchNextPage={onFetchNextPage}
        />
      </PullToRefresh>
    </FilterPageLayout>
  );
}
