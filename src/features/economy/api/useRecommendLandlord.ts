import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  recommendLandlord,
  type RecommendationDTO,
  type RecommendBody,
} from "./landlord.api";

export function useRecommendLandlord(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<RecommendationDTO | null, Error, RecommendBody>({
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
          queryKey: ["landlord", false, slug],
        });
      }
    },
  });
}
