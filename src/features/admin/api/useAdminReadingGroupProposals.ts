import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminReadingGroupProposals,
  type AdminReadingGroupProposalDTO,
  type ReadingGroupFormat,
} from "./adminReadingGroupProposals.api";

export type AdminReadingGroupFormatFilter = ReadingGroupFormat | "all";

interface AdminReadingGroupProposalsPageVM {
  items: AdminReadingGroupProposalDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Platform-wide reading-group-proposal list for the admin oversight page,
 * paginated and optionally filtered by format. Demo mode returns the colocated
 * fixture (filtered client-side) as a single synthetic page and never hits the
 * network — this is an admin-only endpoint that 403s otherwise, and the fixture
 * is fabricated data that must not surface as platform truth in live mode. Live
 * mode calls `GET /admin/reading-group-proposals?page&format`, stopping once
 * `page * pageSize` reaches the server's real `total`.
 */
export function useAdminReadingGroupProposals(
  filter: AdminReadingGroupFormatFilter,
) {
  const { demoMode } = useDemoMode();
  const formatArg = filter === "all" ? undefined : filter;
  const query = useInfiniteQuery<AdminReadingGroupProposalsPageVM>({
    queryKey: ["admin-reading-group-proposals", demoMode, filter],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { ADMIN_READING_GROUP_PROPOSALS } =
          await import("../adminReadingGroupProposals.data");
        const filtered = formatArg
          ? ADMIN_READING_GROUP_PROPOSALS.filter(
              (proposal) => proposal.format === formatArg,
            )
          : ADMIN_READING_GROUP_PROPOSALS;
        return {
          items: filtered,
          total: filtered.length,
          page: 1,
          pageSize: filtered.length || 1,
        };
      }
      return getAdminReadingGroupProposals({
        page: pageParam as number,
        format: formatArg,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const proposals = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, proposals, total };
}
