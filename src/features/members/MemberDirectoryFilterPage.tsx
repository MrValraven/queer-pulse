import { useMemo, useState } from "react";
import { PageShell } from "../../shared/components/layout";
import {
  useCountUp,
  useIncrementalList,
  useMediaQuery,
  useSimulatedLoad,
} from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  EMPTY_FILTERS,
  SORT_PARAM,
  appliedChips,
  matchesFilters,
  reconcileProfessions,
  sortMembers,
  type FilterState,
  type SortKey,
} from "./memberDirectoryFilter.data";
import { useMembers } from "./api/useMembers";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { FiltersSidebar } from "./MemberFilterCards";
import {
  MemberDirectoryHeader,
  MemberFiltersSheet,
  MemberHeaderSkeleton,
  MemberResultsColumn,
} from "./MemberDirectorySections";
import styles from "./MemberDirectoryFilterPage.module.css";

export function MemberDirectoryFilterPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const simLoading = useSimulatedLoad();
  const { demoMode } = useDemoMode();
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("Recently joined");
  // Below the grid's single-column breakpoint the filter sidebar would stack as a
  // tall wall above the results; there it collapses into a bottom-sheet opened
  // from a "Filters" button instead. Matches the 860px grid breakpoint below.
  const isMobile = useMediaQuery("(max-width: 860px)");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Identity selections go to `identities=`, NOT `tags=`. They used to be sent
  // as tags, which the backend matched against `profiles.tags` — a skills
  // vocabulary ('Illustration', 'NestJS') that shares no value with any identity
  // id, so live mode returned nothing for every selection. `identities=` matches
  // each member's opt-in published set; members who have not published an
  // identity are simply not findable by it.
  const {
    items: sourceMembers,
    total: totalMembers,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
  } = useMembers({
    identities: filters.identities,
    // Live mode sorts server-side (sort is part of the query key, so changing it
    // refetches). Demo mode sorts in the browser and must NOT put sort in the key
    // — otherwise every sort change would refetch and flash the skeleton.
    sort: demoMode ? undefined : SORT_PARAM[sort],
  });

  // Combine hook loading with simulated skeleton load for the initial render.
  const loading = isLoading || simLoading;

  // Count the headline figure up from 1 once the skeleton clears — a quick
  // settle that says "this is a real, countable population". Gating on `!loading`
  // means the count animates in with the content instead of finishing unseen
  // behind the skeleton. Reduced motion jumps to the total.
  const countedTotal = useCountUp(totalMembers, { active: !loading, from: 1 });

  // Demo mode sorts the whole mock list in the browser; live mode renders the
  // server's order as-is — the API sorts across the full (paginated) directory,
  // and the live cards carry no ranking fields to re-sort by anyway (they'd all
  // tie and scramble the server order). See `useMembers` / the directory API.
  const filtered = useMemo(() => {
    const matched = sourceMembers.filter((member) =>
      matchesFilters(member, filters),
    );
    return demoMode ? sortMembers(matched, sort) : matched;
  }, [sourceMembers, filters, sort, demoMode]);

  const chips = useMemo(() => appliedChips(filters, t), [filters, t]);
  // Distinguish a genuinely empty directory (nothing to show, e.g. live mode
  // against a fresh backend) from filters that happen to exclude everyone. The
  // age range carries no chip, so fold it in alongside the chip count.
  const hasActiveFilters =
    chips.length > 0 ||
    filters.yearsFrom !== EMPTY_FILTERS.yearsFrom ||
    filters.yearsTo !== EMPTY_FILTERS.yearsTo;
  // Server pagination drives "load more" now; client-side filtering/sorting runs
  // over every page fetched so far. Demo mode returns the whole MEMBERS list as a
  // single page, so `hasNextPage` is false and the full mock list renders.
  const shown = filtered;

  // Window the client-rendered slice: a filter run can hold every fetched page
  // at once, so render a capped batch and reveal more as a sentinel nears the
  // viewport instead of mounting hundreds of cards up front. The cap resets
  // whenever `shown` changes identity (any filter/search/sort), so a new result
  // always starts at the top.
  const {
    visible: shownWindowed,
    sentinelRef,
    hasMore: hasMoreWindowed,
  } = useIncrementalList(shown, { initial: 18, step: 18 });

  // Keep the profession selection coherent with the chosen fields.
  const applyFilters = (next: FilterState) => {
    setFilters(reconcileProfessions(next));
  };

  const clearAllFilters = () => {
    applyFilters(EMPTY_FILTERS);
    showToast(t("members:directory.toast.filtersCleared"), "info");
  };

  const resetAll = () => {
    applyFilters(EMPTY_FILTERS);
    setSort("Recently joined");
  };

  return (
    <PageShell>
      <div className={styles.page}>
        {loading ? (
          <MemberHeaderSkeleton />
        ) : (
          <MemberDirectoryHeader
            totalMembers={totalMembers}
            countedTotal={countedTotal}
          />
        )}

        <div className={styles.grid}>
          {!isMobile && (
            <FiltersSidebar
              filters={filters}
              members={sourceMembers}
              appliedCount={chips.length}
              onChange={applyFilters}
              onClearAll={clearAllFilters}
            />
          )}

          <MemberResultsColumn
            filters={filters}
            sort={sort}
            onSort={setSort}
            chips={chips}
            onApplyFilters={applyFilters}
            onResetAll={resetAll}
            isMobile={isMobile}
            onOpenFilters={() => setFiltersOpen(true)}
            loading={loading}
            shown={shown}
            shownWindowed={shownWindowed}
            sentinelRef={sentinelRef}
            hasMoreWindowed={hasMoreWindowed}
            hasActiveFilters={hasActiveFilters}
            totalMembers={totalMembers}
            filteredCount={filtered.length}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onFetchNextPage={fetchNextPage}
          />
        </div>
      </div>

      {isMobile && filtersOpen && (
        <MemberFiltersSheet
          filters={filters}
          members={sourceMembers}
          appliedCount={chips.length}
          filteredCount={filtered.length}
          onApplyFilters={applyFilters}
          onClearAll={clearAllFilters}
          onClose={() => setFiltersOpen(false)}
        />
      )}
    </PageShell>
  );
}
