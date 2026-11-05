import { type UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "../../admin/api/demoAwareMutation";
import type {
  VjClipDTO,
  VjClipDeletedDTO,
  VjFitMode,
  VjPackClipsDTO,
} from "../../../shared/contracts/vj";
import {
  addVjPackClip,
  deleteVjClip,
  removeVjPackClip,
  updateVjClip,
} from "./vj.api";
import { VJ_WRITE_KEY, vjKeys } from "./vjKeys";
import { useVjCacheWriter } from "./useVjPackMutations";

export function useMoveVjClip(): UseMutationResult<
  VjPackClipsDTO,
  Error,
  { clipId: string; fromPackId: string; toPackId: string }
> {
  const { demoMode } = useDemoMode();
  const cache = useVjCacheWriter();
  return useDemoAwareMutation<
    VjPackClipsDTO,
    Error,
    { clipId: string; fromPackId: string; toPackId: string }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    // The add runs first, so a refusal on it (already there, pack full, gone)
    // leaves the source pack untouched. The answer is the target's clip list.
    demoResult: async ({ clipId, fromPackId, toPackId }) => {
      const store = await import("../demo/vjDemoStore");
      const added = store.demoAddVjPackClip(toPackId, { clipId });
      store.demoRemoveVjPackClip(fromPackId, clipId);
      return added;
    },
    live: async ({ clipId, fromPackId, toPackId }) => {
      const added = await addVjPackClip(toPackId, { clipId });
      await removeVjPackClip(fromPackId, clipId);
      return added;
    },
    onSuccess: () => {
      // Both packs changed, so the whole library reads again.
      cache.invalidateRoot();
    },
    onError: () => {
      // A refused add changed nothing, but a remove that failed after the add
      // left the clip in both packs; reading everything again settles either.
      cache.invalidateRoot();
    },
  });
}

/** Only the properties the caller set, so an absent one is left as it is. */
function clipPatchOf(variables: { title?: string; fitMode?: VjFitMode }): {
  title?: string;
  fitMode?: VjFitMode;
} {
  const patch: { title?: string; fitMode?: VjFitMode } = {};
  if (variables.title !== undefined) patch.title = variables.title;
  if (variables.fitMode !== undefined) patch.fitMode = variables.fitMode;
  return patch;
}

export function useUpdateVjClip(): UseMutationResult<
  VjClipDTO,
  Error,
  { clipId: string; title?: string; fitMode?: VjFitMode }
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const cache = useVjCacheWriter();
  return useDemoAwareMutation<
    VjClipDTO,
    Error,
    { clipId: string; title?: string; fitMode?: VjFitMode }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async (variables) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoUpdateVjClip(variables.clipId, clipPatchOf(variables));
    },
    live: (variables) => updateVjClip(variables.clipId, clipPatchOf(variables)),
    onSuccess: (updated) => {
      queryClient.setQueryData<VjClipDTO[]>(vjKeys.clips(demoMode), (clips) =>
        clips?.map((clip) => (clip.id === updated.id ? updated : clip)),
      );
      // Pack lists carry the same clip, so they read again.
      cache.invalidatePackClipsExcept(null);
    },
    onError: (cause) => {
      cache.invalidateOnMissing(cause);
    },
  });
}

export function useDeleteVjClip(): UseMutationResult<
  VjClipDeletedDTO,
  Error,
  { clipId: string }
> {
  const { demoMode } = useDemoMode();
  const cache = useVjCacheWriter();
  return useDemoAwareMutation<VjClipDeletedDTO, Error, { clipId: string }>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async ({ clipId }) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoDeleteVjClip(clipId);
    },
    live: ({ clipId }) => deleteVjClip(clipId),
    onSuccess: () => {
      cache.invalidateRoot();
    },
    onError: (cause) => {
      cache.invalidateOnMissing(cause);
    },
  });
}
