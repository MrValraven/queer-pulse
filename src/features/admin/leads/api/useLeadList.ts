import { useMemo } from "react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { getLeads } from "./leads.api";
import { leadKeys } from "./leadKeys";
import type {
  LeadListFilters,
  LeadListItemDTO,
  LeadStage,
} from "./leads.types";

const LIVE_STALE_MS = 30_000;

export interface LeadListResult {
  rows: LeadListItemDTO[];
  /** Per stage, over the search and type only; null before the first page. */
  stageCounts: Record<LeadStage, number> | null;
  /** The sum of `stageCounts`; null before the first page. */
  totalCount: number | null;
  /** The first page has not answered yet. */
  isLoading: boolean;
  /** The first page failed, so there is nothing to show. */
  isLoadError: boolean;
  /** A retry of the failed first page is in flight. */
  isRetrying: boolean;
  /** A later page failed; the rows already loaded stay on screen. */
  isLoadMoreError: boolean;
  hasMore: boolean;
  isFetchingMore: boolean;
  /** The rows belong to the previous filters while the new ones load. */
  isShowingPreviousResults: boolean;
  /** Gate a Retry panel on this, so it shows only after a real failure. */
  errorUpdateCount: number;
  error: unknown;
  /** Fetches the next page. Called from a press; the list never pages itself. */
  loadMore: () => void;
  retry: () => void;
}

/**
 * The leads list for one set of filters, paged by cursor. Demo answers every
 * match in one page from the demo store, which only demo writes change, so
 * it never goes stale there. While new filters load, the previous rows stay.
 */
export function useLeadList(filters: LeadListFilters): LeadListResult {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery({
    queryKey: leadKeys.list(filters, demoMode),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam, signal }) => {
      if (demoMode) {
        const { demoListLeads } = await import("../leadsDemoStore");
        return demoListLeads(filters);
      }
      return getLeads(filters, pageParam, signal);
    },
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    placeholderData: keepPreviousData,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : LIVE_STALE_MS,
    meta: { silentError: true, isPrivateQueryKey: true },
  });
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    query;
  const rows = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const firstPage = data?.pages[0];
  const hasLoadedPage = data !== undefined;
  return {
    rows,
    stageCounts: firstPage?.stageCounts ?? null,
    totalCount: firstPage?.totalCount ?? null,
    isLoading: query.isPending,
    // A failed next page also sets `isError`; keying on loaded data keeps
    // that failure from replacing a list that is already on screen.
    isLoadError: query.isError && !hasLoadedPage,
    isRetrying: query.isFetching && query.isError && !hasLoadedPage,
    isLoadMoreError: query.isFetchNextPageError,
    hasMore: hasNextPage,
    isFetchingMore: isFetchingNextPage,
    isShowingPreviousResults: query.isPlaceholderData,
    errorUpdateCount: query.errorUpdateCount,
    error: query.error,
    loadMore: () => {
      if (!hasNextPage || isFetchingNextPage) return;
      void fetchNextPage();
    },
    retry: () => {
      void refetch();
    },
  };
}
