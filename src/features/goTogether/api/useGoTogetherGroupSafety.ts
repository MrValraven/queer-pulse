import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  demoBlockGroupMember,
  demoReportGroupMember,
} from "../goTogether.mock";
import {
  blockGoTogetherGroupMember,
  reportGoTogetherGroupMember,
  type GoTogetherMemberReportBody,
  type GoTogetherMemberReportDTO,
} from "./goTogetherGroupSafety.api";
import { invalidateGoTogetherGroupSideEffects } from "./useGoTogetherGroup";

/**
 * Block one group member. A block moves the BLOCKER: before the start into
 * another group when one fits (unmatched otherwise), out of the group and
 * its chat after it.
 * So the card, every cached group and the conversation queries all go stale,
 * the same set a leave touches. The caller refetches its own group after
 * this resolves: a 404 there means the member has moved out.
 */
export function useBlockGoTogetherGroupMember(groupId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    meta: { silentError: true },
    mutationFn: async (memberRef) =>
      demoMode
        ? demoBlockGroupMember(groupId, memberRef)
        : blockGoTogetherGroupMember(groupId, memberRef),
    onSuccess: () => invalidateGoTogetherGroupSideEffects(queryClient),
  });
}

interface ReportGroupMemberVariables {
  memberRef: string;
  body: GoTogetherMemberReportBody;
}

/** Report one group member to the moderators. Nothing in the group changes,
 *  so nothing is invalidated. Demo mode acknowledges locally. */
export function useReportGoTogetherGroupMember(groupId: string) {
  const { demoMode } = useDemoMode();
  return useMutation<
    GoTogetherMemberReportDTO,
    Error,
    ReportGroupMemberVariables
  >({
    // The dialog shows its own failure line, the server's flood-cap copy
    // included, so the cache-level toast stays quiet.
    meta: { silentError: true },
    mutationFn: async ({ memberRef, body }) =>
      demoMode
        ? demoReportGroupMember(groupId, memberRef, body)
        : reportGoTogetherGroupMember(groupId, memberRef, body),
  });
}
