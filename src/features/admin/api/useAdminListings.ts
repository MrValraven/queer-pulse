import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { filterDemoListingQueue } from "../adminListings.data";
import type { ListingStatus } from "../../marketing/listBusiness/listBusiness.data";
import {
  getListingQueue,
  listingDtoToQueueRow,
  type AdminListingsPageVM,
  type ListingQueueCounts,
  type ListingQueueRow,
  type ListingQueueSort,
} from "./adminListings.api";

/** Shared with `useSetListingStatus`/`useRemoveListing`/`useAskListingQuestion`,
 *  which patch this cache directly and invalidate this key on success. */
export const ADMIN_LISTINGS_KEY = "admin-listings";

const EMPTY_COUNTS: ListingQueueCounts = {
  all: 0,
  review: 0,
  question: 0,
  live: 0,
};

export interface UseAdminListingsFilters {
  status?: ListingStatus;
  q?: string;
  sort?: ListingQueueSort;
}

/** Returns the patched row, or `null` to drop the row from the cache. */
export type ListingRowUpdater = (
  row: ListingQueueRow,
) => ListingQueueRow | null;

/**
 * The full query key for one filter combination. `status` is normalized to
 * the literal `"all"` (rather than left `undefined`) so the key hashes
 * consistently — `patchListingInCache` reads this same position back off a
 * cached query's own key to know which status that page is scoped to.
 */
function adminListingsQueryKey(
  demoMode: boolean,
  { status, q = "", sort = "newest" }: UseAdminListingsFilters,
): QueryKey {
  return [ADMIN_LISTINGS_KEY, demoMode, status ?? "all", q, sort];
}

type AdminListingsCache = InfiniteData<AdminListingsPageVM>;
type AdminListingsSnapshot = Array<[QueryKey, AdminListingsCache | undefined]>;

/**
 * Snapshot every currently cached admin-listings query — every status/q/sort
 * combination the moderator has visited this demo/live session — for a
 * mutation's `onMutate` to roll back to on `onError`. A plain `getQueryData`
 * call no longer captures "the" cache the way it did before pagination: the
 * query key now varies per filter combination, and `getQueryData` is an exact
 * match, so a mutation must snapshot (and later restore) every matched query,
 * not just one.
 */
export function snapshotAdminListingsQueries(
  queryClient: QueryClient,
  demoMode: boolean,
): AdminListingsSnapshot {
  return queryClient.getQueriesData<AdminListingsCache>({
    queryKey: [ADMIN_LISTINGS_KEY, demoMode],
  });
}

/** Restore a snapshot taken by `snapshotAdminListingsQueries`, e.g. after a
 *  failed mutation. */
export function restoreAdminListingsQueries(
  queryClient: QueryClient,
  snapshot: AdminListingsSnapshot,
) {
  for (const [queryKey, data] of snapshot) {
    queryClient.setQueryData(queryKey, data);
  }
}

/**
 * The single source of truth for a queue row's status/removal: walks every
 * currently cached admin-listings query — across every status/q/sort filter
 * combination visited this session — and patches (or drops) one row by
 * `ref`. Used by every moderation mutation's `onMutate` for an optimistic
 * update (see `useListingModeration`), so `AdminListingsPage` needs no local
 * `statusOverrides`/`removedRefs` map.
 *
 * Each cached query is scoped to one status filter, embedded in its own query
 * key (position 2 — see `adminListingsQueryKey`; `"all"` means unfiltered).
 * The cache value is an `InfiniteData<AdminListingsPageVM>`, so this walks
 * `pages[].rows`. Because a status change can move a row out of the filter a
 * given cached page represents (e.g. moving a row out of the "review" tab),
 * the row is dropped from a page whenever the `updater`'s result no longer
 * matches that page's own status filter — not only when the updater itself
 * returns `null`. `counts`/`total` on an already-cached page are left as-is
 * (they go stale by at most one row until the next refetch/invalidate); this
 * mirrors the pre-existing tradeoff of optimistic patches everywhere else in
 * the app.
 */
export function patchListingInCache(
  queryClient: QueryClient,
  demoMode: boolean,
  ref: string,
  updater: ListingRowUpdater,
) {
  const matchedQueries = queryClient.getQueriesData<AdminListingsCache>({
    queryKey: [ADMIN_LISTINGS_KEY, demoMode],
  });

  for (const [queryKey, currentData] of matchedQueries) {
    if (!currentData) continue;
    const queryStatusFilter = queryKey[2] as ListingStatus | "all" | undefined;
    let rowWasFound = false;

    const patchedPages = currentData.pages.map((page) => {
      // `.find` (not `.findIndex` + index-access) so the matched row's type
      // is `ListingQueueRow | undefined` from a real presence check, not an
      // indexed access `noUncheckedIndexedAccess` would flag as possibly
      // `undefined` even after an `index !== -1` guard.
      const existingRow = page.rows.find((row) => row.ref === ref);
      if (!existingRow) return page;
      rowWasFound = true;

      const patchedRow = updater(existingRow);
      const rowStillMatchesThisPage =
        patchedRow !== null &&
        (queryStatusFilter === "all" ||
          patchedRow.status === queryStatusFilter);

      const patchedRows = rowStillMatchesThisPage
        ? page.rows.map((row) => (row === existingRow ? patchedRow : row))
        : page.rows.filter((row) => row !== existingRow);

      return { ...page, rows: patchedRows };
    });

    if (rowWasFound) {
      queryClient.setQueryData(queryKey, {
        ...currentData,
        pages: patchedPages,
      });
    }
  }
}

/**
 * The moderation queue of member-submitted listings, filterable by status,
 * free-text search, and sort, with real pagination via `useInfiniteQuery`
 * (`fetchNextPage`/`hasNextPage` accumulate `items` across pages instead of
 * truncating at page 1). `counts` reflects the `q` search but is NOT scoped
 * by `status` — it's the axis the four status tabs vary across, per
 * `GET /admin/listings/queue`.
 *
 * Demo mode returns the colocated fixture filtered/sorted in-memory (never
 * hits the network) as a single full page — this is a Moderator/Admin-only
 * endpoint that 403s for anyone else, so this fabricated data must never
 * appear as platform truth in live mode.
 */
export function useAdminListings(filters: UseAdminListingsFilters = {}) {
  const { demoMode } = useDemoMode();
  const { status, q = "", sort = "newest" } = filters;

  const query = useInfiniteQuery<AdminListingsPageVM>({
    queryKey: adminListingsQueryKey(demoMode, { status, q, sort }),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        return filterDemoListingQueue({ status, q, sort });
      }
      const listingQueuePage = await getListingQueue({
        status,
        q,
        sort,
        page: pageParam as number,
      });
      return {
        rows: listingQueuePage.items.map(listingDtoToQueueRow),
        total: listingQueuePage.total,
        page: listingQueuePage.page,
        pageSize: listingQueuePage.pageSize,
        counts: listingQueuePage.counts,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });

  const rows = query.data?.pages.flatMap((page) => page.rows) ?? [];
  const counts = query.data?.pages[0]?.counts ?? EMPTY_COUNTS;

  return { ...query, rows, counts };
}
