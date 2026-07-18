import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
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

  const topic = useMemo<Topic | undefined>(() => {
    if (demoMode) return getMockTopic(tag, t);
    if (!detailQuery.data) return undefined;
    return topicDetailToTopic(detailQuery.data, posts, fmt);
  }, [demoMode, tag, t, detailQuery.data, posts, fmt]);

  return {
    topic,
    isLoading: detailQuery.isLoading || postsQuery.isLoading,
    hasNextPage: !demoMode && postsQuery.hasNextPage,
    fetchNextPage: () => void postsQuery.fetchNextPage(),
    isFetchingNextPage: postsQuery.isFetchingNextPage,
  };
}
