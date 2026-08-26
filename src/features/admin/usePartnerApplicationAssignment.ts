import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PartnerApplicationView } from "../marketing/api/usePartnerApplications";
import type { QueueAssignmentResult } from "./api/useQueueAssignment";
import { useQueueAssignmentActions } from "./useQueueAssignmentActions";

/**
 * Claim / release for the partner-application queue (OPS-04).
 *
 * The last of the four queues OPS-04 gave a clock and an assignee to. The
 * interaction itself lives in the shared `useQueueAssignmentActions`; this only
 * supplies the route, the cache key and the local patch, exactly as
 * `useJoinRequestAssignment` does for invite requests. Nothing is written here
 * that is not written there.
 *
 * WHY A LOCAL PATCH AT ALL. Live mode invalidates `["partner-applications"]`
 * and the server's answer lands a moment later, but the button has to respond
 * now. Demo mode has no server: its fixture never mutates, so the overlay IS
 * the result there. One overlay covers both, so the card never branches on
 * mode to read a row.
 */
export function usePartnerApplicationAssignment() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [overrides, setOverrides] = useState<
    Record<string, QueueAssignmentResult>
  >({});

  const { claim, release, isPending } = useQueueAssignmentActions({
    path: (id) =>
      `/admin/partners/applications/${encodeURIComponent(id)}/assignment`,
    invalidateKey: ["partner-applications"],
    demoAssigneeLabel: t("admin:queueAssignment.demoYou"),
    errorToastKey: "admin:queueAssignment.errorToast",
    onAssignmentChanged: (id, result) =>
      setOverrides((current) => ({ ...current, [id]: result })),
    t,
    showToast,
  });

  /** Overlays a claim/release taken this session onto a row, so the card and
   *  the "Assigned to me" filter both read the new holder immediately. */
  function withAssignment(
    view: PartnerApplicationView,
  ): PartnerApplicationView {
    const override = overrides[view.id];
    if (!override) return view;
    return {
      ...view,
      assignedStaffId: override.assignedStaffId,
      assignedStaffName: override.assignedStaffName,
    };
  }

  return { claim, release, isPending, withAssignment };
}
