import { useCallback } from "react";
import type { StudioSearchTrackView } from "./api/studio.adapters";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { StudioTrackRow } from "./kit/StudioTrackRow";

/** A track hit on the shared Studio row: play it inside its release, or
 *  open its page. While "Hide explicit tracks" hides it, the row greys and
 *  offers no play (the list reads the setting once and passes it). A
 *  release named like its artist (a podcast) names itself once. */
export function StudioSearchTrackRow({
  track,
  index,
  shouldHideExplicit,
}: {
  track: StudioSearchTrackView;
  index?: number;
  shouldHideExplicit?: boolean;
}) {
  const { isCurrentTrack, status, togglePlay, playRelease } = useStudioPlayer();
  const isCurrent = isCurrentTrack(track.id);
  const isPlaying = isCurrent && status === "playing";
  const releaseId = track.release.id;
  const trackId = track.id;
  const handlePlay = useCallback(() => {
    if (isCurrent) togglePlay();
    else void playRelease(releaseId, trackId);
  }, [isCurrent, togglePlay, playRelease, releaseId, trackId]);
  return (
    <StudioTrackRow
      track={track}
      index={index}
      isCurrent={isCurrent}
      isPlaying={isPlaying}
      onPlay={handlePlay}
      showRelease={track.release.artist.name !== track.release.title}
      shouldHideExplicit={shouldHideExplicit}
      isDraggable
    />
  );
}
