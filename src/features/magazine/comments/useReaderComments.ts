import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getReaderComments,
  type ReaderCommentDTO,
  type ReaderCommentsPage,
} from "./readerComments.api";
import { DEMO_READER_COMMENTS } from "./readerComments.data";
import {
  hasFailedWithoutData,
  isRetryingFailedRead,
} from "../../admin/queryLoadFailure";

/** Mirrors the backend's `PAGE_SIZE` for this endpoint. Only used to shape the
 *  demo fixture's envelope and the empty fallback the mutations write. */
export const READER_COMMENTS_PAGE_SIZE = 20;

/** Shared by `useReaderComments` and `useReaderCommentMutations` so the
 *  query and its cache patches/invalidations always agree on the exact key.
 *  Every loaded page lives under this ONE key (`useInfiniteQuery`), so the
 *  page number is deliberately not part of it. */
export function readerCommentsQueryKey(demoMode: boolean, articleSlug: string) {
  return ["magazine-reader-comments", demoMode, articleSlug] as const;
}

export interface ReaderCommentsResult {
  /** Every top-level thread loaded so far, newest first. */
  comments: ReaderCommentDTO[];
  /** How many top-level THREADS the article has in total (the backend counts
   *  `parentId IS NULL` rows), across every page. Replies are not in here, so
   *  never label this "comments" in the UI. */
  totalThreads: number;
  /** True while another page of threads is still waiting on the server. */
  hasMore: boolean;
  loadMore: () => void;
  isLoading: boolean;
  isLoadingMore: boolean;
  isError: boolean;
  /** ENG-501: the latest next page failed (`isError` is true then too), so the
   *  footer retries that page under the threads already loaded. Always false
   *  in demo mode, which answers in one page. */
  isFetchNextPageError: boolean;
  /** ENG-501b: the first page failed and nothing ever loaded, including while
   *  a Retry of that failure runs (react-query clears `isError` the moment it
   *  refetches). The list shows its error state with Retry. */
  hasFailedWithoutData: boolean;
  /** A Retry of that failed first page is in flight. */
  isRetrying: boolean;
  /** Re-runs the failed first page. Wire it to `LoadErrorState`'s `onRetry`. */
  retry: () => void;
}

/**
 * An article's public reader-comments list (CNT-10): top-level comments
 * newest-first, each with its flat one-level replies oldest-first.
 *
 * PRD-108: this used to read page 1 and stop, so on a popular piece every
 * thread past the twentieth was unreachable. It now pages the same way the
 * community post thread does (`useCommunityReplies`): one `useInfiniteQuery`,
 * pages appended in load order, a "load more" button driven by `hasMore`.
 * Demo mode always returns the static `DEMO_READER_COMMENTS` fixture as a
 * single terminal page; live mode calls
 * GET /magazine/articles/:slug/comments?page=.
 */
export function useReaderComments(articleSlug: string): ReaderCommentsResult {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery({
    queryKey: readerCommentsQueryKey(demoMode, articleSlug),
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<ReaderCommentsPage> => {
      if (demoMode) {
        return {
          items: DEMO_READER_COMMENTS,
          total: DEMO_READER_COMMENTS.length,
          page: 1,
          pageSize: READER_COMMENTS_PAGE_SIZE,
        };
      }
      return getReaderComments(articleSlug, pageParam);
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedThreads = allPages.reduce(
        (count, loadedPage) => count + loadedPage.items.length,
        0,
      );
      return loadedThreads < lastPage.total ? lastPage.page + 1 : undefined;
    },
    enabled: Boolean(articleSlug),
  });

  const comments = useMemo(
    () => (query.data?.pages ?? []).flatMap((loadedPage) => loadedPage.items),
    [query.data],
  );

  return {
    comments,
    totalThreads: query.data?.pages[0]?.total ?? 0,
    hasMore: Boolean(query.hasNextPage),
    loadMore: () => {
      void query.fetchNextPage();
    },
    isLoading: query.isLoading,
    isLoadingMore: query.isFetchingNextPage,
    isError: query.isError,
    isFetchNextPageError: query.isFetchNextPageError,
    hasFailedWithoutData: hasFailedWithoutData(query),
    isRetrying: isRetryingFailedRead(query),
    retry: () => {
      void query.refetch();
    },
  };
}
