import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { formatRelative } from "../../shared/lib/date";
import { categoryLabel } from "../marketing/localCategories";
import { AdminChip } from "./ui";
import { ListingModerationActions } from "./ListingModerationActions";
import { ListingRowThumb } from "./ListingRowThumb";
import { listingAgeLabel, listingProvenanceLabel } from "./listingProvenance";
import {
  LISTING_STATUS_TONE,
  type ListingQueueRow,
} from "./api/adminListings.api";
import styles from "./AdminListingRows.module.css";

/**
 * One row of the listings moderation queue: checkbox, thumb, the listing
 * (name, then category · neighbourhood · ref), who it came from, its status,
 * and the row's action cluster. The name is a real button whose stretched
 * `::after` covers the row, so a click anywhere on the row opens the preview
 * drawer. The checkbox and actions cells sit above that target, so picking a
 * row for bulk action or moderating it never also opens it.
 */
export function AdminListingRow({
  row,
  isSelected,
  isSelectDisabled,
  onOpen,
  onToggle,
}: {
  row: ListingQueueRow;
  isSelected: boolean;
  /** Disables the checkbox while unselected and the selection is at the bulk
   *  cap. A selected row's own checkbox stays enabled so it can be deselected. */
  isSelectDisabled: boolean;
  onOpen: (row: ListingQueueRow) => void;
  onToggle: (ref: string) => void;
}) {
  const { t } = useTranslation();
  const formatContext = useFormat();
  const ageLabel = listingAgeLabel(
    row,
    t,
    formatRelative(row.createdAt, formatContext),
  );
  const primaryCategory = row.detail.cats[0];
  const placeParts = [
    primaryCategory ? categoryLabel(t, primaryCategory) : "",
    row.hood,
  ].filter(Boolean);

  return (
    <div
      className={[styles.row, isSelected && styles.rowSelected]
        .filter(Boolean)
        .join(" ")}
    >
      <label className={`${styles.cellCheck} ${styles.checkHit}`}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={isSelected}
          disabled={isSelectDisabled}
          onChange={() => onToggle(row.ref)}
          aria-label={t("admin:adminListings.selectRow.ariaLabel", {
            name: row.name,
          })}
        />
      </label>
      <ListingRowThumb row={row} />
      <div className={styles.cellMain}>
        <button
          type="button"
          className={styles.rowOpen}
          onClick={() => onOpen(row)}
          aria-label={t("admin:adminListings.row.openAriaLabel", {
            name: row.name,
          })}
        >
          {row.name}
        </button>
        <p className={styles.rowMeta}>
          {placeParts.length > 0 && `${placeParts.join(" · ")} · `}
          <span className={styles.rowRef}>{row.ref}</span>
        </p>
      </div>
      <div className={styles.cellWho}>
        <p className={styles.whoLine}>{listingProvenanceLabel(row, t)}</p>
        {ageLabel && <p className={styles.ageLine}>{ageLabel}</p>}
      </div>
      <div className={styles.cellStatus}>
        <AdminChip tone={LISTING_STATUS_TONE[row.status]} dot>
          {t(`admin:adminListings.status.${row.status}`)}
        </AdminChip>
      </div>
      <div className={styles.cellActions}>
        <ListingModerationActions variant="row" row={row} />
      </div>
    </div>
  );
}
