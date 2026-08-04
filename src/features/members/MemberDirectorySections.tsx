import { useId } from "react";
import { FiSearch, FiSliders, FiUsers } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FadeIn,
  FeatureHelp,
  ModalSheet,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import {
  SORTS,
  SORT_LABEL_KEY,
  type AppliedChip,
  type FilterState,
  type SortKey,
  type MemberCard,
} from "./memberDirectoryFilter.data";
import { type SectionKey } from "./FilterSection";
import {
  FiltersSidebar,
  MemberResultCard,
  MemberResultSkeleton,
} from "./MemberFilterCards";
import styles from "./MemberDirectoryFilterPage.module.css";

/** Remove one value from whichever filter group a chip belongs to. */
function removeChip(
  filters: FilterState,
  chip: AppliedChip,
): FilterState {
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
        <Translation i18nKey="members:directory.lead" components={{ b: <b /> }} />
      </p>
    </FadeIn>
  );
}

export interface MemberResultsColumnProps {
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
  shownWindowed: MemberCard[];
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  hasMoreWindowed: boolean;
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
  shownWindowed,
  sentinelRef,
  hasMoreWindowed,
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

  return (
    <div>
      <div className={styles.topRow}>
        <div className={styles.count}>
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
            <select
              value={sort}
              aria-labelledby={sortLabelId}
              onChange={(e) => onSort(e.target.value as SortKey)}
            >
              {SORTS.map((sortKey) => (
                <option key={sortKey} value={sortKey}>
                  {t(SORT_LABEL_KEY[sortKey])}
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
                onClick={() => onApplyFilters(removeChip(filters, chip))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

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
        <>
          <div className={styles.mGrid}>
            {shownWindowed.map((member, index) => (
              <FadeIn
                key={`${member.slug}-${index}`}
                delay={Math.min(index, 9) * 85}
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
