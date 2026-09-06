import { useId } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiSearch, FiSliders, FiUsers, FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
  Button,
  EmptyState,
  FadeIn,
  FeatureHelp,
  ModalSheet,
  SearchInput,
  Select,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import {
  SORTS,
  SORT_LABEL_KEY,
  type AppliedChip,
  type DirectoryFacetCounts,
  type FilterState,
  type SortKey,
  type MemberCard,
} from "./memberDirectoryFilter.data";
import { type SectionKey } from "./filterSectionKeys";
import type { MemberDirectorySearch } from "./useMemberDirectoryQuery";
import { FiltersSidebar, MemberResultSkeleton } from "./MemberFilterCards";
import { MemberResultsGrid } from "./MemberResultsGrid";
import styles from "./MemberDirectoryFilterPage.module.css";

/** Remove one value from whichever filter group a chip belongs to. */
function removeChip(filters: FilterState, chip: AppliedChip): FilterState {
  const drop = (values: string[]) => values.filter((v) => v !== chip.value);
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
export function MemberHeaderSkeleton() {
  return (
    <div className={styles.head} aria-busy="true" aria-hidden="true">
      <SkeletonLine width={200} height={11} style={{ marginBottom: 14 }} />
      <SkeletonLine width="70%" height={48} style={{ marginBottom: 16 }} />
      <SkeletonLine width="100%" height={13} style={{ marginTop: 4 }} />
      <SkeletonLine width="45%" height={13} style={{ marginTop: 8 }} />
    </div>
  );
}

/** The counted-population headline. */
export function MemberDirectoryHeader({
  totalMembers,
  countedTotal,
}: {
  totalMembers: number;
  countedTotal: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <FadeIn as="header" className={styles.head}>
      <div className={styles.eyebrow}>{t("members:directory.eyebrow")}</div>
      <h1 className={styles.h1}>
        {t("members:directory.findPrefix")}
        <em>
          <span
            className={styles.tally}
            style={{ minWidth: `${fmt.number(totalMembers).length}ch` }}
          >
            {fmt.number(countedTotal)}
          </span>{" "}
          {t("members:directory.memberCountSuffix", { count: totalMembers })}
        </em>{" "}
        {t("members:directory.findSuffix")}
        <FeatureHelp id="members.hub" />
      </h1>
      <p className={styles.lead}>
        <Translation
          i18nKey="members:directory.lead"
          components={{ b: <b /> }}
        />
      </p>
    </FadeIn>
  );
}

export interface MemberResultsColumnProps {
  /** The name-search box's value and setter. The term itself is already
   *  folded into `hasActiveFilters`, so a search that matches nobody lands on
   *  the "nothing matched, clear it" state rather than "no members yet". */
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
  onFetchNextPage,
}: MemberResultsColumnProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const sortLabelId = useId();
  const { reducedMotion } = useMotionPrefs();

  return (
    <div>
      <div className={styles.searchRow}>
        <SearchInput
          className={styles.directorySearch}
          value={search.input}
          onChange={search.onChange}
          placeholder={t("members:directory.searchPlaceholder")}
          ariaLabel={t("members:directory.searchLabel")}
        />
      </div>

      <div className={styles.topRow}>
        {/* The count answers the search as it is typed, so it is announced
            rather than only redrawn. Atomic, because the sentence only means
            anything whole. */}
        <div className={styles.count} aria-live="polite" aria-atomic="true">
          {t("members:directory.showingPrefix")}{" "}
          <b>
            <em>{fmt.number(filteredCount)}</em>
          </b>{" "}
          {t("members:directory.showingOf")} {fmt.number(totalMembers)}{" "}
          {t("members:directory.memberCountLabel", { count: totalMembers })}
        </div>
        <div className={styles.topControls}>
          <button
            type="button"
            className={styles.filtersBtn}
            aria-expanded={isMobile ? undefined : panelOpen}
            onClick={isMobile ? onOpenFilters : onTogglePanel}
          >
            <FiSliders aria-hidden />
            {!isMobile && panelOpen
              ? t("members:directory.hideFiltersCta")
              : t("members:directory.filtersCta")}
            {chips.length > 0 && (
              <span className={styles.filtersBtnCount}>
                {fmt.number(chips.length)}
              </span>
            )}
          </button>
          <div className={styles.sort}>
            <span id={sortLabelId} className={styles.sortLabel}>
              {t("members:directory.sortLabel")}
            </span>
            <Select
              size="sm"
              labelledBy={sortLabelId}
              options={SORTS.map((sortKey) => ({
                value: sortKey,
                label: t(SORT_LABEL_KEY[sortKey]),
              }))}
              value={sort}
              onChange={(value) => onSort(value as SortKey)}
            />
          </div>
        </div>
      </div>

      {/* Always mounted so a chip removed one at a time can play its exit
          animation; `.appliedRow:empty` hides the row once the last exit
          finishes. `initial={false}` keeps chips already applied on arrival
          from animating in on mount — only chips added later do. */}
      <div className={styles.appliedRow}>
        <AnimatePresence initial={false}>
          {chips.map((chip) => (
            <m.span
              key={`${chip.group}:${chip.value}`}
              className={styles.applied}
              layout={!reducedMotion}
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.86 }}
              transition={{
                duration: reducedMotion ? 0 : 0.22,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {chip.label}
              <button
                type="button"
                aria-label={t("members:directory.removeChipLabel", {
                  label: chip.label,
                })}
                onClick={() => onApplyFilters(removeChip(filters, chip))}
              >
                <FiX aria-hidden />
              </button>
            </m.span>
          ))}
        </AnimatePresence>
      </div>

      {loading ? (
        <div className={styles.mGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <MemberResultSkeleton key={index} />
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
        <div className={styles.loadMore}>
          <Button
            type="button"
            variant="ghost"
            disabled={isFetchingNextPage}
            onClick={onFetchNextPage}
          >
            {isFetchingNextPage
              ? t("members:directory.loadingMore")
              : t("members:directory.loadMoreCta")}
          </Button>
        </div>
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
  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("members:directory.filtersSheetLabel")}
    >
      <h2 className={styles.sheetTitle}>
        {t("members:directory.filtersSheetLabel")}
      </h2>
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
      <div className={styles.sheetFoot}>
        <Button type="button" variant="primary" onClick={onClose}>
          {t("members:directory.showResultsCta", { count: filteredCount })}
        </Button>
      </div>
    </ModalSheet>
  );
}
