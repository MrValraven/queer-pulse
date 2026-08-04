import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminMagazineSubmissions,
  type AdminMagazineSubmissionDTO,
  type MagazineSubmissionStatus,
} from "./adminMagazineSubmissions.api";

export type AdminMagazineSubmissionFilter = MagazineSubmissionStatus | "all";

interface AdminMagazineSubmissionsPageVM {
  items: AdminMagazineSubmissionDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Platform-wide story-submission list for the admin oversight page, paginated
 * and optionally filtered by status. Demo mode returns the colocated fixture
 * (filtered client-side) as a single synthetic page and never hits the network —
 * this is an admin-only endpoint that 403s otherwise, and the fixture is
 * fabricated data that must not surface as platform truth in live mode. Live mode
 * calls `GET /admin/magazine-submissions?page&status`, stopping once
 * `page * pageSize` reaches the server's real `total`.
 */
export function useAdminMagazineSubmissions(
  filter: AdminMagazineSubmissionFilter,
) {
  const { demoMode } = useDemoMode();
  const statusArg = filter === "all" ? undefined : filter;
  const query = useInfiniteQuery<AdminMagazineSubmissionsPageVM>({
    queryKey: ["admin-magazine-submissions", demoMode, filter],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { ADMIN_MAGAZINE_SUBMISSIONS } = await import(
          "../adminMagazineSubmissions.data"
        );
        const filtered = statusArg
          ? ADMIN_MAGAZINE_SUBMISSIONS.filter(
              (submission) => submission.status === statusArg,
            )
          : ADMIN_MAGAZINE_SUBMISSIONS;
        return {
          items: filtered,
          total: filtered.length,
          page: 1,
          pageSize: filtered.length || 1,
        };
      }
      return getAdminMagazineSubmissions({
        page: pageParam as number,
        status: statusArg,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const submissions = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, submissions, total };
}
