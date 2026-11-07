import { type UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDemoAwareMutation } from "../../admin/api/demoAwareMutation";
import type { VjPackClipsDTO, VjPackDTO } from "../../../shared/contracts/vj";
import { vjReasonOf } from "../vjErrors";
import { setVjPackEvent } from "./vj.api";
import { VJ_WRITE_KEY, vjKeys } from "./vjKeys";
import { useVjCacheWriter } from "./useVjPackMutations";

/** Links a pack to an upcoming event, or unlinks it with `eventId: null`. The
 *  answer is the pack, which replaces the cached one; its event card reads
 *  again. */
export function useSetVjPackEvent(): UseMutationResult<
  VjPackDTO,
  Error,
  { packId: string; eventId: string | null }
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const cache = useVjCacheWriter();
  return useDemoAwareMutation<
    VjPackDTO,
    Error,
    { packId: string; eventId: string | null }
  >({
    demoMode,
    demoLatencyMs: 0,
    mutationKey: VJ_WRITE_KEY,
    meta: { silentError: true },
    demoResult: async ({ packId, eventId }) => {
      const store = await import("../demo/vjDemoStore");
      return store.demoSetVjPackEvent(packId, { eventId });
    },
    live: ({ packId, eventId }) => setVjPackEvent(packId, { eventId }),
    onSuccess: (updatedPack) => {
      queryClient.setQueryData<VjPackDTO[]>(vjKeys.packs(demoMode), (packs) =>
        packs?.map((pack) => (pack.id === updatedPack.id ? updatedPack : pack)),
      );
      // The pack's clip list carries the pack too, for its header.
      queryClient.setQueryData<VjPackClipsDTO>(
        vjKeys.packClips(updatedPack.id, demoMode),
        (answer) => answer && { ...answer, pack: updatedPack },
      );
      void queryClient.invalidateQueries({
        queryKey: vjKeys.packEvent(updatedPack.id, demoMode),
      });
    },
    onError: (cause) => {
      cache.invalidateOnMissing(cause);
      const reason = vjReasonOf(cause);
      // The event is gone or no longer linkable, so the picker's list is stale.
      if (
        reason === "VJ_EVENT_NOT_FOUND" ||
        reason === "VJ_EVENT_NOT_LINKABLE"
      ) {
        void queryClient.invalidateQueries({
          queryKey: vjKeys.upcomingEvents(demoMode),
        });
      }
    },
  });
}
