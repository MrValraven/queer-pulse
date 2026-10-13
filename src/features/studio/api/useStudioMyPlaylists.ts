import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  toPlaylistCardView,
  type StudioPlaylistCardView,
} from "./studio.adapters";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { getMyStudioPlaylists } from "./studioPlaylists.api";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

/** One cached page of "your playlists"; the writes patch this shape. */
export interface StudioPlaylistsPage {
  items: StudioPlaylistCardView[];
  nextCursor: string | null;
}

export interface StudioPlaylistListResult {
  playlists: StudioPlaylistCardView[];
  loadState: StudioLoadState;
  hasMore: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  fetchNextPage: () => void;
}

/** The member's own playlists, newest updated first. `isEnabled: false`
 *  lets the add-to-playlist picker wait until it opens. */
export function useStudioMyPlaylists(
  options: { isEnabled?: boolean } = {},
): StudioPlaylistListResult {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useInfiniteQuery({
    queryKey: studioKeys.myPlaylists(demoMode),
    enabled: (options.isEnabled ?? true) && (demoMode || hasAccess),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, client }): Promise<StudioPlaylistsPage> =>
      readStudio(client, async () => {
        const page = demoMode
          ? (await import("./studioDemoPlaylists")).demoMyPlaylistsPage(
              pageParam,
            )
          : await getMyStudioPlaylists(pageParam);
        return {
          items: page.items.map(toPlaylistCardView),
          nextCursor: page.pageInfo.hasMore ? page.pageInfo.nextCursor : null,
        };
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const playlists = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  return {
    playlists,
    loadState: studioLoadStateOf(query, (query.data?.pages.length ?? 0) > 0),
    hasMore: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
    fetchNextPage: () => {
      if (query.isFetchingNextPage) return;
      void query.fetchNextPage();
    },
  };
}
