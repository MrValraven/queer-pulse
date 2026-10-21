import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistCardView } from "./api/studio.adapters";
import { studioPlaylistQueryOptions } from "./api/useStudioPlaylist";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueFromTracks } from "./player/studioQueue";
import { studioReasonCopyKey, studioReasonOf } from "./studioReason";

export interface StudioPlaylistCardPlay {
  isPlaying: boolean;
  isLoading: boolean;
  /** Undefined for an empty playlist, so its card shows no play button. */
  play: (() => void) | undefined;
}

/**
 * Play from a playlist card: the playlist read goes through the same cache
 * the playlist page uses, so a card already opened plays at once. Pressed
 * again while that playlist plays, it pauses. A failed read names the
 * reason in a toast.
 */
export function useStudioPlaylistCardPlay(
  playlist: StudioPlaylistCardView,
): StudioPlaylistCardPlay {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const player = useStudioPlayer();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const source = player.queue.source;
  const isCurrent =
    source?.kind === "playlist" && source.href === playlist.href;
  const isPlaying = isCurrent && player.status === "playing";

  const startPlaylist = async () => {
    setIsLoading(true);
    try {
      const view = await queryClient.fetchQuery(
        studioPlaylistQueryOptions(demoMode, playlist.id),
      );
      const queue = queueFromTracks(view.playableTracks);
      if (queue.length === 0) {
        showToast(t("studio:playlist.card.nothingToPlay"), "info");
        return;
      }
      await player.playTracks(queue, undefined, {
        kind: "playlist",
        label: playlist.name,
        href: playlist.href,
      });
    } catch (error) {
      showToast(t(studioReasonCopyKey(studioReasonOf(error), "play")), "error");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isPlaying,
    isLoading,
    play:
      playlist.trackCount > 0 || isCurrent
        ? () => {
            if (isCurrent) player.togglePlay();
            else if (!isLoading) void startPlaylist();
          }
        : undefined,
  };
}
