import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getPersonaPosts } from "./personaPosts.api";
import {
  toPersonaPostView,
  type PersonaPostView,
} from "./personaPosts.adapters";

export const personaPostKeys = {
  posts: (demoMode: boolean, subprofileId: string) =>
    ["subprofile", "posts", demoMode, subprofileId] as const,
};

/** One cached page; the writes patch this shape. */
export interface PersonaPostsPage {
  items: PersonaPostView[];
  nextCursor: string | null;
}

export interface PersonaPostsResult {
  posts: PersonaPostView[];
  /** The first page answered (it may be empty). */
  hasLoaded: boolean;
  /** Nothing loaded and at least one failed attempt. Stays true while a
   *  Retry runs (gated on errorUpdateCount). */
  hasFailed: boolean;
  isRetrying: boolean;
  retry: () => void;
  hasMore: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  /** Resolves once the page answers, with whether more pages follow, how
   *  many posts it added and whether the read failed; null when a page read
   *  was already running. */
  fetchNextPage: () => Promise<NextPersonaPostsPage | null>;
}

export interface NextPersonaPostsPage {
  hasMore: boolean;
  addedCount: number;
  hasFailed: boolean;
}

/** A persona's posts, newest first, ten a page. Whoever can read the
 *  persona page reads its posts. `isEnabled: false` skips a persona of
 *  another kind. No auto-fetch: the next page loads on "Show more updates". */
export function usePersonaPosts(
  subprofileId: string | null,
  options: { isEnabled?: boolean } = {},
): PersonaPostsResult {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery({
    queryKey: personaPostKeys.posts(demoMode, subprofileId ?? ""),
    enabled: (options.isEnabled ?? true) && subprofileId !== null,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : undefined,
    meta: { silentError: true },
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }): Promise<PersonaPostsPage> => {
      const page = demoMode
        ? (await import("../data/personaPostsDemo")).demoPersonaPostsPage(
            subprofileId ?? "",
            pageParam,
          )
        : await getPersonaPosts(subprofileId ?? "", pageParam);
      return {
        items: page.items.map(toPersonaPostView),
        nextCursor: page.pageInfo.hasMore ? page.pageInfo.nextCursor : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const posts = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  const hasLoaded = (query.data?.pages.length ?? 0) > 0;
  const hasFailed = !hasLoaded && query.errorUpdateCount > 0;
  return {
    posts,
    hasLoaded,
    hasFailed,
    isRetrying: hasFailed && query.isFetching,
    retry: () => {
      void query.refetch();
    },
    hasMore: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
    fetchNextPage: async () => {
      if (query.isFetchingNextPage) return null;
      const pagesBefore = query.data?.pages.length ?? 0;
      const next = await query.fetchNextPage();
      const pages = next.data?.pages ?? [];
      return {
        hasMore: next.hasNextPage,
        addedCount:
          pages.length > pagesBefore ? (pages.at(-1)?.items.length ?? 0) : 0,
        hasFailed: next.isFetchNextPageError,
      };
    },
  };
}
