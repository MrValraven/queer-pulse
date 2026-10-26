import { AnimatePresence, m } from "motion/react";
import type { ReactNode } from "react";
import { Button, useChipMotion } from "../../../../shared/components/ui";
import { IconButton } from "../../../../shared/components/ui/IconButton";
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
import { StudioPlayerArt } from "./StudioPlayerArt";
import { StudioPlayerStatus } from "./StudioPlayerBar";
import { StudioPlayerCloseButton } from "./StudioPlayerCloseButton";
import { StudioNowCoverSwap, StudioNowTextSwap } from "./StudioPlayerNowSwap";
import { StudioWarningGate } from "./StudioWarningGate";
import { useMiniCardSwipe } from "./useMiniCardSwipe";
import { useStudioCoverSkip } from "./useStudioCoverSkip";
import { useStudioSmoothProgress } from "./useStudioSmoothProgress";
import type { SwipeSkipTrail } from "./useSwipeSkipPager";
import styles from "../../StudioPlayer.module.css";
import miniStyles from "./StudioMiniPlayer.module.css";

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

/** The track a landed swipe left, drawn beside the next one while both
 *  slide (useSwipeSkipPager). Decorative: the card names the new track. */
function MiniTrail({ trail }: { trail: SwipeSkipTrail<StudioQueueItem> }) {
  return (
    <span
      className={miniStyles.trail}
      style={{ translate: `${trail.shift}px 0` }}
      aria-hidden="true"
    >
      <span className={styles.art}>
        <StudioPlayerArt item={trail.item} size={44} radius={8} />
      </span>
      <span className={styles.titles}>
        <span className={styles.title}>{trail.item.title}</span>
        <span className={styles.artist}>{trail.item.artistName}</span>
      </span>
    </span>
  );
}

/** The phone mini player (spec 7.1): tap or swipe up for Now playing, swipe
 *  sideways to skip (the cover and titles follow the finger and spring
 *  back). Cover and titles crossfade on a track change, as the bar's do. Title
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
  const { handlers, offsetX, slideRef, isSwipeSkip, trail } = useMiniCardSwipe(
    item,
    () => surface.openNowPlaying(),
    useStudioCoverSkip(),
  );
  const isPlaying = player.status === "playing";
  const isEpisode = item.isEpisode === true;
  const isPreview = Boolean(item.previewToken);
  return (
    <div className={styles.mini} data-studio-player-surface="" {...handlers}>
      <StudioPlayerStatus />
      <StudioWarningGate />
      <Button
        variant="quiet"
        className={`${styles.miniOpen} ${miniStyles.open}`}
        aria-label={t("studio:player.openNowPlaying", {
          title: item.title,
          artist: item.artistName,
        })}
        onClick={() => surface.openNowPlaying()}
      >
        <m.span
          ref={slideRef}
          className={miniStyles.slide}
          style={{ x: offsetX }}
        >
          {trail && <MiniTrail trail={trail} />}
          <span className={styles.art}>
            <StudioNowCoverSwap swapKey={item.trackId} isInstant={isSwipeSkip}>
              <StudioPlayerArt item={item} size={44} radius={8} />
            </StudioNowCoverSwap>
          </span>
          <span className={styles.titles}>
            <StudioNowTextSwap swapKey={item.trackId} isInstant={isSwipeSkip}>
              <span className={styles.title}>{item.title}</span>
              <span className={styles.artist}>{item.artistName}</span>
            </StudioNowTextSwap>
          </span>
        </m.span>
      </Button>
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
        <IconButton
          className={`${styles.playButton} ${miniStyles.play}`}
          data-studio-play-toggle=""
          data-gated={player.pendingWarning !== null || undefined}
          onClick={player.togglePlay}
          aria-label={
            isPlaying ? t("studio:playerBar.pause") : t("studio:playerBar.play")
          }
          aria-busy={player.status === "loading" || undefined}
        >
          <StudioPlayPauseIcon isPlaying={isPlaying} />
        </IconButton>
        <MiniSkipSlot direction="forward" isShown={isEpisode} />
        <StudioPlayerCloseButton className={styles.miniClose} />
      </span>
      <MiniProgress />
    </div>
  );
}
