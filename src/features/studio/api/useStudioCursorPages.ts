import { useInfiniteQuery, type QueryKey } from "@tanstack/react-query";
import { useMemo } from "react";
import type { StudioPageDTO } from "./studio.types";
import { studioLoadStateOf, type StudioLoadState } from "./studioLoadState";
import { readStudio } from "./studioQueryKeys";

interface CursorPage<View> {
  items: View[];
  nextCursor: string | null;
}

export interface StudioCursorPagesOptions<Dto, View> {
  queryKey: QueryKey;
  enabled: boolean;
  /** True for sections that hide on a failure and raise no toast. */
  silentError?: boolean;
  read: (cursor: string | null) => Promise<StudioPageDTO<Dto>>;
  toView: (dto: Dto) => View;
}

export interface StudioCursorPagesResult<View> {
  items: View[];
  loadState: StudioLoadState;
  hasMore: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  fetchNextPage: () => void;
}

/** One cursor pager for every "Show more" list. There is no auto-fetch
 *  effect, so a failed page can never loop. */
export function useStudioCursorPages<Dto, View>({
  queryKey,
  enabled,
  silentError = false,
  read,
  toView,
}: StudioCursorPagesOptions<Dto, View>): StudioCursorPagesResult<View> {
  const query = useInfiniteQuery({
    queryKey,
    enabled,
    initialPageParam: null as string | null,
    meta: silentError ? { silentError: true } : undefined,
    queryFn: ({ pageParam, client }): Promise<CursorPage<View>> =>
      readStudio(client, async () => {
        const page = await read(pageParam);
        return {
          items: page.items.map(toView),
          nextCursor: page.pageInfo.hasMore ? page.pageInfo.nextCursor : null,
        };
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  return {
    items,
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
