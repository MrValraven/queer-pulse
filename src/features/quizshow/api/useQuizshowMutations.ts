import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { eventKeys } from "../../gatherings/api/eventKeys";
import type {
  QuizshowGameInput,
  QuizshowImportInput,
  QuizshowJoinInput,
  QuizshowJoinResponse,
  QuizshowOpenSessionInput,
  QuizshowOpenSessionResponse,
  QuizshowQuizInput,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import type { QuizshowScope } from "../quizshowScope";
import {
  deleteQuizshowGameResults,
  deleteQuizshowResults,
  importQuizshowGame,
  importQuizshowQuiz,
  joinQuizshow,
  openQuizshowGameSession,
  openQuizshowSession,
  putQuizshowGame,
  putQuizshowQuiz,
} from "./quizshow.api";
import { quizshowKeys } from "./quizshowKeys";
import { refreshImportSourceLists } from "./useQuizshowGames";
import {
  demoDeleteResults,
  demoImportQuiz,
  demoJoin,
  demoOpenSession,
  demoPutQuiz,
} from "./quizshowDemoStore";
import {
  demoDeleteGameResults,
  demoImportGame,
  demoOpenGameSession,
  demoPutGame,
} from "./quizshowDemoGames";

// Every write below owns its error copy in the component that calls it.
const SILENT_ERROR_META = { silentError: true } as const;

/** The builder's save body; only a game reads the 18+ switch. */
export type QuizshowSaveInput = QuizshowQuizInput & { isAdultsOnly?: boolean };

/** The event PUT never carries the 18+ switch: an event takes it from its own details. */
function eventBodyOf(body: QuizshowSaveInput): QuizshowQuizInput {
  const eventBody: QuizshowSaveInput = { ...body };
  delete eventBody.isAdultsOnly;
  return eventBody;
}

async function saveFor(
  scope: QuizshowScope,
  demoMode: boolean,
  body: QuizshowSaveInput,
): Promise<QuizshowQuizResponse> {
  if (scope.kind === "event") {
    const eventBody = eventBodyOf(body);
    return demoMode
      ? demoPutQuiz(scope.eventSlug, eventBody)
      : putQuizshowQuiz(scope.eventSlug, eventBody);
  }
  const gameBody: QuizshowGameInput = {
    ...body,
    isAdultsOnly: body.isAdultsOnly === true,
  };
  return demoMode
    ? demoPutGame(scope.gameId, gameBody)
    : putQuizshowGame(scope.gameId, gameBody);
}

async function importFor(
  scope: QuizshowScope,
  demoMode: boolean,
  body: QuizshowImportInput,
): Promise<QuizshowQuizResponse> {
  if (scope.kind === "event") {
    return demoMode
      ? demoImportQuiz(scope.eventSlug, body)
      : importQuizshowQuiz(scope.eventSlug, body);
  }
  return demoMode
    ? demoImportGame(scope.gameId, body)
    : importQuizshowGame(scope.gameId, body);
}

async function openSessionFor(
  scope: QuizshowScope,
  demoMode: boolean,
  body: QuizshowOpenSessionInput,
): Promise<QuizshowOpenSessionResponse> {
  if (scope.kind === "event") {
    return demoMode
      ? demoOpenSession(scope.eventSlug, body)
      : openQuizshowSession(scope.eventSlug, body);
  }
  return demoMode
    ? demoOpenGameSession(scope.gameId, body)
    : openQuizshowGameSession(scope.gameId, body);
}

async function deleteResultsFor(
  scope: QuizshowScope,
  demoMode: boolean,
): Promise<void> {
  if (scope.kind === "event") {
    return demoMode
      ? demoDeleteResults(scope.eventSlug)
      : deleteQuizshowResults(scope.eventSlug);
  }
  return demoMode
    ? demoDeleteGameResults(scope.gameId)
    : deleteQuizshowGameResults(scope.gameId);
}

/** A game write moves its My games row (counts, lobby, results), so the list refetches;
 *  its quiz changed too, so the lists of quizzes to copy from refetch in the background. */
async function refreshMyGamesAfter(
  queryClient: QueryClient,
  scope: QuizshowScope,
  demoMode: boolean,
): Promise<void> {
  if (scope.kind !== "game") return;
  refreshImportSourceLists(queryClient);
  await queryClient.invalidateQueries({
    queryKey: quizshowKeys.games(demoMode),
  });
}

/** Opening a lobby or deleting results moves the quiz and the page that lists it. */
async function refreshAfterSessionWrite(
  queryClient: QueryClient,
  scope: QuizshowScope,
  demoMode: boolean,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: quizshowKeys.quizFor(scope, demoMode),
    }),
    scope.kind === "event"
      ? queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot })
      : refreshMyGamesAfter(queryClient, scope, demoMode),
  ]);
}

export function useSaveQuizshowQuiz(
  scope: QuizshowScope,
): UseMutationResult<QuizshowQuizResponse, unknown, QuizshowSaveInput> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<QuizshowQuizResponse, unknown, QuizshowSaveInput>({
    meta: SILENT_ERROR_META,
    mutationFn: async (body) => saveFor(scope, demoMode, body),
    onSuccess: async (response) => {
      queryClient.setQueryData(quizshowKeys.quizFor(scope, demoMode), response);
      await refreshMyGamesAfter(queryClient, scope, demoMode);
    },
  });
}

export function useImportQuizshowQuiz(
  scope: QuizshowScope,
): UseMutationResult<QuizshowQuizResponse, unknown, QuizshowImportInput> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<QuizshowQuizResponse, unknown, QuizshowImportInput>({
    meta: SILENT_ERROR_META,
    mutationFn: async (body) => importFor(scope, demoMode, body),
    onSuccess: async (response) => {
      queryClient.setQueryData(quizshowKeys.quizFor(scope, demoMode), response);
      await refreshMyGamesAfter(queryClient, scope, demoMode);
    },
  });
}

export function useOpenQuizshowSession(
  scope: QuizshowScope,
): UseMutationResult<
  QuizshowOpenSessionResponse,
  unknown,
  QuizshowOpenSessionInput
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    QuizshowOpenSessionResponse,
    unknown,
    QuizshowOpenSessionInput
  >({
    meta: SILENT_ERROR_META,
    mutationFn: async (body) => openSessionFor(scope, demoMode, body),
    onSuccess: async () => {
      await refreshAfterSessionWrite(queryClient, scope, demoMode);
    },
  });
}

export function useJoinQuizshow(): UseMutationResult<
  QuizshowJoinResponse,
  unknown,
  QuizshowJoinInput
> {
  const { demoMode } = useDemoMode();
  return useMutation<QuizshowJoinResponse, unknown, QuizshowJoinInput>({
    meta: SILENT_ERROR_META,
    mutationFn: async (body) =>
      demoMode ? demoJoin(body) : joinQuizshow(body),
  });
}

export function useDeleteQuizshowResults(
  scope: QuizshowScope,
): UseMutationResult<void, unknown, void> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, unknown, void>({
    meta: SILENT_ERROR_META,
    mutationFn: async () => deleteResultsFor(scope, demoMode),
    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: quizshowKeys.resultsFor(scope, demoMode),
      });
      await refreshAfterSessionWrite(queryClient, scope, demoMode);
    },
  });
}
