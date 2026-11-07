import {
  type QueryClient,
  type UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "../../admin/api/demoAwareMutation";
import type {
  UpdateVjClipBody,
  VjClipDTO,
  VjClipDeletedDTO,
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

/** Only the properties the caller set, so an absent one is left as it is.
 *  A null loop point is kept: null means "whole clip". */
export function vjClipPatchOf(
  variables: { clipId: string } & UpdateVjClipBody,
): UpdateVjClipBody {
  const patch: UpdateVjClipBody = {};
  if (variables.title !== undefined) patch.title = variables.title;
  if (variables.fitMode !== undefined) patch.fitMode = variables.fitMode;
  if (variables.isFavorite !== undefined) {
    patch.isFavorite = variables.isFavorite;
  }
  if (variables.defaultSpeed !== undefined) {
    patch.defaultSpeed = variables.defaultSpeed;
  }
  if (variables.loopInMs !== undefined) patch.loopInMs = variables.loopInMs;
  if (variables.loopOutMs !== undefined) patch.loopOutMs = variables.loopOutMs;
  if (variables.loopMode !== undefined) patch.loopMode = variables.loopMode;
  return patch;
}

/** Rewrites one clip in the library list and in every cached pack clip list,
 *  so a card shows the change wherever the clip sits. Shared with the
 *  favorite write. */
export function patchVjClipCaches(
  queryClient: QueryClient,
  isDemoMode: boolean,
  clipId: string,
  patchClip: (clip: VjClipDTO) => VjClipDTO,
): void {
  const patchItem = (clip: VjClipDTO): VjClipDTO =>
    clip.id === clipId ? patchClip(clip) : clip;
  queryClient.setQueryData<VjClipDTO[]>(vjKeys.clips(isDemoMode), (clips) =>
    clips?.map(patchItem),
  );
  queryClient.setQueriesData<VjPackClipsDTO>(
    { queryKey: vjKeys.packClipsRoot },
    (answer) => answer && { ...answer, items: answer.items.map(patchItem) },
  );
}

export function useUpdateVjClip(): UseMutationResult<
  VjClipDTO,
  Error,
  { clipId: string } & UpdateVjClipBody
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const cache = useVjCacheWriter();
  return useDemoAwareMutation<
    VjClipDTO,
    Error,
    { clipId: string } & UpdateVjClipBody
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async (variables) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoUpdateVjClip(variables.clipId, vjClipPatchOf(variables));
    },
    live: (variables) =>
      updateVjClip(variables.clipId, vjClipPatchOf(variables)),
    onSuccess: (updated) => {
      patchVjClipCaches(queryClient, demoMode, updated.id, () => updated);
      // The patch shows the answer at once; the pack lists still read again,
      // the v1 settle for anything a single clip answer leaves out.
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
