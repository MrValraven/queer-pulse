import {
  useRef,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, m } from "motion/react";
import { FiPause, FiPlay } from "react-icons/fi";
import { ImageSlot, useChipMotion } from "../../../../shared/components/ui";
import { useVerticalSwipe } from "../../../../shared/hooks/useVerticalSwipe";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  useStudioPlayer,
  useStudioPlayerClock,
  type StudioQueueItem,
} from "../studioPlayerContext";
import { useStudioPlayerSurface } from "../studioPlayerSurface";
import { StudioEpisodeSkipButton } from "./StudioEpisodeSkipButton";
import { StudioPlayerStatus } from "./StudioPlayerBar";
import styles from "../../StudioPlayer.module.css";

/** The thin progress line: decorative, the clock lives only here. */
function MiniProgress() {
  const { currentTime, duration } = useStudioPlayerClock();
  const progress =
    duration && duration > 0 ? Math.min(1, currentTime / duration) : 0;
  return (
    <span className={styles.miniProgress} aria-hidden="true">
      <span
        className={styles.miniProgressFill}
        style={{ transform: `scaleX(${progress})` }}
      />
    </span>
  );
}

/** Upward travel past which a press counts as a drag and its click is dropped. */
const DRAG_CLICK_SLOP_PX = 10;
/** A click this soon after a drag's release ends that drag; later ones pass. */
const DRAG_CLICK_WINDOW_MS = 500;

/**
 * The card's swipe up. useVerticalSwipe captures the pointer on the card,
 * which retargets the release and its click to the card, so a tap on a
 * button would land nowhere. The press hands the capture on to the pressed
 * button; move and up events still bubble to the card, so a swipe started
 * anywhere still opens Now playing. A pointer click within
 * DRAG_CLICK_WINDOW_MS of a drag's release ends that drag and is dropped;
 * keyboard clicks (detail 0) and any later click always pass, so a click
 * that arrives with no pointerdown (some assistive tech) is never lost.
 */
function useMiniCardSwipe(onSwipe: () => void) {
  const hasDraggedRef = useRef(false);
  const dragEndedAtRef = useRef<number | null>(null);
  const swipe = useVerticalSwipe({
    direction: "up",
    onSwipe: () => {
      hasDraggedRef.current = true;
      onSwipe();
    },
    onDrag: (offset) => {
      if (offset > DRAG_CLICK_SLOP_PX) hasDraggedRef.current = true;
    },
  });
  return {
    ...swipe,
    onPointerDown(event: ReactPointerEvent<HTMLElement>) {
      hasDraggedRef.current = false;
      dragEndedAtRef.current = null;
      swipe.onPointerDown(event);
      // The hook ignores mouse presses, so a mouse keeps its own capture.
      if (event.pointerType === "mouse") return;
      const button = (event.target as Element).closest("button");
      if (!button) return;
      try {
        button.setPointerCapture(event.pointerId);
      } catch {
        // jsdom or unsupported: the click still reaches the button.
      }
    },
    onPointerUp(event: ReactPointerEvent<HTMLElement>) {
      swipe.onPointerUp(event);
      if (hasDraggedRef.current) dragEndedAtRef.current = event.timeStamp;
      hasDraggedRef.current = false;
    },
    onClickCapture(event: ReactMouseEvent<HTMLElement>) {
      const dragEndedAt = dragEndedAtRef.current;
      dragEndedAtRef.current = null;
      const isDragEnd =
        dragEndedAt !== null &&
        event.timeStamp - dragEndedAt <= DRAG_CLICK_WINDOW_MS;
      if (!isDragEnd || event.detail === 0) return;
      event.preventDefault();
      event.stopPropagation();
    },
  };
}

/** An episode's skip beside the play button (spec 5.6). It grows in and
 *  folds away by width and fade, so the card glides between music and
 *  episodes. Overflow clips only while it moves, keeping the focus ring
 *  whole at rest. */
function MiniSkipSlot({
  direction,
  isShown,
}: {
  direction: "back" | "forward";
  isShown: boolean;
}) {
  const { transition } = useChipMotion();
  return (
    <AnimatePresence initial={false}>
      {isShown && (
        <m.span
          key={direction}
          className={styles.miniSkipSlot}
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
          <StudioEpisodeSkipButton
            direction={direction}
            className={styles.miniSkip}
          />
        </m.span>
      )}
    </AnimatePresence>
  );
}

/** The phone mini player (spec 7.1): tap or swipe up for Now playing. Title
 *  and artist are plain text for every item, private previews included, and
 *  the card offers no save. */
export function StudioMiniPlayer({ item }: { item: StudioQueueItem }) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const surface = useStudioPlayerSurface();
  const swipe = useMiniCardSwipe(() => surface.openNowPlaying());
  const isPlaying = player.status === "playing";
  const isEpisode = item.isEpisode === true;
  return (
    <div className={styles.mini} {...swipe}>
      <StudioPlayerStatus />
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
        <MiniSkipSlot direction="back" isShown={isEpisode} />
        <button
          type="button"
          className={styles.playButton}
          onClick={player.togglePlay}
          aria-label={
            isPlaying ? t("studio:playerBar.pause") : t("studio:playerBar.play")
          }
          aria-busy={player.status === "loading" || undefined}
        >
          {isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
        </button>
        <MiniSkipSlot direction="forward" isShown={isEpisode} />
      </span>
      <MiniProgress />
    </div>
  );
}
