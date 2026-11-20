import { useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "../../api/demoAwareMutation";
import {
  addCulturalIdeaComment,
  backCulturalIdea,
  createCulturalIdea,
  deleteCulturalIdea,
  deleteCulturalIdeaComment,
  unbackCulturalIdea,
  updateCulturalIdea,
} from "./culturalProduction.api";
import type {
  CreateCulturalIdeaBody,
  CulturalIdeaDTO,
  UpdateCulturalIdeaBody,
} from "./culturalProduction.types";
import { CULTURAL_WRITE_KEY } from "./culturalProductionKeys";
import {
  CULTURAL_SILENT_META,
  dropCulturalIdea,
  refreshAfterCulturalRefusal,
  saveCulturalIdeaAnswer,
} from "./culturalMutationCache";

export { useIsCulturalWriteInFlight } from "./culturalMutationCache";

function loadDemoStore() {
  return import("../culturalProductionDemoStore");
}

/** The mode and the cache handlers every idea write shares. */
function useIdeaCache() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return {
    demoMode,
    saveIdea: (idea: CulturalIdeaDTO) =>
      saveCulturalIdeaAnswer(queryClient, idea, demoMode),
    dropIdea: (ideaId: string) => dropCulturalIdea(queryClient, ideaId),
    onRefusal: (cause: unknown, ideaId: string | null) =>
      refreshAfterCulturalRefusal(queryClient, cause, { ideaId }),
  };
}

/** POST ideas. */
export function useCreateCulturalIdea(): UseMutationResult<
  CulturalIdeaDTO,
  Error,
  CreateCulturalIdeaBody
> {
  const { demoMode, saveIdea } = useIdeaCache();
  return useDemoAwareMutation<CulturalIdeaDTO, Error, CreateCulturalIdeaBody>({
    demoMode,
    demoLatencyMs: 0,
    meta: CULTURAL_SILENT_META,
    mutationKey: CULTURAL_WRITE_KEY,
    demoResult: async (body) =>
      (await loadDemoStore()).demoCreateCulturalIdea(body),
    live: (body) => createCulturalIdea(body),
    onSuccess: (idea) => saveIdea(idea),
  });
}

/** PATCH ideas/:id. */
export function useUpdateCulturalIdea(
  ideaId: string,
): UseMutationResult<CulturalIdeaDTO, Error, UpdateCulturalIdeaBody> {
  const { demoMode, saveIdea, onRefusal } = useIdeaCache();
  return useDemoAwareMutation<CulturalIdeaDTO, Error, UpdateCulturalIdeaBody>({
    demoMode,
    demoLatencyMs: 0,
    meta: CULTURAL_SILENT_META,
    mutationKey: CULTURAL_WRITE_KEY,
    demoResult: async (body) =>
      (await loadDemoStore()).demoUpdateCulturalIdea(ideaId, body),
    live: (body) => updateCulturalIdea(ideaId, body),
    onError: (cause) => onRefusal(cause, ideaId),
    onSuccess: (idea) => saveIdea(idea),
  });
}

/** DELETE ideas/:id: the detail query goes with the idea. */
export function useDeleteCulturalIdea(
  ideaId: string,
): UseMutationResult<{ ok: true }, Error, void> {
  const { demoMode, dropIdea, onRefusal } = useIdeaCache();
  return useDemoAwareMutation<{ ok: true }, Error, void>({
    demoMode,
    demoLatencyMs: 0,
    meta: CULTURAL_SILENT_META,
    mutationKey: CULTURAL_WRITE_KEY,
    demoResult: async () =>
      (await loadDemoStore()).demoDeleteCulturalIdea(ideaId),
    live: () => deleteCulturalIdea(ideaId),
    onError: (cause) => onRefusal(cause, ideaId),
    onSuccess: () => dropIdea(ideaId),
  });
}

/** PUT or DELETE ideas/:id/backing: `isBacking` is the state to reach. */
export function useToggleCulturalIdeaBacking(
  ideaId: string,
): UseMutationResult<CulturalIdeaDTO, Error, { isBacking: boolean }> {
  const { demoMode, saveIdea, onRefusal } = useIdeaCache();
  return useDemoAwareMutation<CulturalIdeaDTO, Error, { isBacking: boolean }>({
    demoMode,
    demoLatencyMs: 0,
    meta: CULTURAL_SILENT_META,
    mutationKey: CULTURAL_WRITE_KEY,
    demoResult: async ({ isBacking }) => {
      const store = await loadDemoStore();
      return isBacking
        ? store.demoBackCulturalIdea(ideaId)
        : store.demoUnbackCulturalIdea(ideaId);
    },
    live: ({ isBacking }) =>
      isBacking ? backCulturalIdea(ideaId) : unbackCulturalIdea(ideaId),
    onError: (cause) => onRefusal(cause, ideaId),
    onSuccess: (idea) => saveIdea(idea),
  });
}

/** POST ideas/:id/comments. */
export function useAddCulturalIdeaComment(
  ideaId: string,
): UseMutationResult<CulturalIdeaDTO, Error, { body: string }> {
  const { demoMode, saveIdea, onRefusal } = useIdeaCache();
  return useDemoAwareMutation<CulturalIdeaDTO, Error, { body: string }>({
    demoMode,
    demoLatencyMs: 0,
    meta: CULTURAL_SILENT_META,
    mutationKey: CULTURAL_WRITE_KEY,
    demoResult: async (body) =>
      (await loadDemoStore()).demoAddCulturalIdeaComment(ideaId, body),
    live: (body) => addCulturalIdeaComment(ideaId, body),
    onError: (cause) => onRefusal(cause, ideaId),
    onSuccess: (idea) => saveIdea(idea),
  });
}

/** DELETE ideas/:id/comments/:commentId. */
export function useDeleteCulturalIdeaComment(
  ideaId: string,
): UseMutationResult<CulturalIdeaDTO, Error, { commentId: string }> {
  const { demoMode, saveIdea, onRefusal } = useIdeaCache();
  return useDemoAwareMutation<CulturalIdeaDTO, Error, { commentId: string }>({
    demoMode,
    demoLatencyMs: 0,
    meta: CULTURAL_SILENT_META,
    mutationKey: CULTURAL_WRITE_KEY,
    demoResult: async ({ commentId }) =>
      (await loadDemoStore()).demoDeleteCulturalIdeaComment(ideaId, commentId),
    live: ({ commentId }) => deleteCulturalIdeaComment(ideaId, commentId),
    onError: (cause) => onRefusal(cause, ideaId),
    onSuccess: (idea) => saveIdea(idea),
  });
}
