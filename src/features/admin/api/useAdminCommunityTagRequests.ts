import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminCommunityTagRequests,
  type AdminCommunityTagRequestDTO,
  type CommunityTagRequestStatus,
} from "./communityTagRequests.api";

export type AdminCommunityTagRequestFilter = CommunityTagRequestStatus | "all";

interface AdminCommunityTagRequestsPageVM {
  items: AdminCommunityTagRequestDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Platform-wide community tag-request list for the admin review queue,
 * paginated and filterable by status. Demo mode returns the colocated
 * fixture (filtered client-side) as a single synthetic page and never hits
 * the network — this is a Moderator/Admin-only endpoint that 403s for anyone
 * else. Live mode calls `GET /admin/community-tag-requests?page&status`,
 * stopping once `page * pageSize` reaches the server's real `total`. Mirrors
 * `useAdminResourceSuggestions`.
 */
export function useAdminCommunityTagRequests(
  filter: AdminCommunityTagRequestFilter,
) {
  const { demoMode } = useDemoMode();
  const statusArg = filter === "all" ? undefined : filter;
  const query = useInfiniteQuery<AdminCommunityTagRequestsPageVM>({
    queryKey: ["admin-community-tag-requests", demoMode, filter],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { ADMIN_COMMUNITY_TAG_REQUESTS } = await import(
          "../adminCommunityTagRequests.data"
        );
        const filtered = statusArg
          ? ADMIN_COMMUNITY_TAG_REQUESTS.filter(
              (request) => request.status === statusArg,
            )
          : ADMIN_COMMUNITY_TAG_REQUESTS;
        return {
          items: filtered,
          total: filtered.length,
          page: 1,
          pageSize: filtered.length || 1,
        };
      }
      return getAdminCommunityTagRequests({
        page: pageParam as number,
        status: statusArg,
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
