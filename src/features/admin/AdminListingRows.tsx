import { useEffect, useRef } from "react";
import { FiInbox, FiSearch } from "react-icons/fi";
import { EmptyState, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminListingRow } from "./AdminListingRow";
import { EmptyQueueState } from "./EmptyQueueState";
import type {
  AdminListingsStatusFilter,
  ListingQueueRow,
} from "./api/adminListings.api";
import styles from "./AdminListingRows.module.css";

/** Words the empty body by its cause: a search that matched nothing, an empty
 *  status tab, or a truly clear queue (the only one that earns a celebration). */
function ListingRowsEmpty({
  searchQuery,
  statusFilter,
}: {
  searchQuery: string;
  statusFilter: AdminListingsStatusFilter;
}) {
  const { t } = useTranslation();
  const trimmedQuery = searchQuery.trim();
  if (!trimmedQuery && statusFilter === "all") return <EmptyQueueState />;
  return trimmedQuery ? (
    <EmptyState
      icon={<FiSearch />}
      title={t("admin:adminListings.noMatch.title", { query: trimmedQuery })}
      description={t("admin:adminListings.noMatch.body")}
    />
  ) : (
    <EmptyState
      icon={<FiInbox />}
      title={t("admin:adminListings.emptyTab.title", {
        status: t(`admin:adminListings.filter.${statusFilter}`),
      })}
      description={t("admin:adminListings.emptyTab.body")}
    />
  );
}

export function AdminListingRows({
  rows,
  searchQuery,
  statusFilter,
  selectedRefs,
  atSelectionCap,
  animateEntrance,
  onOpen,
  onToggle,
  onToggleAll,
}: {
  rows: ListingQueueRow[];
  /** The page's search text and status tab, read to word the empty body. */
  searchQuery: string;
  statusFilter: AdminListingsStatusFilter;
  /** Refs picked for bulk action, owned by the page for `<BulkActionBar>`. */
  selectedRefs: Set<string>;
  /** True at `LISTING_BULK_ACTION_CAP`: checkboxes that would ADD are disabled,
   *  and selected ones stay enabled so a moderator can deselect down. */
  atSelectionCap: boolean;
  /** Stagger-fades rows in on first mount only; the page clears it on the first
   *  control change (`handleHeaderChange`), so later tabs render at once. */
  animateEntrance: boolean;
  onOpen: (row: ListingQueueRow) => void;
  onToggle: (ref: string) => void;
  /** Selects/deselects every currently-visible (`rows`) ref at once. */
  onToggleAll: () => void;
}) {
  const { t } = useTranslation();
  const selectAllRef = useRef<HTMLInputElement>(null);
  const selectedVisibleCount = rows.filter((row) =>
    selectedRefs.has(row.ref),
  ).length;
  const isEverySelected =
    rows.length > 0 && selectedVisibleCount === rows.length;
  const isSomeSelected = selectedVisibleCount > 0 && !isEverySelected;
  // `indeterminate` is a DOM property with no HTML attribute: set imperatively.
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  if (rows.length === 0) {
    return (
      <div className={styles.emptyBody}>
        <ListingRowsEmpty
          searchQuery={searchQuery}
          statusFilter={statusFilter}
        />
      </div>
    );
  }
  return (
    <div className={styles.rows}>
      <div className={styles.columnHeader}>
        <label
          className={`${styles.cellCheck} ${styles.checkHit} ${styles.selectAll}`}
        >
          <input
            ref={selectAllRef}
            type="checkbox"
            className={styles.checkbox}
            checked={isEverySelected}
            disabled={atSelectionCap && !isEverySelected}
            onChange={() => onToggleAll()}
            aria-label={t("admin:adminListings.selectAll.ariaLabel")}
          />
          <span className={styles.selectAllText}>
            {t("admin:adminListings.selectAll.label")}
          </span>
        </label>
        <span className={styles.columnListing}>
          {t("admin:adminListings.columns.listing")}
        </span>
        <span className={styles.columnWho}>
          {t("admin:adminListings.columns.submitter")}
        </span>
        <span className={styles.columnStatus}>
          {t("admin:adminListings.columns.status")}
        </span>
        <span className="visuallyHidden">
          {t("admin:adminListings.columns.actions")}
        </span>
      </div>
      {rows.map((row, index) => {
        const rowElement = (
          <AdminListingRow
            key={row.ref}
            row={row}
            isSelected={selectedRefs.has(row.ref)}
            isSelectDisabled={atSelectionCap && !selectedRefs.has(row.ref)}
            onOpen={onOpen}
            onToggle={onToggle}
          />
        );
        return animateEntrance ? (
          <FadeIn
            key={row.ref}
            delay={Math.min(index, 8) * 50}
            className={styles.rowFade}
          >
            {rowElement}
          </FadeIn>
        ) : (
          rowElement
        );
      })}
    </div>
  );
}

const SKELETON_ROW_KEYS = [0, 1, 2, 3];

/** Loading state for the queue panel body: the column header's band, then
 *  four rows shaped like real ones (checkbox, thumb, two lines, chip). */
export function ListingRowsSkeleton() {
  return (
    <div className={styles.rows} aria-hidden="true">
      <div className={styles.columnHeader} />
      {SKELETON_ROW_KEYS.map((skeletonKey) => (
        <div
          key={skeletonKey}
          className={`${styles.row} ${styles.skeletonRow}`}
        >
          <div className={styles.cellCheck}>
            <SkeletonLine
              width={20}
              height={20}
              style={{ borderRadius: "var(--radius-6)" }}
            />
          </div>
          <div className={`${styles.cellThumb} ${styles.thumb}`}>
            <SkeletonLine
              width="100%"
              height="100%"
              style={{ borderRadius: "var(--radius-12)" }}
            />
          </div>
          <div className={`${styles.cellMain} ${styles.skeletonLines}`}>
            <SkeletonLine width="58%" height={16} />
            <SkeletonLine width="36%" height={12} />
          </div>
          <div className={styles.cellWho}>
            <SkeletonLine width="64%" height={12} />
          </div>
          <div className={styles.cellStatus}>
            <SkeletonLine
              width={76}
              height={22}
              style={{ borderRadius: "var(--radius-pill)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
