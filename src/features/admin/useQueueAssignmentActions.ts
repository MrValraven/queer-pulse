import type { ToastContextValue } from "../../shared/components/feedback/toastContext";
import type { TFunction } from "../../shared/i18n/types";
import {
  useQueueAssignment,
  type QueueAssignmentResult,
  type UseQueueAssignmentOptions,
} from "./api/useQueueAssignment";

/**
 * The claim / release interaction, shared by every staff queue (OPS-04).
 *
 * Generalised from `useModerationAssignmentActions`, which owns exactly this
 * shape for reports: fire the mutation, patch the assignee fields wherever the
 * row is held locally so the button and the "Assigned to me" filter respond
 * before the refetch lands, and toast on failure. Only the patching differs
 * per queue, so that is the one thing the caller supplies.
 *
 * Nothing here decides anything about the row itself. A claim says "I have
 * this open"; it takes no side, records no review, and is given back by
 * releasing.
 */
export interface UseQueueAssignmentActionsParams extends UseQueueAssignmentOptions {
  /**
   * Writes the new assignee onto the row wherever the caller holds it (a list,
   * an open drawer, both). Called with the server's answer in live mode and
   * with the simulated one in demo mode, so the caller never branches on mode.
   */
  onAssignmentChanged: (id: string, result: QueueAssignmentResult) => void;
  /** The catalog key of the message shown when the write fails. */
  errorToastKey: string;
  t: TFunction;
  showToast: ToastContextValue["showToast"];
}

export function useQueueAssignmentActions({
  path,
  invalidateKey,
  demoAssigneeLabel,
  onAssignmentChanged,
  errorToastKey,
  t,
  showToast,
}: UseQueueAssignmentActionsParams) {
  const assignment = useQueueAssignment({
    path,
    invalidateKey,
    demoAssigneeLabel,
  });

  /** Claims the row for the signed-in staff member. */
  const claim = (id: string) => {
    assignment.mutate(
      { id, assign: true },
      {
        onSuccess: (result) => onAssignmentChanged(id, result),
        onError: () => showToast(t(errorToastKey), "error"),
      },
    );
  };

  /** Releases a row the signed-in staff member was holding. */
  const release = (id: string) => {
    assignment.mutate(
      { id, assign: false },
      {
        onSuccess: () =>
          onAssignmentChanged(id, {
            assignedStaffId: null,
            assignedStaffName: undefined,
          }),
        onError: () => showToast(t(errorToastKey), "error"),
      },
    );
  };

  return { claim, release, isPending: assignment.isPending };
}
