import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { apiPatch } from "../../../shared/api/client";
import { useDemoAwareMutation } from "./demoAwareMutation";

/**
 * Claim / release for any staff queue (OPS-04) — one hook, four queues.
 *
 * Every `PATCH .../:id/assignment` route on the backend takes the same body
 * (`{ assign }`) and answers with a row carrying the same two assignee fields,
 * so the frontend needs one mutation, parameterised by path and cache key,
 * rather than a near-identical copy per queue.
 *
 * `useReportAssignment` is deliberately NOT rewritten on top of this. Reports
 * were first and their wire fields are named for moderation
 * (`assignedModeratorId`/`assignedModeratorName`); mapping them here would put
 * a queue-specific rename inside the generic hook, and rewiring the working
 * moderation queue buys nothing a reader can see. The interaction is shared,
 * the field names are not.
 *
 * Demo mode has no backing assignee column, so it toggles locally between the
 * signed-in demo user and unassigned — enough to demo the filter and the
 * button with no network, exactly as `useReportAssignment` already does. The
 * live path is the only one that reads the API, and neither path reads the
 * mock persona registry.
 */

export interface QueueAssignmentVars {
  id: string;
  assign: boolean;
}

/** What every queue's assignment route answers with, narrowed to the two
 *  fields the UI patches into its local row. */
export interface QueueAssignmentResult {
  assignedStaffId: string | null;
  assignedStaffName?: string;
}

export interface UseQueueAssignmentOptions {
  /**
   * Builds the route for one row, e.g.
   * `(id) => \`/admin/verifications/requests/${encodeURIComponent(id)}/assignment\``.
   * A function rather than a prefix so a queue whose id sits mid-path stays
   * expressible.
   */
  path: (id: string) => string;
  /** The query key to invalidate after a live claim/release, so the list and
   *  its "Assigned to me" filter reconcile with the server. */
  invalidateKey: QueryKey;
  /**
   * The label demo mode shows as the assignee. Passed in so the caller can use
   * its own catalog string ("You"), keeping this hook free of i18n.
   */
  demoAssigneeLabel: string;
}

export function useQueueAssignment({
  path,
  invalidateKey,
  demoAssigneeLabel,
}: UseQueueAssignmentOptions) {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useDemoAwareMutation<
    QueueAssignmentResult,
    Error,
    QueueAssignmentVars
  >({
    demoMode,
    demoLatencyMs: 0,
    // The queue toasts its own failure, so the global handler stays quiet
    // rather than showing a second one — same as `useReportAssignment`.
    meta: { silentError: true },
    demoResult: ({ assign }) =>
      assign
        ? {
            assignedStaffId: user?.id ?? "demo-staff",
            assignedStaffName: demoAssigneeLabel,
          }
        : { assignedStaffId: null, assignedStaffName: undefined },
    live: async ({ id, assign }) => {
      const dto = await apiPatch<QueueAssignmentResult>(path(id), { assign });
      return {
        assignedStaffId: dto.assignedStaffId ?? null,
        assignedStaffName: dto.assignedStaffName,
      };
    },
    onLiveSettled: () => {
      void queryClient.invalidateQueries({ queryKey: invalidateKey });
    },
  });
}
