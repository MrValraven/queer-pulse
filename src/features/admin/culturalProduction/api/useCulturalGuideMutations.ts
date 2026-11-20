import { useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "../../api/demoAwareMutation";
import {
  createCulturalGuide,
  createCulturalTaskBatch,
  deleteCulturalGuide,
  replaceCulturalGuide,
} from "./culturalProduction.api";
import type {
  CreateCulturalGuideBody,
  CreateCulturalTaskBatchBody,
  CulturalGuideDTO,
  CulturalTaskBatchDTO,
  ReplaceCulturalGuideBody,
} from "./culturalProduction.types";
import { CULTURAL_WRITE_KEY } from "./culturalProductionKeys";
import {
  CULTURAL_SILENT_META,
  dropCulturalGuide,
  refreshAfterCulturalRefusal,
  refreshAfterCulturalTaskBatch,
  saveCulturalGuideAnswer,
} from "./culturalMutationCache";

export { useIsCulturalWriteInFlight } from "./culturalMutationCache";

function loadDemoStore() {
  return import("../culturalProductionDemoStore");
}

/** The mode and the cache handlers every guide write shares. */
function useGuideCache() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return {
    demoMode,
    saveGuide: (guide: CulturalGuideDTO) =>
      saveCulturalGuideAnswer(queryClient, guide, demoMode),
    dropGuide: (guideId: string) => dropCulturalGuide(queryClient, guideId),
    refreshAfterBatch: () => refreshAfterCulturalTaskBatch(queryClient),
    onRefusal: (cause: unknown, guideId: string) =>
      refreshAfterCulturalRefusal(queryClient, cause, { guideId }),
  };
}

/** POST guides. */
export function useCreateCulturalGuide(): UseMutationResult<
  CulturalGuideDTO,
  Error,
  CreateCulturalGuideBody
> {
  const { demoMode, saveGuide } = useGuideCache();
  return useDemoAwareMutation<CulturalGuideDTO, Error, CreateCulturalGuideBody>(
    {
      demoMode,
      demoLatencyMs: 0,
      meta: CULTURAL_SILENT_META,
      mutationKey: CULTURAL_WRITE_KEY,
      demoResult: async (body) =>
        (await loadDemoStore()).demoCreateCulturalGuide(body),
      live: (body) => createCulturalGuide(body),
      onSuccess: (guide) => saveGuide(guide),
    },
  );
}

/** PUT guides/:id. A CULTURAL_GUIDE_EDIT_CONFLICT changes no cache: the
 *  editor offers "Load the latest version", which refetches the guide. */
export function useReplaceCulturalGuide(
  guideId: string,
): UseMutationResult<CulturalGuideDTO, Error, ReplaceCulturalGuideBody> {
  const { demoMode, saveGuide, onRefusal } = useGuideCache();
  return useDemoAwareMutation<
    CulturalGuideDTO,
    Error,
    ReplaceCulturalGuideBody
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: CULTURAL_SILENT_META,
    mutationKey: CULTURAL_WRITE_KEY,
    demoResult: async (body) =>
      (await loadDemoStore()).demoReplaceCulturalGuide(guideId, body),
    live: (body) => replaceCulturalGuide(guideId, body),
    onError: (cause) => onRefusal(cause, guideId),
    onSuccess: (guide) => saveGuide(guide),
  });
}

/** DELETE guides/:id: the detail query goes with the guide. */
export function useDeleteCulturalGuide(
  guideId: string,
): UseMutationResult<{ ok: true }, Error, void> {
  const { demoMode, dropGuide, onRefusal } = useGuideCache();
  return useDemoAwareMutation<{ ok: true }, Error, void>({
    demoMode,
    demoLatencyMs: 0,
    meta: CULTURAL_SILENT_META,
    mutationKey: CULTURAL_WRITE_KEY,
    demoResult: async () =>
      (await loadDemoStore()).demoDeleteCulturalGuide(guideId),
    live: () => deleteCulturalGuide(guideId),
    onError: (cause) => onRefusal(cause, guideId),
    onSuccess: () => dropGuide(guideId),
  });
}

/** POST guides/:id/task-batches: one task per checklist step. */
export function useCreateCulturalTaskBatch(
  guideId: string,
): UseMutationResult<CulturalTaskBatchDTO, Error, CreateCulturalTaskBatchBody> {
  const { demoMode, refreshAfterBatch, onRefusal } = useGuideCache();
  return useDemoAwareMutation<
    CulturalTaskBatchDTO,
    Error,
    CreateCulturalTaskBatchBody
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: CULTURAL_SILENT_META,
    mutationKey: CULTURAL_WRITE_KEY,
    demoResult: async (body) =>
      (await loadDemoStore()).demoCreateCulturalTaskBatch(guideId, body),
    live: (body) => createCulturalTaskBatch(guideId, body),
    onError: (cause) => onRefusal(cause, guideId),
    onSuccess: () => refreshAfterBatch(),
  });
}
