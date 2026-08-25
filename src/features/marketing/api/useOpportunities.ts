import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getOpportunities, type Cause, type Commit } from "./volunteering.api";
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
  /** True while the first page is in flight. */
  isLoading: boolean;
}

interface OpportunitiesPageVM {
  items: VolunteerOpportunity[];
  total: number;
  page: number;
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
    isLoading: query.isLoading,
  };
}
