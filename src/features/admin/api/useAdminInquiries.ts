import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getAdminInquiries,
  type AdminInquiryDTO,
  type AdminInquiryListDTO,
  type InquiryKind,
  type InquiryStatus,
} from "./adminInquiries.api";

export type AdminInquiryKindFilter = InquiryKind | "all";
export type AdminInquiryStatusFilter = InquiryStatus | "all";

export interface AdminInquiryFilters {
  kind: AdminInquiryKindFilter;
  status: AdminInquiryStatusFilter;
}

/** Shared prefix for every `useAdminInquiries` query, so marking one handled
 *  patches and invalidates every filter tab at once. */
export const ADMIN_INQUIRIES_QUERY_KEY = ["admin-inquiries"] as const;

/**
 * The public contact + partnership inbox behind `/admin/intakes`, paginated and
 * optionally narrowed by kind and status (both server-side).
 *
 * `unhandledCount` comes straight off the server and counts every row still
 * waiting, honouring the kind filter and ignoring the status one — so it is the
 * badge, and the loaded page is never counted client-side. Demo mode serves the
 * colocated fixture as one synthetic page and computes the same count from the
 * whole fixture rather than from the filtered slice.
 */
export function useAdminInquiries(filters: AdminInquiryFilters) {
  const { demoMode } = useDemoMode();
  const kindArgument = filters.kind === "all" ? undefined : filters.kind;
  const statusArgument = filters.status === "all" ? undefined : filters.status;

  const query = useInfiniteQuery<AdminInquiryListDTO>({
    queryKey: [
      ...ADMIN_INQUIRIES_QUERY_KEY,
      demoMode,
      filters.kind,
      filters.status,
    ],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { ADMIN_INQUIRIES } = await import("../adminInquiries.data");
        const ofKind = ADMIN_INQUIRIES.filter(
          (inquiry) => !kindArgument || inquiry.kind === kindArgument,
        );
        const filtered = ofKind.filter(
          (inquiry) => !statusArgument || inquiry.status === statusArgument,
        );
        return {
          items: filtered,
          total: filtered.length,
          page: 1,
          pageSize: filtered.length || 1,
          unhandledCount: ofKind.filter((inquiry) => inquiry.status === "new")
            .length,
        };
      }
      return getAdminInquiries({
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

  const inquiries: AdminInquiryDTO[] =
    query.data?.pages.flatMap((page) => page.items) ?? [];
  const firstPage = query.data?.pages[0];
  return {
    ...query,
    inquiries,
    total: firstPage?.total ?? 0,
    unhandledCount: firstPage?.unhandledCount ?? 0,
  };
}
