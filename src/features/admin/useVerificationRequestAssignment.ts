import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminVerificationRequestDTO } from "./api/adminVerifications.api";
import { ADMIN_VERIFICATION_REQUESTS_KEY } from "./api/useAdminVerifications";
import type { QueueAssignmentResult } from "./api/useQueueAssignment";
import { useQueueAssignmentActions } from "./useQueueAssignmentActions";

/**
 * Claim / release for the verification review queue (OPS-04).
 *
 * The interaction itself lives in the shared `useQueueAssignmentActions`; this
 * only supplies the route, the cache key and the local patch — the same split
 * `useJoinRequestAssignment` makes, and the same one
 * `useModerationAssignmentActions` has always made for reports.
 *
 * The local overlay exists because the button has to answer now: live mode
 * invalidates the queue and the server's copy lands a moment later, while demo
 * mode has no server at all and its fixture never mutates. One overlay covers
 * both, so the row components never branch on mode.
 */
export function useVerificationRequestAssignment() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [overrides, setOverrides] = useState<
    Record<string, QueueAssignmentResult>
  >({});

  const { claim, release, isPending } = useQueueAssignmentActions({
    path: (id) =>
      `/admin/verifications/requests/${encodeURIComponent(id)}/assignment`,
    invalidateKey: [ADMIN_VERIFICATION_REQUESTS_KEY],
    demoAssigneeLabel: t("admin:queueAssignment.demoYou"),
    errorToastKey: "admin:queueAssignment.errorToast",
    onAssignmentChanged: (id, result) =>
      setOverrides((current) => ({ ...current, [id]: result })),
    t,
    showToast,
  });

  /** Overlays a claim/release taken this session onto a row. */
  function withAssignment(
    row: AdminVerificationRequestDTO,
  ): AdminVerificationRequestDTO {
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
