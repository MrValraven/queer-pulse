import { AnimatePresence, m } from "motion/react";
import type { ReactNode } from "react";
import { FiPause, FiPlay } from "react-icons/fi";
import { useChipMotion } from "../../../../shared/components/ui";
import styles from "./StudioIconSwap.module.css";

/** Crossfades one icon into the next in place. Both share a single grid
 *  cell while the old one fades and shrinks out and the new one grows in,
 *  so the button never shows an empty frame. Instant under reduced motion.
 *  Decorative: the button around it carries the label. */
export function StudioIconSwap({
  iconKey,
  children,
}: {
  iconKey: string;
  children: ReactNode;
}) {
  const { chip } = useChipMotion();
  return (
    <span className={styles.swap} aria-hidden="true">
      <AnimatePresence initial={false}>
        <m.span
          key={iconKey}
          className={styles.icon}
          initial={chip.initial}
          animate={chip.animate}
          exit={chip.exit}
          transition={chip.transition}
        >
          {children}
        </m.span>
      </AnimatePresence>
    </span>
  );
}

/** The transport's play or pause glyph, swapping in place on a toggle. */
export function StudioPlayPauseIcon({ isPlaying }: { isPlaying: boolean }) {
  return (
    <StudioIconSwap iconKey={isPlaying ? "pause" : "play"}>
      {isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
    </StudioIconSwap>
  );
}
