import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getPartners, type Region } from "./partners.api";
import { cardToPartner } from "./partners.adapters";
import type { Partner } from "../partnerDetails.types";

export interface PartnersResult {
  /** All partners fetched so far, flattened across loaded pages. */
  items: Partner[];
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

interface PartnersPageVM {
  items: Partner[];
  total: number;
  page: number;
}

/**
 * Partners listing source (approved partners only), paginated in live mode.
 *
 * Demo mode returns the page's own `PARTNERS` registry as a single synthetic
 * page — same items, no network, and `hasNextPage` resolves to false (loaded
 * === total) so no "Load more" ever appears and the demo render is unchanged.
 *
 * Live mode calls GET /partners?region=&page= and appends each page, stopping
 * at the server `total`. The page's region chips filter client-side over
 * whatever has been loaded, in both modes, exactly as the prototype does today.
 */
export function usePartners(params: { region?: Region } = {}): PartnersResult {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<PartnersPageVM>({
    queryKey: ["partners", demoMode, params],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { PARTNERS } = await import("../partnerDetails");
        return { items: PARTNERS, total: PARTNERS.length, page: 1 };
      }
      const res = await getPartners({ ...params, page: pageParam as number });
      return {
        items: res.items.map(cardToPartner),
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
