import type { PointerEvent as ReactPointerEvent } from "react";
import { FiChevronDown, FiChevronUp, FiMenu } from "react-icons/fi";
import { IconButton } from "../../../shared/components/ui";
import styles from "./QuizshowQuestionEditor.module.css";

interface QuizshowReorderControlsProps {
  index: number;
  count: number;
  moveUpLabel: string;
  moveDownLabel: string;
  dragLabel: string;
  onMove: (fromIndex: number, toIndex: number) => void;
  gripHandlers: {
    onPointerDown: (event: ReactPointerEvent) => void;
  };
}

/**
 * The reorder trio for a list row: a grip for the pointer drag and the up and
 * down buttons that stay the keyboard and assistive-tech path. An end button
 * is `aria-disabled` so focus never falls off it.
 */
export function QuizshowReorderControls({
  index,
  count,
  moveUpLabel,
  moveDownLabel,
  dragLabel,
  onMove,
  gripHandlers,
}: QuizshowReorderControlsProps) {
  const isFirst = index === 0;
  const isLast = index === count - 1;
  return (
    <div className={styles.reorder}>
      <button
        type="button"
        className={styles.grip}
        aria-label={dragLabel}
        onPointerDown={gripHandlers.onPointerDown}
      >
        <FiMenu aria-hidden />
      </button>
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
