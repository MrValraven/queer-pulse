import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getStudioReleases } from "./studio.api";
import {
  toReleaseCardView,
  type StudioReleaseCardView,
} from "./studio.adapters";
import type { StudioGenre } from "./studio.types";
import { studioLoadStateOf } from "./studioLoadState";
import { readStudio, studioKeys } from "./studioQueryKeys";
import { useStudioAccess } from "./useStudioAccess";
import type { StudioReleasesResult } from "./useStudioReleases";

interface BrowsePage {
  items: StudioReleaseCardView[];
  nextCursor: string | null;
}

/** One genre's published releases, newest first, one Show more press per
 *  page. Nothing is read until a genre is chosen. */
export function useStudioBrowseReleases(
  genre: StudioGenre | null,
): StudioReleasesResult {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const query = useInfiniteQuery({
    queryKey: studioKeys.browse(demoMode, genre),
    enabled: genre !== null && (demoMode || hasAccess),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam, client }): Promise<BrowsePage> =>
      readStudio(client, async () => {
        const page = demoMode
          ? (await import("./studioDemoApi")).demoStudioReleasesPage(
              pageParam,
              genre,
            )
          : await getStudioReleases(pageParam, genre);
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
  return {
    releases,
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
