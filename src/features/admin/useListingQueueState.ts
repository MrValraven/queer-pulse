import { useState } from "react";
import type { AdminListingsHeaderValue } from "./AdminListingsHeader";
import { useAdminListings } from "./api/useAdminListings";
import {
  LISTING_BULK_ACTION_CAP,
  type AdminListingsStatusFilter,
  type ListingQueueRow,
  type ListingQueueSort,
} from "./api/adminListings.api";

/**
 * The submissions queue's state: the status filter, search text and sort that
 * drive the server query, the row selection for bulk actions, and the row open
 * in the preview drawer. It lives above the view tabs, so switching to another
 * view and back keeps the moderator's filter and selection.
 *
 * `filter` drives the server-side `status` param, so each status is its own
 * paginated, counted query. Every status/remove/ask action goes through
 * `useListingModeration`, which patches the shared `[admin-listings]` cache
 * directly, so `rows` reads straight from the query with no local
 * override/removed-refs state.
 *
 * @param initialSearchQuery Seeds the search once (from `?q=`) so a deep link
 *   lands on that row; typing owns the value from then on.
 */
export function useListingQueueState(initialSearchQuery: string) {
  const [filter, setFilter] = useState<AdminListingsStatusFilter>("all");
  // Seeded once from `?q=` so a deep link lands on that row; typing in the
  // header owns the value from then on, and nothing syncs it back.
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sort, setSort] = useState<ListingQueueSort>("newest");
  const statusArg = filter === "all" ? undefined : filter;
  const {
    rows,
    counts,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminListings({ status: statusArg, q: searchQuery, sort });
  const [openRow, setOpenRow] = useState<ListingQueueRow | null>(null);
  const [selectedRefs, setSelectedRefs] = useState<Set<string>>(new Set());
  // First mount gets the row-entrance cascade; the first search/sort/status
  // change flips this off for good, so later changes render rows instantly.
  const [animateRowEntrance, setAnimateRowEntrance] = useState(true);

  function handleHeaderChange(next: AdminListingsHeaderValue) {
    setFilter(next.status);
    setSearchQuery(next.q);
    setSort(next.sort);
    setAnimateRowEntrance(false);
    // A selection made under one filter/search/sort stops applying once the
    // moderator switches to another.
    setSelectedRefs(new Set());
  }

  // Mirrors the backend's per-request cap (`LISTING_BULK_ACTION_CAP`): the
  // state never exceeds it, and unselected checkboxes disable at the cap.
  const atSelectionCap = selectedRefs.size >= LISTING_BULK_ACTION_CAP;
  const hasSelection = selectedRefs.size > 0;
  // The rows (or the empty queue) render once loading is done, unless the
  // fetch failed with nothing cached to show.
  const hasRowsBody = !isLoading && !(isError && rows.length === 0);

  function toggleSelected(ref: string) {
    setSelectedRefs((current) => {
      const next = new Set(current);
      if (next.has(ref)) {
        next.delete(ref);
      } else if (next.size < LISTING_BULK_ACTION_CAP) {
        next.add(ref);
      }
      return next;
    });
  }

  /** Selects every currently-visible row (up to the bulk-action cap), or
   *  deselects them all if every one is already selected, with the same
   *  "select all visible" semantics as `DraftsTabs`'s select-all. Rows
   *  outside the current filter/page are left untouched either way. */
  function toggleSelectAll() {
    setSelectedRefs((current) => {
      const allVisibleSelected = rows.every((row) => current.has(row.ref));
      const next = new Set(current);
      for (const row of rows) {
        if (allVisibleSelected) {
          next.delete(row.ref);
        } else if (next.size < LISTING_BULK_ACTION_CAP) {
          next.add(row.ref);
        }
      }
      return next;
    });
  }

  // The drawer shows the latest cached row for the open ref, so a status
  // change made from the row underneath shows up without a local merge.
  const openRowLive = openRow
    ? (rows.find((row) => row.ref === openRow.ref) ?? openRow)
    : null;

  return {
    filter,
    searchQuery,
    sort,
    rows,
    counts,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    openRowLive,
    setOpenRow,
    selectedRefs,
    clearSelection: () => setSelectedRefs(new Set()),
    atSelectionCap,
    hasSelection,
    hasRowsBody,
    animateRowEntrance,
    handleHeaderChange,
    toggleSelected,
    toggleSelectAll,
  };
}

export type ListingQueueState = ReturnType<typeof useListingQueueState>;
