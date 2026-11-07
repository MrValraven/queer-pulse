import { type UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "../../admin/api/demoAwareMutation";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import { updateVjClip } from "./vj.api";
import { VJ_WRITE_KEY, vjKeys } from "./vjKeys";
import { patchVjClipCaches } from "./useVjClipMutations";
import { useVjCacheWriter } from "./useVjPackMutations";

/**
 * Stars or unstars a clip. The star flips in every cache at once; a refusal
 * flips back only that clip's star, and only while it still shows the refused
 * value, so a rename or a newer star made meanwhile stays. It rejects with the
 * server's error, so the caller's toast can name the reason.
 */
export function useVjClipFavorite(): UseMutationResult<
  VjClipDTO,
  Error,
  { clipId: string; isFavorite: boolean }
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const cache = useVjCacheWriter();
  return useDemoAwareMutation<
    VjClipDTO,
    Error,
    { clipId: string; isFavorite: boolean }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async ({ clipId, isFavorite }) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoUpdateVjClip(clipId, { isFavorite });
    },
    live: ({ clipId, isFavorite }) => updateVjClip(clipId, { isFavorite }),
    onMutate: async ({ clipId, isFavorite }) => {
      // A read on its way would land over the flipped star.
      await Promise.all([
        queryClient.cancelQueries({ queryKey: vjKeys.clips(demoMode) }),
        queryClient.cancelQueries({ queryKey: vjKeys.packClipsRoot }),
      ]);
      patchVjClipCaches(queryClient, demoMode, clipId, (clip) => ({
        ...clip,
        isFavorite,
      }));
    },
    onSuccess: (updated) => {
      patchVjClipCaches(queryClient, demoMode, updated.id, () => updated);
    },
    onError: (cause, { clipId, isFavorite }) => {
      patchVjClipCaches(queryClient, demoMode, clipId, (clip) =>
        clip.isFavorite === isFavorite
          ? { ...clip, isFavorite: !isFavorite }
          : clip,
      );
      cache.invalidateOnMissing(cause);
    },
  });
}
