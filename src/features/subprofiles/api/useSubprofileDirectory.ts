import { useMemo } from "react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getSubprofileDirectory,
  type SubprofileCardDTO,
  type SubprofileDirectoryFacetsDTO,
  type SubprofileDirectoryRefinement,
  type SubprofileDirectorySort,
} from "./subprofiles.api";
import {
  countDirectoryFacets,
  matchesRefinement,
} from "../subprofileDirectoryFacets";
import { sortDirectoryCards } from "../subprofileDirectorySort";

/** Page size. The endpoint defaults to 40 and caps `limit` at 100, so this is
 *  the largest slice one request can pull, which keeps the number of round
 *  trips down. Exported so a reader of the first page alone (the hero's wall
 *  of faces) can slice the flattened cards to it. */
export const DIRECTORY_PAGE_LIMIT = 100;

/** A copy of `values` in a fixed order, so picking the same chips in another
 *  order reads the same cached pages. */
const sortedList = <Value extends string>(values?: readonly Value[]) =>
  [...(values ?? [])].sort();

export interface SubprofileDirectoryParams extends SubprofileDirectoryRefinement {
  /** Free-text term, already trimmed and debounced by the caller. Sent as
   *  `?query=`: a case-insensitive substring match over `display_name` and
   *  `tagline`, both backed by GIN trigram indexes, OR an accent-folded match
   *  on the OWNER's name and profile handle for a linked persona. An empty
   *  string is a no-op server-side, so it is simply not sent. */
  query?: string;
  /** The order. Left out, nothing is sent and the server orders by name (demo
   *  mode does the same). The directory page always passes one. */
  sort?: SubprofileDirectorySort;
}

export interface SubprofileDirectoryResult {
  /** Every persona loaded so far, flattened across the fetched pages, already
   *  narrowed by the search term and every sidebar filter SERVER-SIDE. */
  cards: SubprofileCardDTO[];
  /** The sidebar's availability counts, read off the first page. Undefined
   *  while nothing has loaded, after a failed fetch, or from an older server
   *  that sends none: the sidebar then draws no numbers. */
  facets: SubprofileDirectoryFacetsDTO | undefined;
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

/** One cached page of the directory. Exported so cache patches
 *  (`directoryCardCache.ts`) type the infinite pages they rewrite. */
export interface SubprofileDirectoryPageVM {
  items: SubprofileCardDTO[];
  total: number;
  page: number;
  facets?: SubprofileDirectoryFacetsDTO;
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
 * a GIN trigram index, OR an accent-folded match on the owner's name and
 * profile handle for a LINKED persona). It covers everything the browser-side
 * predicate used to read, so no search behaviour is lost, and that predicate is
 * DELETED rather than left sitting on top of the server's: two spellings of one
 * filter is how a correct result set quietly loses rows.
 *
 * THE OWNER BRANCH IS LINKED-ONLY, matching the rule that fills the card's
 * `ownerName`/`ownerSlug`. A linked card is titled "Ana Silva | Poet", so the
 * name on screen has to be findable; an unlinked persona's owner is unnamed on
 * the card by design, and matching it here would hand that tie back out.
 *
 * THE SIDEBAR'S FILTERS ARE SERVER PARAMS TOO. Professions, tags,
 * availability and the "At the table" format and vibe go out as repeated
 * params (`getSubprofileDirectory`), so they narrow the whole table before
 * paging and `total` is the exact answer. Page 1 carries the `facets` block,
 * each group counted with its own selection lifted, which is what the sidebar
 * draws its numbers from. Demo mode does the same over the mock: the fixture
 * searches, `matchesRefinement` narrows, and `countDirectoryFacets` counts with
 * the endpoint's semantics, so the page reads one shape in both modes.
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
  const sort = params.sort ?? null;
  const refinement: SubprofileDirectoryRefinement = {
    kinds: sortedList(params.kinds),
    tags: sortedList(params.tags),
    availability: params.availability,
    tableFormats: sortedList(params.tableFormats),
    tableVibes: sortedList(params.tableVibes),
  };
  const directoryQuery = useInfiniteQuery<SubprofileDirectoryPageVM>({
    // Every server-side filter rides in the key. Without the term and the
    // sidebar's filters in it, a new search or chip would read the previous
    // set's cached pages and render the wrong personas; `demoMode` keeps the
    // two modes' caches apart. The order rides in it too, last, so the
    // `["subprofiles", "directory"]` prefix still reaches every cached page.
    queryKey: [
      "subprofiles",
      "directory",
      demoMode,
      searchTerm,
      refinement,
      sort,
    ],
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    queryFn: async ({ pageParam, signal }) => {
      if (demoMode) {
        const { mockDirectory } = await import("../data/subprofiles.data");
        // The fixture applies the SAME display-name/tagline substring
        // predicate the endpoint does, plus the same linked-only folded
        // owner-name branch, so the demo directory searches standalone. The
        // sidebar's filters and their counts then run over that searched set
        // with the endpoint's semantics. It has no pagination, so its single
        // page IS the whole matching set and `getNextPageParam` below yields
        // nothing further.
        const searchedPool = mockDirectory(
          searchTerm ? { query: searchTerm } : undefined,
        );
        const items = sortDirectoryCards(
          searchedPool.filter((card) => matchesRefinement(card, refinement)),
          sort ?? "name",
        );
        const facets = countDirectoryFacets(
          searchedPool,
          mockDirectory(),
          refinement,
        );
        return { items, total: items.length, page: 1, facets };
      }
      const page = await getSubprofileDirectory(
        {
          page: pageParam as number,
          limit: DIRECTORY_PAGE_LIMIT,
          ...(searchTerm ? { query: searchTerm } : {}),
          ...(sort ? { sort } : {}),
          ...refinement,
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
        facets: page.facets,
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
    // While the next filters are in flight, the previous page's counts stay
    // up and the sidebar draws them stale (`isShowingPreviousResults`).
    facets: pages[0]?.facets,
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
