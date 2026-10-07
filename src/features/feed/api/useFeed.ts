import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useSocial } from "../../../app/providers/useSocial";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { FeedTab } from "../feed.data";
import { getFeed, type FeedItem } from "./feed.api";

interface FeedPage {
  items: FeedItem[];
  nextCursor: string | null;
}

/**
 * The feed, cursor-paginated (infinite scroll). Demo mode is inert (the page
 * renders its scripted cards directly); this hook only drives the live
 * rendering path. Live mode calls GET /feed?tab= and returns the backend's
 * merged `FeedItem[]` **in the order the server produced it** — community_post
 * / forum_thread / gathering / new_member interleaved newest-first. This hook
 * deliberately does NOT partition by type or adapt items to a card
 * view-model (e.g. via `feedItemToPost`) — the render layer switches on
 * `item.type` per card so the merge order survives to the screen.
 * `queryKey` includes `demoMode` + `tab` + `language` so caches never cross
 * the boundary.
 */
export function useFeed(tab: FeedTab) {
  const { demoMode } = useDemoMode();
  const { blocked, muted } = useSocial();
  // PRD-107: the reader's chrome language doubles as their content language
  // for the magazine source, the same way every magazine hook uses it. It is
  // part of the key because it changes WHICH row of a translated piece the
  // page holds, not merely how it is formatted.
  const { language } = useTranslation();

  const query = useInfiniteQuery<FeedPage>({
    queryKey: ["feed", tab, demoMode, language],
    enabled: !demoMode,
    // Keeps `isLoading` false while a newly selected tab fetches, so the page
    // chrome doesn't treat a tab switch as a page load. The placeholder items
    // belong to the PREVIOUS tab: callers must check `isPlaceholderData` and
    // never render them as this tab's content.
    placeholderData: keepPreviousData,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await getFeed(tab, pageParam as string | undefined, language);
      return { items: res.data, nextCursor: res.pageInfo.nextCursor };
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  // Defense-in-depth: hide any author I've blocked or muted from my feed. The
  // server is authoritative in live mode; this just stops any flash of their
  // content before a fresh block/mute has propagated.
  const hiddenAuthorHandles = useMemo(
    () => new Set([...blocked, ...muted]),
    [blocked, muted],
  );

  // The merged feed as one array per loaded page, each block/mute filtered and
  // kept in the backend's merge order, with every type mixed together and
  // each item exactly as the server sent it. The page boundaries let the "All"
  // tab fold new members page by page (`groupNewMemberPages`), so a card
  // already on screen stays as it is when the next page arrives.
  const itemPages = useMemo<FeedItem[][]>(() => {
    if (demoMode) return [];
    return (query.data?.pages ?? []).map((page) =>
      page.items.filter(
        (item) =>
          !item.actor?.handle || !hiddenAuthorHandles.has(item.actor.handle),
      ),
    );
  }, [demoMode, query.data, hiddenAuthorHandles]);

  // The same feed flattened across pages, for callers that read one list.
  const items = useMemo<FeedItem[]>(() => itemPages.flat(), [itemPages]);

  return { ...query, items, itemPages };
}
