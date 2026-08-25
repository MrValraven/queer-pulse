import type { Dispatch, SetStateAction } from "react";
import type { ToastContextValue } from "../../shared/components/feedback/toastContext";
import type { TFunction } from "../../shared/i18n/types";
import type { ModReportView } from "./moderationAge";
import { useReportAssignment } from "./api/useReportAssignment";

export interface UseModerationAssignmentActionsParams {
  setOpen: Dispatch<SetStateAction<ModReportView[]>>;
  setSelected: Dispatch<SetStateAction<ModReportView | null>>;
  t: TFunction;
  showToast: ToastContextValue["showToast"];
}

/**
 * Self-assign / release a report (COM-5) — the write side of the "Assigned to
 * me" filter. Split out of `useModerationQueueActions` as its own cohesive
 * slice: claiming and releasing don't touch the Undo/removal machinery the
 * rest of that hook is built around, only the assignee fields on the row
 * wherever it's held locally (the open queue, the open drawer).
 */
export function useModerationAssignmentActions({
  setOpen,
  setSelected,
  t,
  showToast,
}: UseModerationAssignmentActionsParams) {
  const reportAssignment = useReportAssignment();

  /** Patches a report's assignee fields in every place it's held locally, so
   *  the drawer and the "Assigned to me" filter reflect the claim/release
   *  immediately without waiting on a refetch. */
  const patchAssignment = (
    id: string,
    assignedModeratorId: string | null,
    assignedModeratorName: string | undefined,
  ) => {
    const apply = (r: ModReportView): ModReportView =>
      r.id === id ? { ...r, assignedModeratorId, assignedModeratorName } : r;
    setOpen((current) => current.map(apply));
    setSelected((current) => (current ? apply(current) : current));
  };

  /** Self-assign (COM-5) — claims a report for the signed-in moderator. */
  const assignToMe = (report: ModReportView) => {
    reportAssignment.mutate(
      { id: report.id, assign: true },
      {
        onSuccess: (result) =>
          patchAssignment(
            report.id,
            result.assignedModeratorId,
            result.assignedModeratorName,
          ),
        onError: () =>
          showToast(t("admin:moderation.queue.serviceErrorToast"), "error"),
      },
    );
  };

  /** Releases a report the signed-in moderator had claimed. */
  const unassignReport = (report: ModReportView) => {
    reportAssignment.mutate(
      { id: report.id, assign: false },
      {
        onSuccess: () => patchAssignment(report.id, null, undefined),
        onError: () =>
          showToast(t("admin:moderation.queue.serviceErrorToast"), "error"),
      },
    );
  };

  return { assignToMe, unassignReport };
}
