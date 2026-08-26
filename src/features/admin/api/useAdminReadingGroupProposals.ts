import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminReadingGroupProposals,
  type AdminReadingGroupProposalDTO,
  type ReadingGroupFormat,
  type ReadingGroupProposalStatus,
} from "./adminReadingGroupProposals.api";

export type AdminReadingGroupFormatFilter = ReadingGroupFormat | "all";
/** The queue filter the console opens on: `pending` is "what needs a decision". */
export type AdminReadingGroupStatusFilter = ReadingGroupProposalStatus | "all";

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
  statusFilter: AdminReadingGroupStatusFilter = "all",
) {
  const { demoMode } = useDemoMode();
  const formatArg = filter === "all" ? undefined : filter;
  const statusArg = statusFilter === "all" ? undefined : statusFilter;
  const query = useInfiniteQuery<AdminReadingGroupProposalsPageVM>({
    queryKey: ["admin-reading-group-proposals", demoMode, filter, statusFilter],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { ADMIN_READING_GROUP_PROPOSALS } =
          await import("../adminReadingGroupProposals.data");
        const filtered = ADMIN_READING_GROUP_PROPOSALS.filter(
          (proposal) =>
            (!formatArg || proposal.format === formatArg) &&
            (!statusArg || proposal.status === statusArg),
        );
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
        status: statusArg,
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
