import { useMemo, useState } from "react";
import { FiSearch, FiUsers } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  FadeIn,
  SkeletonLine,
} from "../../shared/components/ui";
import { useCountUp, useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import {
  EMPTY_FILTERS,
  SORTS,
  SORT_LABEL_KEY,
  appliedChips,
  matchesFilters,
  reconcileProfessions,
  sortMembers,
  type AppliedChip,
  type FilterState,
  type SortKey,
} from "./memberDirectoryFilter.data";
import { useMembers } from "./api/useMembers";
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
  const { showToast } = useToast();
  const simLoading = useSimulatedLoad();
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("Recently active");

  const serverTags = filters.identities;
  const {
    items: sourceMembers,
    total: totalMembers,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
  } = useMembers({ tags: serverTags });

  // Combine hook loading with simulated skeleton load for the initial render.
  const loading = isLoading || simLoading;

  // Count the headline figure up from 1 once the skeleton clears — a quick
  // settle that says "this is a real, countable population". Gating on `!loading`
  // means the count animates in with the content instead of finishing unseen
  // behind the skeleton. Reduced motion jumps to the total.
  const countedTotal = useCountUp(totalMembers, { active: !loading, from: 1 });

  const filtered = useMemo(() => {
    const matched = sourceMembers.filter((m) => matchesFilters(m, filters));
    return sortMembers(matched, sort);
  }, [sourceMembers, filters, sort]);

  const chips = useMemo(() => appliedChips(filters), [filters]);
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

  // Keep the profession selection coherent with the chosen fields.
  const applyFilters = (next: FilterState) => {
    setFilters(reconcileProfessions(next));
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
                    minWidth: `${totalMembers.toLocaleString().length}ch`,
                  }}
                >
                  {countedTotal.toLocaleString()}
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
          <FiltersSidebar
            filters={filters}
            members={sourceMembers}
            appliedCount={chips.length}
            onChange={applyFilters}
            onClearAll={() => {
              applyFilters(EMPTY_FILTERS);
              showToast(t("members:directory.toast.filtersCleared"), "info");
            }}
          />

          <main>
            <div className={styles.topRow}>
              <div className={styles.count}>
                {t("members:directory.showingPrefix")}{" "}
                <b>
                  <em>{filtered.length.toLocaleString()}</em>
                </b>{" "}
                {t("members:directory.showingOf")}{" "}
                {totalMembers.toLocaleString()}{" "}
                {t("members:directory.memberCountLabel", {
                  count: totalMembers,
                })}
              </div>
              <div className={styles.sort}>
                <span className={styles.sortLabel}>
                  {t("members:directory.sortLabel")}
                </span>
                <select
                  value={sort}
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
                      setSort("Recently active");
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
              <div className={styles.mGrid}>
                {shown.map((member, i) => (
                  <FadeIn
                    key={`${member.slug}-${i}`}
                    delay={Math.min(i, 9) * 85}
                  >
                    <MemberResultCard member={member} />
                  </FadeIn>
                ))}
              </div>
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
          </main>
        </div>
      </div>
    </PageShell>
  );
}
