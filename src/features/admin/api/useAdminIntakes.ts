import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminIntakes,
  type AdminIntakeDTO,
  type AdminIntakeKind,
  type AdminIntakeListDTO,
  type AdminIntakeStatus,
} from "./adminIntakes.api";

/** "all" is the console's own idea, not a server value: it just omits the
 *  matching query parameter. */
export type AdminIntakeKindFilter = AdminIntakeKind | "all";
export type AdminIntakeStatusFilter = AdminIntakeStatus | "all";

export interface AdminIntakeFilters {
  kind: AdminIntakeKindFilter;
  status: AdminIntakeStatusFilter;
}

/** Shared prefix for every `useAdminIntakes` query, so a triage can patch and
 *  invalidate every filter tab at once. */
export const ADMIN_INTAKES_QUERY_KEY = ["admin-intakes"] as const;

/**
 * The platform-wide intake list behind `/admin/intakes`, paginated and
 * optionally narrowed by kind and triage status (both server-side).
 *
 * Demo mode returns the colocated fixture, filtered client-side, as one
 * synthetic page and never touches the network: the endpoint is admin-only and
 * 403s otherwise, and the fixture is fabricated data that must never read as
 * platform truth. Live mode calls `GET /intakes?kind&status&page`, stopping once
 * `page * pageSize` reaches the server's real `total`.
 */
export function useAdminIntakes(filters: AdminIntakeFilters) {
  const { demoMode } = useDemoMode();
  const kindArgument = filters.kind === "all" ? undefined : filters.kind;
  const statusArgument = filters.status === "all" ? undefined : filters.status;

  const query = useInfiniteQuery<AdminIntakeListDTO>({
    queryKey: [
      ...ADMIN_INTAKES_QUERY_KEY,
      demoMode,
      filters.kind,
      filters.status,
    ],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { ADMIN_INTAKES } = await import("../adminIntakes.data");
        const filtered = ADMIN_INTAKES.filter(
          (intake) =>
            (!kindArgument || intake.kind === kindArgument) &&
            (!statusArgument || intake.status === statusArgument),
        );
        return {
          items: filtered,
          total: filtered.length,
          page: 1,
          pageSize: filtered.length || 1,
        };
      }
      return getAdminIntakes({
        page: pageParam as number,
        kind: kindArgument,
        status: statusArgument,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });

  const intakes: AdminIntakeDTO[] =
    query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, intakes, total };
}
