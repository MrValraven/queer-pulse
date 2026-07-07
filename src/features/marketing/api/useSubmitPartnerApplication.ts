import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createPartnerApplication,
  type CreatePartnerApplicationDto,
  type PartnerApplicationDTO,
} from "./partners.api";

/**
 * POST /partner-applications — the public "Apply to partner" submit. Any member
 * may submit; the application lands as `pending` for an admin to triage.
 *
 * Demo mode keeps a short "sending…" beat and resolves with no network, so the
 * page shows its plum success panel exactly as the prototype would. Live mode
 * calls the API and invalidates the admin applications query so a freshly
 * submitted application appears in triage.
 */
export function useSubmitPartnerApplication() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    PartnerApplicationDTO | null,
    Error,
    CreatePartnerApplicationDto
  >({
    mutationFn: async (dto) => {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 650));
        return null;
      }
      return createPartnerApplication(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner-applications"] });
    },
  });
}
