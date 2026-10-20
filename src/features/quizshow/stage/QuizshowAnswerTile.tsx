import type { CSSProperties } from "react";
import { FiCheck } from "react-icons/fi";
import type { QuizshowTeamColorKey } from "../../../shared/contracts/quizshow";
import { QuizshowShape } from "../QuizshowShape";
import { QUIZSHOW_SWATCHES } from "../quizshowSwatches";
import styles from "./QuizshowStage.module.css";
import type { QuizshowStageSize } from "./quizshowText";

type QuizshowAnswerTileState = "idle" | "selected" | "correct" | "dimmed";

interface QuizshowAnswerTileProps {
  colorKey: QuizshowTeamColorKey;
  letter: string;
  text: string;
  size: QuizshowStageSize;
  state: QuizshowAnswerTileState;
  onSelect?: () => void;
  isDisabled?: boolean;
  ariaLabel: string;
}

const STATE_CLASS_NAMES: Record<QuizshowAnswerTileState, string> = {
  idle: "",
  selected: styles.tileSelected ?? "",
  correct: styles.tileCorrect ?? "",
  dimmed: styles.tileDimmed ?? "",
};

const SHAPE_SIZES = {
  screen: "screen",
  phone: "medium",
  preview: "small",
} as const;

/** One answer: a letter, a shape and a colour, so no answer rests on colour alone.
 *  A button when `onSelect` is set (phones), a plain group otherwise (the screen). */
export function QuizshowAnswerTile({
  colorKey,
  letter,
  text,
  size,
  state,
  onSelect,
  isDisabled = false,
  ariaLabel,
}: QuizshowAnswerTileProps) {
  const swatch = QUIZSHOW_SWATCHES[colorKey];
  const tileStyle = {
    "--quizshow-tile-fill": swatch.fillVar,
    "--quizshow-tile-ink": swatch.inkVar,
  } as CSSProperties;
  const className = [styles.tile, styles[size], STATE_CLASS_NAMES[state]]
    .filter(Boolean)
    .join(" ");
  const content = (
    <>
      <span className={styles.letter} aria-hidden="true">
        {letter}
      </span>
      <QuizshowShape
        colorKey={colorKey}
        size={SHAPE_SIZES[size]}
        label={null}
      />
      <span className={styles.tileText}>{text}</span>
      {/* The correct answer carries a check as well as its jade edge, so it never rests on colour. The caller's label names it. */}
      {state === "correct" && (
        <span className={styles.tileCheck} aria-hidden="true">
          <FiCheck fill="none" focusable="false" />
        </span>
      )}
    </>
  );

  if (onSelect === undefined) {
    return (
      <div
        role="group"
        aria-label={ariaLabel}
        className={className}
        style={tileStyle}
      >
        {content}
      </div>
    );
  }
  return (
    <button
      type="button"
      className={className}
      style={tileStyle}
      aria-label={ariaLabel}
      aria-pressed={state === "selected"}
      aria-disabled={isDisabled}
      onClick={() => {
        if (!isDisabled) onSelect();
      }}
    >
      {content}
    </button>
  );
}
