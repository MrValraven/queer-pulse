import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminConcerns,
  type AdminConcernDTO,
  type ConcernStatus,
} from "./adminConcerns.api";

export type AdminConcernStatusFilter = ConcernStatus | "all";

interface AdminConcernsPageVM {
  items: AdminConcernDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Platform-wide governance-concern list for the admin dashboard, paginated and
 * optionally filtered by triage status (server-side). Demo mode returns the
 * colocated fixture (filtered client-side) as one synthetic page and never hits
 * the network — this endpoint is admin-only and 403s otherwise, and the fixture
 * is fabricated data that must not surface as platform truth in live mode. Live
 * mode calls `GET /intakes?kind=governance_concern&status&page`, stopping once
 * `page * pageSize` reaches the server's real `total`.
 */
export function useAdminConcerns(filter: AdminConcernStatusFilter) {
  const { demoMode } = useDemoMode();
  const statusArg = filter === "all" ? undefined : filter;
  const query = useInfiniteQuery<AdminConcernsPageVM>({
    queryKey: ["admin-concerns", demoMode, filter],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { ADMIN_CONCERNS } = await import("../adminConcerns.data");
        const filtered = statusArg
          ? ADMIN_CONCERNS.filter((concern) => concern.status === statusArg)
          : ADMIN_CONCERNS;
        return {
          items: filtered,
          total: filtered.length,
          page: 1,
          pageSize: filtered.length || 1,
        };
      }
      return getAdminConcerns({
        page: pageParam as number,
        status: statusArg,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const concerns = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, concerns, total };
}
