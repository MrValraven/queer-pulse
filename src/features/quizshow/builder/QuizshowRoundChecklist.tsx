import { useId, type ReactNode } from "react";
import { FiLock } from "react-icons/fi";
import { Button, Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { QuizshowLanguage } from "../../../shared/contracts/quizshow";
import { isWheelRoundKind } from "../quizshowWheel";
import { templateCardTitleOf } from "../templates/quizshowTemplateResponse";
import {
  useQuizshowRoundSelection,
  type QuizshowRoundSelection,
  type QuizshowSelectableRound,
} from "./quizshowRoundSelection";
import styles from "./QuizshowImport.module.css";

interface QuizshowRoundChecklistProps {
  /** The source's rows in source order (`QuizshowImportSource.rounds` or a template preview's). */
  rounds: readonly QuizshowSelectableRound[];
  /** The language row titles read in (the studio's view language). */
  language: QuizshowLanguage;
  /** False holds the adults rows, each with its reason; left out, none is held. */
  isAdultsAllowed?: boolean;
  /** An import is under way: the submit holds. */
  isPending: boolean;
  /** "Add these rounds": the checked row indexes, in source order. */
  onSubmit: (roundIndexes: number[]) => void;
}

/**
 * One row: kind, title, question count. A wheel row says once, while checked,
 * that its slices come along; a locked slice is muted with a lock and reads
 * that line through `aria-describedby`. A held row (18+ off) is muted with a
 * lock too and says why under itself.
 */
function ChecklistRow({
  round,
  language,
  isChecked,
  isLocked,
  isHeld,
  wheelName,
  wheelHintId,
  hasSliceHint,
  onToggle,
}: {
  round: QuizshowSelectableRound;
  language: QuizshowLanguage;
  isChecked: boolean;
  isLocked: boolean;
  /** The row needs 18+ and the quiz is not: it cannot be checked. */
  isHeld: boolean;
  /** The wheel this row is a slice of; null for a row on no wheel. */
  wheelName: string | null;
  /** The id of this row's wheel hint (the wheel's own, or the one a slice points at). */
  wheelHintId: string;
  /** A wheel row that holds slices and is checked: it says so under itself. */
  hasSliceHint: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const sliceHintId = useId();
  const heldReasonId = useId();
  const title = templateCardTitleOf(round.title, language);
  const isSlice = wheelName !== null;
  const isHintShownHere = isSlice && !isLocked && !isHeld;
  let describedBy: string | undefined;
  if (isHeld) describedBy = heldReasonId;
  else if (isLocked) describedBy = wheelHintId;
  else if (isHintShownHere) describedBy = sliceHintId;
  else if (hasSliceHint) describedBy = wheelHintId;
  return (
    <li
      className={styles.checklistRow}
      data-slice={isSlice}
      data-locked={isLocked || isHeld}
    >
      <label className={styles.checklistLabel}>
        <input
          type="checkbox"
          className={styles.checklistBox}
          checked={isChecked}
          aria-disabled={isLocked || isHeld || undefined}
          aria-describedby={describedBy}
          onChange={onToggle}
        />
        <span className={styles.checklistKind}>
          {t(`quizshow:kind.${round.kind}.name`)}
        </span>
        {title !== "" && <span className={styles.checklistTitle}>{title}</span>}
        {!isWheelRoundKind(round.kind) && (
          <span className={styles.checklistCount}>
            {t("quizshow:packs.questions", { count: round.questionCount })}
          </span>
        )}
        {(isLocked || isHeld) && (
          <FiLock className={styles.checklistLock} fill="none" aria-hidden />
        )}
      </label>
      <Collapse isOpen={isHeld}>
        <span id={heldReasonId} className={styles.checklistSliceHint}>
          {t("quizshow:importSources.adultsRequiredToAdd")}
        </span>
      </Collapse>
      <Collapse isOpen={isHintShownHere}>
        <span id={sliceHintId} className={styles.checklistSliceHint}>
          {t("quizshow:importSources.sliceOf", { wheel: wheelName ?? "" })}
        </span>
      </Collapse>
      <Collapse isOpen={hasSliceHint}>
        <span id={wheelHintId} className={styles.checklistSliceHint}>
          {t("quizshow:importSources.wheelHoldsSlices")}
        </span>
      </Collapse>
    </li>
  );
}

/** The legend and the rows, driven by a selection the caller holds. */
export function QuizshowRoundChecklistRows({
  rounds,
  language,
  selection,
  children,
}: {
  rounds: readonly QuizshowSelectableRound[];
  language: QuizshowLanguage;
  selection: QuizshowRoundSelection;
  /** Rendered under the rows, inside the group (the inline submit). */
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const legendId = useId();
  const hintIdBase = useId();
  const { checked, sliceRanges, wheelOfSlice, heldIndexes } = selection;
  const roundByIndex = new Map(
    rounds.map((round) => [round.roundIndex, round]),
  );
  function wheelNameOf(roundIndex: number): string | null {
    const wheelIndex = wheelOfSlice.get(roundIndex);
    const wheel =
      wheelIndex === undefined ? undefined : roundByIndex.get(wheelIndex);
    if (!wheel) return null;
    const wheelTitle = templateCardTitleOf(wheel.title, language);
    return wheelTitle === "" ? t("quizshow:kind.wheel.name") : wheelTitle;
  }
  return (
    <div role="group" aria-labelledby={legendId} className={styles.checklist}>
      <p id={legendId} className={styles.checklistLegend}>
        {t("quizshow:importSources.chooseRounds")}
      </p>
      <ul className={styles.checklistRows}>
        {rounds.map((round) => {
          const wheelIndex = wheelOfSlice.get(round.roundIndex);
          const hasSlices =
            (sliceRanges.get(round.roundIndex)?.length ?? 0) > 0;
          return (
            <ChecklistRow
              key={round.roundIndex}
              round={round}
              language={language}
              isChecked={checked.has(round.roundIndex)}
              isLocked={wheelIndex !== undefined && checked.has(wheelIndex)}
              isHeld={heldIndexes.has(round.roundIndex)}
              wheelName={wheelNameOf(round.roundIndex)}
              wheelHintId={`${hintIdBase}-wheel-${wheelIndex ?? round.roundIndex}`}
              hasSliceHint={hasSlices && checked.has(round.roundIndex)}
              onToggle={() => selection.toggle(round.roundIndex)}
            />
          );
        })}
      </ul>
      {children}
    </div>
  );
}

/** "Add these rounds", held while nothing is checked, with the hint that says so. */
export function QuizshowRoundSubmit({
  selection,
  isPending,
  onSubmit,
  size = "sm",
}: {
  size?: "sm" | "md";
  selection: QuizshowRoundSelection;
  isPending: boolean;
  onSubmit: (roundIndexes: number[]) => void;
}) {
  const { t } = useTranslation();
  const emptyHintId = useId();
  const isSubmitHeld = selection.isNothingChecked || isPending;
  return (
    <>
      <Button
        variant="stage"
        size={size}
        aria-disabled={isSubmitHeld}
        aria-describedby={selection.isNothingChecked ? emptyHintId : undefined}
        onClick={() => {
          if (!isSubmitHeld) onSubmit(selection.checkedIndexes);
        }}
      >
        {t("quizshow:importSources.addTheseRounds")}
      </Button>
      {selection.isNothingChecked && (
        <span id={emptyHintId} className={styles.checklistHint}>
          {t("quizshow:importSources.chooseRoundsHint")}
        </span>
      )}
    </>
  );
}

/**
 * Item 23: the rows of a source as checkboxes, then "Add these rounds".
 * Checking a wheel checks the rounds on its slices and holds them checked
 * until the wheel is unchecked; slice rows sit indented under their wheel.
 */
export function QuizshowRoundChecklist({
  rounds,
  language,
  isAdultsAllowed = true,
  isPending,
  onSubmit,
}: QuizshowRoundChecklistProps) {
  const selection = useQuizshowRoundSelection(rounds, { isAdultsAllowed });
  return (
    <QuizshowRoundChecklistRows
      rounds={rounds}
      language={language}
      selection={selection}
    >
      <div className={styles.checklistFooter}>
        <QuizshowRoundSubmit
          selection={selection}
          isPending={isPending}
          onSubmit={onSubmit}
        />
      </div>
    </QuizshowRoundChecklistRows>
  );
}
