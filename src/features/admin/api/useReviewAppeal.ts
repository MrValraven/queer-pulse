import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { reviewAppeal } from "./moderation.api";

export interface ReviewAppealVars {
  id: string;
  decision: "uphold" | "overturn";
  note: string;
}

/**
 * A moderator upholds or overturns an appeal (spec 04). The backend routes
 * appeals to a *different* moderator than the original decider and, on overturn,
 * reverses the original action and re-notifies the appellant (`appeal_outcome`).
 * Demo mode is a no-op — the appeals pane drops the row locally as before.
 */
export function useReviewAppeal() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, ReviewAppealVars>({
    // useModerationQueue toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ id, decision, note }) => {
      if (demoMode) return;
      await reviewAppeal(id, { decision, note });
    },
    onSettled: () => {
      if (!demoMode)
        void queryClient.invalidateQueries({ queryKey: ["mod-reports"] });
    },
  });
}
