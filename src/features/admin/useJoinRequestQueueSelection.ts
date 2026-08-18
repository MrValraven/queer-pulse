import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { JOIN_REQUEST_BULK_ACTION_CAP } from "../auth/api/joinRequest.api";
import type { JoinRequestView } from "./api/useJoinRequests";

/**
 * The pending join-request queue's row-selection state for bulk actions
 * (Task 6) — mirrors `useReviewQueueSelection.ts` (the verification-requests
 * queue's own selection hook) one-for-one, minus the J/K keyboard-navigation
 * focus state and the keyboard shortcut's own reject-modal id list: neither
 * concept exists on this queue, so carrying them over would be dead code.
 *
 * - `selectedIds`: bulk-action checkbox selection, capped at
 *   `JOIN_REQUEST_BULK_ACTION_CAP`. `toggleSelectAll` is the one place that
 *   surfaces a cap-exceeded toast (an individual checkbox just disables
 *   silently once the cap is hit).
 */
export function useJoinRequestQueueSelection(rows: JoinRequestView[]) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const atSelectionCap = selectedIds.size >= JOIN_REQUEST_BULK_ACTION_CAP;

  /** A row selected under one queue snapshot stops meaning anything once the
   *  underlying rows change in a way that invalidates it — call this from
   *  whatever handler would make the stale selection wrong. */
  function resetSelection() {
    setSelectedIds(new Set());
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < JOIN_REQUEST_BULK_ACTION_CAP) {
        next.add(id);
      }
      return next;
    });
  }

  /** Selects every currently-visible row (up to the cap), or deselects them
   *  all if every one is already selected — same "select all visible"
   *  semantics as `useReviewQueueSelection`. Unlike a single checkbox,
   *  select-all can silently want to exceed the cap in one action, so this is
   *  the one place that surfaces a toast rather than quietly truncating. */
  function toggleSelectAll() {
    setSelectedIds((current) => {
      const allVisibleSelected = rows.every((row) => current.has(row.id));
      const next = new Set(current);
      let truncated = false;
      for (const row of rows) {
        if (allVisibleSelected) {
          next.delete(row.id);
        } else if (next.size < JOIN_REQUEST_BULK_ACTION_CAP) {
          next.add(row.id);
        } else {
          truncated = true;
        }
      }
      if (truncated) {
        showToast(
          t("admin:members.verify.bulk.capNote", {
            cap: JOIN_REQUEST_BULK_ACTION_CAP,
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
    atSelectionCap,
    resetSelection,
    toggleSelected,
    toggleSelectAll,
  };
}
