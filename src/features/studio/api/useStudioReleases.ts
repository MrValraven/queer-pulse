import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioReleases } from "./studio.api";
import {
  toReleaseCardView,
  type StudioReleaseCardView,
} from "./studio.adapters";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";

interface ReleasesPage {
  items: StudioReleaseCardView[];
  nextCursor: string | null;
}

export interface StudioReleasesResult {
  releases: StudioReleaseCardView[];
  loadState: StudioLoadState;
  hasMore: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  fetchNextPage: () => void;
}

/** Published releases, newest first, one "Show more" press per page. There
 *  is no auto-fetch effect, so a failed page can never loop. */
export function useStudioReleases(): StudioReleasesResult {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useInfiniteQuery({
    queryKey: studioKeys.releases(demoMode),
    enabled: demoMode || hasAccess,
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, client }): Promise<ReleasesPage> =>
      readStudio(client, async () => {
        const page = demoMode
          ? (await import("./studioDemoApi")).demoStudioReleasesPage(pageParam)
          : await getStudioReleases(pageParam);
        return {
          items: page.items.map(toReleaseCardView),
          nextCursor: page.pageInfo.hasMore ? page.pageInfo.nextCursor : null,
        };
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const releases = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  const hasData = (query.data?.pages.length ?? 0) > 0;
  return {
    releases,
    loadState: studioLoadStateOf(query, hasData),
    hasMore: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
    fetchNextPage: () => {
      if (query.isFetchingNextPage) return;
      void query.fetchNextPage();
    },
  };
}
