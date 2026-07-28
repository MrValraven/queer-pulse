import { useId, useMemo, useState } from "react";
import { FiSearch, FiSliders, FiUsers } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  FadeIn,
  ModalSheet,
  SkeletonLine,
} from "../../shared/components/ui";
import {
  useCountUp,
  useIncrementalList,
  useMediaQuery,
  useSimulatedLoad,
} from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import {
  EMPTY_FILTERS,
  SORTS,
  SORT_LABEL_KEY,
  SORT_PARAM,
  appliedChips,
  matchesFilters,
  reconcileProfessions,
  sortMembers,
  type AppliedChip,
  type FilterState,
  type SortKey,
} from "./memberDirectoryFilter.data";
import { useMembers } from "./api/useMembers";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  FiltersSidebar,
  MemberResultCard,
  MemberResultSkeleton,
} from "./MemberFilterCards";
import styles from "./MemberDirectoryFilterPage.module.css";

/** Remove one value from whichever filter group a chip belongs to. */
function removeChip(filters: FilterState, chip: AppliedChip): FilterState {
  const drop = (arr: string[]) => arr.filter((v) => v !== chip.value);
  switch (chip.group) {
    case "openTo":
      return { ...filters, openTo: drop(filters.openTo) };
    case "hood":
      return { ...filters, hoods: drop(filters.hoods) };
    case "discipline":
      return { ...filters, disciplines: drop(filters.disciplines) };
    case "profession":
      return { ...filters, professions: drop(filters.professions) };
    case "identity":
      return { ...filters, identities: drop(filters.identities) };
    case "language":
      return { ...filters, languages: drop(filters.languages) };
  }
}

/** Placeholder for the page header — mirrors the eyebrow / h1 / lead rhythm so
 *  the real header swaps in with no layout shift. */
function MemberHeaderSkeleton() {
  return (
    <div className={styles.head} aria-busy="true" aria-hidden="true">
      <SkeletonLine width={200} height={11} style={{ marginBottom: 14 }} />
      <SkeletonLine width="70%" height={48} style={{ marginBottom: 16 }} />
      <SkeletonLine width="100%" height={13} style={{ marginTop: 4 }} />
      <SkeletonLine width="45%" height={13} style={{ marginTop: 8 }} />
    </div>
  );
}

export function MemberDirectoryFilterPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const simLoading = useSimulatedLoad();
  const { demoMode } = useDemoMode();
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("Recently joined");
  const sortLabelId = useId();
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
    const matched = sourceMembers.filter((m) => matchesFilters(m, filters));
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

  return (
    <PageShell>
      <div className={styles.page}>
        {loading ? (
          <MemberHeaderSkeleton />
        ) : (
          <FadeIn as="header" className={styles.head}>
            <div className={styles.eyebrow}>
              {t("members:directory.eyebrow")}
            </div>
            <h1 className={styles.h1}>
              {t("members:directory.findPrefix")}
              <em>
                <span
                  className={styles.tally}
                  style={{
                    minWidth: `${fmt.number(totalMembers).length}ch`,
                  }}
                >
                  {fmt.number(countedTotal)}
                </span>{" "}
                {t("members:directory.memberCountSuffix", {
                  count: totalMembers,
                })}
              </em>{" "}
              {t("members:directory.findSuffix")}
            </h1>
            <p className={styles.lead}>
              <Translation
                i18nKey="members:directory.lead"
                components={{ b: <b /> }}
              />
            </p>
          </FadeIn>
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

          <div>
            <div className={styles.topRow}>
              <div className={styles.count}>
                {t("members:directory.showingPrefix")}{" "}
                <b>
                  <em>{fmt.number(filtered.length)}</em>
                </b>{" "}
                {t("members:directory.showingOf")} {fmt.number(totalMembers)}{" "}
                {t("members:directory.memberCountLabel", {
                  count: totalMembers,
                })}
              </div>
              <div className={styles.topControls}>
                {isMobile && (
                  <button
                    type="button"
                    className={styles.filtersBtn}
                    onClick={() => setFiltersOpen(true)}
                  >
                    <FiSliders aria-hidden />
                    {t("members:directory.filtersCta")}
                    {chips.length > 0 && (
                      <span className={styles.filtersBtnCount}>
                        {fmt.number(chips.length)}
                      </span>
                    )}
                  </button>
                )}
                <div className={styles.sort}>
                  <span id={sortLabelId} className={styles.sortLabel}>
                    {t("members:directory.sortLabel")}
                  </span>
                  <select
                    value={sort}
                    aria-labelledby={sortLabelId}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                  >
                    {SORTS.map((s) => (
                      <option key={s} value={s}>
                        {t(SORT_LABEL_KEY[s])}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {chips.length > 0 && (
              <div className={styles.appliedRow}>
                {chips.map((chip) => (
                  <span
                    key={`${chip.group}:${chip.value}`}
                    className={styles.applied}
                  >
                    {chip.label}
                    <button
                      type="button"
                      aria-label={t("members:directory.removeChipLabel", {
                        label: chip.label,
                      })}
                      onClick={() => applyFilters(removeChip(filters, chip))}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {loading ? (
              <div className={styles.mGrid}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <MemberResultSkeleton key={i} />
                ))}
              </div>
            ) : shown.length === 0 ? (
              hasActiveFilters ? (
                <EmptyState
                  icon={<FiSearch />}
                  title={t("members:directory.emptyFiltered.title")}
                  description={t("members:directory.emptyFiltered.description")}
                  action={{
                    label: t("members:directory.clearFiltersCta"),
                    onClick: () => {
                      applyFilters(EMPTY_FILTERS);
                      setSort("Recently joined");
                    },
                  }}
                />
              ) : (
                <EmptyState
                  icon={<FiUsers />}
                  title={t("members:directory.emptyAll.title")}
                  description={t("members:directory.emptyAll.description")}
                />
              )
            ) : (
              <>
                <div className={styles.mGrid}>
                  {shownWindowed.map((member, i) => (
                    <FadeIn
                      key={`${member.slug}-${i}`}
                      delay={Math.min(i, 9) * 85}
                    >
                      <MemberResultCard member={member} />
                    </FadeIn>
                  ))}
                </div>
                {hasMoreWindowed && (
                  <div
                    ref={sentinelRef}
                    className={styles.sentinel}
                    aria-hidden="true"
                  />
                )}
              </>
            )}

            {hasNextPage && (
              <div className={styles.loadMore}>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isFetchingNextPage}
                  onClick={fetchNextPage}
                >
                  {isFetchingNextPage
                    ? t("members:directory.loadingMore")
                    : t("members:directory.loadMoreCta")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobile && filtersOpen && (
        <ModalSheet
          onClose={() => setFiltersOpen(false)}
          ariaLabel={t("members:directory.filtersSheetLabel")}
        >
          <h2 className={styles.sheetTitle}>
            {t("members:directory.filtersSheetLabel")}
          </h2>
          <FiltersSidebar
            inSheet
            filters={filters}
            members={sourceMembers}
            appliedCount={chips.length}
            onChange={applyFilters}
            onClearAll={clearAllFilters}
          />
          <div className={styles.sheetFoot}>
            <Button
              type="button"
              variant="primary"
              onClick={() => setFiltersOpen(false)}
            >
              {t("members:directory.showResultsCta", {
                count: filtered.length,
              })}
            </Button>
          </div>
        </ModalSheet>
      )}
    </PageShell>
  );
}
