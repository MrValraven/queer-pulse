import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useStudioAccess } from "../api/useStudioAccess";
import { studioReleaseQueryOptions } from "../api/useStudioRelease";
import { useStudioPlayer, type StudioQueueItem } from "./studioPlayerContext";

/**
 * Whether the playing item belongs to a release the artist set to play
 * without gaps, so crossfade rests between its tracks. It reads the same
 * release cache the player fills on Play, so it is usually there already.
 * It holds only where the player can swap gaplessly: a music track of a
 * release with more than one playable track, outside a private preview,
 * while the browser plays (casting and plain mode play one track at a
 * time). Read only for display; playback decides each join on its own.
 */
export function useStudioIsPlayingGapless(
  item: StudioQueueItem | null,
): boolean {
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const { isPlainMode, remote } = useStudioPlayer();
  const isCasting = remote.isConnected;
  const shouldRead =
    item !== null &&
    item.releaseId !== "" &&
    item.isEpisode !== true &&
    !item.previewToken &&
    !isCasting &&
    !isPlainMode;
  const releaseId = item?.releaseId ?? "";
  const { data: release } = useQuery({
    ...studioReleaseQueryOptions(demoMode, releaseId),
    enabled: shouldRead && (demoMode || hasAccess),
  });
  if (!shouldRead || !release) return false;
  return (
    release.id === releaseId &&
    release.isGapless &&
    release.playableTrackCount > 1
  );
}
