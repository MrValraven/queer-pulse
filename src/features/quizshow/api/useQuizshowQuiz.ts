import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import type {
  QuizshowImportSource,
  QuizshowQuizResponse,
  QuizshowStarterPackCard,
} from "../../../shared/contracts/quizshow";
import {
  getQuizshowImportSources,
  getQuizshowPacks,
  getQuizshowQuiz,
} from "./quizshow.api";
import { quizshowKeys } from "./quizshowKeys";
import { demoGetQuiz, demoImportSources, demoPacks } from "./quizshowDemoStore";

const LIVE_PANEL_REFETCH_MS = 15_000;
const MAX_RETRIES = 2;

/** A refusal about access or absence will not change on a retry. */
export function shouldRetryQuizshowRead(
  failureCount: number,
  error: unknown,
): boolean {
  if (
    error instanceof ApiError &&
    (error.status === 403 || error.status === 404)
  ) {
    return false;
  }
  return failureCount < MAX_RETRIES;
}

export function useQuizshowQuiz(
  slug: string,
  options: {
    isEnabled: boolean;
    /** Live only: poll this often while no session is open, so a screen notices a new lobby. Off when left out. */
    noSessionRefetchMs?: number;
  },
): UseQueryResult<QuizshowQuizResponse> {
  const { demoMode } = useDemoMode();
  const { noSessionRefetchMs } = options;
  return useQuery<QuizshowQuizResponse>({
    queryKey: quizshowKeys.quiz(slug, demoMode),
    enabled: options.isEnabled && slug !== "",
    retry: shouldRetryQuizshowRead,
    // Live only: the live panel's player count moves while a session is open.
    refetchInterval: (query) => {
      if (demoMode) return false;
      if (query.state.data?.liveSession) return LIVE_PANEL_REFETCH_MS;
      return noSessionRefetchMs ?? false;
    },
    queryFn: async () => (demoMode ? demoGetQuiz(slug) : getQuizshowQuiz(slug)),
  });
}

export function useQuizshowPacks(options: {
  isEnabled: boolean;
}): UseQueryResult<{ items: QuizshowStarterPackCard[] }> {
  const { demoMode } = useDemoMode();
  return useQuery<{ items: QuizshowStarterPackCard[] }>({
    queryKey: quizshowKeys.packs(demoMode),
    enabled: options.isEnabled,
    queryFn: async () => (demoMode ? demoPacks() : getQuizshowPacks()),
  });
}

export function useQuizshowImportSources(
  slug: string,
  options: { isEnabled: boolean },
): UseQueryResult<{ items: QuizshowImportSource[] }> {
  const { demoMode } = useDemoMode();
  return useQuery<{ items: QuizshowImportSource[] }>({
    queryKey: quizshowKeys.importSources(slug, demoMode),
    enabled: options.isEnabled && slug !== "",
    retry: shouldRetryQuizshowRead,
    queryFn: async () =>
      demoMode ? demoImportSources(slug) : getQuizshowImportSources(slug),
  });
}
