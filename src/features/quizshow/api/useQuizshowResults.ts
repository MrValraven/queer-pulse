import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { QuizshowResultsResponse } from "../../../shared/contracts/quizshow";
import { getQuizshowResults } from "./quizshow.api";
import { quizshowKeys } from "./quizshowKeys";
import { demoResults } from "./quizshowDemoStore";
import { shouldRetryQuizshowRead } from "./useQuizshowQuiz";

export function useQuizshowResults(
  slug: string,
  options: { isEnabled: boolean },
): UseQueryResult<QuizshowResultsResponse> {
  const { demoMode } = useDemoMode();
  return useQuery<QuizshowResultsResponse>({
    queryKey: quizshowKeys.results(slug, demoMode),
    enabled: options.isEnabled && slug !== "",
    retry: shouldRetryQuizshowRead,
    queryFn: async () =>
      demoMode ? demoResults(slug) : getQuizshowResults(slug),
  });
}
