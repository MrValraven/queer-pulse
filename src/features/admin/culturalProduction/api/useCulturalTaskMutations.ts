import { useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "../../api/demoAwareMutation";
import {
  assignCulturalTask,
  createCulturalTask,
  deleteCulturalTask,
  unassignCulturalTask,
  updateCulturalTask,
} from "./culturalProduction.api";
import type {
  CreateCulturalTaskBody,
  CulturalTaskDTO,
  UpdateCulturalTaskBody,
} from "./culturalProduction.types";
import { CULTURAL_WRITE_KEY } from "./culturalProductionKeys";
import {
  CULTURAL_SILENT_META,
  dropCulturalTask,
  refreshAfterCulturalRefusal,
  saveCulturalTaskAnswer,
  type CulturalRefusalSubject,
} from "./culturalMutationCache";

export { useIsCulturalWriteInFlight } from "./culturalMutationCache";

function loadDemoStore() {
  return import("../culturalProductionDemoStore");
}

/** The mode and the cache handlers every task write shares. */
function useTaskCache() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return {
    demoMode,
    saveTask: (task: CulturalTaskDTO) =>
      saveCulturalTaskAnswer(queryClient, task, demoMode),
    dropTask: (taskId: string) => dropCulturalTask(queryClient, taskId),
    onRefusal: (cause: unknown, subject: CulturalRefusalSubject) =>
      refreshAfterCulturalRefusal(queryClient, cause, subject),
  };
}

/** POST tasks. A linked idea or guide that went away reads again. */
export function useCreateCulturalTask(): UseMutationResult<
  CulturalTaskDTO,
  Error,
  CreateCulturalTaskBody
> {
  const { demoMode, saveTask, onRefusal } = useTaskCache();
  return useDemoAwareMutation<CulturalTaskDTO, Error, CreateCulturalTaskBody>({
    demoMode,
    demoLatencyMs: 0,
    meta: CULTURAL_SILENT_META,
    mutationKey: CULTURAL_WRITE_KEY,
    demoResult: async (body) =>
      (await loadDemoStore()).demoCreateCulturalTask(body),
    live: (body) => createCulturalTask(body),
    onError: (cause, body) =>
      onRefusal(cause, { ideaId: body.ideaId, guideId: body.guideId }),
    onSuccess: (task) => saveTask(task),
  });
}

/** PATCH tasks/:id. */
export function useUpdateCulturalTask(
  taskId: string,
): UseMutationResult<CulturalTaskDTO, Error, UpdateCulturalTaskBody> {
  const { demoMode, saveTask, onRefusal } = useTaskCache();
  return useDemoAwareMutation<CulturalTaskDTO, Error, UpdateCulturalTaskBody>({
    demoMode,
    demoLatencyMs: 0,
    meta: CULTURAL_SILENT_META,
    mutationKey: CULTURAL_WRITE_KEY,
    demoResult: async (body) =>
      (await loadDemoStore()).demoUpdateCulturalTask(taskId, body),
    live: (body) => updateCulturalTask(taskId, body),
    onError: (cause, body) =>
      onRefusal(cause, { taskId, ideaId: body.ideaId, guideId: body.guideId }),
    onSuccess: (task) => saveTask(task),
  });
}

/** DELETE tasks/:id: the detail query goes with the task. */
export function useDeleteCulturalTask(
  taskId: string,
): UseMutationResult<{ ok: true }, Error, void> {
  const { demoMode, dropTask, onRefusal } = useTaskCache();
  return useDemoAwareMutation<{ ok: true }, Error, void>({
    demoMode,
    demoLatencyMs: 0,
    meta: CULTURAL_SILENT_META,
    mutationKey: CULTURAL_WRITE_KEY,
    demoResult: async () =>
      (await loadDemoStore()).demoDeleteCulturalTask(taskId),
    live: () => deleteCulturalTask(taskId),
    onError: (cause) => onRefusal(cause, { taskId }),
    onSuccess: () => dropTask(taskId),
  });
}

/** POST tasks/:id/assignees. */
export function useAssignCulturalTask(
  taskId: string,
): UseMutationResult<CulturalTaskDTO, Error, { userId: string }> {
  const { demoMode, saveTask, onRefusal } = useTaskCache();
  return useDemoAwareMutation<CulturalTaskDTO, Error, { userId: string }>({
    demoMode,
    demoLatencyMs: 0,
    meta: CULTURAL_SILENT_META,
    mutationKey: CULTURAL_WRITE_KEY,
    demoResult: async ({ userId }) =>
      (await loadDemoStore()).demoAssignCulturalTask(taskId, { userId }),
    live: ({ userId }) => assignCulturalTask(taskId, { userId }),
    onError: (cause) => onRefusal(cause, { taskId }),
    onSuccess: (task) => saveTask(task),
  });
}

/** DELETE tasks/:id/assignees/:userId. */
export function useUnassignCulturalTask(
  taskId: string,
): UseMutationResult<CulturalTaskDTO, Error, { userId: string }> {
  const { demoMode, saveTask, onRefusal } = useTaskCache();
  return useDemoAwareMutation<CulturalTaskDTO, Error, { userId: string }>({
    demoMode,
    demoLatencyMs: 0,
    meta: CULTURAL_SILENT_META,
    mutationKey: CULTURAL_WRITE_KEY,
    demoResult: async ({ userId }) =>
      (await loadDemoStore()).demoUnassignCulturalTask(taskId, userId),
    live: ({ userId }) => unassignCulturalTask(taskId, userId),
    onError: (cause) => onRefusal(cause, { taskId }),
    onSuccess: (task) => saveTask(task),
  });
}
