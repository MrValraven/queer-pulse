import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { VERIFICATION_BULK_ACTION_CAP } from "./api/adminVerifications.api";
import type { AdminVerificationRequestDTO } from "./api/adminVerifications.api";

/**
 * The Review-queue segment's row-selection + keyboard-focus + reject-modal
 * state, bundled into one hook (they always reset together — see
 * `resetSelectionAndFocus`) and pulled out of `ReviewQueueSegment` to keep
 * that component under this repo's per-function line budget.
 *
 * - `selectedIds`: bulk-action checkbox selection, capped at
 *   `VERIFICATION_BULK_ACTION_CAP`. `toggleSelectAll` is the one place that
 *   surfaces a cap-exceeded toast (an individual checkbox just disables
 *   silently once the cap is hit — see `VerificationRequestRows`).
 * - `focusedRequestId`: the J/K keyboard-navigation highlight — a DIFFERENT
 *   concept from `selectedIds` (see `VerificationRequestRows`'s doc comment).
 * - `rejectModalIds`: non-null while the keyboard `R` shortcut's own
 *   reject-reason modal is open (the bulk bar owns a separate instance of
 *   the same modal for its own reject button).
 */
export function useReviewQueueSelection(rows: AdminVerificationRequestDTO[]) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [focusedRequestId, setFocusedRequestId] = useState<string | null>(
    null,
  );
  const [rejectModalIds, setRejectModalIds] = useState<string[] | null>(null);

  const atSelectionCap = selectedIds.size >= VERIFICATION_BULK_ACTION_CAP;

  /** A row selected/focused under one filter/search/sort combination stops
   *  meaning anything once the moderator switches to another — call this
   *  from the filter change handlers, same as `AdminListingsPage`'s
   *  `handleHeaderChange` clearing `selectedRefs`. */
  function resetSelectionAndFocus() {
    setSelectedIds(new Set());
    setFocusedRequestId(null);
    setRejectModalIds(null);
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < VERIFICATION_BULK_ACTION_CAP) {
        next.add(id);
      }
      return next;
    });
  }

  /** Selects every currently-visible row (up to the cap), or deselects them
   *  all if every one is already selected — same "select all visible"
   *  semantics as `AdminListingRows`. Unlike a single checkbox, select-all
   *  can silently want to exceed the cap in one action, so this is the one
   *  place that surfaces a toast rather than quietly truncating. */
  function toggleSelectAll() {
    setSelectedIds((current) => {
      const allVisibleSelected = rows.every((row) => current.has(row.id));
      const next = new Set(current);
      let truncated = false;
      for (const row of rows) {
        if (allVisibleSelected) {
          next.delete(row.id);
        } else if (next.size < VERIFICATION_BULK_ACTION_CAP) {
          next.add(row.id);
        } else {
          truncated = true;
        }
      }
      if (truncated) {
        showToast(
          t("admin:verifications.requests.bulk.capNote", {
            cap: VERIFICATION_BULK_ACTION_CAP,
          }),
          "warning",
        );
      }
      return next;
    });
  }

  return {
    selectedIds,
    setSelectedIds,
    focusedRequestId,
    setFocusedRequestId,
    rejectModalIds,
    setRejectModalIds,
    atSelectionCap,
    resetSelectionAndFocus,
    toggleSelected,
    toggleSelectAll,
  };
}
