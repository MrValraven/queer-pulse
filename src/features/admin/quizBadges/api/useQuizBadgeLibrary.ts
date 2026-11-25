import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import type {
  QuizBadgeDefinitionDTO,
  QuizBadgeLibraryResponse,
} from "../../../../shared/contracts/quizWinBadges";
import {
  demoArchiveQuizBadge,
  demoCreateQuizBadge,
  demoDeleteQuizBadge,
  demoGetQuizBadgeLibrary,
  demoRestoreQuizBadge,
  demoUpdateQuizBadge,
} from "../../../quizshow/winBadges/quizWinBadgesDemoStore";
import {
  archiveQuizBadge,
  createQuizBadge,
  deleteQuizBadge,
  getQuizBadgeLibrary,
  restoreQuizBadge,
  updateQuizBadge,
  type QuizBadgeCreateBody,
  type QuizBadgeUpdateBody,
} from "./quizBadgesAdmin.api";
import { quizBadgesAdminKeys } from "./quizBadgesAdminKeys";
import { invalidateAfterQuizBadgeWrite } from "./useQuizEventBadges";

// Each dialog and row that writes owns its error copy.
const SILENT_ERROR_META = { silentError: true } as const;

/** The admin badge library: live badges by name, then archived ones. */
export function useQuizBadgeLibrary(): UseQueryResult<QuizBadgeLibraryResponse> {
  const { demoMode } = useDemoMode();
  return useQuery<QuizBadgeLibraryResponse>({
    queryKey: quizBadgesAdminKeys.library(demoMode),
    queryFn: async () =>
      demoMode ? demoGetQuizBadgeLibrary() : getQuizBadgeLibrary(),
  });
}

export function useCreateQuizBadge(): UseMutationResult<
  QuizBadgeDefinitionDTO,
  Error,
  QuizBadgeCreateBody
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<QuizBadgeDefinitionDTO, Error, QuizBadgeCreateBody>({
    meta: SILENT_ERROR_META,
    mutationFn: async (body) =>
      demoMode ? demoCreateQuizBadge(body) : createQuizBadge(body),
    onSuccess: () => invalidateAfterQuizBadgeWrite(queryClient),
  });
}

export function useUpdateQuizBadge(): UseMutationResult<
  QuizBadgeDefinitionDTO,
  Error,
  { definitionId: string; body: QuizBadgeUpdateBody }
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    QuizBadgeDefinitionDTO,
    Error,
    { definitionId: string; body: QuizBadgeUpdateBody }
  >({
    meta: SILENT_ERROR_META,
    mutationFn: async ({ definitionId, body }) =>
      demoMode
        ? demoUpdateQuizBadge(definitionId, body)
        : updateQuizBadge(definitionId, body),
    onSuccess: () => invalidateAfterQuizBadgeWrite(queryClient),
  });
}

export function useArchiveQuizBadge(): UseMutationResult<
  QuizBadgeDefinitionDTO,
  Error,
  { definitionId: string }
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<QuizBadgeDefinitionDTO, Error, { definitionId: string }>({
    meta: SILENT_ERROR_META,
    mutationFn: async ({ definitionId }) =>
      demoMode
        ? demoArchiveQuizBadge(definitionId)
        : archiveQuizBadge(definitionId),
    onSuccess: () => invalidateAfterQuizBadgeWrite(queryClient),
  });
}

export function useRestoreQuizBadge(): UseMutationResult<
  QuizBadgeDefinitionDTO,
  Error,
  { definitionId: string }
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<QuizBadgeDefinitionDTO, Error, { definitionId: string }>({
    meta: SILENT_ERROR_META,
    mutationFn: async ({ definitionId }) =>
      demoMode
        ? demoRestoreQuizBadge(definitionId)
        : restoreQuizBadge(definitionId),
    onSuccess: () => invalidateAfterQuizBadgeWrite(queryClient),
  });
}

export function useDeleteQuizBadge(): UseMutationResult<
  void,
  Error,
  { definitionId: string }
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { definitionId: string }>({
    meta: SILENT_ERROR_META,
    mutationFn: async ({ definitionId }) => {
      if (demoMode) {
        demoDeleteQuizBadge(definitionId);
        return;
      }
      await deleteQuizBadge(definitionId);
    },
    onSuccess: () => invalidateAfterQuizBadgeWrite(queryClient),
  });
}
