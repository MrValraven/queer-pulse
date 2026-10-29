import { type ReactNode, type Ref } from "react";
import { m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";

/** The outgoing view clears quickly so the incoming one reads as the answer. */
const FADE_OUT_SECONDS = 0.14;
const FADE_IN_SECONDS = 0.22;
/** The incoming view starts as the outgoing one is mostly gone, so the two
 *  never read as a double exposure. */
const FADE_IN_DELAY_SECONDS = 0.06;
const FADE_EASE = [0.22, 0.68, 0.16, 1] as const;

/**
 * One whole view of a panel (a tab's content, a list in its loading, empty
 * or filled state), faded in and out with no height of its own. Give it a
 * `key` that names the view and place it inside
 * `<AnimatePresence mode="popLayout" initial={false}>` whose parent is
 * `position: relative`: the leaving view then drops out of the flow while it
 * fades, and a `MeasuredHeightFrame` around the parent eases the panel from
 * the old height to the new one in a single glide. The leaving view is
 * `inert`, so focus and clicks never land on content on its way out.
 * Reduced motion makes the swap instant.
 */
export function ViewFade({
  children,
  className,
  ref,
}: {
  children: ReactNode;
  className?: string;
  /** `AnimatePresence mode="popLayout"` measures the leaving view through
   *  this ref, so it must reach the element. */
  ref?: Ref<HTMLDivElement>;
}) {
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  return (
    <m.div
      ref={ref}
      className={className}
      inert={!isPresent}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: {
          duration: isReducedMotion ? 0 : FADE_IN_SECONDS,
          delay: isReducedMotion ? 0 : FADE_IN_DELAY_SECONDS,
          ease: FADE_EASE,
        },
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: isReducedMotion ? 0 : FADE_OUT_SECONDS,
          ease: FADE_EASE,
        },
      }}
    >
      {children}
    </m.div>
  );
}

/**
 * One row of a list that gains rows in place (a "Show more" page), faded in
 * and out with no height of its own. The surrounding `MeasuredHeightFrame`
 * eases the list to its new height once, so the rows never fold one by one.
 * Rows present when the list's `AnimatePresence initial={false}` first
 * renders appear at rest.
 */
export function FadeListItem({ children }: { children: ReactNode }) {
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const duration = isReducedMotion ? 0 : FADE_IN_SECONDS;
  return (
    <m.li
      inert={!isPresent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: isReducedMotion ? 0 : FADE_OUT_SECONDS },
      }}
      transition={{ duration, ease: FADE_EASE }}
    >
      {children}
    </m.li>
  );
}
