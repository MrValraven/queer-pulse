import { useMemo } from "react";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getFollowedPersonas,
  getFollowedPersonasAfter,
  type FollowedPersonasPage,
} from "./subprofiles.api";
import {
  toFollowedPortraitCardView,
  type FollowedPortraitCardView,
} from "./followedCard.adapters";

/**
 * Rows per page. Matches the backend's `PAGE_SIZE`, which `GET
 * /subprofiles/following` fixes and takes no parameter for, so the demo branch
 * pages the same way the live one does.
 */
export const FOLLOWED_PERSONAS_PAGE_SIZE = 20;

/** Where the next "You follow" page starts: a keyset cursor (a previous
 *  page's `nextCursor`), or a page number from an older server that sends
 *  none. */
type FollowedPageParam = string | number;

/** What the "You follow" tab renders, named after the "Everyone" grid's own
 *  fields (`useSubprofileDirectoryFilters`) so the two tabs read alike. */
export interface FollowedPersonasInfiniteView {
  /** Every followed persona loaded so far, newest follow first, already
   *  adapted to the portrait card. A card unfollowed in place stays here,
   *  its button flipped, until the list next loads. */
  shownCards: FollowedPortraitCardView[];
  /** Server-reported count of follows, moved by one on each in-place
   *  unfollow or re-follow. */
  total: number;
  /** True when another page is waiting on the server. */
  hasMore: boolean;
  isFetchingMore: boolean;
  /** True when "Show more" failed: the loaded cards stay on screen and the
   *  pager retries that page. */
  isFetchNextPageError: boolean;
  /** True while the FIRST page is in flight. */
  isLoading: boolean;
  /** True when the fetch failed with nothing loaded: a retryable outage,
   *  distinct from a member who follows nobody. */
  hasNothingLoadedError: boolean;
  /** Fetch and append the next page. No-op once `hasMore` is false or while
   *  a page is already on its way. */
  onShowMore: () => void;
  refetch: () => void;
}

/**
 * The personas the signed-in member follows, as the "You follow" tab's
 * portrait grid with a "Show more" pager.
 *
 * Pages by KEYSET: the first page goes out bare and every later one with
 * `?before=<nextCursor>`, so a card unfollowed in place on page one never
 * shifts what page two returns. An older server sends no `nextCursor`; the
 * hook then falls back to page numbers, stopping once the loaded rows reach
 * `total`, so it can never page forever.
 *
 * The key keeps the `["subprofile", "following"]` prefix, so every existing
 * invalidation and the in-place follow patch (`followedPersonasCache.ts`,
 * which needs the raw DTO pages cached here) still reach it. Dual-mode like
 * every data hook here: live calls `GET /subprofiles/following`; demo reads
 * the colocated fixture through a dynamic import, so the mock registry never
 * lands in the live bundle path. The live list is already filtered
 * server-side to personas the viewer may still see (published, open, not
 * owner-removed, not under a moderator takedown, not blocked either way), so
 * a followed persona that was taken down cannot come back through the grid.
 */
export function useFollowedPersonasInfinite(): FollowedPersonasInfiniteView {
  const { demoMode } = useDemoMode();
  const followingQuery = useInfiniteQuery<
    FollowedPersonasPage,
    Error,
    InfiniteData<FollowedPersonasPage>,
    readonly unknown[],
    FollowedPageParam
  >({
    queryKey: ["subprofile", "following", "infinite", demoMode],
    initialPageParam: 1,
    // A card unfollowed in place stays on the grid until the tab next loads,
    // so a mis-tap is one tap to undo. A focus refetch would drop it the
    // moment the member comes back to the window, mid-decision. A reconnect
    // refetch would drop it the same way after a flaky network blip.
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async ({ pageParam, signal }) => {
      const isCursor = typeof pageParam === "string";
      if (demoMode) {
        const { mockFollowedPersonas, mockFollowedPersonasAfter } =
          await import("../followedPersonas.data");
        return isCursor
          ? mockFollowedPersonasAfter(pageParam, FOLLOWED_PERSONAS_PAGE_SIZE)
          : mockFollowedPersonas(pageParam, FOLLOWED_PERSONAS_PAGE_SIZE);
      }
      return isCursor
        ? getFollowedPersonasAfter(pageParam, signal)
        : getFollowedPersonas(pageParam, signal);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.nextCursor !== undefined) {
        return lastPage.nextCursor ?? undefined;
      }
      if (lastPage.items.length === 0) return undefined;
      const loadedCount = allPages.reduce(
        (count, page) => count + page.items.length,
        0,
      );
      return loadedCount < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });

  const shownCards = useMemo(() => {
    const seenKeys = new Set<string>();
    const cards: FollowedPortraitCardView[] = [];
    for (const page of followingQuery.data?.pages ?? []) {
      for (const item of page.items) {
        const view = toFollowedPortraitCardView(item);
        // A row with no public address is left out (see the adapter), and a
        // row seen twice is drawn once: numbered pages from an older server
        // shift under a follow made elsewhere.
        if (!view || seenKeys.has(view.card.key)) continue;
        seenKeys.add(view.card.key);
        cards.push(view);
      }
    }
    return cards;
  }, [followingQuery.data]);

  const hasLoadedPages = (followingQuery.data?.pages.length ?? 0) > 0;
  return {
    shownCards,
    total: followingQuery.data?.pages[0]?.total ?? 0,
    hasMore: followingQuery.hasNextPage,
    isFetchingMore: followingQuery.isFetchingNextPage,
    isFetchNextPageError: followingQuery.isFetchNextPageError,
    isLoading: followingQuery.isLoading,
    hasNothingLoadedError: followingQuery.isError && !hasLoadedPages,
    onShowMore: () => {
      if (!followingQuery.hasNextPage || followingQuery.isFetchingNextPage) {
        return;
      }
      void followingQuery.fetchNextPage();
    },
    refetch: () => void followingQuery.refetch(),
  };
}
