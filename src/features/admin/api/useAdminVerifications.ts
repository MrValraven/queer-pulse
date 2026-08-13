import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { VerificationLevel } from "../../economy/api/verification.api";
import { ADMIN_VERIFICATIONS_DEMO } from "../adminVerifications.data";
import {
  getAdminVerifications,
  overrideVerification,
  type AdminVerificationDTO,
} from "./adminVerifications.api";

export const ADMIN_VERIFICATIONS_KEY = "admin-verifications";

/** Recent verification records for the admin console. Demo returns the
 * colocated fixture and never hits the (admin-only) network. */
export function useAdminVerifications() {
  const { demoMode } = useDemoMode();
  return useQuery<AdminVerificationDTO[]>({
    queryKey: [ADMIN_VERIFICATIONS_KEY, demoMode],
    initialData: demoMode ? ADMIN_VERIFICATIONS_DEMO : undefined,
    queryFn: () =>
      demoMode
        ? Promise.resolve(ADMIN_VERIFICATIONS_DEMO)
        : getAdminVerifications(),
  });
}

/** Manual override — live only (demo has no real record to change). */
export function useOverrideVerification() {
  const queryClient = useQueryClient();
  return useMutation<
    AdminVerificationDTO,
    Error,
    { userId: string; level: VerificationLevel }
  >({
    mutationFn: ({ userId, level }) => overrideVerification(userId, level),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [ADMIN_VERIFICATIONS_KEY, false],
      });
    },
  });
}
