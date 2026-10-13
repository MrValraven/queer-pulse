import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronUp,
  FiPause,
  FiPlay,
  FiSkipBack,
  FiSkipForward,
} from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { StudioAddToPlaylistButton } from "./StudioAddToPlaylistButton";
import { StudioPlayerSeek } from "./StudioPlayerSeek";
import { StudioPlayerShowcase } from "./StudioPlayerShowcase";
import { useStudioShowcase } from "./useStudioShowcase";
import styles from "./StudioPlayer.module.css";

/**
 * The app-wide player bar. Mounted by StudioPlayerMount only while something
 * is queued and the member has Studio access. On phones it collapses to a
 * mini bar (cover, title, play) above the tab bar and expands on request.
 */
export function StudioPlayer({
  barRef,
}: {
  barRef?: (bar: HTMLElement | null) => void;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const isShowcase = useStudioShowcase();
  const [isExpanded, setIsExpanded] = useState(false);
  const item = player.currentItem;
  if (!item) return null;
  const isPlaying = player.status === "playing";

  return (
    <>
      <div className={styles.spacer} aria-hidden />
      <section
        ref={barRef}
        className={styles.bar}
        aria-label={t("studio:playerBar.regionLabel")}
        data-expanded={isExpanded || undefined}
      >
        <div className={styles.now}>
          <span className={styles.art}>
            <ImageSlot
              src={item.coverUrl ?? undefined}
              tint={item.tint}
              width={48}
              height={48}
              radius={8}
              placeholder=""
            />
          </span>
          <span className={styles.titles}>
            <Link to={item.trackHref} className={styles.title}>
              {item.title}
            </Link>
            <Link to={item.artistHref} className={styles.artist}>
              {item.artistName}
            </Link>
          </span>
          <StudioAddToPlaylistButton
            trackIds={[item.trackId]}
            subjectTitle={item.title}
            ariaLabel={t("studio:playlist.add.trackAria", {
              title: item.title,
            })}
            className={styles.addToPlaylist}
          />
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.secondaryControl}
            onClick={player.previous}
            aria-label={t("studio:playerBar.previous")}
          >
            <FiSkipBack aria-hidden />
          </button>
          <button
            type="button"
            className={styles.playButton}
            onClick={player.togglePlay}
            aria-label={
              isPlaying
                ? t("studio:playerBar.pause")
                : t("studio:playerBar.play")
            }
            aria-busy={player.status === "loading" || undefined}
          >
            {isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
          </button>
          <button
            type="button"
            className={styles.secondaryControl}
            onClick={player.next}
            aria-disabled={!player.hasNext || undefined}
            aria-label={t("studio:playerBar.next")}
          >
            <FiSkipForward aria-hidden />
          </button>
        </div>

        <div className={styles.seekArea}>
          <StudioPlayerSeek onSeek={player.seek} />
        </div>

        <div className={styles.status} role="status">
          {player.status === "error" && (
            <span className={styles.error}>
              {t("studio:playerBar.cantPlay")}{" "}
              <button
                type="button"
                className={styles.retry}
                onClick={player.retry}
              >
                {t("studio:playerBar.retry")}
              </button>
            </span>
          )}
        </div>

        {isShowcase && <StudioPlayerShowcase artistName={item.artistName} />}

        <button
          type="button"
          className={styles.expandToggle}
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((wasExpanded) => !wasExpanded)}
          aria-label={
            isExpanded
              ? t("studio:playerBar.collapse")
              : t("studio:playerBar.expand")
          }
        >
          {isExpanded ? (
            <FiChevronDown aria-hidden />
          ) : (
            <FiChevronUp aria-hidden />
          )}
        </button>
      </section>
    </>
  );
}
