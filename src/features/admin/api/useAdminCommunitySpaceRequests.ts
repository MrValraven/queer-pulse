import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminCommunitySpaceRequests,
  type AdminCommunitySpaceRequestListDTO,
  type AdminCommunitySpaceRequestStatus,
} from "./adminCommunitySpaceRequests.api";

export type AdminCommunitySpaceRequestFilter =
  AdminCommunitySpaceRequestStatus | "all";

/** Shared prefix for every `useAdminCommunitySpaceRequests` infinite query
 *  (the full key also carries `demoMode` + the active filter). Shared so
 *  `useDecideCommunitySpaceRequest` can patch/invalidate every filter tab's
 *  cache at once without the key drifting out of sync. */
export const SPACE_REQUESTS_QUERY_KEY = [
  "admin-community-space-requests",
] as const;

/**
 * Platform-wide "Request spaces" list for the admin review queue, paginated
 * and filterable by status. Demo mode returns the colocated fixture (filtered
 * client-side) as a single synthetic page and never hits the network: this
 * is a Moderator/Admin-only endpoint that 403s for anyone else. Live mode
 * calls `GET /admin/community-space-requests?page&status`, stopping once
 * `page * pageSize` reaches the server's real `total`. Mirrors
 * `useAdminCommunityTagRequests`.
 */
export function useAdminCommunitySpaceRequests(
  filter: AdminCommunitySpaceRequestFilter,
) {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery({
    queryKey: [...SPACE_REQUESTS_QUERY_KEY, demoMode, filter],
    initialPageParam: 1,
    queryFn: async ({
      pageParam,
    }): Promise<AdminCommunitySpaceRequestListDTO> => {
      if (demoMode) {
        const { ADMIN_COMMUNITY_SPACE_REQUESTS } =
          await import("../adminCommunitySpaceRequests.data");
        const items =
          filter === "all"
            ? ADMIN_COMMUNITY_SPACE_REQUESTS
            : ADMIN_COMMUNITY_SPACE_REQUESTS.filter(
                (request) => request.status === filter,
              );
        return {
          items,
          total: items.length,
          page: 1,
          pageSize: items.length || 1,
        };
      }
      return getAdminCommunitySpaceRequests({
        page: pageParam,
        status: filter === "all" ? undefined : filter,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const requests = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, requests, total };
}
