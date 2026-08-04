import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  recommendLandlord,
  type RecommendationDTO,
  type RecommendBody,
} from "./landlord.api";
import { economyKeys } from "./economyKeys";

export function useRecommendLandlord(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<RecommendationDTO | null, Error, RecommendBody>({
    // HousingModals' recommend form toasts its own error, so keep the global
    // MutationCache handler quiet for this write (no stacked duplicate toast).
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 650));
        return null;
      }
      return recommendLandlord(slug, body);
    },
    onSuccess: () => {
      if (!demoMode) {
        void queryClient.invalidateQueries({
          queryKey: economyKeys.landlord(false, slug),
        });
      }
    },
  });
}
