import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { DEMO_LATENCY_MS } from "./demoAwareMutation";
import { ADMIN_COMMUNITIES_KEY } from "./useAdminCommunities";
import {
  approveCommunitySpaceRequest,
  declineCommunitySpaceRequest,
  type AdminCommunitySpaceRequestListDTO,
  type AdminCommunitySpaceRequestStatus,
} from "./adminCommunitySpaceRequests.api";
import { SPACE_REQUESTS_QUERY_KEY } from "./useAdminCommunitySpaceRequests";

export type SpaceRequestDecision = "approve" | "decline";

interface DecideVariables {
  id: string;
  decision: SpaceRequestDecision;
  reason?: string;
}

type Snapshot = Array<
  [
    readonly unknown[],
    InfiniteData<AdminCommunitySpaceRequestListDTO> | undefined,
  ]
>;

const STATUS_BY_DECISION: Record<
  SpaceRequestDecision,
  AdminCommunitySpaceRequestStatus
> = {
  approve: "approved",
  decline: "declined",
};

/**
 * Approve / decline a "Request spaces" submission from the admin review
 * queue. Dual-mode: in demo mode the optimistic cache patch IS the source of
 * truth (no network, no invalidation); in live mode it calls
 * `POST /admin/community-space-requests/:id/{approve|decline}` and
 * reconciles by invalidating on settle. Both modes patch the row's `status`
 * across every cached filter tab optimistically and roll back on error. A
 * 409 `SPACE_REQUEST_NOT_OPEN` (an admin approving a request a manual
 * settings switch already closed) rolls back and the live invalidate then
 * refreshes the row to its real state; the page shows a specific toast for
 * that code.
 */
export function useDecideCommunitySpaceRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const mutation = useMutation<
    unknown,
    Error,
    DecideVariables,
    { snapshot: Snapshot }
  >({
    meta: { silentError: true },
    mutationFn: async ({ id, decision, reason }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        return null;
      }
      return decision === "approve"
        ? approveCommunitySpaceRequest(id)
        : declineCommunitySpaceRequest(id, reason);
    },
    onMutate: async ({ id, decision, reason }) => {
      await queryClient.cancelQueries({ queryKey: SPACE_REQUESTS_QUERY_KEY });
      const snapshot = queryClient.getQueriesData<
        InfiniteData<AdminCommunitySpaceRequestListDTO>
      >({
        queryKey: SPACE_REQUESTS_QUERY_KEY,
      }) as Snapshot;
      const nextStatus = STATUS_BY_DECISION[decision];
      for (const [queryKey, data] of snapshot) {
        if (!data) continue;
        const filter = queryKey[2];
        queryClient.setQueryData<
          InfiniteData<AdminCommunitySpaceRequestListDTO>
        >(queryKey, {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items
              .map((request) =>
                request.id === id
                  ? {
                      ...request,
                      status: nextStatus,
                      declineReason:
                        decision === "decline"
                          ? (reason ?? null)
                          : request.declineReason,
                    }
                  : request,
              )
              .filter(
                (request) => filter === "all" || request.status === filter,
              ),
          })),
        });
      }
      return { snapshot };
    },
    onError: (_error, _variables, context) => {
      for (const [queryKey, data] of context?.snapshot ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
    },
    onSettled: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: SPACE_REQUESTS_QUERY_KEY,
      });
      // Approving flips the community's "Allow spaces" setting.
      void queryClient.invalidateQueries({ queryKey: [ADMIN_COMMUNITIES_KEY] });
    },
  });
  return { decide: mutation.mutate, pending: mutation.isPending };
}
