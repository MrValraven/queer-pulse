import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  type PartnerApplicationDTO,
  type UpdatePartnerAdminDto,
  updatePartnerAdmin,
} from "../../marketing/api/partners.api";
import { ADMIN_PARTNERS_KEY } from "./useAdminPartners";

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
  return useMutation<
    PartnerApplicationDTO | undefined,
    Error,
    UpdatePartnerAdminVars
  >({
    mutationFn: async ({ id, dto }) => {
      if (demoMode) return undefined;
      return updatePartnerAdmin(id, dto);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: [ADMIN_PARTNERS_KEY] });
      void queryClient.invalidateQueries({ queryKey: ["partners"] });
      void queryClient.invalidateQueries({ queryKey: ["featured-partners"] });
    },
    meta: { silentError: true }, // AdminApprovedPartners + AdminPartnerTestimonialModal toast locally
  });
}
