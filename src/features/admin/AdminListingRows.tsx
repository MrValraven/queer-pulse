import { useEffect, useRef } from "react";
import { Button, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { formatRelative } from "../../shared/lib/date";
import { AdminChip } from "./ui";
import { ListingModerationActions } from "./ListingModerationActions";
import { EmptyQueueState } from "./EmptyQueueState";
import {
  LISTING_STATUS_TONE,
  type ListingQueueRow,
} from "./api/adminListings.api";
import styles from "./AdminListingsPage.module.css";

export function AdminListingRows({
  rows,
  selectedRefs,
  atSelectionCap,
  animateEntrance,
  onOpen,
  onToggle,
  onToggleAll,
}: {
  rows: ListingQueueRow[];
  /** Refs currently selected for bulk action — controlled by the page so it
   *  can survive filter/sort changes and drive `<BulkActionBar>`. */
  selectedRefs: Set<string>;
  /** True once the selection has hit the bulk-action cap
   *  (`LISTING_BULK_ACTION_CAP`, mirroring the backend's `@ArrayMaxSize(200)`).
   *  Disables any checkbox that would ADD to the selection — an already-selected
   *  row (or "select all" when every visible row is already picked) stays
   *  enabled so a moderator can still deselect down from the cap. */
  atSelectionCap: boolean;
  /** Whether new rows should stagger-fade in. The page flips this to `false`
   *  the moment the moderator first touches the status/search/sort controls,
   *  so only the list's genuine first mount cascades in — switching tabs
   *  after that renders instantly instead of re-triggering the entrance
   *  animation on every row. See `AdminListingsPage`'s `handleHeaderChange`. */
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
  const allSelected = rows.length > 0 && selectedVisibleCount === rows.length;
  const someSelected = selectedVisibleCount > 0 && !allSelected;
  const hasSelection = selectedRefs.size > 0;

  // `indeterminate` isn't a settable HTML attribute — only a DOM property —
  // so it has to be imperative rather than a prop, same as `DraftsTabs`'s
  // select-all checkbox.
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  if (rows.length === 0) {
    return <EmptyQueueState />;
  }
  return (
    <div
      className={[styles.rows, hasSelection && styles.rowsWithBulkBar]
        .filter(Boolean)
        .join(" ")}
    >
      <label className={styles.selectAllRow}>
        <input
          ref={selectAllRef}
          type="checkbox"
          className={styles.rowCheckbox}
          checked={allSelected}
          disabled={atSelectionCap && !allSelected}
          onChange={() => onToggleAll()}
          aria-label={t("admin:adminListings.selectAll.ariaLabel")}
        />
        <span>{t("admin:adminListings.selectAll.label")}</span>
      </label>
      {rows.map((row, index) =>
        animateEntrance ? (
          <FadeIn
            key={row.ref}
            delay={Math.min(index, 8) * 50}
            className={styles.rowFade}
          >
            <AdminListingRow
              row={row}
              selected={selectedRefs.has(row.ref)}
              disableSelect={atSelectionCap && !selectedRefs.has(row.ref)}
              onOpen={onOpen}
              onToggle={onToggle}
            />
          </FadeIn>
        ) : (
          <AdminListingRow
            key={row.ref}
            row={row}
            selected={selectedRefs.has(row.ref)}
            disableSelect={atSelectionCap && !selectedRefs.has(row.ref)}
            onOpen={onOpen}
            onToggle={onToggle}
          />
        ),
      )}
    </div>
  );
}

function AdminListingRow({
  row,
  selected,
  disableSelect,
  onOpen,
  onToggle,
}: {
  row: ListingQueueRow;
  selected: boolean;
  /** Disables the checkbox while unselected and the selection is at the bulk
   *  cap — a selected row's own checkbox stays enabled so it can be deselected. */
  disableSelect: boolean;
  onOpen: (row: ListingQueueRow) => void;
  onToggle: (ref: string) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const ageText = formatRelative(row.createdAt, fmt);

  return (
    <div className={styles.row}>
      {/* A sibling of `.rowMain`, never nested inside it — the row-open
          region below is a `role="button"` that opens the drawer on click, and
          this needs its own independent click target so picking a row for
          bulk action never also opens it. */}
      <input
        type="checkbox"
        className={styles.rowCheckbox}
        checked={selected}
        disabled={disableSelect}
        onChange={() => onToggle(row.ref)}
        onClick={(event) => event.stopPropagation()}
        aria-label={t("admin:adminListings.selectRow.ariaLabel", {
          name: row.name,
        })}
      />
      <div
        className={styles.rowMain}
        role="button"
        tabIndex={0}
        onClick={() => onOpen(row)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen(row);
          }
        }}
      >
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{row.name}</span>
          <AdminChip tone={LISTING_STATUS_TONE[row.status]} dot>
            {t(`admin:adminListings.status.${row.status}`)}
          </AdminChip>
        </div>
        <div className={styles.rowMeta}>
          {row.ref} ·{" "}
          {row.submitterName || t("admin:adminListings.unknownSubmitter")}
          {row.hood ? ` · ${row.hood}` : ""}
          {ageText
            ? ` · ${t("admin:adminListings.row.submittedAgo", { time: ageText })}`
            : ""}
        </div>
      </div>
      <div className={styles.rowActions}>
        <Button variant="ghost" size="md" onClick={() => onOpen(row)}>
          {t("admin:adminListings.viewCta")}
        </Button>
        <ListingModerationActions variant="row" row={row} />
      </div>
    </div>
  );
}
