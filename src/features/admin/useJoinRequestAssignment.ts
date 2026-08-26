import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRequestView } from "./api/useJoinRequests";
import type { QueueAssignmentResult } from "./api/useQueueAssignment";
import { useQueueAssignmentActions } from "./useQueueAssignmentActions";

/**
 * Claim / release for the invite-request queue (OPS-04).
 *
 * The interaction itself lives in the shared `useQueueAssignmentActions`; this
 * only supplies the route, the cache key and the local patch, the same way
 * `useModerationAssignmentActions` does for reports.
 *
 * WHY A LOCAL PATCH AT ALL. Live mode invalidates `["join-requests"]` and the
 * server's answer lands a moment later, but the button has to respond now.
 * Demo mode has no server: its fixture never mutates, so the overlay IS the
 * result there. One overlay covers both, so the component never branches on
 * mode to read a row.
 */
export function useJoinRequestAssignment() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [overrides, setOverrides] = useState<
    Record<string, QueueAssignmentResult>
  >({});

  const { claim, release, isPending } = useQueueAssignmentActions({
    path: (id) => `/join-requests/${encodeURIComponent(id)}/assignment`,
    invalidateKey: ["join-requests"],
    demoAssigneeLabel: t("admin:queueAssignment.demoYou"),
    errorToastKey: "admin:queueAssignment.errorToast",
    onAssignmentChanged: (id, result) =>
      setOverrides((current) => ({ ...current, [id]: result })),
    t,
    showToast,
  });

  /** Overlays a claim/release taken this session onto a row, so the card and
   *  the "Assigned to me" filter both read the new holder immediately. */
  function withAssignment(row: JoinRequestView): JoinRequestView {
    const override = overrides[row.id];
    if (!override) return row;
    return {
      ...row,
      assignedStaffId: override.assignedStaffId,
      assignedStaffName: override.assignedStaffName,
    };
  }

  return { claim, release, isPending, withAssignment };
}
