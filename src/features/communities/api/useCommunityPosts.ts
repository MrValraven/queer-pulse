import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiGet } from "../../../shared/api/client";
import { toItemsPage } from "../../../shared/api/pagination";
import type { Paginated } from "../../../shared/api/refs";
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
  /** True when the list request failed. A tab that paints its "nothing here
   *  yet" empty state on an outage tells a member the feed is empty when it
   *  never loaded (DES-22), so every paginated source reports its failure. */
  isError?: boolean;
  /** Re-runs the failed request. Wire it to `LoadErrorState`'s `onRetry`. */
  refetch?: () => void;
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
 * `GET /communities/:slug/posts` with an optional `q`.
 *
 * A local call rather than `communities.api.ts`'s `getCommunityPosts`, which
 * predates the search parameter and only builds `page`. Same response
 * envelope, normalized through the shared `toItemsPage` so a bare-array answer
 * still becomes one full page.
 */
async function fetchCommunityPostsPage(
  slug: string,
  page: number,
  searchTerm: string,
) {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (searchTerm) params.set("q", searchTerm);
  const query = params.toString();
  const response = await apiGet<
    CommunityPostDTO[] | Paginated<CommunityPostDTO>
  >(`/communities/${slug}/posts${query ? `?${query}` : ""}`);
  return toItemsPage(response);
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
      isError: false,
      refetch: () => {},
    };
  }
  return {
    pinned: split.pinned,
    pulse: split.pulse,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/** What a Pulse search came back with. `pinned` is deliberately absent: a
 *  result list is one flat set of matches, so a pinned match reads in the same
 *  place as any other rather than being lifted to the top of a search. */
export interface CommunityPostSearchResult extends PulsePaging {
  /** Every matching post across the loaded result pages. */
  matches: Post[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * Server-side search across a community's whole post history, page by page.
 *
 * Genuinely server-side (the backend applies `q` in-query, so `total` counts
 * matches), which is what lets the Pulse tab present results plainly: unlike
 * the roster's client-side filter, there is no "only the posts already loaded"
 * caveat to make. Its own infinite query, keyed by the term, so switching back
 * to an empty search restores the untouched feed from cache instead of
 * refetching it.
 *
 * Disabled in demo mode and for an empty term, so the Pulse tab can call it
 * unconditionally and simply ignore the result while nobody is searching.
 */
export function useCommunityPostSearch(
  slug: string | undefined,
  searchTerm: string,
): CommunityPostSearchResult {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const trimmedTerm = searchTerm.trim();
  const query = useInfiniteQuery<PostsPageVM>({
    queryKey: ["community-posts-search", slug, trimmedTerm, demoMode],
    enabled: !demoMode && Boolean(slug) && trimmedTerm.length > 0,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await fetchCommunityPostsPage(
        slug!,
        pageParam as number,
        trimmedTerm,
      );
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
  const split = useMemo(() => postsToPulse(raw, slug ?? "", t), [raw, slug, t]);
  const matches = useMemo(
    () => [...split.pinned, ...split.pulse],
    [split.pinned, split.pulse],
  );

  return {
    matches,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
