import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  Button,
  Reveal,
  SearchInput,
  Select,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CommunityType } from "../homepage/data/types";
import { CommunitiesTagsFilter } from "./CommunitiesTagsFilter";
import type { DiscoverCategoryCounts } from "./useDiscoverCategoryCounts";
import {
  FILTERS,
  SORT_OPTIONS,
  type DiscoverSort,
} from "./communitiesDiscover.data";
import styles from "./CommunitiesPage.module.css";

/**
 * The communities grid's whole filter/sort bar: search, the two pill toggles
 * ("Open to all" / "Busy this week"), the sort select, the category chips
 * (with their stable, whole-pool counts), and the results line underneath.
 * Split out of `CommunitiesDiscover` purely to keep that component under the
 * repo's 200-line cap — every prop below is either page-level state or its
 * own `setState` (passed straight through, no wrapper callbacks needed).
 */
export function CommunitiesDiscoverControls({
  searchInput,
  setSearchInput,
  isOpenOnly,
  setIsOpenOnly,
  isBusyOnly,
  setIsBusyOnly,
  sort,
  setSort,
  filter,
  setFilter,
  tagIds,
  setTagIds,
  categoryCounts,
  resultCount,
  hasActiveRefinement,
  onReset,
  isShowingResline,
  afterFilters,
}: {
  searchInput: string;
  setSearchInput: Dispatch<SetStateAction<string>>;
  isOpenOnly: boolean;
  setIsOpenOnly: Dispatch<SetStateAction<boolean>>;
  isBusyOnly: boolean;
  setIsBusyOnly: Dispatch<SetStateAction<boolean>>;
  sort: DiscoverSort;
  setSort: Dispatch<SetStateAction<DiscoverSort>>;
  filter: "all" | CommunityType;
  setFilter: Dispatch<SetStateAction<"all" | CommunityType>>;
  tagIds: string[];
  setTagIds: Dispatch<SetStateAction<string[]>>;
  /** Per-type totals, `null` for a chip whose count hasn't landed yet. */
  categoryCounts: DiscoverCategoryCounts;
  resultCount: number;
  hasActiveRefinement: boolean;
  onReset: () => void;
  /** Hidden while the initial load or a "Most active"/"Busy this week" drain
   *  is in flight — the count would otherwise flash a wrong partial number. */
  isShowingResline: boolean;
  /** Slot between the category chips and the results line — the "My
   *  communities" tab puts its weekly digest here. */
  afterFilters?: ReactNode;
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
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={isOpenOnly}
            className={[styles.toggle, isOpenOnly && styles.toggleOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setIsOpenOnly((value) => !value)}
          >
            <span className={styles.toggleDot} aria-hidden />
            {t("communities:discover.toggle.openOnly")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={isBusyOnly}
            className={[styles.toggle, isBusyOnly && styles.toggleOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setIsBusyOnly((value) => !value)}
          >
            <span className={styles.toggleDot} aria-hidden />
            {t("communities:discover.toggle.busyOnly")}
          </Button>
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
          const count = categoryCounts[option.value];
          return (
            <Button
              variant="ghost"
              size="sm"
              key={option.value}
              // The chips are a single-select filter, so each one announces
              // whether it is the one currently applied.
              aria-pressed={filter === option.value}
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
            </Button>
          );
        })}
      </Reveal>

      <CommunitiesTagsFilter selectedTagIds={tagIds} onChange={setTagIds} />

      {afterFilters}

      {isShowingResline && (
        <div className={styles.resline}>
          {/* The middot between the two halves lives in CSS, so no catalog
              value ever has to carry a punctuation glyph. */}
          <span className={styles.reslineText}>
            {t("communities:discover.resline.count", { count: resultCount })}
            <span className={styles.reslineSort}>
              {t(`communities:discover.sort.${sort}`)}
            </span>
          </span>
          {hasActiveRefinement && (
            <Button
              variant="ghost"
              size="sm"
              className={styles.reset}
              onClick={onReset}
            >
              {t("communities:discover.resline.reset")}
            </Button>
          )}
        </div>
      )}
    </>
  );
}
