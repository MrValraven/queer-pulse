import { useMemo } from "react";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { getMusicEvents } from "./musicEvents.api";
import {
  toMusicEventRow,
  type MusicEventRowView,
} from "./musicEvents.adapters";
import { musicEventKeys } from "./musicEventKeys";
import type {
  AdminMusicEventAttentionDTO,
  MusicEventBucket,
} from "./musicEvents.types";

/**
 * One bucket of the house music events, paged. The list page and the nav
 * badge both build their query from this, so they share one cache entry and
 * one request. Demo answers from the fixture through a dynamic import and
 * never calls the API; its single page reports no next page.
 */
export function musicEventListQueryOptions(
  bucket: MusicEventBucket,
  demoMode: boolean,
) {
  return infiniteQueryOptions({
    queryKey: musicEventKeys.list(bucket, demoMode),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { demoMusicEventPage } = await import("./musicEventsDemo.data");
        return demoMusicEventPage(bucket);
      }
      return getMusicEvents(bucket, pageParam);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    ...(demoMode ? { staleTime: Number.POSITIVE_INFINITY } : {}),
  });
}

export interface MusicEventListResult {
  rows: MusicEventRowView[];
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
  /** Gate a Retry panel on this, so it shows only after a real failure. */
  errorUpdateCount: number;
  error: unknown;
  /** Fetches the next page. Called from a press; the list never pages itself. */
  loadMore: () => void;
  retry: () => void;
}

/** The rows of one bucket, with the states the list page renders. */
export function useMusicEventList(
  bucket: MusicEventBucket,
): MusicEventListResult {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery(musicEventListQueryOptions(bucket, demoMode));
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    query;
  const rows = useMemo(
    () => data?.pages.flatMap((page) => page.items.map(toMusicEventRow)) ?? [],
    [data],
  );
  const hasLoadedPage = data !== undefined;
  return {
    rows,
    isLoading: query.isPending,
    // A failed next page also sets `isError`; keying on loaded data keeps
    // that failure from replacing a list that is already on screen.
    isLoadError: query.isError && !hasLoadedPage,
    isRetrying: query.isFetching && query.isError && !hasLoadedPage,
    isLoadMoreError: query.isFetchNextPageError,
    hasMore: hasNextPage,
    isFetchingMore: isFetchingNextPage,
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

const NO_ATTENTION: AdminMusicEventAttentionDTO = {
  pendingInviteRequestCount: 0,
  pendingLineupCount: 0,
};

/**
 * The totals behind the pending badge. They ride on every list page and
 * ignore the bucket, so this reads page 1 of "upcoming" through the same
 * options the list uses. Zeros while disabled or still loading.
 */
export function useMusicEventAttention(options: {
  isEnabled: boolean;
}): AdminMusicEventAttentionDTO {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery({
    ...musicEventListQueryOptions("upcoming", demoMode),
    enabled: options.isEnabled,
  });
  if (!options.isEnabled) return NO_ATTENTION;
  return query.data?.pages[0]?.attention ?? NO_ATTENTION;
}
