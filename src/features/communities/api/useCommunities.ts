import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getCommunities, type CommunitiesQuery } from "./communities.api";
import { cardDtoToCommunity } from "./communities.adapters";
import { communities } from "../../homepage/data/communities";
import type { Community } from "../../homepage/data/types";

export interface CommunitiesResult {
  /** Every community fetched so far, flattened across the loaded pages. */
  items: Community[];
  /** Server-reported total across all pages (demo: the registry length). */
  total: number;
  /** True when another page is available (live only — always false in demo). */
  hasNextPage: boolean;
  /** Fetch and append the next page (no-op once `hasNextPage` is false). */
  fetchNextPage: () => void;
  /** True while a subsequent page is loading. */
  isFetchingNextPage: boolean;
  /** True while the first page is in flight. */
  isLoading: boolean;
}

interface CommunitiesPageVM {
  items: Community[];
  total: number;
  page: number;
}

/**
 * Discover-grid source, paginated. Demo mode returns the page's own static
 * `communities` registry as a single synthetic page (full fidelity for the type
 * chips + living-card stats) — `getNextPageParam` then sees loaded === total and
 * yields `undefined`, so demo never shows a "Load more" and renders exactly as
 * it does today. Live mode calls GET /communities?filter=…&page= and appends
 * each page, adapting every card to the same view-model and stopping at the
 * server `total`.
 *
 * The page's category chips still filter client-side over whatever is loaded,
 * so demo behaviour is byte-for-byte today's. Live mode hides private
 * communities from non-members (the API omits them from the list).
 */
export function useCommunities(
  params: CommunitiesQuery = {},
  options: { enabled?: boolean } = {},
): CommunitiesResult {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<CommunitiesPageVM>({
    queryKey: ["communities", demoMode, params],
    // Callers may gate this fetch off when its result isn't consumed (e.g. a
    // profile viewing another member). Demo mode's queryFn is a local no-network
    // read, but gating it too keeps the discarded-path behaviour consistent.
    enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        return { items: communities, total: communities.length, page: 1 };
      }
      const res = await getCommunities({
        ...params,
        page: pageParam as number,
      });
      return {
        items: res.items.map(cardDtoToCommunity),
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
