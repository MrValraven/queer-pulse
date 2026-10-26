import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { MemberDetail } from "../adminMembers.data";
import {
  patchAdminMemberInviteAccess,
  type AdminMemberInviteAccessDTO,
} from "./adminMembers.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

interface SetInviteAccessVariables {
  memberId: string;
  slug: string;
  hasInviteAccess: boolean;
}

type DetailSnapshot = [readonly unknown[], MemberDetail | undefined][];

interface SetInviteAccessContext {
  snapshot: DetailSnapshot;
}

/** The drawer reads `["admin-members", "detail", memberId, demoMode,
 *  language]`. Every language's copy of this member in this mode. */
const detailFilterFor = (memberId: string, demoMode: boolean) => ({
  queryKey: ["admin-members", "detail", memberId],
  predicate: (query: { queryKey: readonly unknown[] }) =>
    query.queryKey[3] === demoMode,
});

/** Writes the new flag into every cached detail of the member and returns
 *  what was there, so a failed write can put it back. In demo this patch is
 *  the whole change, since the detail query never goes stale there. */
async function patchInviteAccessInDetailCache(
  queryClient: QueryClient,
  demoMode: boolean,
  memberId: string,
  hasInviteAccess: boolean,
): Promise<DetailSnapshot> {
  const filter = detailFilterFor(memberId, demoMode);
  await queryClient.cancelQueries(filter);
  const snapshot = queryClient.getQueriesData<MemberDetail | undefined>(filter);
  for (const [queryKey, detail] of snapshot) {
    if (!detail) continue;
    const patchedDetail: MemberDetail = { ...detail, hasInviteAccess };
    queryClient.setQueryData(queryKey, patchedDetail);
  }
  return snapshot;
}

/**
 * PATCH /admin/members/:id/invite-access. Optimistic: the drawer's switch
 * flips at once and flips back if the write fails (the global mutation error
 * toast says why). Live, the detail reads again once it settles, so the
 * `invite_access_changed` audit row lands in the member's timeline.
 */
export function useSetMemberInviteAccess() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    AdminMemberInviteAccessDTO,
    unknown,
    SetInviteAccessVariables,
    SetInviteAccessContext
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: ["admin-members", "invite-access"],
    demoResult: ({ memberId, slug, hasInviteAccess }) => ({
      userId: memberId,
      slug,
      hasInviteAccess,
    }),
    live: ({ memberId, hasInviteAccess }) =>
      patchAdminMemberInviteAccess(memberId, hasInviteAccess),
    onMutate: async ({ memberId, hasInviteAccess }) => ({
      snapshot: await patchInviteAccessInDetailCache(
        queryClient,
        demoMode,
        memberId,
        hasInviteAccess,
      ),
    }),
    onError: (_error, _variables, context) => {
      for (const [queryKey, detail] of context?.snapshot ?? [])
        queryClient.setQueryData(queryKey, detail);
    },
    onLiveSettled: (_data, _error, { memberId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-members", "detail", memberId],
      });
    },
  });
}
