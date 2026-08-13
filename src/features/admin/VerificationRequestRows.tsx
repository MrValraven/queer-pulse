import { useEffect, useRef } from "react";
import { FiAlertTriangle, FiChevronRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { formatRelative } from "../../shared/lib/date";
import { memberRefToPerson } from "../../shared/api/refs";
import { AdminAvatar, AdminChip, type AvatarTone } from "./ui";
import { VERIFICATION_STATUS_TONE } from "./verificationStatusTone";
import { VERIFICATION_REQUEST_STATUS_TONE } from "./verificationRequestStatusTone";
import type { AdminVerificationRequestDTO } from "./api/adminVerifications.api";
import styles from "./AdminSubmissionList.module.css";

/**
 * The Review-queue segment's row list (Task 9), on the same shared
 * `AdminSubmissionList` classes as `AdminVerificationRows` and the
 * concerns/nominations/proposals inboxes — the request queue is one more
 * member of that row family, not a bespoke layout. Each row shows: member,
 * the level they're requesting, the request's own status (distinct from the
 * member's current level — `verificationRequestStatusTone`, not
 * `verificationStatusTone`), when it was submitted, an "Appeal" chip when
 * `isAppeal`, a Phase 3 duplicate-fingerprint warn chip when
 * `row.hasDuplicateSignal` (the full count/detail lives in the drawer's
 * `VerificationSignalsPanel` — this row only needs to flag that it's there),
 * and a trailing "Review" button that opens the drawer via `onOpen(requestId)`.
 *
 * Task 4 adds a leading select-all header checkbox + a per-row checkbox
 * (mirrors `AdminListingRows`'s selection idiom one-for-one) driving the
 * segment's `VerificationBulkActionBar`, and an optional `focusedRequestId`
 * that renders a visible focus ring on one row — the J/K keyboard-navigation
 * highlight, a DIFFERENT concept from the checkbox selection (a reviewer can
 * keyboard-focus a row without selecting it for bulk action).
 */
export function VerificationRequestRows({
  rows,
  onOpen,
  selectedIds,
  onToggle,
  onToggleAll,
  atSelectionCap,
  focusedRequestId,
}: {
  rows: AdminVerificationRequestDTO[];
  onOpen: (requestId: string) => void;
  /** Ids currently selected for bulk action — controlled by the segment so
   *  it can survive filter/sort changes and drive `VerificationBulkActionBar`. */
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  /** Selects/deselects every currently-visible (`rows`) id at once. */
  onToggleAll: () => void;
  /** True once the selection has hit `VERIFICATION_BULK_ACTION_CAP`. Disables
   *  any checkbox that would ADD to the selection — an already-selected row
   *  (or select-all when every visible row is already picked) stays enabled
   *  so a reviewer can still deselect down from the cap. */
  atSelectionCap: boolean;
  /** The id the J/K keyboard shortcuts have focused, or `null` before the
   *  reviewer has pressed either key yet. */
  focusedRequestId: string | null;
}) {
  const { t } = useTranslation();
  const selectAllRef = useRef<HTMLInputElement>(null);
  const selectedVisibleCount = rows.filter((row) =>
    selectedIds.has(row.id),
  ).length;
  const allSelected = rows.length > 0 && selectedVisibleCount === rows.length;
  const someSelected = selectedVisibleCount > 0 && !allSelected;
  const hasSelection = selectedIds.size > 0;

  // `indeterminate` isn't a settable HTML attribute — only a DOM property —
  // so it has to be imperative rather than a prop, same as `AdminListingRows`'s
  // select-all checkbox.
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

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
          aria-label={t("admin:verifications.requests.selectAll.ariaLabel")}
        />
        <span>{t("admin:verifications.requests.selectAll.label")}</span>
      </label>
      {rows.map((row) => (
        <VerificationRequestRow
          key={row.id}
          row={row}
          selected={selectedIds.has(row.id)}
          disableSelect={atSelectionCap && !selectedIds.has(row.id)}
          focused={row.id === focusedRequestId}
          onOpen={onOpen}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

function VerificationRequestRow({
  row,
  selected,
  disableSelect,
  focused,
  onOpen,
  onToggle,
}: {
  row: AdminVerificationRequestDTO;
  selected: boolean;
  /** Disables the checkbox while unselected and the selection is at the bulk
   *  cap — a selected row's own checkbox stays enabled so it can be deselected. */
  disableSelect: boolean;
  /** True while this is the J/K keyboard shortcuts' currently-focused row. */
  focused: boolean;
  onOpen: (requestId: string) => void;
  onToggle: (id: string) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const person = memberRefToPerson(row.member);
  const name = person?.name ?? t("admin:verifications.unknownMember");
  const submittedText = formatRelative(row.createdAt, fmt);
  const rowRef = useRef<HTMLDivElement>(null);

  // Scrolls the row into view as the J/K keyboard focus moves onto it — a
  // reviewer paging through a long queue by keyboard shouldn't have to also
  // scroll manually. No `behavior: "smooth"` is passed, so this is the
  // browser's default instant jump rather than an animation — nothing here
  // needs to check `prefers-reduced-motion` because there's no motion to
  // suppress in the first place.
  useEffect(() => {
    if (focused) {
      rowRef.current?.scrollIntoView({ block: "nearest" });
    }
  }, [focused]);

  return (
    <div
      ref={rowRef}
      className={[styles.row, focused && styles.rowFocused]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        type="checkbox"
        className={styles.rowCheckbox}
        checked={selected}
        disabled={disableSelect}
        onChange={() => onToggle(row.id)}
        onClick={(event) => event.stopPropagation()}
        aria-label={t("admin:verifications.requests.selectRow.ariaLabel", {
          name,
        })}
      />
      <AdminAvatar
        initials={person?.initials ?? "?"}
        // Person.tint is a wider AvatarTint union; tintForSlug (its only
        // source) only ever produces coral/plum/jade, a subset of
        // AdminAvatar's AvatarTone — same cast as AdminVerificationRows.
        tone={(person?.tint as AvatarTone | undefined) ?? "anon"}
        size="md"
        src={person?.avatarUrl ?? undefined}
        alt={name}
      />
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{name}</span>
          <AdminChip tone={VERIFICATION_STATUS_TONE[row.requestedLevel]}>
            {t(`admin:verifications.level.${row.requestedLevel}`)}
          </AdminChip>
          <AdminChip tone={VERIFICATION_REQUEST_STATUS_TONE[row.status]} dot>
            {t(`admin:verifications.requests.status.${row.status}`)}
          </AdminChip>
          {row.isAppeal && (
            <AdminChip tone="amber">
              {t("admin:verifications.requests.appealChip")}
            </AdminChip>
          )}
          {row.hasDuplicateSignal && (
            <AdminChip
              tone="warn"
              title={t("admin:verifications.requests.duplicateChipTitle")}
            >
              <FiAlertTriangle aria-hidden className={styles.duplicateIcon} />
              {t("admin:verifications.requests.duplicateChip")}
            </AdminChip>
          )}
        </div>
        {submittedText && (
          <div className={styles.rowMeta}>
            {t("admin:verifications.requests.submittedAt", {
              when: submittedText,
            })}
          </div>
        )}
      </div>
      <div className={styles.rowActions}>
        <Button variant="ghost" size="sm" onClick={() => onOpen(row.id)}>
          {t("admin:verifications.reviewCta")}
          <FiChevronRight aria-hidden />
        </Button>
      </div>
    </div>
  );
}
