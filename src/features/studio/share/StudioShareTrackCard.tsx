import { useId } from "react";
import { AnimatePresence } from "motion/react";
import { ImageSlot } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { StudioTrackView } from "../api/studio.adapters";
import { useStudioHideExplicit } from "../api/useStudioPlaybackPreferences";
import { useStudioTrack } from "../api/useStudioTrack";
import { useStudioPlayer } from "../player/studioPlayerContext";
import { StudioShareCardBody } from "./StudioShareCardBody";
import {
  StudioShareCardLayer,
  StudioShareCardStatusBody,
} from "./StudioShareCardStates";
import { studioLinkPath, type StudioLinkTarget } from "./studioLinkTarget";
import {
  GRANTED_ACCESS,
  studioShareCardStatus,
  trackPlayModel,
} from "./studioShareCardModel";
import styles from "./StudioShareCard.module.css";

/** A shared track: plays inside its release from this track, at `&t=` when
 *  the link carries one (spec section 1). */
export function StudioShareTrackCard({ target }: { target: StudioLinkTarget }) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const hideExplicit = useStudioHideExplicit();
  const noteId = useId();
  const { track, loadState } = useStudioTrack(target.id);
  const status = studioShareCardStatus(
    GRANTED_ACCESS,
    loadState,
    track !== null,
  );
  let readyBody = null;
  if (status === "ready" && track) {
    const model = trackPlayModel(track, hideExplicit);
    const isCurrent = player.isCurrentTrack(track.id);
    const isPlaying = isCurrent && player.status === "playing";
    const isHidden = model.playMode === "hidden";
    // Called synchronously inside the click, so the audio context unlocks.
    const play = () => {
      // A hidden track already playing can still be paused from here.
      if (!isPlaying && model.playMode !== "playable") return;
      if (isCurrent) player.togglePlay();
      else
        void player.playRelease(
          track.releaseId,
          track.id,
          target.startAtSeconds ?? undefined,
        );
    };
    readyBody = (
      <StudioShareCardBody
        kind="track"
        href={studioLinkPath(target)}
        title={track.title}
        subtitle={trackSubtitle(track)}
        meta={
          isHidden ? (
            <span id={noteId}>{t("studio:share.card.hiddenNote")}</span>
          ) : (
            <>
              {track.durationLabel}
              {track.isExplicit && (
                <span className={styles.explicit}>
                  <span aria-hidden="true">
                    {t("studio:release.explicitShort")}
                  </span>
                  <span className="visuallyHidden">
                    {t("studio:release.explicit")}
                  </span>
                </span>
              )}
            </>
          )
        }
        art={
          <ImageSlot
            src={track.release.coverUrl ?? undefined}
            tint={track.release.tint}
            width="100%"
            height="100%"
            // The cover box clips to the concentric corner.
            radius={0}
            placeholder=""
            style={{ position: "absolute", inset: 0 }}
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
                    ? "studio:card.pauseRelease"
                    : "studio:card.playRelease",
                  { title: track.title },
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
          />
        )}
      </StudioShareCardLayer>
    </AnimatePresence>
  );
}

/** "Artist · Release". A single, whose release shares the track's title,
 *  reads the artist alone. */
function trackSubtitle(track: StudioTrackView): string {
  const isSingle =
    track.release.title.trim().toLocaleLowerCase() ===
    track.title.trim().toLocaleLowerCase();
  return isSingle
    ? track.release.artist.name
    : [track.release.artist.name, track.release.title].join(" · ");
}
