import { useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { useCallback } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "../../admin/api/demoAwareMutation";
import type {
  CreateVjSetlistBody,
  UpdateVjSetlistBody,
  VjSetlistDTO,
  VjSetlistDeletedDTO,
  VjSetlistItemInput,
} from "../../../shared/contracts/vj";
import { vjReasonOf } from "../vjErrors";
import { useVjShowCacheWriter } from "./useVjShowCache";
import {
  createVjSetlist,
  deleteVjSetlist,
  reorderVjSetlists,
  setVjSetlistItems,
  updateVjSetlist,
} from "./vj.api";
import { vjKeys, VJ_WRITE_KEY } from "./vjKeys";

/** Set list writes (contract 6.2 "Set lists", keys 9.3, sequences contract
 *  4). Every refusal reaches the caller untouched, so `vjErrorKeyOf` and
 *  `vjErrorValuesOf` name its reason. */

/** A PATCH: the set list and at least one of name, Loop and default length. */
export type UpdateVjSetlistVariables = {
  setlistId: string;
} & UpdateVjSetlistBody;
/** A whole-list write: each entry with an `id` keeps that stored step. */
export type SetVjSetlistItemsVariables = {
  setlistId: string;
  items: VjSetlistItemInput[];
};

/** The PATCH body with only the fields the caller set, so an absent field
 *  stays out of the request. */
export function updateBodyOf(
  variables: UpdateVjSetlistVariables,
): UpdateVjSetlistBody {
  const body: UpdateVjSetlistBody = {};
  if (variables.name !== undefined) body.name = variables.name;
  if (variables.isLooping !== undefined) body.isLooping = variables.isLooping;
  if (variables.stepDuration !== undefined) {
    body.stepDuration = variables.stepDuration;
  }
  return body;
}

/** Marks the clip list and every pack's clip list stale: each clip's
 *  `setlistItemCount` moves with set list steps, and a VJ_CLIP_NOT_FOUND step
 *  refusal means a clip is gone. */
function useInvalidateVjClips(): () => void {
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();
  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: vjKeys.clips(demoMode) });
    void queryClient.invalidateQueries({ queryKey: vjKeys.packClipsRoot });
  }, [queryClient, demoMode]);
}

/** The refusals of a step write that the cache writer's missing check does
 *  not cover: a missing clip reads clips and set lists again, a step id no
 *  longer stored reads set lists again. */
function useInvalidateOnMissingStep(): (cause: unknown) => void {
  const cache = useVjShowCacheWriter();
  const invalidateClips = useInvalidateVjClips();
  return useCallback(
    (cause: unknown) => {
      cache.invalidateOnMissing(cause);
      const reason = vjReasonOf(cause);
      if (reason === "VJ_CLIP_NOT_FOUND") {
        invalidateClips();
        cache.invalidateSetlists();
      }
      if (reason === "VJ_SETLIST_ITEM_NOT_FOUND") {
        cache.invalidateSetlists();
      }
    },
    [cache, invalidateClips],
  );
}

function useCreateVjSetlist(): UseMutationResult<
  VjSetlistDTO,
  Error,
  CreateVjSetlistBody
> {
  const { demoMode } = useDemoMode();
  const cache = useVjShowCacheWriter();
  const invalidateClips = useInvalidateVjClips();
  const invalidateOnMissingStep = useInvalidateOnMissingStep();
  return useDemoAwareMutation<VjSetlistDTO, Error, CreateVjSetlistBody>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async (body) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoCreateVjSetlist(body);
    },
    live: (body) => createVjSetlist(body),
    onSuccess: (createdSetlist) => {
      cache.putSetlist(createdSetlist);
      cache.invalidateSetlists();
      // Scenes and clips named in the new set list count one more item each.
      if (createdSetlist.items.some((item) => item.kind === "scene")) {
        cache.invalidateScenes();
      }
      if (createdSetlist.items.some((item) => item.kind === "clip")) {
        invalidateClips();
      }
    },
    onError: (cause) => {
      invalidateOnMissingStep(cause);
    },
  });
}

/** PATCH: name, Loop and default length in one write (sequences contract
 *  4.2). The answer is the whole set list. */
function useUpdateVjSetlist(): UseMutationResult<
  VjSetlistDTO,
  Error,
  UpdateVjSetlistVariables
> {
  const { demoMode } = useDemoMode();
  const cache = useVjShowCacheWriter();
  return useDemoAwareMutation<VjSetlistDTO, Error, UpdateVjSetlistVariables>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async (variables) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoUpdateVjSetlist(
        variables.setlistId,
        updateBodyOf(variables),
      );
    },
    live: (variables) =>
      updateVjSetlist(variables.setlistId, updateBodyOf(variables)),
    onSuccess: (updatedSetlist) => {
      cache.putSetlist(updatedSetlist);
    },
    onError: (cause) => {
      cache.invalidateOnMissing(cause);
    },
  });
}

function useReorderVjSetlists(): UseMutationResult<
  VjSetlistDTO[],
  Error,
  { setlistIds: string[] }
> {
  const { demoMode } = useDemoMode();
  const cache = useVjShowCacheWriter();
  return useDemoAwareMutation<VjSetlistDTO[], Error, { setlistIds: string[] }>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async ({ setlistIds }) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoReorderVjSetlists({ setlistIds }).items;
    },
    live: async ({ setlistIds }) =>
      (await reorderVjSetlists({ setlistIds })).items,
    onSuccess: (setlists) => {
      cache.setSetlists(setlists);
    },
    onError: (cause) => {
      // A mismatch means another tab added or removed a set list: read the
      // list again so the next drag starts from the server's order.
      if (vjReasonOf(cause) === "VJ_SETLIST_REORDER_MISMATCH") {
        cache.invalidateSetlists();
      }
      cache.invalidateOnMissing(cause);
    },
  });
}

function useSetVjSetlistItems(): UseMutationResult<
  VjSetlistDTO,
  Error,
  SetVjSetlistItemsVariables
> {
  const { demoMode } = useDemoMode();
  const cache = useVjShowCacheWriter();
  const invalidateClips = useInvalidateVjClips();
  const invalidateOnMissingStep = useInvalidateOnMissingStep();
  return useDemoAwareMutation<VjSetlistDTO, Error, SetVjSetlistItemsVariables>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async ({ setlistId, items }) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoSetVjSetlistItems(setlistId, { items });
    },
    live: ({ setlistId, items }) => setVjSetlistItems(setlistId, { items }),
    onSuccess: (savedSetlist) => {
      // The answer is the whole set list; each scene's and clip's
      // `setlistItemCount` changes with it.
      cache.putSetlist(savedSetlist);
      cache.invalidateScenes();
      invalidateClips();
    },
    onError: (cause) => {
      invalidateOnMissingStep(cause);
    },
  });
}

function useDeleteVjSetlist(): UseMutationResult<
  VjSetlistDeletedDTO,
  Error,
  { setlistId: string }
> {
  const { demoMode } = useDemoMode();
  const cache = useVjShowCacheWriter();
  const invalidateClips = useInvalidateVjClips();
  return useDemoAwareMutation<
    VjSetlistDeletedDTO,
    Error,
    { setlistId: string }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async ({ setlistId }) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoDeleteVjSetlist(setlistId);
    },
    live: ({ setlistId }) => deleteVjSetlist(setlistId),
    onSuccess: (answer) => {
      // Its steps go with it, so each scene and clip it named counts one less.
      cache.dropSetlist(answer.deletedSetlistId);
      cache.invalidateScenes();
      invalidateClips();
    },
    onError: (cause) => {
      cache.invalidateOnMissing(cause);
    },
  });
}

/** Create, update (name, Loop, default length), reorder, write the steps of
 *  and delete set lists. Every steps save sends the full step list with the
 *  kept item ids (`PUT /setlists/:id/items`). */
export function useVjSetlistMutations(): {
  createSetlist: UseMutationResult<VjSetlistDTO, Error, CreateVjSetlistBody>;
  updateSetlist: UseMutationResult<
    VjSetlistDTO,
    Error,
    UpdateVjSetlistVariables
  >;
  reorderSetlists: UseMutationResult<
    VjSetlistDTO[],
    Error,
    { setlistIds: string[] }
  >;
  setSetlistItems: UseMutationResult<
    VjSetlistDTO,
    Error,
    SetVjSetlistItemsVariables
  >;
  deleteSetlist: UseMutationResult<
    VjSetlistDeletedDTO,
    Error,
    { setlistId: string }
  >;
} {
  const createSetlist = useCreateVjSetlist();
  const updateSetlist = useUpdateVjSetlist();
  const reorderSetlists = useReorderVjSetlists();
  const setSetlistItems = useSetVjSetlistItems();
  const deleteSetlist = useDeleteVjSetlist();
  return {
    createSetlist,
    updateSetlist,
    reorderSetlists,
    setSetlistItems,
    deleteSetlist,
  };
}
