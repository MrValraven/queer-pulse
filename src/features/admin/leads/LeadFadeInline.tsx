import type { ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";

const FADE_SECONDS = 0.2;
const FADE_EASE = [0.22, 0.68, 0.16, 1] as const;

/** A short inline piece (the "edited" mark, the header's location) that
 *  fades in and out as it comes and goes. A block fold would be invalid
 *  inside the paragraphs these sit in. */
export function LeadFadeInline({
  isShown,
  children,
}: {
  isShown: boolean;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  const duration = reducedMotion ? 0 : FADE_SECONDS;
  return (
    <AnimatePresence initial={false}>
      {isShown && (
        <m.span
          key="shown"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration, ease: FADE_EASE } }}
          exit={{ opacity: 0, transition: { duration, ease: FADE_EASE } }}
        >
          {children}
        </m.span>
      )}
    </AnimatePresence>
  );
}
