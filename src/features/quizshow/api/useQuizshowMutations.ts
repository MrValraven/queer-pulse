import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { eventKeys } from "../../gatherings/api/eventKeys";
import type {
  QuizshowImportInput,
  QuizshowJoinInput,
  QuizshowJoinResponse,
  QuizshowOpenSessionInput,
  QuizshowOpenSessionResponse,
  QuizshowQuizInput,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import {
  deleteQuizshowResults,
  importQuizshowQuiz,
  joinQuizshow,
  openQuizshowSession,
  putQuizshowQuiz,
} from "./quizshow.api";
import { quizshowKeys } from "./quizshowKeys";
import {
  demoDeleteResults,
  demoImportQuiz,
  demoJoin,
  demoOpenSession,
  demoPutQuiz,
} from "./quizshowDemoStore";

// Every write below owns its error copy in the component that calls it.
const SILENT_ERROR_META = { silentError: true } as const;

export function useSaveQuizshowQuiz(
  slug: string,
): UseMutationResult<QuizshowQuizResponse, unknown, QuizshowQuizInput> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<QuizshowQuizResponse, unknown, QuizshowQuizInput>({
    meta: SILENT_ERROR_META,
    mutationFn: async (body) =>
      demoMode ? demoPutQuiz(slug, body) : putQuizshowQuiz(slug, body),
    onSuccess: (response) => {
      queryClient.setQueryData(quizshowKeys.quiz(slug, demoMode), response);
    },
  });
}

export function useImportQuizshowQuiz(
  slug: string,
): UseMutationResult<QuizshowQuizResponse, unknown, QuizshowImportInput> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<QuizshowQuizResponse, unknown, QuizshowImportInput>({
    meta: SILENT_ERROR_META,
    mutationFn: async (body) =>
      demoMode ? demoImportQuiz(slug, body) : importQuizshowQuiz(slug, body),
    onSuccess: (response) => {
      queryClient.setQueryData(quizshowKeys.quiz(slug, demoMode), response);
    },
  });
}

export function useOpenQuizshowSession(
  slug: string,
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
    mutationFn: async (body) =>
      demoMode ? demoOpenSession(slug, body) : openQuizshowSession(slug, body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: quizshowKeys.quiz(slug, demoMode),
        }),
        queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot }),
      ]);
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
  slug: string,
): UseMutationResult<void, unknown, void> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, unknown, void>({
    meta: SILENT_ERROR_META,
    mutationFn: async () =>
      demoMode ? demoDeleteResults(slug) : deleteQuizshowResults(slug),
    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: quizshowKeys.results(slug, demoMode),
      });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: quizshowKeys.quiz(slug, demoMode),
        }),
        queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot }),
      ]);
    },
  });
}
