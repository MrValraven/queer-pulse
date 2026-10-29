import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { studioErrorCodeOf } from "../../studio/api/studio.api";
import type { StudioAccessGrantDTO } from "../../studio/api/studio.types";
import { STUDIO_ADMIN_SILENT_META } from "../studioAdminDemoErrors";
import { useDemoAwareMutation } from "./demoAwareMutation";
import { ADMIN_STUDIO_KEY } from "./StudioAdminCurationHooks";
import {
  accessRequestPagesWithout,
  dismissAdminStudioAccessRequest,
  getAdminStudioAccessRequests,
  grantAdminStudioAccessRequest,
  type AdminStudioAccessRequestDTO,
  type AdminStudioAccessRequestPageDTO,
} from "./studioAccessRequestsAdmin.api";
import { memberStudioAccessKey } from "./useAdminStudio";

type AccessRequestPages = InfiniteData<AdminStudioAccessRequestPageDTO>;

export const adminStudioAccessRequestsKey = (demoMode: boolean) =>
  [ADMIN_STUDIO_KEY, "access-requests", demoMode] as const;

/** Waiting for Studio, 30 a page. The next page loads on "Show more" only:
 *  no effect fetches it. */
export function useAdminStudioAccessRequests() {
  const { demoMode } = useDemoMode();
  return useInfiniteQuery<
    AdminStudioAccessRequestPageDTO,
    Error,
    AccessRequestPages,
    ReturnType<typeof adminStudioAccessRequestsKey>,
    string | null
  >({
    queryKey: adminStudioAccessRequestsKey(demoMode),
    initialPageParam: null,
    getNextPageParam: (page) => page.nextCursor,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : 30_000,
    queryFn: async ({ pageParam }) =>
      demoMode
        ? (
            await import("../StudioAdminAccessRequests.data")
          ).demoAccessRequestPage(pageParam)
        : getAdminStudioAccessRequests(pageParam),
  });
}

function removeRequestRow(
  queryClient: QueryClient,
  demoMode: boolean,
  requestId: string,
): void {
  queryClient.setQueryData<AccessRequestPages>(
    adminStudioAccessRequestsKey(demoMode),
    (data) => accessRequestPagesWithout(data, (row) => row.id === requestId),
  );
}

/** A request another console already granted or dismissed answers 404; the
 *  row is gone either way, so it leaves the list and the caller still reads
 *  the refusal. */
function removeRowWhenAlreadyGone(
  queryClient: QueryClient,
  demoMode: boolean,
  error: unknown,
  requestId: string,
): void {
  if (studioErrorCodeOf(error) === "studio_access_request_not_found")
    removeRequestRow(queryClient, demoMode, requestId);
}

/** POST /admin/studio/access-requests/:id/grant. The row leaves every loaded
 *  page, and the member's drawer line reads the grant again. */
export function useGrantStudioAccessRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    StudioAccessGrantDTO,
    unknown,
    AdminStudioAccessRequestDTO
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: [ADMIN_STUDIO_KEY, "access-requests", "grant"],
    meta: STUDIO_ADMIN_SILENT_META,
    demoResult: (request) => ({
      userId: request.member.id,
      grantedAt: new Date().toISOString(),
      grantedBy: null,
    }),
    live: (request) => grantAdminStudioAccessRequest(request.id),
    onSuccess: (grant, request) => {
      removeRequestRow(queryClient, demoMode, request.id);
      // The demo drawer reads a static fixture, so it takes the grant as
      // written; live reads it again.
      if (demoMode)
        queryClient.setQueryData(
          memberStudioAccessKey(true, request.member.id),
          grant,
        );
    },
    onLiveSuccess: (_grant, request) => {
      void queryClient.invalidateQueries({
        queryKey: memberStudioAccessKey(false, request.member.id),
      });
    },
    onError: (error, request) =>
      removeRowWhenAlreadyGone(queryClient, demoMode, error, request.id),
  });
}

/** DELETE /admin/studio/access-requests/:id. Quiet: the member hears nothing. */
export function useDismissStudioAccessRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, unknown, AdminStudioAccessRequestDTO>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: [ADMIN_STUDIO_KEY, "access-requests", "dismiss"],
    meta: STUDIO_ADMIN_SILENT_META,
    demoResult: () => undefined,
    live: (request) => dismissAdminStudioAccessRequest(request.id),
    onSuccess: (_result, request) =>
      removeRequestRow(queryClient, demoMode, request.id),
    onError: (error, request) =>
      removeRowWhenAlreadyGone(queryClient, demoMode, error, request.id),
  });
}
