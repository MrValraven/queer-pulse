import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { FEED_POST, type FeedPost, type FeedTab } from "../feed.data";
import { getFeed, type FeedItem } from "./feed.api";
import { feedItemToPost } from "./feed.adapters";

interface FeedPage {
  items: FeedItem[];
  nextCursor: string | null;
}

/**
 * The feed, cursor-paginated (infinite scroll). Demo mode returns the colocated
 * `FEED_POST` mock so the demo experience is unchanged; live mode calls
 * GET /feed?tab= and adapts each `FeedItem` to the `FeedPost` card view-model.
 * `queryKey` includes `demoMode` + `tab` so caches never cross the boundary.
 *
 * Demo mode is inert (the page renders its scripted cards directly); this hook
 * only drives the live rendering path.
 */
export function useFeed(tab: FeedTab) {
  const { demoMode } = useDemoMode();

  const query = useInfiniteQuery<FeedPage>({
    queryKey: ["feed", tab, demoMode],
    enabled: !demoMode,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await getFeed(tab, pageParam as string | undefined);
      return { items: res.data, nextCursor: res.pageInfo.nextCursor };
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const posts = useMemo<FeedPost[]>(() => {
    if (demoMode) return [FEED_POST];
    return (query.data?.pages ?? [])
      .flatMap((p) => p.items)
      .filter((it) => it.type === "community_post")
      .map(feedItemToPost);
  }, [demoMode, query.data]);

  return { ...query, posts };
}
