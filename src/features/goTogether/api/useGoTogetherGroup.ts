import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import {
  demoAcceptMerge,
  demoCheckIn,
  demoGroup,
  demoLeaveGroup,
} from "../goTogether.mock";
import {
  acceptGoTogetherMerge,
  checkInGoTogether,
  getGoTogetherGroup,
  leaveGoTogetherGroup,
} from "./goTogether.api";
import type { GoTogetherGroupDTO } from "./goTogether.types";
import { goTogetherKeys } from "./goTogetherKeys";

/** A formed group, `GET /go-together/groups/:groupId`, visible to its
 *  members only. */
export function useGoTogetherGroup(groupId: string | undefined) {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status } = useAuth();
  const isActiveSession = !checking && loggedIn && status === "active";
  return useQuery<GoTogetherGroupDTO>({
    queryKey: goTogetherKeys.group(groupId, demoMode),
    enabled: Boolean(groupId) && (demoMode || isActiveSession),
    retry: false,
    queryFn: async () =>
      demoMode || !groupId
        ? demoGroup(groupId ?? "")
        : getGoTogetherGroup(groupId),
  });
}

/** POST /go-together/groups/:groupId/checkin with `here` or `left`. */
export function useGoTogetherCheckIn(groupId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<GoTogetherGroupDTO, Error, "here" | "left">({
    meta: { silentError: true },
    mutationFn: async (checkInStatus) =>
      demoMode
        ? demoCheckIn(groupId, checkInStatus)
        : checkInGoTogether(groupId, checkInStatus),
    onSuccess: (group) => {
      queryClient.setQueryData(goTogetherKeys.group(groupId, demoMode), group);
    },
  });
}

/**
 * Every query a formed group can leave stale behind it, invalidated
 * together after leave and after merge: the card (whose state moves), every
 * cached group (leave clears this member's own; merge replaces the group id
 * so the old one has to go stale too), the DM inbox list (a merge's new
 * group chat has to appear there, a leave's old one has to stop bolding),
 * and any open conversation detail (`hasLeft`, participants, composer). The
 * conversation keys mirror `useConversations.ts`'s own `["conversations"]`
 * list root and `["conversation-detail", id, demoMode]` query, which has no
 * exported key factory to import, hence the matching literal prefixes here.
 */
export function invalidateGoTogetherGroupSideEffects(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: goTogetherKeys.cardRoot });
  void queryClient.invalidateQueries({ queryKey: goTogetherKeys.groupRoot });
  void queryClient.invalidateQueries({ queryKey: ["conversations"] });
  void queryClient.invalidateQueries({ queryKey: ["conversation-detail"] });
}

/** POST /go-together/groups/:groupId/leave. The card, the group and the
 *  conversation all change, so all three refresh. */
export function useLeaveGoTogetherGroup(groupId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    meta: { silentError: true },
    mutationFn: async () =>
      demoMode ? demoLeaveGroup(groupId) : leaveGoTogetherGroup(groupId),
    onSuccess: () => invalidateGoTogetherGroupSideEffects(queryClient),
  });
}

/** POST /go-together/groups/:groupId/merge/accept. The answer is the group
 *  the member now belongs to, whose id can differ from `groupId`, so it is
 *  cached under its own id first (so a render right after this resolves
 *  already has it), then the old group, the card and the conversation list
 *  all refresh, so the old chat's banner and the inbox both pick up the
 *  merge on their next read. */
export function useAcceptGoTogetherMerge(groupId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<GoTogetherGroupDTO, Error, void>({
    meta: { silentError: true },
    mutationFn: async () =>
      demoMode ? demoAcceptMerge(groupId) : acceptGoTogetherMerge(groupId),
    onSuccess: (group) => {
      queryClient.setQueryData(goTogetherKeys.group(group.id, demoMode), group);
      invalidateGoTogetherGroupSideEffects(queryClient);
    },
  });
}
