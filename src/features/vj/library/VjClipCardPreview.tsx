import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type { VjClipDTO } from "../../../shared/contracts/vj";
import styles from "./VjClips.module.css";

const EASE = [0.22, 0.68, 0.16, 1] as const;

/**
 * Fades the clip's animated preview over its thumbnail while `isActive`;
 * nothing for a clip with no preview yet, where the still thumbnail stays.
 * The video mounts only while active, so a grid of cards never loads or plays
 * more than the one being looked at. Under reduced motion the thumbnail stays
 * still.
 */
export function VjClipCardPreview({
  clip,
  isActive,
}: {
  clip: VjClipDTO;
  isActive: boolean;
}) {
  const { reducedMotion } = useMotionPrefs();
  if (clip.previewUrl === null) return null;
  const isShown = isActive && !reducedMotion;

  return (
    <AnimatePresence initial={false}>
      {isShown ? (
        <m.video
          key="preview"
          className={styles.cardPreview}
          src={clip.previewUrl}
          poster={clip.thumbnailUrl}
          width={clip.width}
          height={clip.height}
          aria-hidden="true"
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
        />
      ) : null}
    </AnimatePresence>
  );
}
