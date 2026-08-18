import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ApiError } from "../../../shared/api/client";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { THREADS, type Thread } from "../forum.data";
import {
  getPinnedThreads,
  getThread,
  getThreadCounts,
  getThreadPosts,
  getThreads,
  type ForumPostResponse,
  type ForumThreadCounts,
  type ForumThreadResponse,
  type GetThreadsOptions,
} from "./forum.api";
import { threadDetail, threadToCard } from "./forum.adapters";

/** One cursor page of thread cards. Exported so `useForumMutations` can type its
 *  optimistic patch of this exact react-query cache shape. */
export interface ThreadListPage {
  items: Thread[];
  nextCursor: string | null;
}

/** One cursor page of a thread's posts (OP + replies). Exported so
 *  `useForumMutations` can type its optimistic vote patch. */
export interface ThreadPostsPage {
  items: ForumPostResponse[];
  nextCursor: string | null;
}

/**
 * Thread list, cursor-paginated (GET /forum/threads?category=&cursor=), so
 * ForumPage can append page after page via its "Load more" button instead of
 * silently truncating at the first page.
 *
 * Demo mode is resolved inside `queryFn` and returns the full `THREADS` mock as
 * a SINGLE terminal page (`nextCursor: null`) — `hasNextPage` is therefore
 * false, no "Load more" renders, and ForumPage's own client-side category/sort
 * split still sees the exact same array as before: demo is byte-identical.
 *
 * Each card carries its backend `slug`, so `ForumThreadList` links to
 * `/thread/:slug` and `useThread` fetches the detail straight from that param —
 * detail no longer depends on the list step having populated any lookup map.
 *
 * `queryKey` includes `demoMode` + `language` — and the live `sort`/`tag`/`q`
 * filters — so caches never cross either boundary or a filter change.
 *
 * The `options` (`sort`/`tag`/`q`) drive the LIVE list only: the backend orders
 * and filters, and the FE renders the server order verbatim. Demo ignores them
 * here and keeps returning the full `THREADS` mock as a single terminal page —
 * `ForumPage` still does its own client-side category/sort/search split over
 * that array, so demo stays byte-identical.
 */
export function useThreads(category: string, options?: GetThreadsOptions) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const { sort, tag, q } = options ?? {};

  const query = useInfiniteQuery<ThreadListPage>({
    // sort/tag/q are part of the key so each live filter combination caches
    // independently and never bleeds into another.
    queryKey: ["forum-threads", demoMode, category, language, sort, tag, q],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      if (demoMode) return { items: THREADS, nextCursor: null };
      const res = await getThreads(category, pageParam as string | undefined, {
        sort,
        tag,
        q,
      });
      return {
        items: res.data.map((dto) => threadToCard(dto, t, fmt)),
        nextCursor: res.pageInfo.nextCursor,
      };
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const threads = useMemo<Thread[]>(
    () => (query.data?.pages ?? []).flatMap((p) => p.items),
    [query.data],
  );

  return {
    threads,
    isPending: query.isPending,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
  };
}

/**
 * The small "sticky" pinned bucket rendered above the thread list (GET
 * /forum/threads/pinned?category=). Live only — demo has no separate pinned
 * endpoint; its pinned threads already sort to the top of the mock list via
 * `useForumPageState`'s client-side sort, so this simply returns an empty
 * bucket in demo mode rather than doubling them up.
 */
export function usePinnedThreads(category: string) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();

  const query = useQuery<ForumThreadResponse[]>({
    queryKey: ["forum-pinned-threads", demoMode, category, language],
    enabled: !demoMode,
    queryFn: () => getPinnedThreads(category),
  });

  const pinned = useMemo<Thread[]>(
    () => (query.data ?? []).map((dto) => threadToCard(dto, t, fmt)),
    [query.data, t, fmt],
  );

  return { pinned, isLoading: !demoMode && query.isLoading };
}

/**
 * Demo counts derived ONCE from the static `THREADS` mock: `all` plus a tally
 * per category id. The mock never changes, so this is computed at module load,
 * not per render.
 */
const DEMO_COUNTS: ForumThreadCounts = THREADS.reduce<ForumThreadCounts>(
  (counts, thread) => {
    counts.all += 1;
    counts[thread.category] = (counts[thread.category] ?? 0) + 1;
    return counts;
  },
  { all: 0 },
);

/**
 * Per-category thread counts for the sidebar + list header.
 *
 * Live: GET /forum/threads/counts?q=&tag= — the counts honour the same block +
 * `q`/`tag` filters as the list, and re-fetch when either filter changes (both
 * are in the query key). Demo: derived from the full `THREADS` mock (`all` + per
 * category), ignoring `q`/`tag` so the demo sidebar stays stable and matches the
 * single-terminal-page list.
 *
 * Returns `{ counts, isPending }`. `counts` is a `ForumThreadCounts`
 * (`{ all: number; [category]: number }`) — read `counts.all` and
 * `counts[categoryId]`; a category with no threads is simply absent, so treat a
 * missing key as 0. `counts` is `undefined` only while the LIVE query is still
 * loading; in demo it is always present.
 */
export function useForumCounts(q?: string, tag?: string) {
  const { demoMode } = useDemoMode();

  const query = useQuery<ForumThreadCounts>({
    queryKey: ["forum-thread-counts", demoMode, q, tag],
    enabled: !demoMode,
    queryFn: () => getThreadCounts(q, tag),
  });

  return {
    counts: demoMode ? DEMO_COUNTS : query.data,
    // Demo resolves synchronously; only the live fetch has a pending phase.
    isPending: !demoMode && query.isPending,
  };
}

/**
 * A single thread with its posts. The thread META is one plain query; its POSTS
 * are a separate cursor-paginated `useInfiniteQuery` (GET
 * /forum/threads/:slug/posts?cursor=), so ThreadPage can pull in further pages
 * of replies from its "Load more" button. Every page loaded so far is flattened
 * and merged with the meta into the same `Thread` detail view-model
 * (`threadDetail`), whose first post is the OP body and whose remainder are the
 * replies — so the merge stays correct as pages append.
 *
 * Demo mode short-circuits both queries (`enabled: false`) and resolves the
 * scripted `THREADS` mock by numeric id with `hasNextPage === false`, so the
 * demo experience is unchanged: same thread, same replies, no "Load more".
 *
 * Live resolution fetches straight from the backend slug carried in the route
 * param (`/thread/:slug`), so a hard refresh, a shared link, or any deep link
 * loads the real thread — it no longer depends on the list step having run.
 * `thread` is `undefined` only while the live queries are in flight or when the
 * slug genuinely resolves to nothing (404); it NEVER falls back to mock data in
 * live mode — that leak was the bug this replaces.
 */
export function useThread(routeParam: string) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  // Live: the route param IS the backend slug. Demo: it is the numeric mock id.
  const slug = demoMode ? undefined : routeParam || undefined;
  const live = !demoMode && !!slug;

  const metaQuery = useQuery<ForumThreadResponse>({
    queryKey: ["forum-thread-meta", demoMode, routeParam, language],
    enabled: live,
    queryFn: () => getThread(slug as string),
  });

  const postsQuery = useInfiniteQuery<ThreadPostsPage>({
    queryKey: ["forum-thread-posts", demoMode, routeParam, language],
    enabled: live,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await getThreadPosts(
        slug as string,
        pageParam as string | undefined,
      );
      return { items: res.data, nextCursor: res.pageInfo.nextCursor };
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const posts = useMemo<ForumPostResponse[]>(
    () => (postsQuery.data?.pages ?? []).flatMap((p) => p.items),
    [postsQuery.data],
  );

  const thread = useMemo<Thread | undefined>(() => {
    if (demoMode)
      return (
        THREADS.find((candidate) => String(candidate.id) === routeParam) ??
        THREADS[0]
      );
    if (!metaQuery.data) return undefined;
    return threadDetail(metaQuery.data, posts, t, fmt);
  }, [demoMode, routeParam, metaQuery.data, posts, t, fmt]);

  // Split a failed meta fetch into a genuine 404 (the slug resolves to nothing →
  // an honest "not found") vs any other failure (500 / network / timeout →
  // retryable "something went wrong"). Conflating them showed a real outage as
  // if the thread had been deleted, with no way to retry.
  const metaError = metaQuery.error;
  const isHttp404 = metaError instanceof ApiError && metaError.status === 404;

  return {
    thread,
    // Only meaningful in live mode; demo drives its own simulated spinner.
    isLoading: live && (metaQuery.isLoading || postsQuery.isLoading),
    // A genuine 404 — the thread doesn't exist.
    isNotFound: live && metaQuery.isError && isHttp404,
    // A retryable failure (anything that isn't a 404).
    isError: live && metaQuery.isError && !isHttp404,
    refetch: () => {
      void metaQuery.refetch();
      void postsQuery.refetch();
    },
    hasNextPage: !demoMode && postsQuery.hasNextPage,
    fetchNextPage: () => void postsQuery.fetchNextPage(),
    isFetchingNextPage: postsQuery.isFetchingNextPage,
  };
}
