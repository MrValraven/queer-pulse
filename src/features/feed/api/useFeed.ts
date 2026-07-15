import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
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
    // Keep the previous tab's data on screen while the new tab fetches, so
    // switching tabs swaps content smoothly instead of flashing the skeleton
    // (a fresh query key would otherwise report isLoading and blank the list).
    placeholderData: keepPreviousData,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await getFeed(tab, pageParam as string | undefined);
      return { items: res.data, nextCursor: res.pageInfo.nextCursor };
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  const items = useMemo<FeedItem[]>(
    () => (query.data?.pages ?? []).flatMap((p) => p.items),
    [query.data],
  );

  const posts = useMemo<FeedPost[]>(() => {
    if (demoMode) return [FEED_POST];
    return items
      .filter((it) => it.type === "community_post")
      .map(feedItemToPost);
  }, [demoMode, items]);

  // Recently-joined members ("People" tab, also folded into "All") — rendered
  // by `NewMemberCard` directly off the raw `FeedItem`, not adapted to
  // `FeedPost` (unlike `posts` above) since the card's shape differs enough
  // that adapting would just be indirection.
  const newMembers = useMemo<FeedItem[]>(() => {
    if (demoMode) return [];
    return items.filter((it) => it.type === "new_member");
  }, [demoMode, items]);

  return { ...query, posts, newMembers };
}
