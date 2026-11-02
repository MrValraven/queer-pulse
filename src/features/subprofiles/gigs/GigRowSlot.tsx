import { useEffect, type ReactNode } from "react";
import { m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { cx } from "../../../shared/lib/cx";
import { REORDER_EASE } from "../reorderMotion";
import styles from "./GigRowGroup.module.css";

const SLOT_DURATION = 0.22;

/**
 * A gig row's animated shell inside `GigRowGroup`'s drag container: height +
 * opacity in and out, instant under reduced motion. It is `inert` while
 * leaving, so the drag engine's `liveRowsOf` skips it and it takes no
 * pointer. Overflow clips only while moving (the animation targets own it),
 * so focus rings show at rest. Must sit directly inside an `AnimatePresence`.
 */
export function GigRowSlot({
  children,
  isHeld,
  onExitStart,
}: {
  children: ReactNode;
  /** True while the row is held by the grip drag (lifts above neighbours). */
  isHeld: boolean;
  /** Called once when the row starts leaving. */
  onExitStart: () => void;
}) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  useEffect(() => {
    if (!isPresent) onExitStart();
  }, [isPresent, onExitStart]);
  const duration = reducedMotion ? 0 : SLOT_DURATION;
  return (
    <m.div
      className={cx(
        styles.slot,
        isHeld && styles.slotHeld,
        !isPresent && styles.slotExiting,
      )}
      inert={!isPresent}
      initial={{ height: 0, opacity: 0, overflow: "hidden" }}
      animate={{ height: "auto", opacity: 1, overflow: "visible" }}
      exit={{ height: 0, opacity: 0, overflow: "hidden" }}
      transition={{
        duration,
        ease: REORDER_EASE,
        overflow: { duration: 0, delay: duration },
      }}
    >
      {children}
    </m.div>
  );
}
