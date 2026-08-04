import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminCommissionInterests,
  type AdminCommissionInterestDTO,
  type CommissionCategory,
} from "./adminCommissionInterests.api";

export type AdminCommissionCategoryFilter = CommissionCategory | "all";

interface AdminCommissionInterestsPageVM {
  items: AdminCommissionInterestDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Platform-wide commission-interest list for the admin oversight page, paginated
 * and optionally filtered by category. Demo mode returns the colocated fixture
 * (filtered client-side) as a single synthetic page and never hits the network —
 * this is an admin-only endpoint that 403s otherwise, and the fixture is
 * fabricated data that must not surface as platform truth in live mode. Live mode
 * calls `GET /admin/commission-interests?page&category`, stopping once
 * `page * pageSize` reaches the server's real `total`.
 */
export function useAdminCommissionInterests(
  filter: AdminCommissionCategoryFilter,
) {
  const { demoMode } = useDemoMode();
  const categoryArg = filter === "all" ? undefined : filter;
  const query = useInfiniteQuery<AdminCommissionInterestsPageVM>({
    queryKey: ["admin-commission-interests", demoMode, filter],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { ADMIN_COMMISSION_INTERESTS } = await import(
          "../adminCommissionInterests.data"
        );
        const filtered = categoryArg
          ? ADMIN_COMMISSION_INTERESTS.filter(
              (interest) => interest.commissionCategory === categoryArg,
            )
          : ADMIN_COMMISSION_INTERESTS;
        return {
          items: filtered,
          total: filtered.length,
          page: 1,
          pageSize: filtered.length || 1,
        };
      }
      return getAdminCommissionInterests({
        page: pageParam as number,
        category: categoryArg,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const interests = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, interests, total };
}
