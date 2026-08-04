import { useMutation } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { readDemoRoadmap, writeDemoRoadmap } from "../adminRoadmap.data";
import {
  demoCreateIdea,
  demoDeclineIdea,
  demoDeleteIdea,
  demoMergeIdea,
  demoPromoteIdea,
  demoUpdateIdea,
} from "../adminRoadmapDemo";
import {
  createRoadmapIdea,
  declineIdea as declineIdeaApi,
  deleteRoadmapIdea,
  mergeIdea as mergeIdeaApi,
  promoteIdea as promoteIdeaApi,
  updateRoadmapIdea,
  type RoadmapDeclineReason,
  type RoadmapIdeaUpdateBody,
} from "./roadmapAdmin.api";
import { useInvalidateAdminRoadmap } from "./useInvalidateAdminRoadmap";

// Idea-scoped admin roadmap actions (Ideas / Not-building views) — split out
// of `useAdminRoadmapMutations` purely for file/function size, same dual-mode
// + `meta: { silentError: true }` convention as
// `useAdminRoadmapItemMutations` (see that file's header doc).

export interface UpdateRoadmapIdeaVars {
  id: string;
  body: RoadmapIdeaUpdateBody;
}

export interface MergeIdeaVars {
  id: string;
  intoItemId: string;
}

export interface DeclineIdeaVars {
  id: string;
  reason: RoadmapDeclineReason;
  note: string;
}

export function useAdminRoadmapIdeaMutations() {
  const { demoMode } = useDemoMode();
  const invalidate = useInvalidateAdminRoadmap();

  const createIdeaMutation = useMutation({
    mutationFn: async (text: string) => {
      if (demoMode) {
        const { state, result } = demoCreateIdea(readDemoRoadmap(), text);
        writeDemoRoadmap(state);
        return result;
      }
      return createRoadmapIdea(text);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const updateIdeaMutation = useMutation({
    mutationFn: async ({ id, body }: UpdateRoadmapIdeaVars) => {
      if (demoMode) {
        const { state, result } = demoUpdateIdea(readDemoRoadmap(), id, body);
        writeDemoRoadmap(state);
        return result;
      }
      return updateRoadmapIdea(id, body);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const deleteIdeaMutation = useMutation({
    mutationFn: async (id: string) => {
      if (demoMode) {
        const { state } = demoDeleteIdea(readDemoRoadmap(), id);
        writeDemoRoadmap(state);
        return;
      }
      return deleteRoadmapIdea(id);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const promoteIdeaMutation = useMutation({
    mutationFn: async (id: string) => {
      if (demoMode) {
        const { state, result } = demoPromoteIdea(readDemoRoadmap(), id);
        writeDemoRoadmap(state);
        return result;
      }
      return promoteIdeaApi(id);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const mergeIdeaMutation = useMutation({
    mutationFn: async ({ id, intoItemId }: MergeIdeaVars) => {
      if (demoMode) {
        const { state, result } = demoMergeIdea(readDemoRoadmap(), id, intoItemId);
        writeDemoRoadmap(state);
        return result;
      }
      return mergeIdeaApi(id, intoItemId);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  const declineIdeaMutation = useMutation({
    mutationFn: async ({ id, reason, note }: DeclineIdeaVars) => {
      if (demoMode) {
        const { state, result } = demoDeclineIdea(readDemoRoadmap(), id, reason, note);
        writeDemoRoadmap(state);
        return result;
      }
      return declineIdeaApi(id, reason, note);
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  // Reopening a declined idea is a plain `status: 'published'` patch — the
  // reducer/endpoint behind `updateIdea` already clears `declineReason`/
  // `declineNote` when that happens (see `demoUpdateIdea` and
  // `RoadmapAdminService.updateIdea`'s doc), so this is intentionally the
  // same mutation, not a distinct one.
  const reopenIdeaMutation = useMutation({
    mutationFn: async (id: string) => {
      if (demoMode) {
        const { state, result } = demoUpdateIdea(readDemoRoadmap(), id, {
          status: "published",
        });
        writeDemoRoadmap(state);
        return result;
      }
      return updateRoadmapIdea(id, { status: "published" });
    },
    onSuccess: invalidate,
    meta: { silentError: true },
  });

  return {
    createIdea: createIdeaMutation.mutate,
    updateIdea: updateIdeaMutation.mutate,
    deleteIdea: deleteIdeaMutation.mutate,
    promoteIdea: promoteIdeaMutation.mutate,
    mergeIdea: mergeIdeaMutation.mutate,
    declineIdea: declineIdeaMutation.mutate,
    reopenIdea: reopenIdeaMutation.mutate,
    pending:
      createIdeaMutation.isPending ||
      updateIdeaMutation.isPending ||
      deleteIdeaMutation.isPending ||
      promoteIdeaMutation.isPending ||
      mergeIdeaMutation.isPending ||
      declineIdeaMutation.isPending ||
      reopenIdeaMutation.isPending,
  };
}
