import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { getCommunityPosts, type CommunityPostDTO } from "./communities.api";
import { postsToPulse } from "./communities.adapters";
import { getLiving } from "../livingCommunities.data";
import type { Post } from "../community.model";

/** The Pulse feed's pagination controls, threaded down to the Pulse tab.
 *  All three are inert in demo mode, where `hasNextPage` is always false. */
export interface PulsePaging {
  /** True when another page is available (live only — always false in demo). */
  hasNextPage: boolean;
  /** Fetch and append the next page of posts (no-op in demo). */
  fetchNextPage: () => void;
  /** True while a subsequent page is loading. */
  isFetchingNextPage: boolean;
  /** True while the FIRST page is in flight, where the source knows it.
   *  Optional because the roster/discussion sources fold their first-page
   *  wait into the page's own skeleton. */
  isLoading?: boolean;
}

export interface CommunityPostsResult extends PulsePaging {
  /** Pinned announcements across every loaded page, in server order. */
  pinned: Post[];
  /** The running Pulse feed (non-pinned posts) across every loaded page. */
  pulse: Post[];
  /** True while the FIRST page is in flight. The Pulse tab used to paint a
   *  fixed 500ms fake skeleton instead, which made cached data wait and hid
   *  the real fetch state entirely. Always false in demo mode (no network). */
  isLoading: boolean;
}

interface PostsPageVM {
  items: CommunityPostDTO[];
  total: number;
  page: number;
}

/**
 * A community's Pulse feed, paginated. Demo returns the flagship's mock
 * pinned/pulse posts synchronously with `hasNextPage: false`, so the Pulse tab
 * renders exactly as it does today and never touches the network.
 *
 * Live mode calls GET /communities/:slug/posts?page= and appends each page,
 * stopping at the server `total`. Pages are kept as raw DTOs and flattened
 * BEFORE the pinned/pulse split: `postsToPulse` is a pure map+filter over the
 * array, so running it once over the flattened list keeps pinned announcements
 * in stable server order and never duplicates or re-shuffles them as later
 * pages arrive (splitting per page and concatenating would interleave them).
 */
export function useCommunityPosts(
  slug: string | undefined,
): CommunityPostsResult {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const query = useInfiniteQuery<PostsPageVM>({
    // `demoMode` is part of the key so demo and live caches never cross.
    queryKey: ["community-posts", slug, demoMode],
    enabled: !demoMode && Boolean(slug),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getCommunityPosts(slug!, pageParam as number);
      return { items: res.items, total: res.total, page: res.page };
    },
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });

  const raw = useMemo(
    () => (query.data?.pages ?? []).flatMap((p) => p.items),
    [query.data],
  );
  // Mapped outside `queryFn` (pages stay raw DTOs), so the adapter's
  // translated fallbacks follow a language switch with no refetch.
  const split = useMemo(() => postsToPulse(raw, slug ?? "", t), [raw, slug, t]);

  if (demoMode) {
    const living = getLiving(slug);
    return {
      pinned: living?.pinned ?? [],
      pulse: living?.pulse ?? [],
      hasNextPage: false,
      fetchNextPage: () => {},
      isFetchingNextPage: false,
      isLoading: false,
    };
  }
  return {
    pinned: split.pinned,
    pulse: split.pulse,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
  };
}
