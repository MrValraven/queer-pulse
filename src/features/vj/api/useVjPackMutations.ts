import {
  useIsMutating,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "../../admin/api/demoAwareMutation";
import type {
  VjPackClipsDTO,
  VjPackDTO,
  VjPackDeletedDTO,
} from "../../../shared/contracts/vj";
import { vjReasonOf } from "../vjErrors";
import {
  addVjPackClip,
  createVjPack,
  deleteVjPack,
  removeVjPackClip,
  renameVjPack,
  reorderVjPackClips,
  reorderVjPacks,
} from "./vj.api";
import { VJ_WRITE_KEY, vjKeys } from "./vjKeys";

/** Where a write's answer lands in the cache, and what it leaves for a read to
 *  settle. Shared by the pack and the clip writes. */
export interface VjCacheWriter {
  setPacks: (packs: VjPackDTO[]) => void;
  /** Puts a just-created pack last in the cached list, so the selection can
   *  land on it before the read settles. */
  appendPack: (pack: VjPackDTO) => void;
  setPackClips: (answer: VjPackClipsDTO) => void;
  invalidatePacks: () => void;
  invalidateClips: () => void;
  /** Every pack's clip list, except the one the answer just set. */
  invalidatePackClipsExcept: (packId: string | null) => void;
  invalidateRoot: () => void;
  /** A refusal that says the pack or the clip is gone reads the whole library
   *  again, so the stale row leaves the screen. */
  invalidateOnMissing: (cause: unknown) => void;
}

export function useVjCacheWriter(): VjCacheWriter {
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();
  return useMemo<VjCacheWriter>(
    () => ({
      setPacks: (packs) => {
        queryClient.setQueryData(vjKeys.packs(demoMode), packs);
      },
      appendPack: (pack) => {
        queryClient.setQueryData<VjPackDTO[]>(
          vjKeys.packs(demoMode),
          (packs) =>
            packs && !packs.some((cached) => cached.id === pack.id)
              ? [...packs, pack]
              : packs,
        );
      },
      setPackClips: (answer) => {
        queryClient.setQueryData(
          vjKeys.packClips(answer.pack.id, demoMode),
          answer,
        );
      },
      invalidatePacks: () => {
        void queryClient.invalidateQueries({
          queryKey: vjKeys.packs(demoMode),
        });
      },
      invalidateClips: () => {
        void queryClient.invalidateQueries({
          queryKey: vjKeys.clips(demoMode),
        });
      },
      invalidatePackClipsExcept: (packId) => {
        void queryClient.invalidateQueries({
          queryKey: vjKeys.packClipsRoot,
          predicate: (query) => packId === null || query.queryKey[3] !== packId,
        });
      },
      invalidateRoot: () => {
        void queryClient.invalidateQueries({ queryKey: vjKeys.root });
      },
      invalidateOnMissing: (cause) => {
        const reason = vjReasonOf(cause);
        if (reason === "VJ_PACK_NOT_FOUND" || reason === "VJ_CLIP_NOT_FOUND") {
          void queryClient.invalidateQueries({ queryKey: vjKeys.root });
        }
      },
    }),
    [queryClient, demoMode],
  );
}

/** True while any library write is in flight. */
export function useVjIsWriting(): boolean {
  return useIsMutating({ mutationKey: VJ_WRITE_KEY }) > 0;
}

export function useCreateVjPack(): UseMutationResult<
  VjPackDTO,
  Error,
  { name: string }
> {
  const { demoMode } = useDemoMode();
  const cache = useVjCacheWriter();
  return useDemoAwareMutation<VjPackDTO, Error, { name: string }>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async ({ name }) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoCreateVjPack({ name });
    },
    live: ({ name }) => createVjPack({ name }),
    onSuccess: (createdPack) => {
      cache.appendPack(createdPack);
      cache.invalidatePacks();
    },
    onError: (cause) => {
      cache.invalidateOnMissing(cause);
    },
  });
}

export function useRenameVjPack(): UseMutationResult<
  VjPackDTO,
  Error,
  { packId: string; name: string }
> {
  const { demoMode } = useDemoMode();
  const cache = useVjCacheWriter();
  return useDemoAwareMutation<
    VjPackDTO,
    Error,
    { packId: string; name: string }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async ({ packId, name }) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoRenameVjPack(packId, { name });
    },
    live: ({ packId, name }) => renameVjPack(packId, { name }),
    onSuccess: () => {
      cache.invalidatePacks();
      cache.invalidatePackClipsExcept(null);
    },
    onError: (cause) => {
      cache.invalidateOnMissing(cause);
    },
  });
}

export function useReorderVjPacks(): UseMutationResult<
  VjPackDTO[],
  Error,
  { packIds: string[] }
> {
  const { demoMode } = useDemoMode();
  const cache = useVjCacheWriter();
  return useDemoAwareMutation<VjPackDTO[], Error, { packIds: string[] }>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async ({ packIds }) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoReorderVjPacks({ packIds }).items;
    },
    live: async ({ packIds }) => (await reorderVjPacks({ packIds })).items,
    onSuccess: (packs) => {
      cache.setPacks(packs);
      cache.invalidatePackClipsExcept(null);
      cache.invalidateClips();
    },
    onError: (cause) => {
      cache.invalidateOnMissing(cause);
    },
  });
}

export function useDeleteVjPack(): UseMutationResult<
  VjPackDeletedDTO,
  Error,
  { packId: string }
> {
  const { demoMode } = useDemoMode();
  const cache = useVjCacheWriter();
  return useDemoAwareMutation<VjPackDeletedDTO, Error, { packId: string }>({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async ({ packId }) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoDeleteVjPack(packId);
    },
    live: ({ packId }) => deleteVjPack(packId),
    onSuccess: () => {
      cache.invalidateRoot();
    },
    onError: (cause) => {
      cache.invalidateOnMissing(cause);
    },
  });
}

/** What a membership write leaves behind: the answer is the pack's clip list,
 *  so the pack's own cache is set and everything that counts or lists
 *  membership reads again. */
function settleMembership(cache: VjCacheWriter, answer: VjPackClipsDTO): void {
  cache.setPackClips(answer);
  cache.invalidatePacks();
  cache.invalidatePackClipsExcept(answer.pack.id);
  cache.invalidateClips();
}

export function useAddVjPackClip(): UseMutationResult<
  VjPackClipsDTO,
  Error,
  { packId: string; clipId: string }
> {
  const { demoMode } = useDemoMode();
  const cache = useVjCacheWriter();
  return useDemoAwareMutation<
    VjPackClipsDTO,
    Error,
    { packId: string; clipId: string }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async ({ packId, clipId }) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoAddVjPackClip(packId, { clipId });
    },
    live: ({ packId, clipId }) => addVjPackClip(packId, { clipId }),
    onSuccess: (answer) => {
      settleMembership(cache, answer);
    },
    onError: (cause) => {
      cache.invalidateOnMissing(cause);
    },
  });
}

export function useRemoveVjPackClip(): UseMutationResult<
  VjPackClipsDTO,
  Error,
  { packId: string; clipId: string }
> {
  const { demoMode } = useDemoMode();
  const cache = useVjCacheWriter();
  return useDemoAwareMutation<
    VjPackClipsDTO,
    Error,
    { packId: string; clipId: string }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async ({ packId, clipId }) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoRemoveVjPackClip(packId, clipId);
    },
    live: ({ packId, clipId }) => removeVjPackClip(packId, clipId),
    onSuccess: (answer) => {
      settleMembership(cache, answer);
    },
    onError: (cause) => {
      cache.invalidateOnMissing(cause);
    },
  });
}

export function useReorderVjPackClips(): UseMutationResult<
  VjPackClipsDTO,
  Error,
  { packId: string; clipIds: string[] }
> {
  const { demoMode } = useDemoMode();
  const cache = useVjCacheWriter();
  return useDemoAwareMutation<
    VjPackClipsDTO,
    Error,
    { packId: string; clipIds: string[] }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async ({ packId, clipIds }) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoReorderVjPackClips(packId, { clipIds });
    },
    live: ({ packId, clipIds }) => reorderVjPackClips(packId, { clipIds }),
    onSuccess: (answer) => {
      // The pack's own list is the answer. The pack row's cover is the first
      // clip's thumbnail, so the pack list reads again; membership did not
      // change, so the clip list stays as it is.
      cache.setPackClips(answer);
      cache.invalidatePacks();
    },
    onError: (cause) => {
      cache.invalidateOnMissing(cause);
    },
  });
}
