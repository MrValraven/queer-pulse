import {
  keepPreviousData,
  useInfiniteQuery,
  type InfiniteData,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { apiGet } from "../../../shared/api/client";
import { toSearchView, type StudioSearchView } from "./studio.adapters";
import {
  STUDIO_LIMITS,
  type StudioFormat,
  type StudioGenre,
  type StudioMood,
  type StudioSearchResultDTO,
  type StudioSearchType,
} from "./studio.types";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";
import { studioReasonOf, type StudioFailureReason } from "../studioReason";

interface StudioSearchPageRequest {
  query: string;
  type: StudioSearchType;
  genre: StudioGenre | null;
  mood: StudioMood | null;
  format: StudioFormat | null;
  cursor: string | null;
}

/** GET /studio/search (ENG-05). `cursor` goes out only with a single type:
 *  the all-types search stays one page of 20 per type. */
function searchStudioPage(
  request: StudioSearchPageRequest,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({ q: request.query });
  if (request.type !== "all") params.set("type", request.type);
  if (request.type !== "all" && request.cursor)
    params.set("cursor", request.cursor);
  if (request.genre) params.set("genre", request.genre);
  if (request.mood) params.set("mood", request.mood);
  if (request.format) params.set("format", request.format);
  return apiGet<StudioSearchResultDTO>(
    `/studio/search?${params.toString()}`,
    undefined,
    undefined,
    signal,
  );
}

/** Joins the pages of one type, each hit once (a hit that moves between two
 *  pages while the catalog changes is kept where it first showed). */
function mergeSearchPages(
  pages: readonly StudioSearchResultDTO[],
): StudioSearchResultDTO {
  const uniqueById = <Item extends { id: string }>(items: Item[]): Item[] => {
    const seenIds = new Set<string>();
    return items.filter((item) => {
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });
  };
  return {
    releases: uniqueById(pages.flatMap((page) => page.releases)),
    tracks: uniqueById(pages.flatMap((page) => page.tracks)),
    artists: uniqueById(pages.flatMap((page) => page.artists)),
    playlists: uniqueById(pages.flatMap((page) => page.playlists)),
  };
}

type SearchPages = InfiniteData<StudioSearchResultDTO, string | null>;

export interface StudioSearchPages {
  result: StudioSearchView | null;
  loadState: StudioLoadState;
  isIdle: boolean;
  /** Only a single type tab pages; the all-types view never does. */
  hasMore: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  /** Why the last Show more failed, for its footer line. */
  nextPageReason: StudioFailureReason;
  fetchNextPage: () => void;
}

/**
 * Server search, paged per type (ENG-05). A type tab reads 20 at a time and
 * Show more follows `nextCursor` to the end of the set; the all-types view
 * is one page. While a new term or filter loads, the previous result stays
 * on screen (the page dims it). Demo answers from the fixture through the
 * same view model, in one page.
 */
export function useStudioSearchPages(
  query: string,
  type: StudioSearchType,
  genre: StudioGenre | null = null,
  mood: StudioMood | null = null,
  format: StudioFormat | null = null,
): StudioSearchPages {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const trimmed = query.trim().slice(0, STUDIO_LIMITS.searchQueryMax);
  const isIdle = trimmed.length === 0;
  const search = useInfiniteQuery<
    StudioSearchResultDTO,
    Error,
    SearchPages,
    readonly unknown[],
    string | null
  >({
    queryKey: [
      ...studioKeys.search(demoMode, trimmed, type, genre, mood, format),
      "pages",
    ],
    enabled: !isIdle && (demoMode || hasAccess),
    placeholderData: keepPreviousData,
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      type === "all" ? undefined : (lastPage.nextCursor ?? undefined),
    queryFn: ({ signal, client, pageParam }) =>
      readStudio(client, async () =>
        demoMode
          ? {
              ...(await import("./studioDemoApi")).demoStudioSearch(
                trimmed,
                type,
                genre,
                mood,
                format,
              ),
              nextCursor: null,
            }
          : await searchStudioPage(
              { query: trimmed, type, genre, mood, format, cursor: pageParam },
              signal,
            ),
      ),
  });
  const pages = search.data?.pages;
  const result = useMemo(
    () => (pages ? toSearchView(mergeSearchPages(pages)) : null),
    [pages],
  );
  const { fetchNextPage: fetchNext } = search;
  const fetchNextPage = useCallback(() => {
    void fetchNext();
  }, [fetchNext]);
  return {
    result: isIdle ? null : result,
    loadState: studioLoadStateOf(search, search.data !== undefined),
    isIdle,
    hasMore: !search.isPlaceholderData && search.hasNextPage,
    isFetchingNextPage: search.isFetchingNextPage,
    isFetchNextPageError: search.isFetchNextPageError,
    nextPageReason: search.isFetchNextPageError
      ? studioReasonOf(search.error)
      : "unknown",
    fetchNextPage,
  };
}
