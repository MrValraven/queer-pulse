import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getMyPartners,
  updateMyPartner,
  type OwnedPartnerDTO,
  type UpdatePartnerProfileDto,
} from "./partners.api";

export const MY_PARTNERS_KEY = "my-partners";

/**
 * The partner profiles the signed-in member MAINTAINS (PRD-263).
 *
 * Until this existed an approved partner could not change one character of its
 * own public page: staff could reach the featured flag and a testimonial, and
 * nothing else, so a partner whose phone number or address changed kept the
 * wrong one on a public support page until an engineer edited the row by hand.
 *
 * NOT collapsed into an empty state on failure. "You maintain no partner
 * profile" and "we could not reach the server" are opposite answers, and an
 * organisation reading the first when the second is true would conclude its
 * listing had been taken down. Callers branch on `isError`.
 *
 * `enabled` is for surfaces that render before sign-in settles: the route sits
 * behind `ActiveMemberGuard` and 401s a signed-out visitor.
 */
export function useMyPartners(options: { enabled?: boolean } = {}) {
  const { demoMode } = useDemoMode();
  return useQuery<OwnedPartnerDTO[]>({
    queryKey: [MY_PARTNERS_KEY, demoMode],
    enabled: options.enabled ?? true,
    queryFn: async () => {
      if (demoMode) {
        const { MY_PARTNERS_DEMO } = await import("./myPartners.mock.data");
        return MY_PARTNERS_DEMO;
      }
      return getMyPartners();
    },
  });
}

export interface UpdateMyPartnerVars {
  id: string;
  dto: UpdatePartnerProfileDto;
}

/**
 * A partner saving its own profile. No network in demo mode (the editor still
 * runs its full save/success path against the mock), and in live mode the
 * public partner queries are invalidated alongside the owner's own, because
 * the edit changes the page a visitor sees, which is the whole point of it.
 */
export function useUpdateMyPartner() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<OwnedPartnerDTO | null, Error, UpdateMyPartnerVars>({
    mutationFn: async ({ id, dto }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return null;
      }
      return updateMyPartner(id, dto);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [MY_PARTNERS_KEY] });
      void queryClient.invalidateQueries({ queryKey: ["partners"] });
      void queryClient.invalidateQueries({ queryKey: ["partner"] });
      void queryClient.invalidateQueries({ queryKey: ["featured-partners"] });
    },
    // The editor toasts locally, with the field-level detail a generic
    // handler cannot know about.
    meta: { silentError: true },
  });
}
