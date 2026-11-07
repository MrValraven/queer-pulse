import type { UseMutationResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "../../admin/api/demoAwareMutation";
import type {
  CreateVjSceneBody,
  UpdateVjSceneBody,
  VjSceneDTO,
  VjSceneDeletedDTO,
} from "../../../shared/contracts/vj";
import { vjReasonOf } from "../vjErrors";
import { useVjShowCacheWriter } from "./useVjShowCache";
import {
  createVjScene,
  deleteVjScene,
  reorderVjScenes,
  updateVjScene,
} from "./vj.api";
import { VJ_WRITE_KEY } from "./vjKeys";

/** Scene writes (contract 6.2 "Scenes", keys 9.3). Every refusal reaches the
 *  caller untouched, so `vjErrorKeyOf` and `vjErrorValuesOf` name its reason. */

type UpdateVjSceneVariables = { sceneId: string } & UpdateVjSceneBody;

/** The body holds only the properties the caller set; `packId: null` stays,
 *  since it moves the scene to no pack. */
function updateBodyOf(variables: UpdateVjSceneVariables): UpdateVjSceneBody {
  const body: UpdateVjSceneBody = {};
  if (variables.name !== undefined) body.name = variables.name;
  if (variables.packId !== undefined) body.packId = variables.packId;
  if (variables.look !== undefined) body.look = variables.look;
  return body;
}

function useCreateVjScene(): UseMutationResult<
  VjSceneDTO,
  Error,
  CreateVjSceneBody
> {
  const { demoMode } = useDemoMode();
  const cache = useVjShowCacheWriter();
  return useDemoAwareMutation<VjSceneDTO, Error, CreateVjSceneBody>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async (body) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoCreateVjScene(body);
    },
    live: (body) => createVjScene(body),
    onSuccess: (createdScene) => {
      cache.putScene(createdScene);
      cache.invalidateScenes();
    },
    onError: (cause) => {
      cache.invalidateOnMissing(cause);
    },
  });
}

function useUpdateVjScene(): UseMutationResult<
  VjSceneDTO,
  Error,
  UpdateVjSceneVariables
> {
  const { demoMode } = useDemoMode();
  const cache = useVjShowCacheWriter();
  return useDemoAwareMutation<VjSceneDTO, Error, UpdateVjSceneVariables>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async (variables) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoUpdateVjScene(
        variables.sceneId,
        updateBodyOf(variables),
      );
    },
    live: (variables) =>
      updateVjScene(variables.sceneId, updateBodyOf(variables)),
    onSuccess: (updatedScene) => {
      cache.putScene(updatedScene);
    },
    onError: (cause) => {
      cache.invalidateOnMissing(cause);
    },
  });
}

function useReorderVjScenes(): UseMutationResult<
  VjSceneDTO[],
  Error,
  { sceneIds: string[] }
> {
  const { demoMode } = useDemoMode();
  const cache = useVjShowCacheWriter();
  return useDemoAwareMutation<VjSceneDTO[], Error, { sceneIds: string[] }>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async ({ sceneIds }) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoReorderVjScenes({ sceneIds }).items;
    },
    live: async ({ sceneIds }) => (await reorderVjScenes({ sceneIds })).items,
    onSuccess: (scenes) => {
      cache.setScenes(scenes);
    },
    onError: (cause) => {
      // A mismatch means another tab added or removed a scene: read the list
      // again so the next drag starts from the server's order.
      if (vjReasonOf(cause) === "VJ_SCENE_REORDER_MISMATCH") {
        cache.invalidateScenes();
      }
      cache.invalidateOnMissing(cause);
    },
  });
}

function useDeleteVjScene(): UseMutationResult<
  VjSceneDeletedDTO,
  Error,
  { sceneId: string }
> {
  const { demoMode } = useDemoMode();
  const cache = useVjShowCacheWriter();
  return useDemoAwareMutation<VjSceneDeletedDTO, Error, { sceneId: string }>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async ({ sceneId }) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoDeleteVjScene(sceneId);
    },
    live: ({ sceneId }) => deleteVjScene(sceneId),
    onSuccess: (answer) => {
      // The scene's set list items go with it, and the server closes the gap
      // it leaves in the scene positions.
      cache.dropScene(answer.deletedSceneId);
      cache.invalidateSetlists();
      cache.invalidateScenes();
    },
    onError: (cause) => {
      cache.invalidateOnMissing(cause);
    },
  });
}

/** Create, edit (name, pack, look), reorder and delete scenes. Rename is
 *  `updateScene.mutateAsync({ sceneId, name })`. */
export function useVjSceneMutations(): {
  createScene: UseMutationResult<VjSceneDTO, Error, CreateVjSceneBody>;
  updateScene: UseMutationResult<VjSceneDTO, Error, UpdateVjSceneVariables>;
  reorderScenes: UseMutationResult<VjSceneDTO[], Error, { sceneIds: string[] }>;
  deleteScene: UseMutationResult<VjSceneDeletedDTO, Error, { sceneId: string }>;
} {
  const createScene = useCreateVjScene();
  const updateScene = useUpdateVjScene();
  const reorderScenes = useReorderVjScenes();
  const deleteScene = useDeleteVjScene();
  return { createScene, updateScene, reorderScenes, deleteScene };
}
