import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminInvites,
  type AdminInviteDTO,
  type AdminInviteStatus,
} from "./adminInvites.api";

export type AdminInviteFilter = AdminInviteStatus | "all";

interface AdminInvitesPageVM {
  items: AdminInviteDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Platform-wide invite list for the admin oversight page, paginated and
 * optionally filtered by status. Demo mode returns the colocated
 * `ADMIN_INVITES` fixture (filtered client-side) as a single synthetic page and
 * never hits the network — this is an admin-only endpoint that 403s otherwise,
 * and the fixture is fabricated data that must not surface as platform truth in
 * live mode. Live mode calls `GET /admin/invites?page&status`, stopping once
 * `page * pageSize` reaches the server's real `total`.
 */
export function useAdminInvites(filter: AdminInviteFilter) {
  const { demoMode } = useDemoMode();
  const statusArg = filter === "all" ? undefined : filter;
  const query = useInfiniteQuery<AdminInvitesPageVM>({
    queryKey: ["admin-invites", demoMode, filter],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { ADMIN_INVITES } = await import("../adminInvites.data");
        const filtered = statusArg
          ? ADMIN_INVITES.filter((invite) => invite.status === statusArg)
          : ADMIN_INVITES;
        // pageSize === filtered.length (min 1) so getNextPageParam yields
        // undefined — demo never issues a page-2 fetch.
        return {
          items: filtered,
          total: filtered.length,
          page: 1,
          pageSize: filtered.length || 1,
        };
      }
      return getAdminInvites({ page: pageParam as number, status: statusArg });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const invites = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, invites, total };
}
