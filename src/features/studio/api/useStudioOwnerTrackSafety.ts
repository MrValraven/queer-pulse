import type { StudioReleaseView } from "./studio.adapters";
import type { StudioContentWarningId } from "./studioSafety.types";
import { useStudioRelease } from "./useStudioRelease";

/** What the editors need about one of the owner's tracks: the artist's own
 *  warnings, our team's locked ones and our team's explicit mark. They ride
 *  on the owner rows of the release (contract). */
export interface StudioOwnerTrackSafety {
  artistContentWarnings: StudioContentWarningId[];
  staffContentWarnings: StudioContentWarningId[];
  isExplicitLocked: boolean;
}

export function ownerTrackSafetyOf(
  release: StudioReleaseView | null,
  trackId: string,
): StudioOwnerTrackSafety {
  const row = release?.ownerTracks?.find(
    (candidate) => candidate.id === trackId,
  );
  return {
    artistContentWarnings: row?.artistContentWarnings ?? [],
    staffContentWarnings: row?.staffContentWarnings ?? [],
    isExplicitLocked: row?.isExplicitLocked ?? false,
  };
}

/** The owner row of a track, read from the release the editor sits on. */
export function useStudioOwnerTrackSafety(
  releaseId: string,
  trackId: string,
): StudioOwnerTrackSafety {
  const { release } = useStudioRelease(releaseId, {
    shouldUseDemoDefault: false,
  });
  return ownerTrackSafetyOf(release, trackId);
}
