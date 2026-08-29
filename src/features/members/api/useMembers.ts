import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getMembers, type MembersPage } from "./members.api";
import { cardDtoToMemberCard } from "./members.adapters";
import type {
  DirectoryFacetCounts,
  MemberCard,
} from "../memberDirectoryFilter.data";

export interface MembersResult {
  /** All members fetched so far, flattened across loaded pages. */
  items: MemberCard[];
  /** Server-reported total across all pages. */
  total: number;
  /** Per-option availability counts for the sidebar's filter groups, read off
   *  the FIRST page: every page of one filter run shares the same facets, and
   *  they describe the whole matching set rather than the cards loaded so far.
   *  `undefined` in demo mode (the sidebar counts the mock list itself) and
   *  against a backend that doesn't send them — the sidebar then shows no
   *  badges, which is the honest fallback. */
  facets?: DirectoryFacetCounts;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  /** True when the initial (live) fetch failed — distinct from an empty
   *  directory. The page shows a retryable error state, not a false-empty. */
  isError: boolean;
  /** Re-run the query after a failure — wired to the error state's retry. */
  refetch: () => void;
  /** True while the previous filter run's results and counts are still on
   *  screen because the new one hasn't landed. The sidebar dims its counts on
   *  this rather than blanking them: a number that vanishes and returns on
   *  every tick is harder to read than one that briefly goes quiet. */
  isShowingPreviousResults: boolean;
}

interface MembersPageVM {
  items: MemberCard[];
  total: number;
  page: number;
  facets?: DirectoryFacetCounts;
}

/**
 * Directory source, paginated. Demo mode returns the page's own MemberCard
 * registry as a single synthetic page (full filter fidelity); live mode calls
 * GET /members?page= and appends each page, stopping at the server `total`.
 */
export function useMembers(
  params: {
    query?: string;
    tags?: string[];
    identities?: string[];
    openTo?: string[];
    hoods?: string[];
    disciplines?: string[];
    professions?: string[];
    languages?: string[];
    yearsFrom?: number;
    yearsTo?: number;
    /** Server-side sort order (a `MemberSort` wire token). Demo mode ignores it
     *  and sorts the mock list in the browser; see the page's `sortMembers`. */
    sort?: string;
  } = {},
): MembersResult {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<MembersPageVM>({
    queryKey: ["members", demoMode, params],
    initialPageParam: 1,
    // Every facet travels in the query key, so each tick of a filter is a new
    // key and would otherwise drop to `isLoading` — blanking the sidebar's
    // counts and flashing the grid's skeleton on every single click. Holding
    // the previous run's data until the new one lands keeps the numbers legible
    // while they update; `isShowingPreviousResults` says when they're stale.
    placeholderData: keepPreviousData,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { MEMBERS } = await import("../memberDirectoryFilter.data");
        return { items: MEMBERS, total: MEMBERS.length, page: 1 };
      }
      const res: MembersPage = await getMembers({
        ...params,
        page: pageParam as number,
      });
      return {
        items: res.items.map(cardDtoToMemberCard),
        total: res.total,
        page: res.page,
        facets: res.facets,
      };
    },
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });

  const pages = query.data?.pages ?? [];
  return {
    items: pages.flatMap((p) => p.items),
    total: pages[0]?.total ?? 0,
    facets: pages[0]?.facets,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
    isShowingPreviousResults: query.isPlaceholderData,
  };
}
