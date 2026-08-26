import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "./demoAwareMutation";
import {
  getAdminDsarRequests,
  updateAdminDsarRequest,
  type AdminDsarRequestDTO,
  type AdminDsarStatus,
  type AdminDsarTargetStatus,
} from "./adminDsar.api";

export type AdminDsarFilter = AdminDsarStatus | "all";

/** Shared prefix for every DSAR queue query; the full key also carries
 *  `demoMode` and the active filter. */
const DSAR_QUERY_KEY = ["admin-dsar"] as const;

interface AdminDsarPageVM {
  items: AdminDsarRequestDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * The data-subject request queue, closest statutory deadline first (the
 * backend owns that sort, so the order arrives already correct and no client
 * re-sort can disagree with the paging).
 *
 * Demo mode serves the colocated `ADMIN_DSAR_REQUESTS` fixture as one
 * synthetic page and never touches the network: this is a Moderator/Admin
 * endpoint that 403s otherwise, and the fixture is fabricated data that must
 * not surface as platform truth. Live mode calls `GET /admin/dsar?page&status`,
 * stopping once `page * pageSize` reaches the server's real `total`.
 */
export function useAdminDsarRequests(filter: AdminDsarFilter) {
  const { demoMode } = useDemoMode();
  const statusArg = filter === "all" ? undefined : filter;
  const query = useInfiniteQuery<AdminDsarPageVM>({
    queryKey: [...DSAR_QUERY_KEY, demoMode, filter],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { ADMIN_DSAR_REQUESTS } = await import("../adminDsar.data");
        const filtered = statusArg
          ? ADMIN_DSAR_REQUESTS.filter(
              (request) => request.status === statusArg,
            )
          : ADMIN_DSAR_REQUESTS;
        const sorted = [...filtered].sort(
          (first, second) => first.daysRemaining - second.daysRemaining,
        );
        // pageSize === sorted.length (min 1) so getNextPageParam yields
        // undefined; demo never issues a page-2 fetch.
        return {
          items: sorted,
          total: sorted.length,
          page: 1,
          pageSize: sorted.length || 1,
        };
      }
      return getAdminDsarRequests({
        page: pageParam as number,
        ...(statusArg ? { status: statusArg } : {}),
      });
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const requests = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, requests, total };
}

/**
 * Replace one request everywhere the paginated cache holds it, dropping it
 * from any cached tab whose status filter the new status no longer matches.
 *
 * The queue's tabs ARE a status filter, so a plain in-place patch would leave
 * a just-resolved request sitting under "Received" with its action merely
 * disabled. Same approach as `useResolveCommunityTagRequest`: read each cached
 * query's own filter off its key, patch or splice accordingly.
 */
function patchRequestInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updated: AdminDsarRequestDTO,
) {
  const matched = queryClient.getQueriesData<{ pages: AdminDsarPageVM[] }>({
    queryKey: DSAR_QUERY_KEY,
  });
  for (const [queryKey, currentData] of matched) {
    if (!currentData) continue;
    const queryFilter = queryKey[2] as AdminDsarFilter | undefined;
    const stillMatches =
      queryFilter === "all" ||
      queryFilter === undefined ||
      queryFilter === updated.status;
    queryClient.setQueryData(queryKey, {
      ...currentData,
      pages: currentData.pages.map((page) => ({
        ...page,
        items: stillMatches
          ? page.items.map((row) => (row.id === updated.id ? updated : row))
          : page.items.filter((row) => row.id !== updated.id),
      })),
    });
  }
}

export interface UpdateAdminDsarVars {
  request: AdminDsarRequestDTO;
  status: AdminDsarTargetStatus;
  outcomeNote: string;
}

/**
 * Move a request along and record the outcome, from the queue's detail pane.
 *
 * Demo mode never touches the network and resolves a synthesized row; live
 * mode calls `PATCH /admin/dsar/:id`. Either way the cache is patched from the
 * RESULT in `onSuccess`, never optimistically, so a row only reads "resolved"
 * once the write is real and the member's notification has actually been
 * fired. `silentError` because the caller tells a 409 ("this moved on") apart
 * from a genuine failure.
 */
export function useUpdateAdminDsarRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminDsarRequestDTO,
    unknown,
    UpdateAdminDsarVars
  >({
    demoMode,
    mutationKey: [...DSAR_QUERY_KEY, "update"],
    meta: { silentError: true },
    demoResult: ({ request, status, outcomeNote }) => ({
      ...request,
      status,
      outcomeNote: outcomeNote || request.outcomeNote,
      respondedAt:
        status === "in_review" ? request.respondedAt : new Date().toISOString(),
      isOverdue: status === "in_review" ? request.isOverdue : false,
    }),
    live: ({ request, status, outcomeNote }) =>
      updateAdminDsarRequest(request.id, {
        status,
        ...(outcomeNote ? { outcomeNote } : {}),
      }),
    logLabel: "admin.dsar.update",
    logContext: ({ request, status }) => ({ id: request.id, status }),
    onSuccess: (updated) => {
      patchRequestInCache(queryClient, updated);
    },
  });
}
