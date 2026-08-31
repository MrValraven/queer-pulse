import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { ItemsPage } from "../../../shared/api/pagination";
import { ADMIN_LISTING_CLAIMS } from "../listingClaims.data";
import { getListingClaims, type ListingClaimDTO } from "./listingClaims.api";

/** Shared with `useReviewListingClaim`, which invalidates this key on
 *  success. */
export const LISTING_CLAIMS_KEY = "admin-listing-claims";

/**
 * The pending "claim this listing" review queue, paginated (ENG-41).
 *
 * The endpoint used to answer with a flat array capped at 200 rows, and this
 * hook read the whole array as if it were the whole queue. A desk with 201
 * pending claims therefore hid the most recently filed one from every moderator,
 * with nothing on screen saying anything was missing. `total` is now the real
 * size of the pending queue and `fetchNextPage` walks the rest of it, stopping
 * once `page * pageSize` reaches that total.
 *
 * Demo mode reads the colocated fixture as a single synthetic page and never
 * hits the network: this is a Moderator/Admin-only endpoint that 403s for anyone
 * else, and the fixture is fabricated data that must never surface as platform
 * truth. Mirrors `useAdminCommunityTagRequests`.
 */
export function useListingClaims() {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<ItemsPage<ListingClaimDTO>>({
    queryKey: [LISTING_CLAIMS_KEY, demoMode],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      demoMode
        ? Promise.resolve({
            items: ADMIN_LISTING_CLAIMS,
            total: ADMIN_LISTING_CLAIMS.length,
            page: 1,
            pageSize: ADMIN_LISTING_CLAIMS.length || 1,
          })
        : getListingClaims(pageParam as number),
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const rows = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, rows, total };
}
