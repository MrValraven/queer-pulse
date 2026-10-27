import { useId } from "react";
import { AnimatePresence } from "motion/react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { StudioPlaylistView } from "../api/studio.adapters";
import { useStudioHideExplicit } from "../api/useStudioPlaybackPreferences";
import { useStudioPlaylist } from "../api/useStudioPlaylist";
import { useStudioPlayer } from "../player/studioPlayerContext";
import { StudioPlaylistCover } from "../StudioPlaylistCover";
import { StudioShareCardBody } from "./StudioShareCardBody";
import {
  StudioShareCardLayer,
  StudioShareCardStatusBody,
} from "./StudioShareCardStates";
import { studioLinkPath, type StudioLinkTarget } from "./studioLinkTarget";
import {
  GRANTED_ACCESS,
  playlistPlayModel,
  studioShareCardStatus,
} from "./studioShareCardModel";

/** A shared playlist: plays the tracks this reader can play, in order,
 *  skipping the ones the member hides. */
export function StudioSharePlaylistCard({
  target,
}: {
  target: StudioLinkTarget;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const hideExplicit = useStudioHideExplicit();
  const noteId = useId();
  const { playlist, loadState } = useStudioPlaylist(target.id);
  const status = studioShareCardStatus(
    GRANTED_ACCESS,
    loadState,
    playlist !== null,
  );
  let readyBody = null;
  if (status === "ready" && playlist) {
    const model = playlistPlayModel(playlist, hideExplicit);
    // As StudioPlaylistHero: the playlist is current while one of its
    // playable tracks is.
    const isCurrent = playlist.playableTracks.some((track) =>
      player.isCurrentTrack(track.id),
    );
    const isPlaying = isCurrent && player.status === "playing";
    const isHidden = model.playMode === "hidden";
    // Called synchronously inside the click, so the audio context unlocks.
    const play = () => {
      // A hidden track already playing can still be paused from here.
      if (!isPlaying && model.playMode !== "playable") return;
      if (isCurrent) player.togglePlay();
      else void player.playTracks(model.queue);
    };
    readyBody = (
      <StudioShareCardBody
        kind="playlist"
        href={studioLinkPath(target)}
        title={playlist.name}
        subtitle={t("studio:share.card.byline", {
          name: playlist.credit.name,
        })}
        meta={
          isHidden ? (
            <span id={noteId}>{t("studio:share.card.hiddenNote")}</span>
          ) : (
            playlistFacts(playlist, t)
          )
        }
        art={
          <StudioPlaylistCover
            coverUrls={playlist.coverUrls}
            tint={playlist.tint}
            label=""
            radius={0}
          />
        }
        play={
          model.playMode === "blocked"
            ? null
            : {
                isPlaying,
                isBlocked: isHidden && !isPlaying,
                noteId,
                label: t(
                  isPlaying
                    ? "studio:playlist.page.pauseAria"
                    : "studio:playlist.page.playAria",
                  { name: playlist.name },
                ),
                onPlay: play,
              }
        }
      />
    );
  }
  return (
    <AnimatePresence initial={false}>
      <StudioShareCardLayer key={readyBody ? "ready" : status}>
        {readyBody ?? (
          <StudioShareCardStatusBody
            status={status === "ready" ? "loading" : status}
            loadState={loadState}
          />
        )}
      </StudioShareCardLayer>
    </AnimatePresence>
  );
}

/** "12 tracks · 48 min". */
function playlistFacts(
  playlist: StudioPlaylistView,
  t: ReturnType<typeof useTranslation>["t"],
): string {
  const minutes = Math.round(playlist.totalDurationSeconds / 60);
  return [
    t("studio:facts.trackCount", { count: playlist.trackCount }),
    minutes > 0 ? t("studio:facts.minutes", { count: minutes }) : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
