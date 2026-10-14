import { Link } from "react-router-dom";
import { FiPause, FiPlay } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { StudioReleaseView } from "./api/studio.adapters";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { StudioTrackMenu } from "./player/ui/StudioTrackMenu";
import { StudioAddToPlaylistButton } from "./StudioAddToPlaylistButton";
import {
  StudioHiddenTrackNote,
  StudioHiddenTrackNumber,
} from "./StudioHiddenTrack";
import hiddenCss from "./StudioHiddenTrack.module.css";
import { StudioLikeButton } from "./StudioLikeButton";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";
import releaseStyles from "./StudioRelease.module.css";

const PER_PLAY_AMOUNT = 0.05;

/** The playable tracklist: each row is a play button plus a link to the
 *  track page. The playing row carries aria-current. */
export function StudioAlbumTracklist({
  release,
}: {
  release: StudioReleaseView;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const player = useStudioPlayer();
  const isShowcase = useStudioShowcase();
  const hideExplicit = useStudioHideExplicit();
  // The server refuses every stream on a taken-down release, owners included.
  const isStreamable = release.status !== "taken_down";
  const isPublished = release.status === "published";
  // A preview read through its private link shows its rows without the
  // track menu (agreed with Studio v3), and so does a taken-down release,
  // which streams nothing.
  const hasTrackMenu = !release.isPreview && isStreamable;

  return (
    <ol
      className={`${styles.setCard} ${releaseStyles.tracklist}`}
      aria-label={t("studio:release.tracklistLabel", { title: release.title })}
    >
      {release.tracks.map((track) => {
        const isCurrent = player.isCurrentTrack(track.id);
        const isPlaying = isCurrent && player.status === "playing";
        const isPlayBlocked = !isStreamable || !track.hasAudio;
        const isHidden = hideExplicit && track.isExplicit;
        // A heart only where the track can be played and opened: a
        // published release read outside a preview link.
        const isLikeable = isPublished && !release.isPreview && !isPlayBlocked;
        const likeSubject = {
          trackId: track.id,
          title: track.title,
          href: track.href,
          artistName: release.artist.name,
        };
        return (
          <li
            key={track.id}
            className={[
              styles.setRow,
              isCurrent && styles.setRowNow,
              isHidden && hiddenCss.hidden,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={isCurrent ? "true" : undefined}
          >
            {isHidden ? (
              <StudioHiddenTrackNumber position={track.position} />
            ) : (
              <button
                type="button"
                className={releaseStyles.rowPlay}
                aria-disabled={isPlayBlocked || undefined}
                aria-label={
                  isPlaying
                    ? t("studio:release.pauseTrack", { title: track.title })
                    : t("studio:release.playTrack", { title: track.title })
                }
                onClick={() => {
                  if (isPlayBlocked) return;
                  if (isCurrent) player.togglePlay();
                  else void player.playRelease(release.id, track.id);
                }}
              >
                <span className={releaseStyles.rowNumber} aria-hidden>
                  {track.position}
                </span>
                <span className={releaseStyles.rowIcon} aria-hidden>
                  {isPlaying ? <FiPause /> : <FiPlay />}
                </span>
              </button>
            )}
            <div className={styles.srCov}>
              <ImageSlot
                src={release.coverUrl ?? undefined}
                tint={release.tint}
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
                {track.isExplicit && (
                  <abbr
                    className={releaseStyles.explicit}
                    title={t("studio:release.explicit")}
                  >
                    {t("studio:release.explicitShort")}
                  </abbr>
                )}
              </h5>
              <div className={styles.who}>
                {isHidden ? (
                  <StudioHiddenTrackNote />
                ) : isCurrent ? (
                  t("studio:release.nowPlaying")
                ) : (
                  release.artist.name
                )}
              </div>
            </div>
            <div className={`${styles.pay} ${releaseStyles.payColumn}`}>
              {isShowcase &&
                t("studio:album.main.perPlaySuffix", {
                  amount: formatters.currency(PER_PLAY_AMOUNT),
                })}
            </div>
            <div className={`${styles.tm} ${releaseStyles.timeCell}`}>
              <span className={releaseStyles.timeLabel}>
                {track.durationLabel ?? t("studio:release.processing")}
              </span>
              {isLikeable && (
                <StudioLikeButton
                  subject={likeSubject}
                  className={releaseStyles.rowAdd}
                />
              )}
              {isPublished && (
                <StudioAddToPlaylistButton
                  trackIds={isPlayBlocked ? [] : [track.id]}
                  subjectTitle={track.title}
                  ariaLabel={t("studio:playlist.add.trackAria", {
                    title: track.title,
                  })}
                  className={releaseStyles.rowAdd}
                  likeSubject={isLikeable ? likeSubject : undefined}
                />
              )}
              {hasTrackMenu && (
                <StudioTrackMenu
                  track={{
                    id: track.id,
                    title: track.title,
                    href: track.href,
                    hasAudio: track.hasAudio,
                    isExplicit: track.isExplicit,
                  }}
                />
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
