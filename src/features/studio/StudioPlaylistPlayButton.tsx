import { useMemo } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistView } from "./api/studio.adapters";
import {
  StudioPlayButton,
  type StudioPlayButtonSize,
} from "./kit/StudioPlayButton";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueFromTracks } from "./player/studioQueue";

/** Play a playlist from its first playable entry, in the hero and in the
 *  sticky header: pause and resume on the current set, and stay focusable
 *  with the reason when nothing in it can play. */
export function StudioPlaylistPlayButton({
  playlist,
  size = "hero",
}: {
  playlist: StudioPlaylistView;
  size?: StudioPlayButtonSize;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const queue = useMemo(
    () => queueFromTracks(playlist.playableTracks),
    [playlist.playableTracks],
  );
  const isCurrent = queue.some((item) => player.isCurrentTrack(item.trackId));
  const isPlaying = isCurrent && player.status === "playing";
  const isEmpty = queue.length === 0;
  return (
    <StudioPlayButton
      size={size}
      state={isEmpty ? "blocked" : isPlaying ? "playing" : "idle"}
      blockedReason={
        isEmpty ? t("studio:playlist.page.nothingToPlay") : undefined
      }
      label={t(
        isPlaying
          ? "studio:playlist.page.pauseAria"
          : "studio:playlist.page.playAria",
        { name: playlist.name },
      )}
      onToggle={() => {
        if (isCurrent) player.togglePlay();
        else void player.playTracks(queue);
      }}
    />
  );
}
