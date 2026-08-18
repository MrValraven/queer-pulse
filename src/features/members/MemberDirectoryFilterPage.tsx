import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FiAlertTriangle } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { EmptyState } from "../../shared/components/ui";
import {
  useCountUp,
  useLocalStorage,
  useMediaQuery,
  useSimulatedLoad,
} from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  ALL_OF_LISBON,
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
import {
  ALL_SECTIONS_COLLAPSED,
  isSectionOpenMap,
  type SectionKey,
} from "./FilterSection";
import {
  MemberDirectoryHeader,
  MemberFiltersSheet,
  MemberHeaderSkeleton,
} from "./MemberDirectorySections";
import { MemberDirectoryLayout } from "./MemberDirectoryLayout";
import styles from "./MemberDirectoryFilterPage.module.css";

export function MemberDirectoryFilterPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const simLoading = useSimulatedLoad();
  const { demoMode } = useDemoMode();
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("Recently joined");
  // Below the grid's single-column breakpoint the filter sidebar would stack as a
  // tall wall above the results; there it collapses into a bottom-sheet opened
  // from a "Filters" button instead. Matches the 860px grid breakpoint below.
  const isMobile = useMediaQuery(mediaMax("mobile"));
  const [filtersOpen, setFiltersOpen] = useState(false);

  // View-only preferences (which sections are open, whether the whole desktop
  // panel is shown) persist across visits. They are SEPARATE from `filters` —
  // hiding the panel never clears a selection.
  const [panelOpen, setPanelOpen] = useLocalStorage<boolean>(
    "qp.members.filtersPanelOpen",
    true,
    (value): value is boolean => typeof value === "boolean",
  );
  const [sectionsOpen, setSectionsOpen] = useLocalStorage<
    Record<SectionKey, boolean>
  >("qp.members.filterSections", ALL_SECTIONS_COLLAPSED, isSectionOpenMap);

  const toggleSection = (key: SectionKey) =>
    setSectionsOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  // Identity selections go to `identities=`, NOT `tags=`. They used to be sent
  // as tags, which the backend matched against `profiles.tags` — a skills
  // vocabulary ('Illustration', 'NestJS') that shares no value with any identity
  // id, so live mode returned nothing for every selection. `identities=` matches
  // each member's opt-in published set; members who have not published an
  // identity are simply not findable by it.
  //
  // Every facet is forwarded now — this used to stop at `identities`/`sort`,
  // silently leaving the rest of the sidebar decorative in live mode (an
  // audited P0). `ALL_OF_LISBON` is FE-only chrome meaning "no hood filter"
  // and is stripped before the request; `yearsFrom`/`yearsTo` are only sent
  // once the range has actually been narrowed from its full [0, 9] default —
  // sending the untouched default would be a harmless no-op filter, but
  // omitting it keeps the query key (and the request) identical to before a
  // member ever touches the slider.
  const hoods = filters.hoods.filter((h) => h !== ALL_OF_LISBON);
  const {
    items: sourceMembers,
    total: totalMembers,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useMembers({
    identities: filters.identities,
    openTo: filters.openTo,
    hoods,
    disciplines: filters.disciplines,
    professions: filters.professions,
    languages: filters.languages,
    yearsFrom:
      filters.yearsFrom !== EMPTY_FILTERS.yearsFrom
        ? filters.yearsFrom
        : undefined,
    yearsTo:
      filters.yearsTo !== EMPTY_FILTERS.yearsTo ? filters.yearsTo : undefined,
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
    // Live mode: every facet now travels through the query key and the server
    // does the actual filtering — `sourceMembers` already IS the filtered set.
    // Re-running `matchesFilters` here would be redundant at best; at worst a
    // client/server vocabulary drift (e.g. a hood match computed differently
    // client-side than `neighbourhoods.ts`'s `matchNeighbourhood`) could
    // silently narrow an already-correct server page. Trust the server.
    if (!demoMode) return sourceMembers;
    // Demo mode holds the whole mock list, which carries every facet field, so
    // it filters and sorts entirely in the browser.
    const matched = sourceMembers.filter((member) =>
      matchesFilters(member, filters),
    );
    return sortMembers(matched, sort);
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
  // A filter run can hold every fetched page's cards at once; `MemberResultsGrid`
  // (via `useMemberDirectoryVirtualizer`) mounts only the rows near the
  // viewport regardless of how long `shown` is, so no client-side windowing is
  // needed here — this used to cap an initial slice with `useIncrementalList`
  // and grow it via a scroll sentinel, which only capped the *initial* mount,
  // not the steady-state DOM size once fully scrolled.
  const shown = filtered;

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

  // A failed live fetch (with nothing loaded) must read as an outage, not as an
  // empty directory (audit P1-14). Once any page has loaded we keep the results
  // rather than blowing them away for a later-page failure.
  const showError = isError && sourceMembers.length === 0;

  if (showError) {
    return (
      <PageShell>
        <div className={styles.page}>
          <EmptyState
            icon={<FiAlertTriangle />}
            title={t("members:directory.error.title")}
            description={t("members:directory.error.description")}
            action={{
              label: t("members:directory.error.retry"),
              onClick: refetch,
            }}
          />
        </div>
      </PageShell>
    );
  }

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

        <MemberDirectoryLayout
          filters={filters}
          sourceMembers={sourceMembers}
          sort={sort}
          onSort={setSort}
          chips={chips}
          onApplyFilters={applyFilters}
          onClearAllFilters={clearAllFilters}
          onResetAll={resetAll}
          isMobile={isMobile}
          panelOpen={panelOpen}
          onTogglePanel={() => setPanelOpen((prev) => !prev)}
          onOpenFilters={() => setFiltersOpen(true)}
          sectionsOpen={sectionsOpen}
          onToggleSection={toggleSection}
          loading={loading}
          shown={shown}
          hasActiveFilters={hasActiveFilters}
          totalMembers={totalMembers}
          filteredCount={filtered.length}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onFetchNextPage={fetchNextPage}
          onRefresh={() => queryClient.invalidateQueries({ queryKey: ["members"] })}
        />
      </div>

      {isMobile && filtersOpen && (
        <MemberFiltersSheet
          filters={filters}
          members={sourceMembers}
          appliedCount={chips.length}
          filteredCount={filtered.length}
          sectionsOpen={sectionsOpen}
          onToggleSection={toggleSection}
          onApplyFilters={applyFilters}
          onClearAll={clearAllFilters}
          onClose={() => setFiltersOpen(false)}
        />
      )}
    </PageShell>
  );
}
