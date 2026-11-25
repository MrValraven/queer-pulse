import type { PointerEvent as ReactPointerEvent } from "react";
import { FiChevronDown, FiChevronUp, FiMenu } from "react-icons/fi";
import { IconButton } from "../../../shared/components/ui";
import styles from "./QuizshowQuestionEditor.module.css";

interface QuizshowReorderGripProps {
  dragLabel: string;
  gripHandlers: {
    onPointerDown: (event: ReactPointerEvent) => void;
  };
}

interface QuizshowReorderArrowsProps {
  index: number;
  count: number;
  moveUpLabel: string;
  moveDownLabel: string;
  onMove: (fromIndex: number, toIndex: number) => void;
}

type QuizshowReorderControlsProps = QuizshowReorderGripProps &
  QuizshowReorderArrowsProps;

/**
 * The grip a pointer drags a list row by: the shared icon button (its focus
 * ring and 44px target), with the grab cursor and `touch-action: none` the
 * drag needs on top.
 */
export function QuizshowReorderGrip({
  dragLabel,
  gripHandlers,
}: QuizshowReorderGripProps) {
  return (
    <IconButton
      size="sm"
      className={styles.grip}
      aria-label={dragLabel}
      onPointerDown={gripHandlers.onPointerDown}
    >
      <FiMenu aria-hidden />
    </IconButton>
  );
}

/**
 * The up and down buttons of a list row, side by side: the keyboard and
 * assistive-tech path next to the grip. An end button is `aria-disabled` so
 * focus never falls off it.
 */
export function QuizshowReorderArrows({
  index,
  count,
  moveUpLabel,
  moveDownLabel,
  onMove,
}: QuizshowReorderArrowsProps) {
  const isFirst = index === 0;
  const isLast = index === count - 1;
  return (
    <div className={styles.reorderArrows}>
      <IconButton
        size="sm"
        aria-label={moveUpLabel}
        aria-disabled={isFirst}
        onClick={() => {
          if (!isFirst) onMove(index, index - 1);
        }}
      >
        <FiChevronUp aria-hidden />
      </IconButton>
      <IconButton
        size="sm"
        aria-label={moveDownLabel}
        aria-disabled={isLast}
        onClick={() => {
          if (!isLast) onMove(index, index + 1);
        }}
      >
        <FiChevronDown aria-hidden />
      </IconButton>
    </div>
  );
}

/**
 * The reorder trio for a list row: a grip for the pointer drag and the up and
 * down buttons. A row that lays them out apart (the builder's order rows) uses
 * the grip and the arrows on their own.
 */
export function QuizshowReorderControls({
  dragLabel,
  gripHandlers,
  ...arrowProps
}: QuizshowReorderControlsProps) {
  return (
    <div className={styles.reorder}>
      <QuizshowReorderGrip dragLabel={dragLabel} gripHandlers={gripHandlers} />
      <QuizshowReorderArrows {...arrowProps} />
    </div>
  );
}
