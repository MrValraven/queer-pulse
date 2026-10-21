import { useMemo } from "react";
import { routes } from "../../app/routeMap";
import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioLikedTracks } from "./api/useStudioLikedTracks";
import { StudioMediaCard } from "./kit/StudioMediaCard";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { StudioLikedCover } from "./StudioLikedCover";
import { useStudioLikedPlayAll } from "./useStudioLikedPlayAll";
import css from "./StudioPlaylist.module.css";

/** Liked songs on the library's Playlists grid, always first, built like
 *  StudioPlaylistCard (StudioMediaCard). Play queues every like, reading
 *  the pages still waiting first, exactly as the Liked songs hero does
 *  (useStudioLikedPlayAll); pressed again while it reads, it cancels. Only
 *  the member ever sees it, so it always reads Private. */
export function StudioLikedSongsCard() {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const liked = useStudioLikedTracks();
  const playAll = useStudioLikedPlayAll(liked);
  const { trackCount, playableTracks, loadState } = liked;
  const hasCount = !loadState.isLoading && !loadState.isError;
  // The hero's test: the liked list is playing when its current track is
  // one of the likes.
  const isCurrent = useMemo(
    () => playableTracks.some((track) => player.isCurrentTrack(track.id)),
    [playableTracks, player],
  );
  const isPlaying = isCurrent && player.status === "playing";
  const hasPlayableTracks = playableTracks.length > 0 || liked.hasMore;
  const title = t("studio:liked.title");
  return (
    <StudioMediaCard
      kind="liked"
      href={routes.studioLiked}
      title={title}
      isPlaying={isPlaying || playAll.pendingMode === "play"}
      playLabel={
        playAll.pendingMode === "play"
          ? t("studio:liked.page.loadingAll", { count: trackCount })
          : t(
              isPlaying
                ? "studio:playlist.page.pauseAria"
                : "studio:playlist.page.playAria",
              { name: title },
            )
      }
      onPlay={
        isCurrent || hasPlayableTracks
          ? () => {
              if (playAll.pendingMode !== null) playAll.cancel();
              else if (isCurrent) player.togglePlay();
              else playAll.start("play");
            }
          : undefined
      }
      cover={<StudioLikedCover />}
      meta={
        <span className={css.metaRow}>
          {hasCount && (
            <FadeIn as="span">
              {t("studio:facts.trackCount", { count: trackCount })}
            </FadeIn>
          )}
          <span className={css.visibilityChip}>
            {t("studio:playlist.visibility.private")}
          </span>
        </span>
      }
    />
  );
}
