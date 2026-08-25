import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { readDemoRoadmap, writeDemoRoadmap } from "../adminRoadmap.data";
import {
  demoArchiveItem,
  demoBulkItems,
  demoCreateItem,
  demoDeleteItem,
  demoDuplicateItem,
  demoNotifyVoters,
  demoUpdateDeps,
  demoUpdateItem,
} from "../adminRoadmapDemo";
import {
  archiveRoadmapItem,
  bulkItems as bulkItemsApi,
  createRoadmapItem,
  deleteRoadmapItem,
  duplicateRoadmapItem,
  notifyVoters as notifyVotersApi,
  updateItemDeps as updateItemDepsApi,
  updateRoadmapItem,
  type RoadmapBulkItemsBody,
  type RoadmapItemUpdateBody,
  type RoadmapItemWriteBody,
  type RoadmapUpdateDepsBody,
} from "./roadmapAdmin.api";
import { useInvalidateAdminRoadmap } from "./useInvalidateAdminRoadmap";

// Item-scoped admin roadmap actions (Board/Timeline/Archive views) — split
// out of `useAdminRoadmapMutations` purely for file/function size (8
// mutations is already ~180 lines on its own). Every mutation is dual-mode:
// demo runs the matching pure reducer from the colocated
// `adminRoadmapDemo.ts` (which throws a plain `Error` on a guard failure —
// slip reason missing, safety gate, not-found target — instead of writing)
// against the current store and persists the result via `writeDemoRoadmap`;
// live calls the matching `/admin/roadmap/items/*` endpoint. `meta:
// { silentError: true }` on every one so a failed write doesn't
// double-toast on top of the caller's own per-call `onError`.

export interface UpdateRoadmapItemVars {
  id: string;
  body: RoadmapItemUpdateBody;
}

export interface UpdateItemDepsVars {
  id: string;
  body: RoadmapUpdateDepsBody;
}

export interface ArchiveRoadmapItemVars {
  id: string;
  archived: boolean;
}

export interface NotifyVotersVars {
  id: string;
  message: string;
}

export function useAdminRoadmapItemMutations() {
  const { demoMode } = useDemoMode();
  const invalidate = useInvalidateAdminRoadmap();

  const createItemMutation = useMutation({
    mutationFn: async (body: RoadmapItemWriteBody) => {
      if (demoMode) {
        const { state, result } = demoCreateItem(readDemoRoadmap(), body);
        writeDemoRoadmap(state);
        return result;
      }
      return createRoadmapItem(body);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, body }: UpdateRoadmapItemVars) => {
      if (demoMode) {
        const { state, result } = demoUpdateItem(readDemoRoadmap(), id, body);
        writeDemoRoadmap(state);
        return result;
      }
      return updateRoadmapItem(id, body);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      if (demoMode) {
        const { state } = demoDeleteItem(readDemoRoadmap(), id);
        writeDemoRoadmap(state);
        return;
      }
      return deleteRoadmapItem(id);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const updateDepsMutation = useMutation({
    mutationFn: async ({ id, body }: UpdateItemDepsVars) => {
      if (demoMode) {
        const { state, result } = demoUpdateDeps(readDemoRoadmap(), id, body);
        writeDemoRoadmap(state);
        return result;
      }
      return updateItemDepsApi(id, body);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const duplicateItemMutation = useMutation({
    mutationFn: async (id: string) => {
      if (demoMode) {
        const { state, result } = demoDuplicateItem(readDemoRoadmap(), id);
        writeDemoRoadmap(state);
        return result;
      }
      return duplicateRoadmapItem(id);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const archiveItemMutation = useMutation({
    mutationFn: async ({ id, archived }: ArchiveRoadmapItemVars) => {
      if (demoMode) {
        const { state, result } = demoArchiveItem(
          readDemoRoadmap(),
          id,
          archived,
        );
        writeDemoRoadmap(state);
        return result;
      }
      return archiveRoadmapItem(id, archived);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const notifyVotersMutation = useMutation({
    mutationFn: async ({ id, message }: NotifyVotersVars) => {
      if (demoMode) {
        const { state, result } = demoNotifyVoters(readDemoRoadmap(), id);
        writeDemoRoadmap(state);
        return result;
      }
      return notifyVotersApi(id, message);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const bulkItemsMutation = useMutation({
    mutationFn: async (body: RoadmapBulkItemsBody) => {
      if (demoMode) {
        const { state, result } = demoBulkItems(
          readDemoRoadmap(),
          body.ids,
          body.action,
          body.column,
        );
        writeDemoRoadmap(state);
        return result;
      }
      return bulkItemsApi(body);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  return {
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    updateDeps: updateDepsMutation.mutate,
    duplicateItem: duplicateItemMutation.mutate,
    archiveItem: archiveItemMutation.mutate,
    notifyVoters: notifyVotersMutation.mutate,
    bulkItems: bulkItemsMutation.mutate,
    pending:
      createItemMutation.isPending ||
      updateItemMutation.isPending ||
      deleteItemMutation.isPending ||
      updateDepsMutation.isPending ||
      duplicateItemMutation.isPending ||
      archiveItemMutation.isPending ||
      notifyVotersMutation.isPending ||
      bulkItemsMutation.isPending,
  };
}
