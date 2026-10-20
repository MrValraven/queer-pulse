import type { Ref } from "react";
import { Link } from "react-router-dom";
import { m } from "motion/react";
import { FiPause, FiPlay } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioLikedEntryView } from "./api/studioLiked.adapters";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { StudioTrackMenu } from "./player/ui/StudioTrackMenu";
import {
  StudioHiddenTrackNote,
  StudioHiddenTrackNumber,
} from "./StudioHiddenTrack";
import { StudioLikeButton } from "./StudioLikeButton";
import { StudioTrackWarningPill } from "./StudioTrackWarningPill";
import hiddenCss from "./StudioHiddenTrack.module.css";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";
import likedCss from "./StudioLikedPage.module.css";
import releaseStyles from "./StudioRelease.module.css";
import css from "./StudioPlaylistPage.module.css";

interface StudioLikedEntryRowProps {
  entry: StudioLikedEntryView;
  isCurrent: boolean;
  isPlaying: boolean;
  rowRef: Ref<HTMLLIElement>;
  onPlay: () => void;
  onToggled: (isNowLiked: boolean) => void;
}

/** One like: play inside Liked songs, open the track, its menu, and the
 *  heart that takes it out. An unavailable like keeps the title the member
 *  saved and reads Withdrawn when our team took its release down (that one
 *  links to the page that explains it), else No longer available. An
 *  explicit track hidden by the member's settings shows its number in the
 *  play button's cell. A row fades out once unliked. */
export function StudioLikedEntryRow({
  entry,
  isCurrent,
  isPlaying,
  rowRef,
  onPlay,
  onToggled,
}: StudioLikedEntryRowProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const shouldHideExplicit = useStudioHideExplicit();
  const track = entry.track;
  const isHidden = shouldHideExplicit && track?.isExplicit === true;
  const isWithdrawn =
    !entry.isAvailable && entry.unavailableReason === "withdrawn";
  return (
    <m.li
      ref={rowRef}
      layout="position"
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
      className={[
        styles.setRow,
        css.row,
        !entry.isAvailable && css.rowUnavailable,
        isHidden && hiddenCss.hidden,
        isCurrent && styles.setRowNow,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-current={isCurrent ? "true" : undefined}
    >
      {track && !isHidden ? (
        <button
          type="button"
          className={releaseStyles.rowPlay}
          aria-disabled={!track.hasAudio || undefined}
          aria-label={t(
            isPlaying
              ? "studio:release.pauseTrack"
              : "studio:release.playTrack",
            { title: entry.title },
          )}
          onClick={() => {
            if (track.hasAudio) onPlay();
          }}
        >
          <span className={releaseStyles.rowNumber} aria-hidden>
            {entry.position}
          </span>
          <span className={releaseStyles.rowIcon} aria-hidden>
            {isPlaying ? <FiPause /> : <FiPlay />}
          </span>
        </button>
      ) : track ? (
        <StudioHiddenTrackNumber position={entry.position} />
      ) : (
        <span className={css.position} aria-hidden>
          {entry.position}
        </span>
      )}
      <div className={`${styles.srCov} ${css.cover}`}>
        <ImageSlot
          src={track?.release.coverUrl ?? undefined}
          tint={track?.release.tint ?? "plum"}
          width={36}
          height={36}
          radius={5}
          placeholder=""
        />
      </div>
      <div className={css.main}>
        <h3
          className={[
            likedCss.rowTitle,
            isCurrent && likedCss.rowTitleNow,
            isHidden && likedCss.rowTitleHidden,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {track || isWithdrawn ? (
            <Link to={entry.href} className={kit.titleLink}>
              {entry.title}
            </Link>
          ) : (
            entry.title
          )}
        </h3>
        <StudioTrackWarningPill warnings={track?.contentWarnings} />
        {track ? (
          <div className={styles.who}>
            {`${track.release.artist.name} · ${track.release.title}`}
          </div>
        ) : (
          <div className={styles.who}>
            {t(
              isWithdrawn
                ? "studio:withdrawnLive.rowLabel"
                : "studio:playlist.row.unavailable",
            )}
          </div>
        )}
        {isHidden && <StudioHiddenTrackNote />}
      </div>
      <div className={`${styles.tm} ${css.duration} ${releaseStyles.timeCell}`}>
        <span className={releaseStyles.timeLabel}>
          {track?.durationLabel ?? ""}
        </span>
        {/* Quiet: the row fading out and focus moving on confirm it here. */}
        <StudioLikeButton
          subject={{
            trackId: entry.trackId,
            title: entry.title,
            href: entry.href,
            artistName: track?.release.artist.name ?? "",
          }}
          className={releaseStyles.rowAdd}
          isQuiet
          onToggled={onToggled}
        />
        {track ? (
          <StudioTrackMenu
            track={{
              id: track.id,
              title: track.title,
              href: track.href,
              hasAudio: track.hasAudio,
              isExplicit: track.isExplicit,
              artistId: track.release.artist.id,
              isPublished: track.release.publishedAt !== null,
              isWithheld: track.isWithheld,
            }}
          />
        ) : (
          // Holds the menu's column, so this heart lines up with the rest.
          <span className={likedCss.menuPlaceholder} aria-hidden="true" />
        )}
      </div>
    </m.li>
  );
}
