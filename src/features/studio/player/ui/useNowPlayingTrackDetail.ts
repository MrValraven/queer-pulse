import type { StudioTrackView } from "../../api/studio.adapters";
import { useStudioAccess } from "../../api/useStudioAccess";
import { useStudioTrack } from "../../api/useStudioTrack";

/** The track's detail, for the plain lyrics and the credits. Only a public
 *  track mounts this: a private preview's detail needs its token, so a
 *  preview never asks. Loading ends with any answer, including a missing
 *  track, a failed read or a member without Studio access (whose read never
 *  starts). */
export function useNowPlayingTrackDetail(trackId: string): {
  track: StudioTrackView | null;
  isLoading: boolean;
} {
  const { track, loadState } = useStudioTrack(trackId);
  const { status } = useStudioAccess();
  return { track, isLoading: loadState.isLoading && status !== "denied" };
}
