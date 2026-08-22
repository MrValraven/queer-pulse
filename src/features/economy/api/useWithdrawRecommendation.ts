import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { Landlord } from "../landlords";
import { withdrawMyRecommendation } from "./landlord.api";
import { economyKeys } from "./economyKeys";

/**
 * DELETE /landlords/:slug/recommendations/mine. The author takes their own
 * recommendation of a named real person back down (BE-HSG-18). Until this route
 * had a frontend, a member who regretted publicly rating someone had to find a
 * moderator.
 *
 * The write is confirmed only by the server: nothing is removed from the
 * rendered list until the request resolves, and `onSuccess` is where the cached
 * landlord loses the entry. Live mode then invalidates so the refreshed average
 * and recommendation count come from the backend rather than being guessed
 * here. Demo mode drops the flagged fixture entry from the cache so the
 * prototype answers the same way with no backend.
 *
 * The caller gates this behind `ConfirmDialog` and toasts its own error, so the
 * global mutation-error toast stays quiet (`meta.silentError`).
 */
export function useWithdrawRecommendation(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    meta: { silentError: true },
    mutationFn: async () => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 450));
        return;
      }
      await withdrawMyRecommendation(slug);
    },
    onSuccess: () => {
      // Prefix match, so both the demo and live cache entries for this slug are
      // patched whichever language/session suffix they carry.
      queryClient.setQueriesData<Landlord | null>(
        { queryKey: economyKeys.landlord(demoMode, slug) },
        (previous) =>
          previous
            ? {
                ...previous,
                recommendations: previous.recommendations.filter(
                  (recommendation) => !recommendation.isMine,
                ),
              }
            : previous,
      );
      if (!demoMode) {
        void queryClient.invalidateQueries({
          queryKey: economyKeys.landlord(false, slug),
        });
        void queryClient.invalidateQueries({
          queryKey: economyKeys.landlordsRoot,
        });
      }
    },
  });
}
