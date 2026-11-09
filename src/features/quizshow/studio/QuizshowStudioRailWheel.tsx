import { memo, useId } from "react";
import { FiDisc, FiMoreHorizontal } from "react-icons/fi";
import { IconButton } from "../../../shared/components/ui";
import type { QuizshowWheelPick } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { isContextMenuKey, STUDIO_PRESS_FOCUS } from "./quizshowStudioRailView";
import {
  STUDIO_RAIL_ITEM_ATTRIBUTE,
  STUDIO_ROUND_HEADER_ATTRIBUTE,
} from "./quizshowStudioDom";
import type { QuizshowStudioRailRoundProps } from "./QuizshowStudioRailRound";
import styles from "./QuizshowStudioRail.module.css";

export interface QuizshowStudioRailWheelProps extends Pick<
  QuizshowStudioRailRoundProps,
  | "roundIndex"
  | "isWide"
  | "openMenuKey"
  | "onSelectRound"
  | "onFocusRound"
  | "onOpenRoundMenu"
  | "onRoundDragPress"
> {
  /** "Wheel 2": the wheel's place among the wheel rows. */
  wheelNumber: number;
  /** The rounds its range holds right now; 0 for a wheel with nothing after it. */
  sliceCount: number;
  pick: QuizshowWheelPick;
  isSelected: boolean;
  hasProblem: boolean;
}

/**
 * A wheel row in the rail: a slim divider card above the rounds it spins
 * between. It selects, drags, follows focus and opens its menu exactly like
 * a round header, and holds no questions, so it has no add button.
 */
function QuizshowStudioRailWheelBase(props: QuizshowStudioRailWheelProps) {
  const { roundIndex, wheelNumber, sliceCount, isSelected, hasProblem } = props;
  const { t } = useTranslation();
  const problemId = useId();
  const numberId = useId();
  const cardLineKey =
    props.pick === "question"
      ? "quizshow:studio.rail.wheelCardQuestion"
      : "quizshow:studio.rail.wheelCardRound";
  return (
    <div className={styles.wheel} data-selected={isSelected || undefined}>
      <button
        type="button"
        className={styles.wheelButton}
        {...{
          [STUDIO_ROUND_HEADER_ATTRIBUTE]: "",
          [STUDIO_RAIL_ITEM_ATTRIBUTE]: "",
        }}
        data-round-index={roundIndex}
        tabIndex={isSelected ? 0 : -1}
        aria-current={isSelected ? "true" : undefined}
        aria-describedby={hasProblem ? `${numberId} ${problemId}` : numberId}
        onPointerDown={(event) => {
          if (props.isWide && event.pointerType !== "touch") {
            props.onRoundDragPress(roundIndex, event);
          }
        }}
        onFocus={() => {
          if (!isSelected) props.onFocusRound(roundIndex);
        }}
        onClick={(event) => {
          event.currentTarget.focus(STUDIO_PRESS_FOCUS);
          props.onSelectRound(roundIndex);
        }}
        onKeyDown={(event) => {
          if (!isContextMenuKey(event)) return;
          event.preventDefault();
          props.onOpenRoundMenu(roundIndex, event.currentTarget, "open");
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          props.onOpenRoundMenu(roundIndex, event.currentTarget, "open");
        }}
      >
        <FiDisc aria-hidden className={styles.wheelIcon} />
        <span className={styles.wheelLine}>
          {t(cardLineKey, { count: sliceCount })}
        </span>
        {hasProblem && <span className={styles.roundDot} aria-hidden />}
      </button>
      <span id={numberId} className={styles.visuallyHidden}>
        {t("quizshow:studio.inspector.wheel.eyebrow", { number: wheelNumber })}
      </span>
      {hasProblem && (
        <span id={problemId} className={styles.visuallyHidden}>
          {t("quizshow:studio.rail.needsFixing")}
        </span>
      )}
      <IconButton
        size="sm"
        tone="dark"
        tabIndex={-1}
        className={styles.roundMore}
        aria-label={t("quizshow:studio.rail.wheelMenu", {
          number: wheelNumber,
        })}
        aria-haspopup="menu"
        aria-expanded={props.openMenuKey === `round-${roundIndex}`}
        onClick={(event) =>
          props.onOpenRoundMenu(roundIndex, event.currentTarget, "toggle")
        }
      >
        <FiMoreHorizontal aria-hidden />
      </IconButton>
    </div>
  );
}

export const QuizshowStudioRailWheel = memo(QuizshowStudioRailWheelBase);
