import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { keepOnFrameLoop } from "../gatherings/checkin/checkinMotion";
import styles from "./ProfileEventsSection.module.css";

/** The shared `Collapse` curve and length, so the grid moves like a fold. */
const GLIDE_EASE = [0.22, 0.68, 0.16, 1] as const;
const GLIDE_SECONDS = 0.28;
/** A poster's own fade, and the stagger between posters that arrive
 *  together, as the hub's grid uses. */
const CELL_SECONDS = 0.22;
const CELL_STAGGER_SECONDS = 0.055;

/**
 * One poster cell, as a keyed child of `<AnimatePresence initial={false}>`.
 * A cell the button adds fades in after the ones before it (`arrivalIndex`
 * steps the delay); a cell it takes away fades and shrinks a touch, and the
 * cells after it glide into place. It is `inert` while it leaves, and
 * reduced motion makes all of it instant.
 */
export function ProfileEventCell({
  arrivalIndex,
  children,
}: {
  arrivalIndex: number;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const duration = reducedMotion ? 0 : CELL_SECONDS;
  const delay = reducedMotion ? 0 : arrivalIndex * CELL_STAGGER_SECONDS;
  return (
    <m.div
      layout="position"
      inert={!isPresent}
      onUpdate={keepOnFrameLoop}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { duration, ease: GLIDE_EASE, delay },
      }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration, ease: GLIDE_EASE }}
    >
      {children}
    </m.div>
  );
}

/**
 * Animates its own height to follow its content's, on the way up and down,
 * so the grid opens and closes like the shared `Collapse` and everything
 * below it moves with it. The content is measured with a ResizeObserver.
 * It clips only while it moves, so posters' focus rings and hover lift are
 * never cut at rest. `onSettled` runs when a height change has finished.
 */
export function HeightGlide({
  children,
  onSettled,
}: {
  children: ReactNode;
  onSettled: () => void;
}) {
  const { reducedMotion } = useMotionPrefs();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const [isGliding, setIsGliding] = useState(false);
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const observer = new ResizeObserver(() => {
      setContentHeight(content.offsetHeight);
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, []);
  return (
    <m.div
      className={styles.glide}
      style={{ overflow: isGliding ? "hidden" : "visible" }}
      initial={false}
      animate={{ height: contentHeight ?? "auto" }}
      transition={{
        duration: reducedMotion ? 0 : GLIDE_SECONDS,
        ease: GLIDE_EASE,
      }}
      onAnimationStart={() => setIsGliding(true)}
      onAnimationComplete={() => {
        setIsGliding(false);
        onSettled();
      }}
    >
      <div ref={contentRef}>{children}</div>
    </m.div>
  );
}
