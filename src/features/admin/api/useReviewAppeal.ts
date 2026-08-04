import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { reviewAppeal } from "./moderation.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

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
  return useDemoAwareMutation<void, Error, ReviewAppealVars>({
    demoMode,
    demoLatencyMs: 0,
    // useModerationQueue toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    demoResult: () => undefined,
    live: async ({ id, decision, note }) => {
      await reviewAppeal(id, { decision, note });
    },
    onLiveSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["mod-reports"] });
    },
  });
}
