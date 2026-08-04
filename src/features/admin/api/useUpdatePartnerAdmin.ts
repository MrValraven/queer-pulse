import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  type PartnerApplicationDTO,
  type UpdatePartnerAdminDto,
  updatePartnerAdmin,
} from "../../marketing/api/partners.api";
import { ADMIN_PARTNERS_KEY } from "./useAdminPartners";
import { useDemoAwareMutation } from "./demoAwareMutation";

export interface UpdatePartnerAdminVars {
  id: string;
  dto: UpdatePartnerAdminDto;
}

/** Admin sets a partner's featured flag + testimonial. No-op in demo mode;
 *  live PATCHes and invalidates the admin list plus the public partner +
 *  featured-partner queries so all surfaces refresh. */
export function useUpdatePartnerAdmin() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    PartnerApplicationDTO | undefined,
    Error,
    UpdatePartnerAdminVars
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true }, // AdminApprovedPartners + AdminPartnerTestimonialModal toast locally
    demoResult: () => undefined,
    live: ({ id, dto }) => updatePartnerAdmin(id, dto),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ADMIN_PARTNERS_KEY] });
      void queryClient.invalidateQueries({ queryKey: ["partners"] });
      void queryClient.invalidateQueries({ queryKey: ["featured-partners"] });
    },
  });
}
