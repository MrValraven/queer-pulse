import type { Dispatch, SetStateAction } from "react";
import { Reveal, SearchInput, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Community, CommunityType } from "../homepage/data/types";
import { FILTERS, SORT_OPTIONS, type DiscoverSort } from "./communitiesDiscover.data";
import styles from "./CommunitiesPage.module.css";

/**
 * The Discover page's whole filter/sort bar: search, the two pill toggles
 * ("Open to all" / "Busy this week"), the sort select, the category chips
 * (with their stable, whole-pool counts), and the results line underneath.
 * Split out of `CommunitiesDiscover` purely to keep that component under the
 * repo's 200-line cap — every prop below is either page-level state or its
 * own `setState` (passed straight through, no wrapper callbacks needed).
 */
export function CommunitiesDiscoverControls({
  searchInput,
  setSearchInput,
  openOnly,
  setOpenOnly,
  busyOnly,
  setBusyOnly,
  sort,
  setSort,
  filter,
  setFilter,
  allForCounts,
  countsHasNext,
  resultCount,
  hasActiveRefinement,
  showResline,
}: {
  searchInput: string;
  setSearchInput: Dispatch<SetStateAction<string>>;
  openOnly: boolean;
  setOpenOnly: Dispatch<SetStateAction<boolean>>;
  busyOnly: boolean;
  setBusyOnly: Dispatch<SetStateAction<boolean>>;
  sort: DiscoverSort;
  setSort: Dispatch<SetStateAction<DiscoverSort>>;
  filter: "all" | CommunityType;
  setFilter: Dispatch<SetStateAction<"all" | CommunityType>>;
  allForCounts: Community[];
  countsHasNext: boolean;
  resultCount: number;
  hasActiveRefinement: boolean;
  /** Hidden while the initial load or a "Most active"/"Busy this week" drain
   *  is in flight — the count would otherwise flash a wrong partial number. */
  showResline: boolean;
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.controlsRow}>
        <SearchInput
          className={styles.search}
          value={searchInput}
          onChange={setSearchInput}
          placeholder={t("communities:discover.search.placeholder")}
          ariaLabel={t("communities:discover.search.ariaLabel")}
        />

        <div className={styles.toggles}>
          <button
            type="button"
            aria-pressed={openOnly}
            className={[styles.toggle, openOnly && styles.toggleOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setOpenOnly((value) => !value)}
          >
            <span className={styles.toggleDot} aria-hidden />
            {t("communities:discover.toggle.openOnly")}
          </button>
          <button
            type="button"
            aria-pressed={busyOnly}
            className={[styles.toggle, busyOnly && styles.toggleOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setBusyOnly((value) => !value)}
          >
            <span className={styles.toggleDot} aria-hidden />
            {t("communities:discover.toggle.busyOnly")}
          </button>
        </div>

        <label className={styles.sort}>
          <span className={styles.sortLabel}>
            {t("communities:discover.sort.label")}
          </span>
          <Select
            size="sm"
            value={sort}
            options={SORT_OPTIONS.map((option) => ({
              value: option,
              label: t(`communities:discover.sort.${option}`),
            }))}
            onChange={(next) => setSort((next as DiscoverSort) ?? sort)}
          />
        </label>
      </div>

      <Reveal className={styles.filters}>
        {FILTERS.map((option) => {
          const count = countsHasNext
            ? null
            : allForCounts.filter(
                (community) =>
                  option.value === "all" || community.type === option.value,
              ).length;
          return (
            <button
              type="button"
              key={option.value}
              className={[
                styles.chip,
                filter === option.value && styles.chipActive,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setFilter(option.value)}
            >
              {t(option.labelKey)}
              {count !== null && (
                <span className={styles.chipCount}>{count}</span>
              )}
            </button>
          );
        })}
      </Reveal>

      {showResline && (
        <div className={styles.resline}>
          <span>
            {t("communities:discover.resline.count", { count: resultCount })}{" "}
            · {t(`communities:discover.sort.${sort}`)}
          </span>
          {hasActiveRefinement && (
            <button
              type="button"
              className={styles.reset}
              onClick={() => {
                setSearchInput("");
                setFilter("all");
                setOpenOnly(false);
                setBusyOnly(false);
                setSort("newest");
              }}
            >
              {t("communities:discover.resline.reset")}
            </button>
          )}
        </div>
      )}
    </>
  );
}
