import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createCommissionInterest,
  type CommissionInterestResponseDTO,
  type CreateCommissionInterestDto,
} from "./culture.api";

/**
 * POST /commissions/interest — `CommissionInterestModal`'s "Send interest".
 *
 * Demo mode keeps the prototype's short "sending…" beat and resolves with no
 * network, landing on the same plum success panel. Live mode calls the API
 * (mirrors `useSubmitPartnerApplication`'s demo/live split) so the recipient's
 * team can actually see and follow up on the interest.
 */
export function useCreateCommissionInterest() {
  const { demoMode } = useDemoMode();
  return useMutation<
    CommissionInterestResponseDTO | null,
    Error,
    CreateCommissionInterestDto
  >({
    // CommissionInterestModal toasts its own error, so silence the global
    // duplicate.
    meta: { silentError: true },
    mutationFn: async (dto) => {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 1000));
        return null;
      }
      return createCommissionInterest(dto);
    },
  });
}
