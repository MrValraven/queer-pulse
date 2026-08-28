import {
  useId,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  ActiveFilters,
  Button,
  RefineGroup,
  RefinePanel,
  RefineSplit,
  RefineToggle,
  SearchInput,
  Select,
} from "../../shared/components/ui";
import { useRefineDrawer } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CommunityType } from "../homepage/data/types";
import { CommunitiesCategoryFilter } from "./CommunitiesCategoryFilter";
import { CommunitiesTagsFilter } from "./CommunitiesTagsFilter";
import { useCommunitiesActiveFilters } from "./useCommunitiesActiveFilters";
import type { DiscoverCategoryCounts } from "./useDiscoverCategoryCounts";
import { SORT_OPTIONS, type DiscoverSort } from "./communitiesDiscover.data";
import styles from "./CommunitiesPage.module.css";

/**
 * The communities grid's whole filter/sort bar: a search field and one
 * "Refine" toggle on a single row, with every group (category, sort, the two
 * pill toggles, tags) in the drawer below, and the results line underneath.
 *
 * The groups live behind the toggle for the same reason the Local directory's
 * do: seven category chips, a tags tray and two toggles standing open pushed
 * the first community card most of the way down the fold, for controls most
 * visitors set once or never. What IS always on screen is the chip row saying
 * what is currently narrowing the list, so a closed drawer hides the controls
 * without hiding their state.
 *
 * Split out of `CommunitiesGrid` purely to keep that component under the
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
  /** Drops every refinement at once, behind the chip row's "Clear all". */
  onReset: () => void;
  /** Hidden while the initial load or a "Most active"/"Busy this week" drain
   *  is in flight — the count would otherwise flash a wrong partial number. */
  isShowingResline: boolean;
  /** Slot between the filter bar and the results line — the "My communities"
   *  tab puts its weekly digest here. */
  afterFilters?: ReactNode;
}) {
  const { t } = useTranslation();
  const refine = useRefineDrawer("qp.communities.refineOpen");
  const sortLabelId = useId();
  const togglesLabelId = useId();
  const activeFilters = useCommunitiesActiveFilters({
    searchInput,
    setSearchInput,
    filter,
    setFilter,
    isOpenOnly,
    setIsOpenOnly,
    isBusyOnly,
    setIsBusyOnly,
    tagIds,
    setTagIds,
  });
  // The search term shows in the field itself, so the badge counts only what
  // the shut drawer is actually hiding.
  const hiddenFilterCount =
    (filter === "all" ? 0 : 1) +
    (isOpenOnly ? 1 : 0) +
    (isBusyOnly ? 1 : 0) +
    tagIds.length;

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
        <RefineToggle {...refine.toggleProps} activeCount={hiddenFilterCount} />
      </div>

      <RefinePanel {...refine.panelProps}>
        <CommunitiesCategoryFilter
          filter={filter}
          setFilter={setFilter}
          categoryCounts={categoryCounts}
        />

        <RefineSplit>
          <RefineGroup
            label={t("communities:discover.sort.label")}
            labelId={sortLabelId}
          >
            <Select
              size="sm"
              labelledBy={sortLabelId}
              value={sort}
              options={SORT_OPTIONS.map((option) => ({
                value: option,
                label: t(`communities:discover.sort.${option}`),
              }))}
              onChange={(next) => setSort((next as DiscoverSort) ?? sort)}
            />
          </RefineGroup>

          <RefineGroup
            label={t("communities:discover.toggle.groupLabel")}
            labelId={togglesLabelId}
            role="group"
            aria-labelledby={togglesLabelId}
          >
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
          </RefineGroup>
        </RefineSplit>

        <CommunitiesTagsFilter selectedTagIds={tagIds} onChange={setTagIds} />
      </RefinePanel>

      <ActiveFilters filters={activeFilters} onClearFilters={onReset} />

      {afterFilters}

      {/* Just the count and the active sort now: clearing lives on the chip row
          above, beside the chips it clears, rather than in two places. */}
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
        </div>
      )}
    </>
  );
}
