import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useSaved } from "../../../app/providers/useSaved";
import {
  playableTracksOf,
  type StudioSearchTrackView,
} from "./studio.adapters";
import {
  likedEntryToSavedItem,
  toLikedTracksPageView,
  type StudioLikedEntryView,
  type StudioLikedTracksPageView,
} from "./studioLiked.adapters";
import { getStudioLikedTracks } from "./studioLiked.api";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";
import { useStudioLibrarySaves } from "./useStudioLibrarySaves";

export interface StudioLikedTracksResult {
  /** Every loaded like the member still holds, numbered 1..n. */
  entries: StudioLikedEntryView[];
  /** The available likes that have audio, in list order: what Play and
   *  Shuffle queue. */
  playableTracks: StudioSearchTrackView[];
  trackCount: number;
  totalDurationSeconds: number;
  loadState: StudioLoadState;
  hasMore: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  /** Reads the next page. `cancelRefetch: false` lets a read already under
   *  way (the one a like or unlike starts) finish first. */
  fetchNextPage: (options?: { cancelRefetch?: boolean }) => void;
}

/**
 * Liked songs: the member's `studio_track` saves, newest first, 100 a page.
 * The Saved store stays the one source of a like: a row unliked anywhere
 * leaves the list at once, and its track leaves the counts. Live, each page
 * puts its rows into the Saved store (`remember`, which sends nothing), so a
 * like past the store's first page still reads as liked on every heart.
 * A row unliked this session stays out of the store even when a read that
 * left before the unlike still lists it.
 * A heart (`useStudioLike`) has the live list read again once the server
 * holds the like or unlike, so a new like joins it and the counts settle.
 * The demo builds the list from the store itself, keyed by the saved ids, so
 * a like anywhere reads it again. `isEnabled: false` waits, as the
 * add-to-playlist picker does until it opens.
 */
export function useStudioLikedTracks(
  options: { isEnabled?: boolean } = {},
): StudioLikedTracksResult {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const { items, remember, readSaveScope } = useSaved();
  // Also seeds the demo library fixture once, as the library tabs do.
  const demoTrackSaves = useStudioLibrarySaves("studio_track");
  const savedIdsJoined = demoMode
    ? demoTrackSaves.map((item) => item.id).join(" ")
    : "";
  const query = useInfiniteQuery({
    queryKey: demoMode
      ? [...studioKeys.likedTracks(true), savedIdsJoined]
      : studioKeys.likedTracks(false),
    enabled: (options.isEnabled ?? true) && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    // The demo key changes with every like: the list on screen stays while
    // the next one is built.
    placeholderData: demoMode ? keepPreviousData : undefined,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, client }): Promise<StudioLikedTracksPageView> =>
      readStudio(client, async () => {
        if (demoMode) {
          const { demoLikedTracksPage } = await import("./studioDemoLiked");
          return toLikedTracksPageView(
            demoLikedTracksPage(demoTrackSaves, pageParam),
          );
        }
        // Read before the request: a page that lands after another member
        // signed in on this device stays out of their store.
        const scopeAtRead = readSaveScope();
        const page = toLikedTracksPageView(
          await getStudioLikedTracks(pageParam),
        );
        remember(page.entries.map(likedEntryToSavedItem), { scopeAtRead });
        return page;
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const savedIds = useMemo(
    () => new Set(items.map((item) => item.id)),
    [items],
  );
  const pages = query.data?.pages;
  const derived = useMemo(() => {
    const loaded = pages?.flatMap((page) => page.entries) ?? [];
    const unlikedHere = loaded.filter(
      (entry) => entry.isAvailable && !savedIds.has(entry.savedId),
    );
    const entries = loaded
      .filter((entry) => savedIds.has(entry.savedId))
      .map((entry, index) => ({ ...entry, position: index + 1 }));
    const firstPage = pages?.[0];
    return {
      entries,
      playableTracks: playableTracksOf(entries),
      trackCount: Math.max(
        0,
        (firstPage?.trackCount ?? 0) - unlikedHere.length,
      ),
      totalDurationSeconds: Math.max(
        0,
        (firstPage?.totalDurationSeconds ?? 0) -
          unlikedHere.reduce(
            (sum, entry) => sum + (entry.track?.durationSeconds ?? 0),
            0,
          ),
      ),
    };
  }, [pages, savedIds]);
  return {
    ...derived,
    loadState: studioLoadStateOf(query, (pages?.length ?? 0) > 0),
    hasMore: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
    fetchNextPage: (fetchOptions) => {
      if (query.isFetchingNextPage) return;
      void query.fetchNextPage(fetchOptions);
    },
  };
}
