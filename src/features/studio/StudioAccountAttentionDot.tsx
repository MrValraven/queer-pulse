import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import styles from "./StudioAccountAttentionDot.module.css";

/** The coral dot on the avatar while a creator badge waits behind the menu.
 *  It fades in and out, and skips the fade under reduced motion. */
export function StudioAccountAttentionDot({ isShown }: { isShown: boolean }) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence initial={false}>
      {isShown && (
        <m.span
          key="attention"
          aria-hidden
          data-testid="studio-attention-dot"
          className={styles.dot}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: reducedMotion ? 0 : 0.18 }}
        />
      )}
    </AnimatePresence>
  );
}
