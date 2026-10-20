import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { StudioReleaseView, StudioTrackView } from "./studio.adapters";
import { studioKeys } from "./studioQueryKeys";
import { counterStudioClaim } from "./studioSafety.api";
import {
  toOwnerClaimView,
  type StudioOwnerClaimView,
} from "./studioSafetyFields";

const SILENT = { silentError: true } as const;

function withClaim(
  claims: StudioOwnerClaimView[] | undefined,
  updated: StudioOwnerClaimView,
): StudioOwnerClaimView[] | undefined {
  return claims?.map((claim) => (claim.id === updated.id ? updated : claim));
}

/** The owner's one counter-notice. The panel sits on the release and the
 *  track page, so the answer patches the claim in both caches. */
export function useCounterStudioClaim() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    StudioOwnerClaimView,
    Error,
    { claim: StudioOwnerClaimView; releaseId: string; note: string }
  >({
    meta: SILENT,
    mutationFn: async ({ claim, note }) =>
      toOwnerClaimView(
        demoMode
          ? (await import("./studioDemoSafety")).demoCounterClaim(
              claim.id,
              note,
            )
          : await counterStudioClaim(claim.id, { note, goodFaith: true }),
      ),
    onSuccess: (updated, { releaseId }) => {
      queryClient.setQueryData<StudioReleaseView>(
        studioKeys.release(demoMode, releaseId),
        (release) =>
          release
            ? { ...release, claims: withClaim(release.claims, updated) }
            : release,
      );
      queryClient.setQueryData<StudioTrackView>(
        studioKeys.track(demoMode, updated.trackId),
        (track) =>
          track
            ? { ...track, claims: withClaim(track.claims, updated) }
            : track,
      );
    },
    // A refusal means the claim moved on (decided, or a counter already
    // sent): both pages read again.
    onError: (_error, { releaseId, claim }) => {
      void queryClient.invalidateQueries({
        queryKey: studioKeys.release(demoMode, releaseId),
      });
      void queryClient.invalidateQueries({
        queryKey: studioKeys.track(demoMode, claim.trackId),
      });
    },
  });
}
