import { useMemo } from "react";
import { FiPause, FiPlay, FiShuffle } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSearchTrackView } from "./api/studio.adapters";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueFromTracks, shuffledQueue } from "./player/studioQueue";
import { StudioDetailHero } from "./StudioDetailHero";
import { StudioLikedCover } from "./StudioLikedCover";
import styles from "./studio.module.css";
import likedCss from "./StudioLikedPage.module.css";
import pageCss from "./StudioPlaylistPage.module.css";

/** Liked songs' heart cover, its name, the Private chip and note, the
 *  facts, and Play and Shuffle over the loaded likes. Liked songs is only
 *  ever the member's own, so it offers no save, share or owner menu.
 *  Shuffle is computed in the browser and sent nowhere. Play and Shuffle
 *  fold away while no like can play, and fold back in with the next. */
export function StudioLikedHero({
  playableTracks,
  trackCount,
  totalDurationSeconds,
}: {
  playableTracks: StudioSearchTrackView[];
  trackCount: number;
  totalDurationSeconds: number;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const title = t("studio:liked.title");
  const queue = useMemo(
    () => queueFromTracks(playableTracks),
    [playableTracks],
  );
  const isCurrent = queue.some((item) => player.isCurrentTrack(item.trackId));
  const isPlaying = isCurrent && player.status === "playing";
  const hasPlayableTracks = queue.length > 0;
  const minutes = Math.round(totalDurationSeconds / 60);
  const facts = [
    t("studio:facts.trackCount", { count: trackCount }),
    minutes > 0 ? t("studio:facts.minutes", { count: minutes }) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <StudioDetailHero
      art={<StudioLikedCover radius={16} />}
      kind={[t("studio:playlist.page.eyebrow"), facts].join(" · ")}
      title={title}
      by={
        <span className={`${pageCss.chip} ${likedCss.privateChip}`}>
          {t("studio:playlist.visibility.private")}
        </span>
      }
      actionsClassName={likedCss.heroActionsFlush}
      actions={
        <Collapse isOpen={hasPlayableTracks}>
          <div className={likedCss.heroActionsRow}>
            <button
              type="button"
              className={styles.playBig}
              aria-label={t(
                isPlaying
                  ? "studio:playlist.page.pauseAria"
                  : "studio:playlist.page.playAria",
                { name: title },
              )}
              onClick={() => {
                if (isCurrent) player.togglePlay();
                else void player.playTracks(queue);
              }}
            >
              {isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
            </button>
            <button
              type="button"
              onClick={() => void player.playTracks(shuffledQueue(queue))}
            >
              <FiShuffle aria-hidden /> {t("studio:playlist.page.shuffleCta")}
            </button>
          </div>
        </Collapse>
      }
    >
      <p className={pageCss.description}>
        {t("studio:liked.page.privateNote")}
      </p>
    </StudioDetailHero>
  );
}
