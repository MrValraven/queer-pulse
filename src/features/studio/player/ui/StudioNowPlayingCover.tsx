import type { RefObject } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { ImageSlot } from "../../../../shared/components/ui";
import { STUDIO_EXIT, STUDIO_FADE } from "../../studioMotion";
import type { StudioQueueItem } from "../studioPlayerContext";
import { useNowPlayingCoverSwipe } from "./useNowPlayingCoverSwipe";
import { useStudioCoverSkip } from "./useStudioCoverSkip";
import styles from "./StudioNowPlaying.module.css";

/** Under reduced motion every move becomes a short fade (Design language). */
const REDUCED_FADE = { duration: 0.12 } as const;

/** The leaving art's fade, resolved with AnimatePresence's `custom`: gone
 *  at once when a swipe's skip slides the next one in. */
const COVER_EXIT_VARIANTS = {
  exit: (isSwipeSkip: boolean) => ({
    opacity: 0,
    transition: isSwipeSkip ? { duration: 0 } : STUDIO_EXIT,
  }),
  reducedExit: { opacity: 0, transition: REDUCED_FADE },
};

/** Now playing's artwork. It crossfades when the track changes (as the bar
 *  does), and on a phone it takes the swipes: down from the top of the
 *  sheet closes, sideways skips. The image is decorative: the title below
 *  names the track. */
export function StudioNowPlayingCover({
  item,
  isPhone,
  sheetRef,
  frameRef,
  onClose,
}: {
  item: StudioQueueItem;
  isPhone: boolean;
  sheetRef: RefObject<HTMLElement | null>;
  frameRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}) {
  const { reducedMotion } = useMotionPrefs();
  const skip = useStudioCoverSkip();
  const { coverRef, offsetX, isSwipeSkip } = useNowPlayingCoverSwipe({
    isEnabled: isPhone,
    sheetRef,
    frameRef,
    onClose,
    ...skip,
  });
  return (
    <m.div
      ref={coverRef}
      className={styles.cover}
      data-swipe={isPhone ? "" : undefined}
      style={{ x: offsetX }}
    >
      {/* A swipe's skip swaps the art at once: the slide carries it in. */}
      <AnimatePresence initial={false} custom={isSwipeSkip}>
        <m.div
          key={item.trackId}
          className={styles.coverLayer}
          initial={isSwipeSkip ? false : { opacity: 0 }}
          animate={{
            opacity: 1,
            transition: reducedMotion ? REDUCED_FADE : STUDIO_FADE,
          }}
          variants={COVER_EXIT_VARIANTS}
          exit={reducedMotion ? "reducedExit" : "exit"}
        >
          <ImageSlot
            src={item.coverUrl ?? undefined}
            tint={item.tint}
            width="100%"
            height="100%"
            radius={16}
            placeholder=""
            style={{ position: "absolute", inset: 0 }}
          />
        </m.div>
      </AnimatePresence>
    </m.div>
  );
}
