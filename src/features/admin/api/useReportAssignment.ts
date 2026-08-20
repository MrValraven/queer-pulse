import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { setReportAssignment } from "./moderation.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

export interface ReportAssignmentVars {
  id: string;
  assign: boolean;
}

export interface ReportAssignmentResult {
  assignedModeratorId: string | null;
  assignedModeratorName?: string;
}

/**
 * Self-assign or unassign a report (COM-5) — the write side of the "Assigned
 * to me" filter, which used to be a hardcoded, always-empty-in-live id set
 * (`MINE` in `useModerationQueue.ts`). Demo mode has no backing assignee
 * column to persist against, so it toggles locally between the signed-in
 * demo user and unassigned — enough to demo the filter without a network.
 */
export function useReportAssignment() {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    ReportAssignmentResult,
    Error,
    ReportAssignmentVars
  >({
    demoMode,
    demoLatencyMs: 0,
    // useModerationQueue toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    demoResult: ({ assign }) =>
      assign
        ? {
            assignedModeratorId: user?.id ?? "demo-moderator",
            assignedModeratorName: "You",
          }
        : { assignedModeratorId: null, assignedModeratorName: undefined },
    live: async ({ id, assign }) => {
      const dto = await setReportAssignment(id, assign);
      return {
        assignedModeratorId: dto.assignedModeratorId ?? null,
        assignedModeratorName: dto.assignedModeratorName,
      };
    },
    onLiveSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["mod-reports"] });
    },
  });
}
