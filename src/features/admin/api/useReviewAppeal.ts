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
 * A moderator upholds or overturns an appeal (spec 04). The backend rejects
 * (403) a moderator reviewing the appeal of their own original decision — a
 * conflict-of-interest guard (COM-10), not an active routing/assignment
 * scheme; nothing auto-picks a different reviewer, it just blocks the same
 * one. On overturn the backend reverses the original action and re-notifies
 * the appellant (`appeal_outcome`). Demo mode is a no-op — the appeals pane
 * drops the row locally as before.
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
