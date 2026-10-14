import { type ReactNode } from "react";
import { m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { keepOnFrameLoop } from "../../../features/gatherings/checkin/checkinMotion";

/** Same curve as the shared `Collapse`, so rows fold like every disclosure. */
const ROW_EASE = [0.22, 0.68, 0.16, 1] as const;

/**
 * One animated list row, the `Collapse` motion on an `li`: it grows in, and
 * on removal it fades and folds its height away so the rows below glide up.
 * Keep the row's padding and border on a child, so they fold with it. While
 * it folds it is `inert`, so focus and clicks never land on a row on its way
 * out. Overflow opens only once the height has settled, so focus rings are
 * never clipped at rest. Reduced motion makes it instant. `keepOnFrameLoop`
 * keeps the last opacity frame from flashing back.
 */
export function CollapseListItem({ children }: { children: ReactNode }) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const duration = reducedMotion ? 0 : 0.28;
  return (
    <m.li
      inert={!isPresent}
      style={{ display: "flow-root" }}
      onUpdate={keepOnFrameLoop}
      initial={{ height: 0, opacity: 0, overflow: "hidden" }}
      animate={{ height: "auto", opacity: 1, overflow: "visible" }}
      exit={{
        height: 0,
        opacity: 0,
        overflow: "hidden",
        transition: { duration, ease: ROW_EASE, overflow: { duration: 0 } },
      }}
      transition={{
        duration,
        ease: ROW_EASE,
        overflow: { duration: 0, delay: duration },
      }}
    >
      {children}
    </m.li>
  );
}
