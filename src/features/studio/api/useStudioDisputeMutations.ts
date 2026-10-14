import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { toReleaseView, type StudioReleaseView } from "./studio.adapters";
import { createStudioReleaseDispute } from "./studioDisputes.api";
import { studioKeys } from "./studioQueryKeys";
import { storeRelease } from "./useStudioReleaseMutations";

/** The form shows the refusal itself. */
const SILENT = { silentError: true } as const;

/** Files the owner's dispute. The answer is the whole owner release, which
 *  replaces the cached one (dispute open, canDispute false) and refreshes
 *  the lists that show it. A refusal in live re-reads the release, whose
 *  state (an open dispute, the cap) is what the refusal was about. */
export function useFileStudioDispute() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    StudioReleaseView,
    Error,
    { releaseId: string; note: string }
  >({
    meta: SILENT,
    mutationFn: async ({ releaseId, note }) => {
      if (!demoMode)
        return toReleaseView(
          await createStudioReleaseDispute(releaseId, { note }),
        );
      const cached = queryClient.getQueryData<StudioReleaseView>(
        studioKeys.release(demoMode, releaseId),
      );
      if (!cached) throw new Error(`Studio release ${releaseId} is not loaded`);
      return (await import("./studioDemoDisputes")).demoFileDispute(
        cached,
        note,
      );
    },
    onSuccess: (release) => storeRelease(queryClient, demoMode, release),
    onError: (_error, { releaseId }) => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: studioKeys.release(demoMode, releaseId),
      });
    },
  });
}
