import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { CAUSES } from "../causes.data";
import {
  getOpportunities,
  type Cause,
  type Commit,
  type VolunteerFacets,
} from "./volunteering.api";
import { opportunityKeys } from "./opportunityKeys";
import { cardToOpportunity } from "./volunteering.adapters";
import type { VolunteerOpportunity } from "../volunteerOpportunities";

export interface OpportunitiesResult {
  /** All opportunities fetched so far, flattened across loaded pages. */
  items: VolunteerOpportunity[];
  /** Server-reported total across all pages. */
  total: number;
  /** True when another page is available (always false in demo). */
  hasNextPage: boolean;
  /** Fetch and append the next page (no-op once exhausted / in demo). */
  fetchNextPage: () => void;
  /** True while a subsequent page loads. */
  isFetchingNextPage: boolean;
  /**
   * True when only the NEXT page failed (ENG-501). react-query sets `isError`
   * as well, so the page keeps the roles already loaded and retries that page
   * from its footer with `fetchNextPage`.
   */
  isFetchNextPageError: boolean;
  /** True while the first page is in flight. */
  isLoading: boolean;
  /**
   * True when the list read failed (DES-22). The page MUST branch on this
   * before it branches on `items.length === 0`: an outage rendered as "no
   * opportunities" tells a member nobody needs help.
   */
  isError: boolean;
  /** Re-run the failed read, for the error state's retry. */
  refetch: () => void;
  /**
   * The sidebar's availability counts, read off the FIRST page: every page of
   * one filter run shares them. Undefined while that page is in flight, after
   * it failed, and on a server that predates the facets. Undefined means "not
   * counted", which must never render as a `0`.
   */
  facets: VolunteerFacets | undefined;
}

interface OpportunitiesPageVM {
  items: VolunteerOpportunity[];
  total: number;
  page: number;
  facets?: VolunteerFacets;
}

/**
 * Demo mode's stand-in for the live endpoint's `facets`, with the same rules:
 * each group is counted with its own filter lifted and the other applied, and
 * an opportunity counts once under each of its causes. `includes` matches the
 * API's overlap filter, so a cause listed second or third still counts.
 */
function countDemoFacets(
  items: readonly VolunteerOpportunity[],
  params: { cause?: Cause; commit?: Commit },
): VolunteerFacets {
  const commitCounts: Record<Commit, number> = { low: 0, medium: 0 };
  const causeCounts = Object.fromEntries(
    CAUSES.map((definition) => [definition.value, 0]),
  ) as Record<Cause, number>;
  let allCausesCount = 0;
  for (const opportunity of items) {
    const isUnderCause =
      params.cause === undefined || opportunity.causes.includes(params.cause);
    const isUnderCommit =
      params.commit === undefined || opportunity.commit === params.commit;
    if (isUnderCause) commitCounts[opportunity.commit] += 1;
    if (isUnderCommit) {
      allCausesCount += 1;
      for (const cause of opportunity.causes) causeCounts[cause] += 1;
    }
  }
  return {
    commit: commitCounts,
    cause: causeCounts,
    allCauses: allCausesCount,
  };
}

/**
 * Volunteer opportunities list source, paginated in live mode.
 *
 * Demo mode returns the page's own `VOLUNTEER_OPPORTUNITIES` registry as a
 * single synthetic page — same items, no network, and `hasNextPage` resolves to
 * false (loaded === total) so no "Load more" appears and the demo render is
 * unchanged.
 *
 * Live mode calls GET /volunteering?cause=&commit=&page= and appends each page,
 * stopping at the server `total`. `cause` is lowercase on the wire; the page
 * Title-cases it for display. The page's own cause/commitment chips filter
 * client-side over whatever has been loaded, in both modes, as they do today.
 */
export function useOpportunities(
  params: { cause?: Cause; commit?: Commit } = {},
): OpportunitiesResult {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<OpportunitiesPageVM>({
    queryKey: opportunityKeys.list(params, demoMode),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { VOLUNTEER_OPPORTUNITIES } =
          await import("../volunteerOpportunities");
        return {
          items: VOLUNTEER_OPPORTUNITIES,
          total: VOLUNTEER_OPPORTUNITIES.length,
          page: 1,
          // The demo page ignores the params, so its counts are taken here
          // over the whole registry, the way the server takes them.
          facets: countDemoFacets(VOLUNTEER_OPPORTUNITIES, params),
        };
      }
      const res = await getOpportunities({
        ...params,
        page: pageParam as number,
      });
      return {
        items: res.items.map(cardToOpportunity),
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
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
    facets: pages[0]?.facets,
  };
}
