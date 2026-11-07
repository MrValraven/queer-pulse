import type { UseMutationResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "../../admin/api/demoAwareMutation";
import type {
  CreateVjSetlistBody,
  VjSetlistDTO,
  VjSetlistDeletedDTO,
} from "../../../shared/contracts/vj";
import { vjReasonOf } from "../vjErrors";
import { useVjShowCacheWriter } from "./useVjShowCache";
import {
  createVjSetlist,
  deleteVjSetlist,
  renameVjSetlist,
  reorderVjSetlists,
  setVjSetlistItems,
} from "./vj.api";
import { VJ_WRITE_KEY } from "./vjKeys";

/** Set list writes (contract 6.2 "Set lists", keys 9.3). Every refusal reaches
 *  the caller untouched, so `vjErrorKeyOf` and `vjErrorValuesOf` name its
 *  reason. */

type RenameVjSetlistVariables = { setlistId: string; name: string };
type SetVjSetlistItemsVariables = { setlistId: string; sceneIds: string[] };

function useCreateVjSetlist(): UseMutationResult<
  VjSetlistDTO,
  Error,
  CreateVjSetlistBody
> {
  const { demoMode } = useDemoMode();
  const cache = useVjShowCacheWriter();
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
      // Scenes named in the new set list count one more item each.
      if (createdSetlist.items.length > 0) cache.invalidateScenes();
    },
    onError: (cause) => {
      cache.invalidateOnMissing(cause);
    },
  });
}

function useRenameVjSetlist(): UseMutationResult<
  VjSetlistDTO,
  Error,
  RenameVjSetlistVariables
> {
  const { demoMode } = useDemoMode();
  const cache = useVjShowCacheWriter();
  return useDemoAwareMutation<VjSetlistDTO, Error, RenameVjSetlistVariables>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async ({ setlistId, name }) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoRenameVjSetlist(setlistId, { name });
    },
    live: ({ setlistId, name }) => renameVjSetlist(setlistId, { name }),
    onSuccess: (renamedSetlist) => {
      cache.putSetlist(renamedSetlist);
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
  return useDemoAwareMutation<VjSetlistDTO, Error, SetVjSetlistItemsVariables>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async ({ setlistId, sceneIds }) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoSetVjSetlistItems(setlistId, { sceneIds });
    },
    live: ({ setlistId, sceneIds }) =>
      setVjSetlistItems(setlistId, { sceneIds }),
    onSuccess: (savedSetlist) => {
      // The answer is the whole set list; each scene's `setlistItemCount`
      // changes with it.
      cache.putSetlist(savedSetlist);
      cache.invalidateScenes();
    },
    onError: (cause) => {
      cache.invalidateOnMissing(cause);
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
      // Its items go with it, so each scene it named counts one less.
      cache.dropSetlist(answer.deletedSetlistId);
      cache.invalidateScenes();
    },
    onError: (cause) => {
      cache.invalidateOnMissing(cause);
    },
  });
}

/** Create, rename, reorder, set the scenes of and delete set lists. Every
 *  items save sends the full scene list (`PUT /setlists/:id/items`). */
export function useVjSetlistMutations(): {
  createSetlist: UseMutationResult<VjSetlistDTO, Error, CreateVjSetlistBody>;
  renameSetlist: UseMutationResult<
    VjSetlistDTO,
    Error,
    RenameVjSetlistVariables
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
  const renameSetlist = useRenameVjSetlist();
  const reorderSetlists = useReorderVjSetlists();
  const setSetlistItems = useSetVjSetlistItems();
  const deleteSetlist = useDeleteVjSetlist();
  return {
    createSetlist,
    renameSetlist,
    reorderSetlists,
    setSetlistItems,
    deleteSetlist,
  };
}
