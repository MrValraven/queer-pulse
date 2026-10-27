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
  QuizshowTemplateCard,
  QuizshowTemplateDetail,
  QuizshowTemplateRow,
} from "../../../shared/contracts/quizshow";
import { quizResponseOfTemplate } from "../templates/quizshowTemplateResponse";
import {
  createQuizshowTemplate,
  deleteQuizshowTemplate,
  duplicateQuizshowTemplate,
  getQuizshowTemplateCards,
  getQuizshowTemplateRows,
  publishQuizshowTemplate,
  unpublishQuizshowTemplate,
} from "./quizshowTemplates.api";
import { quizshowKeys } from "./quizshowKeys";
import {
  demoCreateTemplate,
  demoDeleteTemplate,
  demoDuplicateTemplate,
  demoListTemplates,
  demoPublishTemplate,
  demoTemplateCards,
  demoUnpublishTemplate,
} from "./quizshowDemoTemplates";
import { shouldRetryQuizshowRead } from "./useQuizshowQuiz";

// Every write below owns its error copy in the component that calls it.
const SILENT_ERROR_META = { silentError: true } as const;

type QuizshowTemplateList<Item> = { items: Item[] };

/** The staff rows and the host cards both refetch after a template changes. */
export async function refreshTemplateLists(
  queryClient: QueryClient,
  demoMode: boolean,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: quizshowKeys.templateRows(demoMode),
    }),
    queryClient.invalidateQueries({
      queryKey: quizshowKeys.templateCards(demoMode),
    }),
  ]);
}

/** The builder reads a template from this key, so a staff write fills it at once. */
function cacheTemplateDetail(
  queryClient: QueryClient,
  detail: QuizshowTemplateDetail,
  demoMode: boolean,
): void {
  queryClient.setQueryData(
    quizshowKeys.template(detail.id, demoMode),
    quizResponseOfTemplate(detail),
  );
}

/** Publish and unpublish move the row's status at once, before the list refetches. */
function patchTemplateRow(
  queryClient: QueryClient,
  detail: QuizshowTemplateDetail,
  demoMode: boolean,
): void {
  queryClient.setQueryData<QuizshowTemplateList<QuizshowTemplateRow>>(
    quizshowKeys.templateRows(demoMode),
    (previous) =>
      previous && {
        ...previous,
        items: previous.items.map((row) =>
          row.id === detail.id
            ? { ...row, status: detail.status, publishedAt: detail.publishedAt }
            : row,
        ),
      },
  );
}

/** A new template opens in the builder, so only the staff list needs a refetch. */
async function refreshAfterNewTemplate(
  queryClient: QueryClient,
  detail: QuizshowTemplateDetail,
  demoMode: boolean,
): Promise<void> {
  cacheTemplateDetail(queryClient, detail, demoMode);
  await queryClient.invalidateQueries({
    queryKey: quizshowKeys.templateRows(demoMode),
  });
}

/** Publish and unpublish: fill the builder, patch the row, then refetch both lists. */
async function refreshAfterStatusChange(
  queryClient: QueryClient,
  detail: QuizshowTemplateDetail,
  demoMode: boolean,
): Promise<void> {
  cacheTemplateDetail(queryClient, detail, demoMode);
  patchTemplateRow(queryClient, detail, demoMode);
  await refreshTemplateLists(queryClient, demoMode);
}

/** The published cards a host picks from. */
export function useQuizshowTemplateCards(options: {
  isEnabled: boolean;
}): UseQueryResult<QuizshowTemplateList<QuizshowTemplateCard>> {
  const { demoMode } = useDemoMode();
  return useQuery<QuizshowTemplateList<QuizshowTemplateCard>>({
    queryKey: quizshowKeys.templateCards(demoMode),
    enabled: options.isEnabled,
    retry: shouldRetryQuizshowRead,
    queryFn: async () =>
      demoMode ? demoTemplateCards() : getQuizshowTemplateCards(),
  });
}

/** Every template for staff, drafts first. */
export function useQuizshowTemplateRows(): UseQueryResult<
  QuizshowTemplateList<QuizshowTemplateRow>
> {
  const { demoMode } = useDemoMode();
  return useQuery<QuizshowTemplateList<QuizshowTemplateRow>>({
    queryKey: quizshowKeys.templateRows(demoMode),
    retry: shouldRetryQuizshowRead,
    queryFn: async () =>
      demoMode ? demoListTemplates() : getQuizshowTemplateRows(),
  });
}

export function useCreateQuizshowTemplate(): UseMutationResult<
  QuizshowTemplateDetail,
  unknown,
  void
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<QuizshowTemplateDetail, unknown, void>({
    meta: SILENT_ERROR_META,
    mutationFn: async () =>
      demoMode ? demoCreateTemplate() : createQuizshowTemplate(),
    onSuccess: async (detail) => {
      await refreshAfterNewTemplate(queryClient, detail, demoMode);
    },
  });
}

export function useDuplicateQuizshowTemplate(): UseMutationResult<
  QuizshowTemplateDetail,
  unknown,
  string
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<QuizshowTemplateDetail, unknown, string>({
    meta: SILENT_ERROR_META,
    mutationFn: async (templateId) =>
      demoMode
        ? demoDuplicateTemplate(templateId)
        : duplicateQuizshowTemplate(templateId),
    onSuccess: async (detail) => {
      await refreshAfterNewTemplate(queryClient, detail, demoMode);
    },
  });
}

export function usePublishQuizshowTemplate(): UseMutationResult<
  QuizshowTemplateDetail,
  unknown,
  string
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<QuizshowTemplateDetail, unknown, string>({
    meta: SILENT_ERROR_META,
    mutationFn: async (templateId) =>
      demoMode
        ? demoPublishTemplate(templateId)
        : publishQuizshowTemplate(templateId),
    onSuccess: async (detail) => {
      await refreshAfterStatusChange(queryClient, detail, demoMode);
    },
  });
}

export function useUnpublishQuizshowTemplate(): UseMutationResult<
  QuizshowTemplateDetail,
  unknown,
  string
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<QuizshowTemplateDetail, unknown, string>({
    meta: SILENT_ERROR_META,
    mutationFn: async (templateId) =>
      demoMode
        ? demoUnpublishTemplate(templateId)
        : unpublishQuizshowTemplate(templateId),
    onSuccess: async (detail) => {
      await refreshAfterStatusChange(queryClient, detail, demoMode);
    },
  });
}

export function useDeleteQuizshowTemplate(): UseMutationResult<
  void,
  unknown,
  string
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, unknown, string>({
    meta: SILENT_ERROR_META,
    mutationFn: async (templateId) =>
      demoMode
        ? demoDeleteTemplate(templateId)
        : deleteQuizshowTemplate(templateId),
    onSuccess: async (_response, templateId) => {
      queryClient.setQueryData<QuizshowTemplateList<QuizshowTemplateRow>>(
        quizshowKeys.templateRows(demoMode),
        (previous) =>
          previous && {
            ...previous,
            items: previous.items.filter((row) => row.id !== templateId),
          },
      );
      queryClient.removeQueries({
        queryKey: quizshowKeys.template(templateId, demoMode),
      });
      await refreshTemplateLists(queryClient, demoMode);
    },
  });
}
