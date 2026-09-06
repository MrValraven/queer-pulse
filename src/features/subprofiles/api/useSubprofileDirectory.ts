import { useMemo } from "react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getSubprofileDirectory,
  type SubprofileCardDTO,
} from "./subprofiles.api";

/** Page size. The endpoint defaults to 40 and caps `limit` at 100, so this is
 *  the largest slice one request can pull. A big first page keeps the number
 *  of round trips down AND gives the browser-side tag/availability narrowing
 *  a wide pool to work over. */
const DIRECTORY_PAGE_LIMIT = 100;

export interface SubprofileDirectoryParams {
  /** Free-text term, already trimmed and debounced by the caller. Sent as
   *  `?query=`: a case-insensitive substring match over `display_name` and
   *  `tagline`, both backed by GIN trigram indexes. An empty string is a
   *  no-op server-side, so it is simply not sent. */
  query?: string;
}

export interface SubprofileDirectoryResult {
  /** Every persona loaded so far, flattened across the fetched pages, already
   *  narrowed by the search term SERVER-SIDE. */
  cards: SubprofileCardDTO[];
  /** Server-reported count of everything matching the current term, across
   *  every page. Demo reports its fixture's own length. */
  total: number;
  /** True when another page of matches is waiting on the server. */
  hasNextPage: boolean;
  /** Fetch and append the next page. No-op once `hasNextPage` is false. */
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  /** True while the FIRST page for the current term is in flight. */
  isLoading: boolean;
  /** True when the fetch failed: a retryable outage, distinct from a search
   *  that matched nobody. */
  isError: boolean;
  refetch: () => void;
  /** True while the cards on screen belong to the PREVIOUS term, held there by
   *  `keepPreviousData` until the new one lands. */
  isShowingPreviousResults: boolean;
}

interface SubprofileDirectoryPageVM {
  items: SubprofileCardDTO[];
  total: number;
  page: number;
}

/**
 * The standalone-persona directory, searched SERVER-SIDE and paginated.
 *
 * This used to be a fetch-once set: page 1, then page 2, then page 3, each
 * awaiting the last, up to twenty sequential round trips of a hundred records
 * before a single card rendered, with every filter (including the text search)
 * applied afterwards in the browser. That made the search blind to anything
 * past the two-thousandth persona and made first paint cost a chain of
 * requests. The walk is gone. First paint is exactly ONE request, and "Show
 * more" fetches the next page instead of revealing rows already held.
 *
 * `query` is the filter the endpoint can apply itself, over the whole table
 * before paging (`ListSubprofileDirectoryQuery.query` →
 * `sp.displayName ILIKE :term OR sp.tagline ILIKE :term`, both columns carrying
 * a GIN trigram index). It matches the exact two columns the browser-side
 * predicate used to read, so no search behaviour is lost, and that predicate is
 * DELETED rather than left sitting on top of the server's: two spellings of one
 * filter is how a correct result set quietly loses rows.
 *
 * `kind` and tags are deliberately NOT sent, and this is the one thing here
 * that still needs backend work. The endpoint's `kind` takes a single enum
 * value while the profession chips are a multi-select OR facet, and there is no
 * `tags` param at all (persona tags are derived per page from
 * `subprofile_items.tags`, so filtering on them needs an EXISTS sub-predicate
 * and a new index). Sending a single `kind` would also narrow the pool the
 * Refine drawer counts its own chips from, which would read every other
 * profession as 0 and then drop it from the drawer entirely. Closing that
 * properly means the endpoint accepting repeated `kind` values and returning a
 * `facets` block, the way `GET /communities` and `GET /members` already do.
 * Until then profession, tags and open-to-collabs narrow the LOADED pages in
 * `useSubprofileDirectoryFilters`, which says so on screen.
 *
 * `keepPreviousData` holds the previous term's cards while the next term is in
 * flight, so typing swaps results instead of flashing the skeleton grid on
 * every keystroke, and react-query's `signal` is forwarded to `apiGet`, so a
 * fast typist's superseded requests are aborted rather than raced.
 */
export function useSubprofileDirectory(
  params: SubprofileDirectoryParams = {},
): SubprofileDirectoryResult {
  const { demoMode } = useDemoMode();
  const searchTerm = params.query?.trim() ?? "";
  const directoryQuery = useInfiniteQuery<SubprofileDirectoryPageVM>({
    // Every server-side filter rides in the key. Without the term in it a new
    // search would read the previous term's cached pages and render the wrong
    // personas; `demoMode` keeps the two modes' caches apart.
    queryKey: ["subprofiles", "directory", demoMode, searchTerm],
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    queryFn: async ({ pageParam, signal }) => {
      if (demoMode) {
        const { mockDirectory } = await import("../data/subprofiles.data");
        // The fixture applies the SAME display-name/tagline substring
        // predicate the endpoint does, so the demo directory searches
        // standalone. It has no pagination, so its single page IS the whole
        // matching set and `getNextPageParam` below yields nothing further.
        const items = mockDirectory(
          searchTerm ? { query: searchTerm } : undefined,
        );
        return { items, total: items.length, page: 1 };
      }
      const page = await getSubprofileDirectory(
        {
          page: pageParam as number,
          limit: DIRECTORY_PAGE_LIMIT,
          ...(searchTerm ? { query: searchTerm } : {}),
        },
        signal,
      );
      // `total` and `page` are always present on the real response. Defaulted
      // anyway so a backend (or an MSW fixture) that returns only `items`
      // degrades to a single page instead of an undefined comparison that
      // would page forever.
      return {
        items: page.items,
        total: page.total ?? page.items.length,
        page: page.page ?? (pageParam as number),
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce(
        (count, page) => count + page.items.length,
        0,
      );
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });

  const pages = useMemo(
    () => directoryQuery.data?.pages ?? [],
    [directoryQuery.data],
  );
  // Stable across renders, because the facet counts and the tag vocabulary in
  // `useSubprofileDirectoryFilters` are memoised on this array: a fresh
  // `flatMap` every render would recompute all five of them on every keystroke.
  const cards = useMemo(() => pages.flatMap((page) => page.items), [pages]);
  return {
    cards,
    total: pages[0]?.total ?? 0,
    hasNextPage: directoryQuery.hasNextPage,
    fetchNextPage: () => void directoryQuery.fetchNextPage(),
    isFetchingNextPage: directoryQuery.isFetchingNextPage,
    isLoading: directoryQuery.isLoading,
    isError: directoryQuery.isError,
    refetch: () => void directoryQuery.refetch(),
    isShowingPreviousResults: directoryQuery.isPlaceholderData,
  };
}
