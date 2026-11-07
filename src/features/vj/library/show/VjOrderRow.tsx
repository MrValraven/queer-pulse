import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { m, useIsPresent } from "motion/react";
import { FiChevronDown, FiChevronUp, FiMenu } from "react-icons/fi";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { IconButton } from "../../../../shared/components/ui";
import { keepOnFrameLoop } from "../../../gatherings/checkin/checkinMotion";
import styles from "./VjShowParts.module.css";

/** The app's primary ease (`--ease`) and the row timings that go with it
 *  (the pack rail's, so every VJ list moves alike). */
const ROW_EASE = [0.22, 0.68, 0.16, 1] as const;
const FOLD_SECONDS = 0.28;
const GLIDE_SECONDS = 0.25;

export interface VjOrderRowProps {
  /** The row's index in the list, from 0. */
  position: number;
  total: number;
  isDragging: boolean;
  gripProps: { onPointerDown: (event: ReactPointerEvent) => void };
  moveUpLabel: string;
  moveDownLabel: string;
  onMove: (direction: -1 | 1) => void;
  /** The row's own content and actions, between the grip and the move buttons. */
  children: ReactNode;
  /** Folds under the row (an edit form, the items editor). */
  below?: ReactNode;
}

/**
 * One row of an ordered show list (scenes, set lists, set list items). It
 * grows in when added and folds away when removed; a reorder glides it to its
 * new slot. The grip is the pointer path; the up and down buttons are the
 * keyboard path, blocked at the ends. Render it inside `AnimatePresence`
 * under the `<ol>` that holds the list's `listRef`.
 */
export function VjOrderRow({
  position,
  total,
  isDragging,
  gripProps,
  moveUpLabel,
  moveDownLabel,
  onMove,
  children,
  below,
}: VjOrderRowProps) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const foldSeconds = reducedMotion ? 0 : FOLD_SECONDS;
  const isFirst = position <= 0;
  const isLast = position >= total - 1;

  return (
    <m.li
      layout="position"
      inert={!isPresent}
      className={styles.rowItem}
      data-dragging={isDragging ? "true" : undefined}
      onUpdate={keepOnFrameLoop}
      initial={{ height: 0, opacity: 0, overflow: "hidden" }}
      animate={{ height: "auto", opacity: 1, overflow: "visible" }}
      exit={{
        height: 0,
        opacity: 0,
        overflow: "hidden",
        transition: {
          duration: foldSeconds,
          ease: ROW_EASE,
          overflow: { duration: 0 },
        },
      }}
      transition={{
        duration: foldSeconds,
        ease: ROW_EASE,
        overflow: { duration: 0, delay: foldSeconds },
        layout: reducedMotion
          ? { duration: 0 }
          : { duration: GLIDE_SECONDS, ease: ROW_EASE },
      }}
    >
      <div className={styles.row}>
        <span className={styles.grip} aria-hidden="true" {...gripProps}>
          <FiMenu fill="none" focusable="false" />
        </span>
        <div className={styles.content}>{children}</div>
        <div className={styles.moves}>
          <IconButton
            className={styles.move}
            aria-label={moveUpLabel}
            aria-disabled={isFirst ? "true" : undefined}
            onClick={() => {
              if (!isFirst) onMove(-1);
            }}
          >
            <FiChevronUp aria-hidden="true" fill="none" focusable="false" />
          </IconButton>
          <IconButton
            className={styles.move}
            aria-label={moveDownLabel}
            aria-disabled={isLast ? "true" : undefined}
            onClick={() => {
              if (!isLast) onMove(1);
            }}
          >
            <FiChevronDown aria-hidden="true" fill="none" focusable="false" />
          </IconButton>
        </div>
      </div>
      {below}
    </m.li>
  );
}
