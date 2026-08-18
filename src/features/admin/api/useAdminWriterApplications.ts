import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminWriterApplications,
  type AdminWriterApplicationDTO,
  type AdminWriterApplicationsPageDTO,
} from "./adminWriterApplications.api";
import type { WriterApplicationStatus } from "../../magazine/api/writerApplications.api";

export type AdminWriterApplicationFilter = WriterApplicationStatus | "all";

export function useAdminWriterApplications(
  filter: AdminWriterApplicationFilter,
) {
  const { demoMode } = useDemoMode();
  const statusArg = filter === "all" ? undefined : filter;
  const query = useInfiniteQuery<AdminWriterApplicationsPageDTO>({
    queryKey: ["admin-writer-applications", demoMode, filter],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { ADMIN_WRITER_APPLICATIONS } = await import(
          "../adminWriterApplications.data"
        );
        const filtered = statusArg
          ? ADMIN_WRITER_APPLICATIONS.filter(
              (item) => item.status === statusArg,
            )
          : ADMIN_WRITER_APPLICATIONS;
        return {
          items: filtered,
          total: filtered.length,
          page: 1,
          pageSize: filtered.length || 1,
        };
      }
      return getAdminWriterApplications({
        page: pageParam as number,
        status: statusArg,
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const applications: AdminWriterApplicationDTO[] =
    query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, applications, total };
}
