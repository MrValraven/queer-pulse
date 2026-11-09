import { useMemo, type Ref, type RefObject } from "react";
import { AnimatePresence } from "motion/react";
import { CollapseListItem } from "../../../shared/components/ui/CollapseListItem";
import type { QuizshowLanguage } from "../../../shared/contracts/quizshow";
import type { QuizshowDraftRound } from "../builder/quizshowDraft";
import { problemSpotKey } from "./quizshowStudioRailView";
import { railRowsOf } from "./quizshowStudioRailRowModel";
import {
  QuizshowStudioRailRound,
  type QuizshowStudioRailRoundProps,
} from "./QuizshowStudioRailRound";
import { QuizshowStudioRailWheel } from "./QuizshowStudioRailWheel";
import type { QuizshowStudioSelection } from "./quizshowStudioSelection";
import styles from "./QuizshowStudioRail.module.css";

/** The rail's stable handlers, shared by every round and wheel row. */
export type QuizshowStudioRailRowHandlers = Pick<
  QuizshowStudioRailRoundProps,
  | "onSelectRound"
  | "onSelectQuestion"
  | "onFocusRound"
  | "onFocusQuestion"
  | "onOpenQuestionMenu"
  | "onOpenRoundMenu"
  | "onAddQuestion"
  | "onMoveQuestion"
  | "onRoundDragPress"
>;

export interface QuizshowStudioRailRowsProps {
  rounds: readonly QuizshowDraftRound[];
  selection: QuizshowStudioSelection;
  problemSpots: ReadonlySet<string>;
  viewLanguage: QuizshowLanguage;
  isWide: boolean;
  quizQuestionCount: number;
  openMenuKey: string | null;
  /** The round drag's container: it must hold only the rows, in draft order. */
  roundsRef: RefObject<HTMLDivElement | null>;
  handlers: QuizshowStudioRailRowHandlers;
  isAddQuestionToRoundAllowed: (roundIndex: number) => boolean;
}

/**
 * Every draft row in one list: rounds, and wheels as divider cards above the
 * rounds they spin between. Both kinds sit in the one list the round drag
 * measures, so a drag index stays a row index, and a round dropped into a
 * range becomes one of its slices.
 */
export function QuizshowStudioRailRows({
  rounds,
  selection,
  problemSpots,
  viewLanguage,
  isWide,
  quizQuestionCount,
  openMenuKey,
  roundsRef,
  handlers,
  isAddQuestionToRoundAllowed,
}: QuizshowStudioRailRowsProps) {
  const railRows = useMemo(() => railRowsOf(rounds), [rounds]);
  return (
    <ul
      className={styles.rounds}
      ref={roundsRef as unknown as Ref<HTMLUListElement>}
    >
      <AnimatePresence initial={false}>
        {railRows.map((railRow) => {
          const round = rounds[railRow.roundIndex];
          if (!round) return null;
          const { roundIndex } = railRow;
          const isRoundSelected =
            selection.kind === "round" && selection.roundIndex === roundIndex;
          return (
            <CollapseListItem key={round.draftKey}>
              {railRow.kind === "wheel" ? (
                <QuizshowStudioRailWheel
                  roundIndex={roundIndex}
                  wheelNumber={railRow.wheelNumber}
                  sliceCount={railRow.sliceCount}
                  pick={railRow.pick}
                  isSelected={isRoundSelected}
                  hasProblem={problemSpots.has(
                    problemSpotKey(roundIndex, null),
                  )}
                  isWide={isWide}
                  openMenuKey={openMenuKey}
                  onSelectRound={handlers.onSelectRound}
                  onFocusRound={handlers.onFocusRound}
                  onOpenRoundMenu={handlers.onOpenRoundMenu}
                  onRoundDragPress={handlers.onRoundDragPress}
                />
              ) : (
                <QuizshowStudioRailRound
                  round={round}
                  roundIndex={roundIndex}
                  roundNumber={railRow.roundNumber}
                  wheelNumber={railRow.wheelNumber}
                  viewLanguage={viewLanguage}
                  selectedQuestionIndex={
                    selection.kind === "question" &&
                    selection.roundIndex === roundIndex
                      ? selection.questionIndex
                      : null
                  }
                  isRoundSelected={isRoundSelected}
                  problemSpots={problemSpots}
                  isWide={isWide}
                  isAddQuestionAllowed={isAddQuestionToRoundAllowed(roundIndex)}
                  quizQuestionCount={quizQuestionCount}
                  openMenuKey={openMenuKey}
                  {...handlers}
                />
              )}
            </CollapseListItem>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
