import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { QuizshowResultsResponse } from "../../../shared/contracts/quizshow";
import type { QuizshowSessionScope } from "../quizshowScope";
import { getQuizshowGameResults, getQuizshowResults } from "./quizshow.api";
import { quizshowKeys } from "./quizshowKeys";
import { demoResults } from "./quizshowDemoStore";
import { demoGameResults } from "./quizshowDemoGames";
import { hasQuizshowScopeId, shouldRetryQuizshowRead } from "./useQuizshowQuiz";

async function fetchResultsFor(
  scope: QuizshowSessionScope,
  demoMode: boolean,
): Promise<QuizshowResultsResponse> {
  if (scope.kind === "event") {
    return demoMode
      ? demoResults(scope.eventSlug)
      : getQuizshowResults(scope.eventSlug);
  }
  return demoMode
    ? demoGameResults(scope.gameId)
    : getQuizshowGameResults(scope.gameId);
}

export function useQuizshowResults(
  scope: QuizshowSessionScope,
  options: { isEnabled: boolean },
): UseQueryResult<QuizshowResultsResponse> {
  const { demoMode } = useDemoMode();
  return useQuery<QuizshowResultsResponse>({
    queryKey: quizshowKeys.resultsFor(scope, demoMode),
    enabled: options.isEnabled && hasQuizshowScopeId(scope),
    retry: shouldRetryQuizshowRead,
    queryFn: async () => fetchResultsFor(scope, demoMode),
  });
}
