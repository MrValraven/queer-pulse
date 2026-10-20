import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type {
  QuizshowCreateGameInput,
  QuizshowGameListResponse,
  QuizshowGameResponse,
  QuizshowGameSummary,
} from "../../../shared/contracts/quizshow";
import {
  createQuizshowGame,
  deleteQuizshowGame,
  duplicateQuizshowGame,
  getQuizshowGames,
} from "./quizshow.api";
import { quizshowKeys } from "./quizshowKeys";
import {
  demoCreateGame,
  demoDeleteGame,
  demoDuplicateGame,
  demoListGames,
} from "./quizshowDemoGames";
import { shouldRetryQuizshowRead } from "./useQuizshowQuiz";

// Every write below owns its error copy in the component that calls it.
const SILENT_ERROR_META = { silentError: true } as const;

/** The My games row for a game the server just answered with. */
export function gameSummaryOf(
  response: QuizshowGameResponse,
): QuizshowGameSummary {
  const rounds = response.quiz?.rounds ?? [];
  return {
    id: response.gameId,
    title: response.quiz?.title ?? "",
    roundCount: rounds.length,
    questionCount: rounds.reduce(
      (total, round) => total + round.questions.length,
      0,
    ),
    isAdultsOnly: response.isAdultsOnly,
    liveSession: response.liveSession,
    hasResults: response.hasResults,
    updatedAt: response.quiz?.updatedAt ?? new Date().toISOString(),
  };
}

export function useQuizshowGames(options: {
  isEnabled: boolean;
}): UseQueryResult<QuizshowGameListResponse> {
  const { demoMode } = useDemoMode();
  return useQuery<QuizshowGameListResponse>({
    queryKey: quizshowKeys.games(demoMode),
    enabled: options.isEnabled,
    retry: shouldRetryQuizshowRead,
    queryFn: async () => (demoMode ? demoListGames() : getQuizshowGames()),
  });
}

/** The import source lists, event and game, every scope at once. */
const IMPORT_SOURCE_LIST_PREFIXES = [
  ["quizshow", "import-sources"],
  ["quizshow", "game-import-sources"],
] as const;

/**
 * A game was created, copied, deleted or saved, so every list of quizzes to
 * copy from is stale. Fire and forget: nothing waits on these refetches.
 */
export function refreshImportSourceLists(queryClient: QueryClient): void {
  for (const queryKey of IMPORT_SOURCE_LIST_PREFIXES) {
    void queryClient.invalidateQueries({ queryKey }).catch(() => undefined);
  }
}

/** Puts a new game at the top of My games at once, then lets the list refetch in the background. */
function prependToMyGames(
  queryClient: QueryClient,
  response: QuizshowGameResponse,
  demoMode: boolean,
): void {
  const summary = gameSummaryOf(response);
  queryClient.setQueryData<QuizshowGameListResponse>(
    quizshowKeys.games(demoMode),
    (previous) =>
      previous && {
        ...previous,
        games: [
          summary,
          ...previous.games.filter((game) => game.id !== summary.id),
        ],
      },
  );
  queryClient.setQueryData(
    quizshowKeys.game(response.gameId, demoMode),
    response,
  );
  void queryClient
    .invalidateQueries({ queryKey: quizshowKeys.games(demoMode) })
    .catch(() => undefined);
  refreshImportSourceLists(queryClient);
}

export function useCreateQuizshowGame(): UseMutationResult<
  QuizshowGameResponse,
  unknown,
  QuizshowCreateGameInput
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<QuizshowGameResponse, unknown, QuizshowCreateGameInput>({
    meta: SILENT_ERROR_META,
    mutationFn: async (body) =>
      demoMode ? demoCreateGame(body) : createQuizshowGame(body),
    onSuccess: (response) => {
      prependToMyGames(queryClient, response, demoMode);
    },
  });
}

export function useDuplicateQuizshowGame(): UseMutationResult<
  QuizshowGameResponse,
  unknown,
  string
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<QuizshowGameResponse, unknown, string>({
    meta: SILENT_ERROR_META,
    mutationFn: async (gameId) =>
      demoMode ? demoDuplicateGame(gameId) : duplicateQuizshowGame(gameId),
    onSuccess: (response) => {
      prependToMyGames(queryClient, response, demoMode);
    },
  });
}

export function useDeleteQuizshowGame(): UseMutationResult<
  void,
  unknown,
  string
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, unknown, string>({
    meta: SILENT_ERROR_META,
    mutationFn: async (gameId) =>
      demoMode ? demoDeleteGame(gameId) : deleteQuizshowGame(gameId),
    onSuccess: async (_response, gameId) => {
      queryClient.setQueryData<QuizshowGameListResponse>(
        quizshowKeys.games(demoMode),
        (previous) =>
          previous && {
            ...previous,
            games: previous.games.filter((game) => game.id !== gameId),
          },
      );
      queryClient.removeQueries({
        queryKey: quizshowKeys.game(gameId, demoMode),
      });
      queryClient.removeQueries({
        queryKey: quizshowKeys.gameResults(gameId, demoMode),
      });
      queryClient.removeQueries({
        queryKey: quizshowKeys.gameImportSources(gameId, demoMode),
      });
      refreshImportSourceLists(queryClient);
      await queryClient.invalidateQueries({
        queryKey: quizshowKeys.games(demoMode),
      });
    },
  });
}
