import { PullToRefresh } from "../../shared/components/ui";
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
import styles from "./MemberDirectoryFilterPage.module.css";

export interface MemberDirectoryLayoutProps {
  /** The name-search box's value and setter, rendered in the results column. */
  search: MemberDirectorySearch;
  filters: FilterState;
  /** Every member loaded so far. DEMO mode counts the sidebar's facets off
   *  this (there it is the whole directory); live mode uses `facets` — see
   *  `FiltersSidebar`. */
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
  onFetchNextPage: () => void;
  onRefresh: () => Promise<unknown>;
}

/** The two-column desktop layout (sticky filters sidebar + results column,
 *  collapsing to a results-only column on mobile where filters live in a
 *  sheet instead) wrapped in the pull-to-refresh gesture. Extracted from
 *  `MemberDirectoryFilterPage` purely to keep that component under the
 *  200-line single-component limit — this owns no state of its own. */
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
  onFetchNextPage,
  onRefresh,
}: MemberDirectoryLayoutProps) {
  return (
    <div
      className={[styles.grid, !isMobile && !panelOpen && styles.gridFull]
        .filter(Boolean)
        .join(" ")}
    >
      {!isMobile && (
        /* Kept mounted so the sidebar can slide/fade out rather than pop.
           The column is the sticky, clipping container (grid track eases to
           0), and `inert` drops the hidden filters from tab/AT reach. */
        <div
          className={[styles.filtersCol, !panelOpen && styles.filtersColHidden]
            .filter(Boolean)
            .join(" ")}
          inert={!panelOpen || undefined}
        >
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
        </div>
      )}

      {/* `queryKey: ["members"]` matches useMembers' inline
          `["members", demoMode, params]` as a prefix — invalidates every
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
          onFetchNextPage={onFetchNextPage}
        />
      </PullToRefresh>
    </div>
  );
}
