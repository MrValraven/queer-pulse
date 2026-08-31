import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { ItemsPage } from "../../../shared/api/pagination";
import {
  ADMIN_COOPS_DEMO,
  ADMIN_JOIN_REQUESTS_DEMO,
} from "../adminHousing.data";
import {
  type AdminJoinRequestDTO,
  getAdminCoops,
  getAdminJoinRequests,
} from "./adminHousing.api";
import type { HousingCoopDTO } from "../../economy/api/housingCoop.api";

export const ADMIN_HOUSING_COOPS_KEY = "admin-housing-coops";
export const ADMIN_HOUSING_JOIN_REQUESTS_KEY = "admin-housing-join-requests";

/**
 * Every housing coop on the platform, for the admin housing panel. Demo mode
 * returns the colocated (empty) fixture and never hits the network — this is
 * an admin-only endpoint that 403s for anyone else.
 */
export function useAdminHousingCoops() {
  const { demoMode } = useDemoMode();
  return useQuery<HousingCoopDTO[]>({
    queryKey: [ADMIN_HOUSING_COOPS_KEY, demoMode],
    initialData: demoMode ? ADMIN_COOPS_DEMO : undefined,
    queryFn: () => (demoMode ? ADMIN_COOPS_DEMO : getAdminCoops()),
  });
}

/**
 * The PENDING join requests across all coops, for the admin triage queue,
 * paginated (ENG-41).
 *
 * Two things changed here, and the first was a correctness bug rather than a
 * truncation: this hook used to fetch every request in every status and both
 * consumers filtered to `status === "pending"` in the browser. The endpoint
 * capped that fetch at the newest 200 rows, so a platform with 200 decided
 * requests newer than a pending one showed the admin an EMPTY queue while
 * somebody waited. The filter now travels in the query, and `total` is the real
 * number of people waiting rather than the length of whatever arrived.
 * `fetchNextPage` walks the rest, stopping once `page * pageSize` reaches that
 * total.
 *
 * Demo mode returns the colocated (empty) fixture as a single synthetic page and
 * never hits the network: this is an admin-only endpoint that 403s for anyone
 * else. Mirrors `useAdminGroupJoinRequests` for the sibling housing-groups
 * queue.
 */
export function useAdminJoinRequests() {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<ItemsPage<AdminJoinRequestDTO>>({
    queryKey: [ADMIN_HOUSING_JOIN_REQUESTS_KEY, demoMode],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      demoMode
        ? Promise.resolve({
            items: ADMIN_JOIN_REQUESTS_DEMO,
            total: ADMIN_JOIN_REQUESTS_DEMO.length,
            page: 1,
            pageSize: ADMIN_JOIN_REQUESTS_DEMO.length || 1,
          })
        : getAdminJoinRequests({
            page: pageParam as number,
            status: "pending",
          }),
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const requests = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, requests, total };
}
