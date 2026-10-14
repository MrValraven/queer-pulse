import { Link } from "react-router-dom";
import { FiPause, FiPlay } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSearchTrackView } from "./api/studio.adapters";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { StudioTrackMenu } from "./player/ui/StudioTrackMenu";
import { StudioAddToPlaylistButton } from "./StudioAddToPlaylistButton";
import { StudioHiddenTrackNote } from "./StudioHiddenTrack";
import hiddenCss from "./StudioHiddenTrack.module.css";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";
import releaseStyles from "./StudioRelease.module.css";
import searchStyles from "./StudioSearch.module.css";

/** A track hit: play it inside its release, or open its page. While "Hide
 *  explicit tracks" hides it, the row greys and offers no play. */
export function StudioSearchTrackRow({
  track,
}: {
  track: StudioSearchTrackView;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const isHidden = useStudioHideExplicit() && track.isExplicit;
  const isCurrent = player.isCurrentTrack(track.id);
  const isPlaying = isCurrent && player.status === "playing";
  return (
    <li
      className={[
        styles.setRow,
        searchStyles.trackRow,
        isCurrent && styles.setRowNow,
        isHidden && hiddenCss.hidden,
        isHidden && hiddenCss.hiddenSearchRow,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-current={isCurrent ? "true" : undefined}
    >
      {!isHidden && (
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
      )}
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
        <div className={`${styles.who} ${searchStyles.trackArtist}`}>
          {track.release.artist.name === track.release.title
            ? track.release.title
            : `${track.release.artist.name} · ${track.release.title}`}
        </div>
        {isHidden && <StudioHiddenTrackNote />}
      </div>
      <div className={styles.pay} />
      <div className={`${styles.tm} ${releaseStyles.timeCell}`}>
        {track.durationLabel ?? ""}
        <StudioAddToPlaylistButton
          trackIds={track.hasAudio ? [track.id] : []}
          subjectTitle={track.title}
          ariaLabel={t("studio:playlist.add.trackAria", { title: track.title })}
          className={releaseStyles.rowAdd}
        />
        <StudioTrackMenu
          track={{
            id: track.id,
            title: track.title,
            href: track.href,
            hasAudio: track.hasAudio,
            isExplicit: track.isExplicit,
          }}
        />
      </div>
    </li>
  );
}
