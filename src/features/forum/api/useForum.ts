import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { THREADS, type Thread } from "../forum.data";
import {
  getThread,
  getThreadPosts,
  getThreads,
  type ForumPostResponse,
  type ForumThreadResponse,
} from "./forum.api";
import { threadDetail, threadToCard } from "./forum.adapters";

interface ThreadListPage {
  items: Thread[];
  nextCursor: string | null;
}

interface ThreadPostsPage {
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
 * `queryKey` includes `demoMode` + `language` so caches never cross either
 * boundary.
 */
export function useThreads(category: string) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();

  const query = useInfiniteQuery<ThreadListPage>({
    queryKey: ["forum-threads", demoMode, category, language],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      if (demoMode) return { items: THREADS, nextCursor: null };
      const res = await getThreads(category, pageParam as string | undefined);
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

  return {
    thread,
    // Only meaningful in live mode; demo drives its own simulated spinner.
    isLoading: live && (metaQuery.isLoading || postsQuery.isLoading),
    isNotFound: live && metaQuery.isError,
    hasNextPage: !demoMode && postsQuery.hasNextPage,
    fetchNextPage: () => void postsQuery.fetchNextPage(),
    isFetchingNextPage: postsQuery.isFetchingNextPage,
  };
}
