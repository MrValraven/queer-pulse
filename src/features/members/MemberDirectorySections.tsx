import { FiSearch, FiUsers } from "react-icons/fi";
import {
  EmptyState,
  LoadMoreFooter,
  SearchInput,
} from "../../shared/components/ui";
import {
  AppliedChipsRow,
  FilterPageHeader,
  FilterResultsTop,
  FilterSortControl,
  FiltersSheet,
  FiltersToggleButton,
  filterPageClassNames,
} from "../../shared/components/filterPage";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import {
  SORTS,
  SORT_LABEL_KEY,
  removeChip,
  type AppliedChip,
  type DirectoryFacetCounts,
  type FilterState,
  type SortKey,
  type MemberCard,
} from "./memberDirectoryFilter.data";
import { type SectionKey } from "./filterSectionKeys";
import type { MemberDirectorySearch } from "./useMemberDirectoryQuery";
import { FiltersSidebar } from "./MemberFilterCards";
import {
  MemberResultsGrid,
  MemberResultsSkeletonGrid,
} from "./MemberResultsGrid";
import styles from "./MemberDirectoryFilterPage.module.css";

/** The figure the headline rolls up from when it first appears. */
const HEADLINE_ROLL_FROM = 1;

/** The counted-population headline. The figure mounts at 1 and rolls up to
 *  the real count, so the reveal and every later change share one motion.
 *  Reduced motion shows the real count straight away. */
export function MemberDirectoryHeader({
  totalMembers,
}: {
  totalMembers: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const rollFrom = Math.min(HEADLINE_ROLL_FROM, totalMembers);
  return (
    <FilterPageHeader
      eyebrow={t("members:directory.eyebrow")}
      title={
        <>
          {t("members:directory.findPrefix")}
          <em>
            <span
              className={styles.tally}
              style={{ minWidth: `${fmt.number(totalMembers).length}ch` }}
            >
              <RollingNumber
                value={fmt.number(totalMembers)}
                numericValue={totalMembers}
                revealFrom={{
                  value: fmt.number(rollFrom),
                  numericValue: rollFrom,
                }}
              />
            </span>{" "}
            {t("members:directory.memberCountSuffix", { count: totalMembers })}
          </em>{" "}
          {t("members:directory.findSuffix")}
        </>
      }
      lead={
        <Translation
          i18nKey="members:directory.lead"
          components={{ b: <b /> }}
        />
      }
    />
  );
}

export interface MemberResultsColumnProps {
  /** The name-search box's value and setter. The term itself is already
   *  folded into `hasActiveFilters`, so a search that matches nobody lands on
   *  the "nothing matched, clear it" state, which differs from "no members
   *  yet". */
  search: MemberDirectorySearch;
  filters: FilterState;
  sort: SortKey;
  onSort: (sort: SortKey) => void;
  chips: AppliedChip[];
  onApplyFilters: (filters: FilterState) => void;
  onResetAll: () => void;
  isMobile: boolean;
  panelOpen: boolean;
  onTogglePanel: () => void;
  onOpenFilters: () => void;
  loading: boolean;
  shown: MemberCard[];
  hasActiveFilters: boolean;
  totalMembers: number;
  filteredCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  /** The latest "Load more" failed; the loaded cards stay (ENG-501). */
  isFetchNextPageError: boolean;
  onFetchNextPage: () => void;
}

/** The right-hand results column: count row + sort, applied chips, the card
 *  grid (with skeleton / empty states), and the "load more" pager. */
export function MemberResultsColumn({
  search,
  filters,
  sort,
  onSort,
  chips,
  onApplyFilters,
  onResetAll,
  isMobile,
  panelOpen,
  onTogglePanel,
  onOpenFilters,
  loading,
  shown,
  hasActiveFilters,
  totalMembers,
  filteredCount,
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  onFetchNextPage,
}: MemberResultsColumnProps) {
  const { t } = useTranslation();
  const fmt = useFormat();

  return (
    <div>
      <FilterResultsTop
        search={
          <SearchInput
            className={filterPageClassNames.search}
            value={search.input}
            onChange={search.onChange}
            placeholder={t("members:directory.searchPlaceholder")}
            ariaLabel={t("members:directory.searchLabel")}
          />
        }
        count={
          <>
            {t("members:directory.showingPrefix")}{" "}
            <b>
              <em>
                <RollingNumber
                  value={fmt.number(filteredCount)}
                  numericValue={filteredCount}
                />
              </em>
            </b>{" "}
            {t("members:directory.showingOf")} {fmt.number(totalMembers)}{" "}
            {t("members:directory.memberCountLabel", { count: totalMembers })}
          </>
        }
        filtersButton={
          <FiltersToggleButton
            isMobile={isMobile}
            isPanelOpen={panelOpen}
            onTogglePanel={onTogglePanel}
            onOpenSheet={onOpenFilters}
            activeCount={chips.length}
          />
        }
        controls={
          <FilterSortControl
            label={t("members:directory.sortLabel")}
            value={sort}
            options={SORTS.map((sortKey) => ({
              value: sortKey,
              label: t(SORT_LABEL_KEY[sortKey]),
            }))}
            onChange={onSort}
          />
        }
      />

      <AppliedChipsRow
        chips={chips.map((chip) => ({
          key: `${chip.group}:${chip.value}`,
          label: chip.label,
          onRemove: () => onApplyFilters(removeChip(filters, chip)),
        }))}
      />

      {loading ? (
        <MemberResultsSkeletonGrid />
      ) : shown.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon={<FiSearch />}
            title={t("members:directory.emptyFiltered.title")}
            description={t("members:directory.emptyFiltered.description")}
            action={{
              label: t("members:directory.clearFiltersCta"),
              onClick: onResetAll,
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
        <MemberResultsGrid members={shown} />
      )}

      {hasNextPage && (
        <LoadMoreFooter
          className={styles.loadMore}
          isFetchingNextPage={isFetchingNextPage}
          isFetchNextPageError={isFetchNextPageError}
          onLoadMore={onFetchNextPage}
          errorMessage={t("common:error.loadMore")}
          label={t("members:directory.loadMoreCta")}
          loadingLabel={t("members:directory.loadingMore")}
        />
      )}
    </div>
  );
}

/** The mobile bottom-sheet wrapper around the filters sidebar. */
export function MemberFiltersSheet({
  filters,
  members,
  facets,
  countsAreStale,
  appliedCount,
  filteredCount,
  sectionsOpen,
  onToggleSection,
  onApplyFilters,
  onClearAll,
  onClose,
}: {
  filters: FilterState;
  members: MemberCard[];
  facets?: DirectoryFacetCounts;
  countsAreStale: boolean;
  appliedCount: number;
  filteredCount: number;
  sectionsOpen: Record<SectionKey, boolean>;
  onToggleSection: (key: SectionKey) => void;
  onApplyFilters: (filters: FilterState) => void;
  onClearAll: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <FiltersSheet
      title={t("members:directory.filtersSheetLabel")}
      showResultsLabel={
        <Translation
          i18nKey="members:directory.showResultsCta"
          values={{ count: filteredCount }}
          slots={{
            count: (
              <RollingNumber
                value={fmt.number(filteredCount)}
                numericValue={filteredCount}
              />
            ),
          }}
        />
      }
      onClose={onClose}
    >
      <FiltersSidebar
        inSheet
        filters={filters}
        members={members}
        facets={facets}
        countsAreStale={countsAreStale}
        appliedCount={appliedCount}
        sectionsOpen={sectionsOpen}
        onToggleSection={onToggleSection}
        onChange={onApplyFilters}
        onClearAll={onClearAll}
      />
    </FiltersSheet>
  );
}
