import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getFollowedPersonas } from "../../subprofiles/api/subprofiles.api";
import { FOLLOWED_PERSONAS_PAGE_SIZE } from "../../subprofiles/api/useFollowedPersonas";
import {
  toFollowedArtistView,
  type StudioArtistRefView,
} from "./studio.adapters";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

interface FollowedArtistsPage {
  artists: StudioArtistRefView[];
  nextPage: number | null;
}

export interface StudioFollowedArtistsResult {
  artists: StudioArtistRefView[];
  loadState: StudioLoadState;
  hasMore: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  fetchNextPage: () => void;
}

/** The library's Artists tab: followed personas that make music. The
 *  followed list pages 20 at a time on the server; each page keeps its
 *  musicians and DJs, so a page can add none and Show more stays offered
 *  while pages remain. */
export function useStudioFollowedArtists(): StudioFollowedArtistsResult {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useInfiniteQuery({
    queryKey: studioKeys.followedArtists(demoMode),
    enabled: demoMode || hasAccess,
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }): Promise<FollowedArtistsPage> => {
      const page = demoMode
        ? (
            await import("../../subprofiles/followedPersonas.data")
          ).mockFollowedPersonas(pageParam, FOLLOWED_PERSONAS_PAGE_SIZE)
        : await getFollowedPersonas(pageParam, signal);
      return {
        artists: page.items.flatMap((dto) => {
          const artist = toFollowedArtistView(dto);
          return artist ? [artist] : [];
        }),
        nextPage: page.page * page.pageSize < page.total ? page.page + 1 : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
  const artists = useMemo(
    () => query.data?.pages.flatMap((page) => page.artists) ?? [],
    [query.data],
  );
  return {
    artists,
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
