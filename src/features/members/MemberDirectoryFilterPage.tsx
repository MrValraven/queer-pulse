import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  FadeIn,
  SkeletonLine,
} from "../../shared/components/ui";
import { useCountUp, useSimulatedLoad } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import {
  DEFAULT_FILTERS,
  EMPTY_FILTERS,
  PAGE_SIZE,
  SORTS,
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
  const { showToast } = useToast();
  const simLoading = useSimulatedLoad();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("Recently active");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const serverTags = filters.identities;
  const { data, isLoading } = useMembers({ tags: serverTags });
  const sourceMembers = data?.items ?? [];
  const totalMembers = data?.total ?? 0;

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
  const shown = filtered.slice(0, visible);
  const remaining = filtered.length - shown.length;

  // Reset paging whenever the result set changes underneath us, and keep the
  // profession selection coherent with the chosen fields.
  const applyFilters = (next: FilterState) => {
    setFilters(reconcileProfessions(next));
    setVisible(PAGE_SIZE);
  };

  return (
    <PageShell>
      <div className={styles.page}>
        {loading ? (
          <MemberHeaderSkeleton />
        ) : (
          <FadeIn as="header" className={styles.head}>
            <div className={styles.eyebrow}>Members · advanced filter</div>
            <h1 className={styles.h1}>
              Find
              <em>
                <span className={styles.tally}>
                  {countedTotal.toLocaleString()}
                </span>{" "}
                members,
              </em>{" "}
              exactly.
            </h1>
            <p className={styles.lead}>
              Filter by what they offer, where they're based, what they're{" "}
              <b>open to</b>. The same data goes both ways — members appear here
              because they opted in to be findable for these reasons.
            </p>
          </FadeIn>
        )}

        <div className={styles.grid}>
          <FiltersSidebar
            filters={filters}
            appliedCount={chips.length}
            onChange={applyFilters}
            onClearAll={() => {
              applyFilters(EMPTY_FILTERS);
              showToast("Filters cleared", "info");
            }}
          />

          <main>
            <div className={styles.topRow}>
              <div className={styles.count}>
                Showing{" "}
                <b>
                  <em>{filtered.length.toLocaleString()}</em>
                </b>{" "}
                of {totalMembers.toLocaleString()} members
              </div>
              <div className={styles.sort}>
                <span className={styles.sortLabel}>Sort</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                >
                  {SORTS.map((s) => (
                    <option key={s}>{s}</option>
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
                      aria-label={`Remove ${chip.label}`}
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
              <EmptyState
                icon={<FiSearch />}
                title="Nothing matches your filters"
                description="No members fit all of these just now. Loosen a filter or two and more people will show up."
                action={{
                  label: "Clear filters",
                  onClick: () => {
                    applyFilters(EMPTY_FILTERS);
                    setSort("Recently active");
                  },
                }}
              />
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

            {remaining > 0 && (
              <div className={styles.loadMore}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                >
                  Load {Math.min(PAGE_SIZE, remaining)} more members
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </PageShell>
  );
}
