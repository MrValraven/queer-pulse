import { Link } from "react-router-dom";
import { FiPause, FiPlay } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSearchTrackView } from "./api/studio.adapters";
import { useStudioPlayer } from "./player/studioPlayerContext";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";
import releaseStyles from "./StudioRelease.module.css";
import searchStyles from "./StudioSearch.module.css";

/** A track hit: play it inside its release, or open its page. */
export function StudioSearchTrackRow({
  track,
}: {
  track: StudioSearchTrackView;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const isCurrent = player.isCurrentTrack(track.id);
  const isPlaying = isCurrent && player.status === "playing";
  return (
    <li
      className={[
        styles.setRow,
        searchStyles.trackRow,
        isCurrent && styles.setRowNow,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-current={isCurrent ? "true" : undefined}
    >
      <button
        type="button"
        className={releaseStyles.rowPlay}
        disabled={!track.hasAudio}
        aria-label={
          isPlaying
            ? t("studio:release.pauseTrack", { title: track.title })
            : t("studio:release.playTrack", { title: track.title })
        }
        onClick={() =>
          isCurrent
            ? player.togglePlay()
            : void player.playRelease(track.release.id, track.id)
        }
      >
        {isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
      </button>
      <div className={styles.srCov}>
        <ImageSlot
          src={track.release.coverUrl ?? undefined}
          tint={track.release.tint}
          width={36}
          height={36}
          radius={5}
          placeholder=""
        />
      </div>
      <div>
        <h5>
          <Link to={track.href} className={kit.titleLink}>
            {track.title}
          </Link>
        </h5>
        <div
          className={styles.who}
        >{`${track.release.artist.name} · ${track.release.title}`}</div>
      </div>
      <div className={styles.pay} />
      <div className={styles.tm}>{track.durationLabel ?? ""}</div>
    </li>
  );
}
