import { AnimatePresence, m } from "motion/react";
import type { ReactNode } from "react";
import { ImageSlot, useChipMotion } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { StudioLikeButton } from "../../StudioLikeButton";
import {
  useStudioPlayer,
  useStudioPlayerClock,
  type StudioQueueItem,
} from "../studioPlayerContext";
import { useStudioEpisodeSpeed } from "../useStudioEpisodeMemory";
import { playbackRateFor } from "../useStudioEpisodeRate";
import { useStudioPlayerSurface } from "../studioPlayerSurface";
import { StudioEpisodeSkipButton } from "./StudioEpisodeSkipButton";
import { StudioPlayPauseIcon } from "./StudioIconSwap";
import { StudioPlayerStatus } from "./StudioPlayerBar";
import { StudioPlayerCloseButton } from "./StudioPlayerCloseButton";
import { StudioWarningGate } from "./StudioWarningGate";
import { useMiniCardSwipe } from "./useMiniCardSwipe";
import { useStudioSmoothProgress } from "./useStudioSmoothProgress";
import styles from "../../StudioPlayer.module.css";

/** Draws the mini line's fill as a horizontal scale. */
function paintMiniFill(fill: HTMLSpanElement, fraction: number) {
  fill.style.transform = `scaleX(${fraction})`;
}

/** The thin progress line: decorative, the clock lives only here. While
 *  playing it glides between the clock's ticks like the waveform does; the
 *  rendered scale is the paused and first value. */
function MiniProgress() {
  const { currentTime, duration } = useStudioPlayerClock();
  const { currentItem, status } = useStudioPlayer();
  // Same rule as the engine: music at 1x, an episode at the member's speed.
  const { speed } = useStudioEpisodeSpeed();
  const playbackRate = playbackRateFor(currentItem?.isEpisode === true, speed);
  const progress =
    duration && duration > 0 ? Math.min(1, currentTime / duration) : 0;
  const fillRef = useStudioSmoothProgress({
    currentTime,
    duration: duration ?? 0,
    isPlaying: status === "playing",
    playbackRate,
    paint: paintMiniFill,
  });
  return (
    <span className={styles.miniProgress} aria-hidden="true">
      <span
        ref={fillRef}
        className={styles.miniProgressFill}
        style={{ transform: `scaleX(${progress})` }}
      />
    </span>
  );
}

/** A control slot of the mini card. It grows in and folds away by width
 *  and fade, so the card glides as its controls change. Overflow clips only
 *  while it moves, keeping the focus ring whole at rest. */
function MiniFoldSlot({
  slotKey,
  className,
  direction,
  isShown,
  children,
}: {
  slotKey: string;
  className?: string;
  direction?: "back" | "forward";
  isShown: boolean;
  children: ReactNode;
}) {
  const { transition } = useChipMotion();
  return (
    <AnimatePresence initial={false}>
      {isShown && (
        <m.span
          key={slotKey}
          className={className}
          data-direction={direction}
          initial={{ width: 0, opacity: 0, overflow: "hidden" }}
          animate={{ width: "auto", opacity: 1, overflow: "visible" }}
          exit={{
            width: 0,
            opacity: 0,
            overflow: "hidden",
            transition: { ...transition, overflow: { duration: 0 } },
          }}
          transition={{
            ...transition,
            overflow: { duration: 0, delay: transition.duration },
          }}
        >
          {children}
        </m.span>
      )}
    </AnimatePresence>
  );
}

/** An episode's skip beside the play button (spec 5.6), so the card glides
 *  between music and episodes. */
function MiniSkipSlot({
  direction,
  isShown,
}: {
  direction: "back" | "forward";
  isShown: boolean;
}) {
  return (
    <MiniFoldSlot
      slotKey={direction}
      className={styles.miniSkipSlot}
      direction={direction}
      isShown={isShown}
    >
      <StudioEpisodeSkipButton
        direction={direction}
        className={styles.miniSkip}
      />
    </MiniFoldSlot>
  );
}

/** The phone mini player (spec 7.1): tap or swipe up for Now playing. Title
 *  and artist are plain text for every item, private previews included, and
 *  the card keeps to a single save, the Like heart. The heart leads the
 *  controls for a music track; it folds away for a private preview and for
 *  an episode, whose skips need the room beside the title. Close player ends
 *  the row; like the play button, a press on any of them takes the pointer
 *  from the card's swipe, so a tap acts and a swipe that starts on it still
 *  opens Now playing. */
export function StudioMiniPlayer({ item }: { item: StudioQueueItem }) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const surface = useStudioPlayerSurface();
  const swipe = useMiniCardSwipe(() => surface.openNowPlaying());
  const isPlaying = player.status === "playing";
  const isEpisode = item.isEpisode === true;
  const isPreview = Boolean(item.previewToken);
  return (
    <div className={styles.mini} data-studio-player-surface="" {...swipe}>
      <StudioPlayerStatus />
      <StudioWarningGate />
      <button
        type="button"
        className={styles.miniOpen}
        aria-label={t("studio:player.openNowPlaying", {
          title: item.title,
          artist: item.artistName,
        })}
        onClick={() => surface.openNowPlaying()}
      >
        <span className={styles.art}>
          <ImageSlot
            src={item.coverUrl ?? undefined}
            tint={item.tint}
            width={44}
            height={44}
            radius={8}
            placeholder=""
          />
        </span>
        <span className={styles.titles}>
          <span className={styles.title}>{item.title}</span>
          <span className={styles.artist}>{item.artistName}</span>
        </span>
      </button>
      <span className={styles.miniControls}>
        <MiniFoldSlot
          slotKey="like"
          className={styles.miniLikeSlot}
          isShown={!isPreview && !isEpisode}
        >
          <StudioLikeButton
            subject={{
              trackId: item.trackId,
              title: item.title,
              href: item.trackHref,
              artistName: item.artistName,
            }}
            className={styles.like}
          />
        </MiniFoldSlot>
        <MiniSkipSlot direction="back" isShown={isEpisode} />
        <button
          type="button"
          className={styles.playButton}
          data-studio-play-toggle=""
          onClick={player.togglePlay}
          aria-label={
            isPlaying ? t("studio:playerBar.pause") : t("studio:playerBar.play")
          }
          aria-busy={player.status === "loading" || undefined}
        >
          <StudioPlayPauseIcon isPlaying={isPlaying} />
        </button>
        <MiniSkipSlot direction="forward" isShown={isEpisode} />
        <StudioPlayerCloseButton className={styles.miniClose} />
      </span>
      <MiniProgress />
    </div>
  );
}
