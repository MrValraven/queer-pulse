import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { ItemsPage } from "../../../shared/api/pagination";
import { ADMIN_LISTING_DRAFTS } from "../adminListingDrafts.data";
import {
  getAdminListingDrafts,
  type AdminListingDraftDTO,
} from "./adminListingDrafts.api";

export const ADMIN_LISTING_DRAFTS_KEY = "admin-listing-drafts";

/**
 * Members' unfinished list-a-business drafts, paginated, so staff can offer a
 * hand to someone who stalled partway. `total` is the size of the whole set,
 * not of the pages fetched so far.
 *
 * Demo reads the colocated fixture as a single synthetic page and never hits
 * the network: the endpoint is Admin-only and the fixture is fabricated data
 * that must never surface as platform truth. Mirrors `useListingClaims`.
 */
export function useAdminListingDrafts() {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<ItemsPage<AdminListingDraftDTO>>({
    queryKey: [ADMIN_LISTING_DRAFTS_KEY, demoMode],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      demoMode
        ? Promise.resolve({
            items: ADMIN_LISTING_DRAFTS,
            total: ADMIN_LISTING_DRAFTS.length,
            page: 1,
            pageSize: ADMIN_LISTING_DRAFTS.length || 1,
          })
        : getAdminListingDrafts(pageParam as number),
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const rows = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, rows, total };
}
