import { useMemo } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioLikedTracksResult } from "./api/useStudioLikedTracks";
import {
  StudioPlayButton,
  type StudioPlayButtonSize,
} from "./kit/StudioPlayButton";
import { useStudioPlayer } from "./player/studioPlayerContext";
import type { StudioLikedPlayAll } from "./useStudioLikedPlayAll";

/** Play Liked songs, in the hero and in the sticky header, both driven by
 *  the page's one `playAll`: while the waiting pages are read it shows the
 *  loading ring and a press cancels ("Cancel loading", and the hero pill
 *  says Cancel); on the current set it pauses and resumes. */
export function StudioLikedPlayButton({
  liked,
  playAll,
  size = "hero",
}: {
  liked: StudioLikedTracksResult;
  playAll: StudioLikedPlayAll;
  size?: StudioPlayButtonSize;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const title = t("studio:liked.title");
  const { playableTracks } = liked;
  const isCurrent = useMemo(
    () => playableTracks.some((track) => player.isCurrentTrack(track.id)),
    [playableTracks, player],
  );
  const isPlaying = isCurrent && player.status === "playing";
  const isLoading = playAll.pendingMode === "play";
  const cancelWord = t("studio:playButton.cancel");
  return (
    <StudioPlayButton
      size={size}
      state={isLoading ? "loading" : isPlaying ? "playing" : "idle"}
      visibleLabel={isLoading ? cancelWord : undefined}
      alternateLabels={[cancelWord]}
      label={
        isLoading
          ? t("studio:liked.page.cancelLoadingAria")
          : t(
              isPlaying
                ? "studio:playlist.page.pauseAria"
                : "studio:playlist.page.playAria",
              { name: title },
            )
      }
      onToggle={() => {
        if (playAll.pendingMode !== null) playAll.cancel();
        else if (isCurrent) player.togglePlay();
        else playAll.start("play");
      }}
    />
  );
}
