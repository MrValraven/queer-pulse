import { useMemo, useState } from "react";
import type {
  QuizshowContentLabel,
  QuizshowImportRoundRef,
} from "../../../shared/contracts/quizshow";
import { isWheelRoundKind, wheelSliceRoundIndexes } from "../quizshowWheel";

/**
 * A row of a source's round list. A template preview's rows carry their
 * content label; a source row may too, and a row without one holds nothing
 * back.
 */
export type QuizshowSelectableRound = QuizshowImportRoundRef & {
  contentLabel?: QuizshowContentLabel;
};

const NO_HELD_ROUNDS: ReadonlySet<number> = new Set();

/**
 * The rows an append cannot take: the adults rows of a quiz that is not 18+,
 * and a wheel whose slices include one (a chosen wheel brings every slice of
 * its range, so it cannot come along without them). A wheel row carries no
 * content of its own.
 */
export function adultsHeldRoundIndexesOf(
  rounds: readonly QuizshowSelectableRound[],
  sliceRanges: ReadonlyMap<number, number[]>,
): ReadonlySet<number> {
  const adultsIndexes = new Set(
    rounds
      .filter(
        (round) =>
          !isWheelRoundKind(round.kind) && round.contentLabel === "adults",
      )
      .map((round) => round.roundIndex),
  );
  if (adultsIndexes.size === 0) return NO_HELD_ROUNDS;
  const held = new Set(adultsIndexes);
  for (const [wheelIndex, sliceIndexes] of sliceRanges) {
    if (sliceIndexes.some((sliceIndex) => adultsIndexes.has(sliceIndex))) {
      held.add(wheelIndex);
    }
  }
  return held;
}

/**
 * Each wheel row's slice rows, by source row index, read with the wheel's
 * stored slice count (Auto when null), so the range matches the one the
 * server adds (C6.28).
 */
export function sliceRangesOf(
  rounds: readonly QuizshowImportRoundRef[],
): Map<number, number[]> {
  const wheelRows = rounds.map((round) => ({
    kind: round.kind,
    settings: { sliceCount: round.sliceCount },
    questions: [],
  }));
  const sliceRanges = new Map<number, number[]>();
  rounds.forEach((round, position) => {
    if (!isWheelRoundKind(round.kind)) return;
    const slicePositions = wheelSliceRoundIndexes(wheelRows, position);
    sliceRanges.set(
      round.roundIndex,
      slicePositions.flatMap((slicePosition) => {
        const sliceRound = rounds[slicePosition];
        return sliceRound ? [sliceRound.roundIndex] : [];
      }),
    );
  });
  return sliceRanges;
}

/** The wheel row index each slice row belongs to. */
function wheelOfSliceOf(
  sliceRanges: ReadonlyMap<number, number[]>,
): Map<number, number> {
  const wheelOfSlice = new Map<number, number>();
  for (const [wheelIndex, sliceIndexes] of sliceRanges) {
    for (const sliceIndex of sliceIndexes) {
      wheelOfSlice.set(sliceIndex, wheelIndex);
    }
  }
  return wheelOfSlice;
}

/**
 * `checked` with `roundIndex` flipped. A wheel row flips its whole slice
 * range with it; a slice row stays put while its wheel is checked. A held row
 * never changes.
 */
function withRoundToggled(
  checked: ReadonlySet<number>,
  roundIndex: number,
  sliceRanges: ReadonlyMap<number, number[]>,
  wheelOfSlice: ReadonlyMap<number, number>,
  heldIndexes: ReadonlySet<number>,
): Set<number> {
  const next = new Set(checked);
  if (heldIndexes.has(roundIndex)) return next;
  const wheelIndex = wheelOfSlice.get(roundIndex);
  if (wheelIndex !== undefined && checked.has(wheelIndex)) return next;
  const isChecking = !next.has(roundIndex);
  const flipped = [roundIndex, ...(sliceRanges.get(roundIndex) ?? [])];
  for (const flippedIndex of flipped) {
    if (isChecking) next.add(flippedIndex);
    else next.delete(flippedIndex);
  }
  return next;
}

/** The checked rows of a source's round list, and the ways to change them. */
export interface QuizshowRoundSelection {
  checked: ReadonlySet<number>;
  /** The checked row indexes, in source order. */
  checkedIndexes: number[];
  isNothingChecked: boolean;
  sliceRanges: ReadonlyMap<number, number[]>;
  wheelOfSlice: ReadonlyMap<number, number>;
  /** Rows that cannot be checked: adults rows of a quiz that is not 18+, and wheels holding one. */
  heldIndexes: ReadonlySet<number>;
  toggle: (roundIndex: number) => void;
}

/**
 * The checklist's state, so a caller can keep it outside the rows (the
 * template preview's "Add these rounds" sits in the dialog's footer).
 * `isAdultsAllowed` false holds the adults rows (default true: nothing held).
 */
export function useQuizshowRoundSelection(
  rounds: readonly QuizshowSelectableRound[],
  { isAdultsAllowed = true }: { isAdultsAllowed?: boolean } = {},
): QuizshowRoundSelection {
  const [checked, setChecked] = useState<ReadonlySet<number>>(new Set());
  const sliceRanges = useMemo(() => sliceRangesOf(rounds), [rounds]);
  const wheelOfSlice = useMemo(
    () => wheelOfSliceOf(sliceRanges),
    [sliceRanges],
  );
  const heldIndexes = useMemo(
    () =>
      isAdultsAllowed
        ? NO_HELD_ROUNDS
        : adultsHeldRoundIndexesOf(rounds, sliceRanges),
    [isAdultsAllowed, rounds, sliceRanges],
  );
  return {
    checked,
    checkedIndexes: rounds
      .map((round) => round.roundIndex)
      .filter((roundIndex) => checked.has(roundIndex)),
    isNothingChecked: checked.size === 0,
    sliceRanges,
    wheelOfSlice,
    heldIndexes,
    toggle: (roundIndex) =>
      setChecked((current) =>
        withRoundToggled(
          current,
          roundIndex,
          sliceRanges,
          wheelOfSlice,
          heldIndexes,
        ),
      ),
  };
}
