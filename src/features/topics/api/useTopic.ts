import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ApiError } from "../../../shared/api/client";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useSocial } from "../../../app/providers/useSocial";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { getTopic as getMockTopic, type Topic } from "../topics.data";
import { topicDetailToTopic } from "./topics.adapters";
import {
  getTopicDetail,
  getTopicPosts,
  type TopicDetailResponse,
  type TopicPostResponse,
} from "./topics.api";

interface TopicPostsPage {
  items: TopicPostResponse[];
  nextCursor: string | null;
}

/**
 * A topic with its post feed, for `TopicPage`. Demo mode returns the
 * existing `getTopic()` mock unchanged — full fidelity (`topVoices`, the
 * curated `resources` panel, per-kind post styling), byte-for-byte with the
 * prototype — with `hasNextPage === false`, so `TopicFeed` keeps its scripted
 * client-side "Load N older posts" reveal and nothing else changes there.
 *
 * Live mode splits the page in two: `GET /topics/:slug` (meta) is a plain
 * query, while `GET /topics/:slug/posts?cursor=` is a cursor-paginated
 * `useInfiniteQuery`. Every post page loaded so far is flattened and merged
 * with the meta onto the same `Topic` view-model, so
 * `TopicHeader`/`TopicFeed`/`TopicPostCard`/`TopicSidebar` render unchanged
 * while `TopicFeed`'s button now really fetches the next page (it used to be
 * decorative — a pure client-side reveal that loaded nothing).
 *
 * Mirrors `forum/api/useForum.ts#useThread`'s meta-plus-cursor-posts shape.
 * `queryKey` includes `demoMode` + `language` so caches never cross either
 * boundary.
 */
export function useTopic(tag: string) {
  const { demoMode } = useDemoMode();
  const { blocked, muted } = useSocial();
  const { t, language } = useTranslation();
  const fmt = useFormat();

  const detailQuery = useQuery<TopicDetailResponse>({
    queryKey: ["topic-detail", demoMode, tag, language],
    enabled: !demoMode,
    queryFn: () => getTopicDetail(tag),
  });

  const postsQuery = useInfiniteQuery<TopicPostsPage>({
    queryKey: ["topic-posts", demoMode, tag, language],
    enabled: !demoMode,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await getTopicPosts(tag, pageParam as string | undefined);
      return { items: res.data, nextCursor: res.pageInfo.nextCursor };
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const posts = useMemo<TopicPostResponse[]>(
    () => (postsQuery.data?.pages ?? []).flatMap((p) => p.items),
    [postsQuery.data],
  );

  // Safety filter, mirroring `useFeed`: posts by a member the viewer has muted
  // or blocked never render in a topic feed. Applies in both modes — a mute is
  // a promise the demo has to keep too.
  const hiddenAuthorHandles = useMemo(
    () => new Set([...blocked, ...muted]),
    [blocked, muted],
  );

  const topic = useMemo<Topic | undefined>(() => {
    const source = demoMode
      ? getMockTopic(tag, t)
      : detailQuery.data
        ? topicDetailToTopic(detailQuery.data, posts, fmt)
        : undefined;
    if (!source) return undefined;
    const visiblePosts = source.posts.filter(
      (post) => !post.authorSlug || !hiddenAuthorHandles.has(post.authorSlug),
    );
    if (visiblePosts.length === source.posts.length) return source;
    return { ...source, posts: visiblePosts };
  }, [demoMode, tag, t, detailQuery.data, posts, fmt, hiddenAuthorHandles]);

  // Split a failed meta fetch the way `useThread` does: a genuine 404 is an
  // honest "no such topic", anything else (500, network, timeout) is
  // retryable. Conflating them showed an outage as if the topic had never
  // existed, with a "back to the forum" button and no way to try again.
  const detailError = detailQuery.error;
  const isHttp404 =
    detailError instanceof ApiError && detailError.status === 404;

  return {
    topic,
    isLoading: detailQuery.isLoading || postsQuery.isLoading,
    /** The slug resolves to nothing — a real "topic not found". */
    isNotFound: !demoMode && detailQuery.isError && isHttp404,
    /** A retryable failure (anything that isn't a 404). Demo never errors. */
    isError: !demoMode && detailQuery.isError && !isHttp404,
    refetch: () => {
      void detailQuery.refetch();
      void postsQuery.refetch();
    },
    hasNextPage: !demoMode && postsQuery.hasNextPage,
    fetchNextPage: () => void postsQuery.fetchNextPage(),
    isFetchingNextPage: postsQuery.isFetchingNextPage,
  };
}
