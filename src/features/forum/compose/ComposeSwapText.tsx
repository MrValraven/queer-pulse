import { type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";

// ── A line of text that fades when it changes ───────────────────────────────
// The composer has a few readouts that rewrite themselves as the member types
// or chooses (the kind tip, the title tip, the detected language). Swapping
// the words in one frame reads as a flicker, so the old line fades out and the
// new one fades in over it. The live region stays on the caller's element,
// which never remounts, so screen readers still hear each new line once.

export interface ComposeSwapTextProps {
  /** Changes whenever the text does. A new key is what starts the fade. An
   *  empty key means "no line": nothing is drawn, and the last line fades
   *  out, so an empty readout takes no room in a wrapping row. */
  swapKey: string;
  children: ReactNode;
  className?: string;
}

export function ComposeSwapText({
  swapKey,
  children,
  className,
}: ComposeSwapTextProps) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence mode="wait" initial={false}>
      {swapKey !== "" && (
        <m.span
          key={swapKey}
          className={className}
          initial={{ opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -2 }}
          transition={{
            duration: reducedMotion ? 0 : 0.14,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ display: "inline-block" }}
        >
          {children}
        </m.span>
      )}
    </AnimatePresence>
  );
}
