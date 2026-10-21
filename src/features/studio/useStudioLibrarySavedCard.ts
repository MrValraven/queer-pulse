import { useMemo, type RefObject } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSaved, type SavedItem } from "../../app/providers/useSaved";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioSavedId, type StudioPlaylistView } from "./api/studio.adapters";
import { studioPlaylistQueryOptions } from "./api/useStudioPlaylist";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueFromTracks } from "./player/studioQueue";
import { studioReasonCopyKey, studioReasonOf } from "./studioReason";

export { savedCoverTintOf } from "./studioLibrarySort.data";

export interface StudioSavedCardPlay {
  isPlaying: boolean;
  onPlay: () => void;
}

const RELEASE_PREFIX = studioSavedId.release("");
const PLAYLIST_PREFIX = studioSavedId.playlist("");
export const savedReleaseIdOf = (item: SavedItem) =>
  item.id.slice(RELEASE_PREFIX.length);
export const savedPlaylistIdOf = (item: SavedItem) =>
  item.id.slice(PLAYLIST_PREFIX.length);

/** Play or pause a saved release from its card. */
export function useSavedReleasePlay(releaseId: string): StudioSavedCardPlay {
  const player = useStudioPlayer();
  const isCurrent = player.isCurrentRelease(releaseId);
  return {
    isPlaying: isCurrent && player.status === "playing",
    onPlay: () => {
      if (isCurrent) player.togglePlay();
      else void player.playRelease(releaseId);
    },
  };
}

/** Play or pause a saved playlist from its card. The card reads the
 *  playlist only when Play is pressed (a cached read is used as is), and a
 *  read that fails says why in a toast. */
export function useSavedPlaylistPlay(
  playlistId: string,
): StudioSavedCardPlay & { cached: StudioPlaylistView | undefined } {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const player = useStudioPlayer();
  const { showToast } = useToast();
  const options = studioPlaylistQueryOptions(demoMode, playlistId);
  // Observes the cache without reading: the cover and the playing state
  // follow a playlist this session already opened.
  const { data: cached } = useQuery({ ...options, enabled: false });
  const queue = useMemo(
    () => (cached ? queueFromTracks(cached.playableTracks) : []),
    [cached],
  );
  const isCurrent = queue.some((item) => player.isCurrentTrack(item.trackId));
  async function play() {
    try {
      const playlist = await queryClient.fetchQuery(options);
      const tracks = queueFromTracks(playlist.playableTracks);
      if (tracks.length === 0) {
        showToast(t("studio:libraryLive.playlistNothingToPlay"), "info");
        return;
      }
      await player.playTracks(tracks);
    } catch (error) {
      showToast(t(studioReasonCopyKey(studioReasonOf(error), "play")), "error");
    }
  }
  return {
    cached,
    isPlaying: isCurrent && player.status === "playing",
    onPlay: () => {
      if (isCurrent) player.togglePlay();
      else void play();
    },
  };
}

/** Remove from Library with an Undo toast. Focus moves to the next card
 *  (or the one before) first, so it never drops to the page as the card
 *  leaves. */
export function useLibraryUnsave(
  item: SavedItem,
  cardRef: RefObject<HTMLElement | null>,
): () => void {
  const { t } = useTranslation();
  const { unsave, save } = useSaved();
  const { showToast } = useToast();
  return () => {
    const listItem = cardRef.current?.closest("li");
    const neighbour =
      listItem?.nextElementSibling ?? listItem?.previousElementSibling;
    neighbour?.querySelector<HTMLElement>("a[href], button")?.focus();
    unsave(item.id);
    showToast(
      t("studio:libraryLive.removedToast", { title: item.title }),
      "info",
      undefined,
      { label: t("studio:libraryLive.undoCta"), onClick: () => save(item) },
    );
  };
}
