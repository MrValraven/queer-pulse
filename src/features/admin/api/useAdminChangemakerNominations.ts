import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminChangemakerNominations,
  type AdminChangemakerNominationDTO,
} from "./adminChangemakerNominations.api";

interface AdminChangemakerNominationsPageVM {
  items: AdminChangemakerNominationDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Platform-wide changemaker-nomination list for the admin oversight page,
 * paginated. Demo mode returns the colocated fixture as a single synthetic page
 * and never hits the network — this is an admin-only endpoint that 403s
 * otherwise, and the fixture is fabricated data that must not surface as platform
 * truth in live mode. Live mode calls `GET /admin/changemaker-nominations?page`,
 * stopping once `page * pageSize` reaches the server's real `total`.
 */
export function useAdminChangemakerNominations() {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<AdminChangemakerNominationsPageVM>({
    queryKey: ["admin-changemaker-nominations", demoMode],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { ADMIN_CHANGEMAKER_NOMINATIONS } = await import(
          "../adminChangemakerNominations.data"
        );
        return {
          items: ADMIN_CHANGEMAKER_NOMINATIONS,
          total: ADMIN_CHANGEMAKER_NOMINATIONS.length,
          page: 1,
          pageSize: ADMIN_CHANGEMAKER_NOMINATIONS.length || 1,
        };
      }
      return getAdminChangemakerNominations({ page: pageParam as number });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const nominations = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, nominations, total };
}
