import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../../app/providers/authContext";
import {
  getOwnerListingHistory,
  type OwnerListingHistoryDTO,
} from "./listingHistory.api";
import {
  flattenHistoryPages,
  getDemoOwnerListingHistory,
  nextHistoryPage,
} from "./ownerListingHistory.data";

/**
 * Cache key for one listing's owner-facing history. Kept under the
 * `["listings"]` prefix on purpose: every mutation that already invalidates
 * that tree (a save, a pause or resume, a co-manager joining or leaving)
 * refreshes the history with it, with no second key to remember.
 */
export const ownerListingHistoryQueryKey = (
  demoMode: boolean,
  listingRef: string,
) => ["listings", "history", demoMode, listingRef] as const;

/**
 * Who changed what on one listing, newest first, a page at a time. Demo mode
 * reads the colocated fixture; live mode calls `GET /listings/:ref/history`.
 * Only `events` are surfaced: the Q&A thread has its own place on the page.
 */
export function useOwnerListingHistory(listingRef: string) {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const query = useInfiniteQuery<
    OwnerListingHistoryDTO,
    Error,
    InfiniteData<OwnerListingHistoryDTO>,
    ReturnType<typeof ownerListingHistoryQueryKey>,
    number
  >({
    queryKey: ownerListingHistoryQueryKey(demoMode, listingRef),
    enabled: listingRef.length > 0 && (demoMode || loggedIn),
    // The section renders its own error state and an inline retry for an
    // older page, so silence the global toast. A co-manager who steps down
    // also refetches this once on the way out, and that 403 is expected.
    meta: { silentError: true },
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) =>
      demoMode
        ? getDemoOwnerListingHistory(pageParam)
        : getOwnerListingHistory(listingRef, pageParam, signal),
    getNextPageParam: nextHistoryPage,
  });

  const pages = query.data?.pages;
  const events = useMemo(() => flattenHistoryPages(pages ?? []), [pages]);

  return {
    events,
    loadedPageCount: pages?.length ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
    fetchNextPage: () => void query.fetchNextPage(),
    refetch: () => void query.refetch(),
  };
}
