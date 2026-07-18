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
import { slugForThreadId, threadDetail, threadToCard } from "./forum.adapters";

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
 * Note the adaptation (`threadToCard`) deliberately happens inside `queryFn`,
 * per page, not in a memo over the flattened list: `threadToCard` populates the
 * `slugForThreadId` numeric-id → backend-slug map as a side effect, and
 * `useThread` needs that entry for EVERY thread the member can click, not just
 * the ones on page 1.
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
 * Demo mode short-circuits both queries (`enabled: false`) and returns the
 * scripted `THREADS` mock with `hasNextPage === false`, so the demo experience
 * is unchanged: same thread, same replies, no "Load more", no extra spinners.
 *
 * Live resolution needs the backend slug, which the list step remembers by
 * numeric id — so deep-linking a thread the list hasn't produced yet returns
 * undefined (loading/empty), a documented prototype limitation.
 */
export function useThread(id: number) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  const slug = demoMode ? undefined : slugForThreadId(id);
  const live = !demoMode && !!slug;

  const metaQuery = useQuery<ForumThreadResponse>({
    queryKey: ["forum-thread-meta", demoMode, id, language],
    enabled: live,
    queryFn: () => getThread(slug as string),
  });

  const postsQuery = useInfiniteQuery<ThreadPostsPage>({
    queryKey: ["forum-thread-posts", demoMode, id, language],
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
      return THREADS.find((candidate) => candidate.id === id) ?? THREADS[0];
    if (!metaQuery.data) return undefined;
    return threadDetail(metaQuery.data, posts, t, fmt);
  }, [demoMode, id, metaQuery.data, posts, t, fmt]);

  return {
    thread,
    isLoading: metaQuery.isLoading || postsQuery.isLoading,
    hasNextPage: !demoMode && postsQuery.hasNextPage,
    fetchNextPage: () => void postsQuery.fetchNextPage(),
    isFetchingNextPage: postsQuery.isFetchingNextPage,
  };
}
