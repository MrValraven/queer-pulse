import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  deleteReportedQuizshowGame,
  endReportedQuizshowGame,
  type QuizshowStaffActionInput,
} from "./adminQuizshow.api";
import { useDemoAwareMutation } from "./demoAwareMutation";

/** "End this game" on a `quizshow_game` report. Demo resolves at once. The
 *  component shows its own error line, so the global toast stays quiet. */
export function useEndReportedQuizshowGame() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, unknown, QuizshowStaffActionInput>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: ["admin-quizshow", "end"],
    meta: { silentError: true },
    demoResult: () => undefined,
    live: (input) => endReportedQuizshowGame(input),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["mod-report"] });
    },
  });
}

/** "Delete this game" on a `quizshow_game` report. Demo resolves at once. */
export function useDeleteReportedQuizshowGame() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, unknown, QuizshowStaffActionInput>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: ["admin-quizshow", "delete"],
    meta: { silentError: true },
    demoResult: () => undefined,
    live: (input) => deleteReportedQuizshowGame(input),
    onLiveSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["mod-report"] });
    },
  });
}
