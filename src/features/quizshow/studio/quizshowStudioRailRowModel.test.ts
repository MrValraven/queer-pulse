import { describe, expect, it } from "vitest";
import {
  moveItem,
  newRound,
  newWheel,
  type QuizshowDraftRound,
} from "../builder/quizshowDraft";
import { railRowsOf } from "./quizshowStudioRailRowModel";

function quizRow(): QuizshowDraftRound {
  return newRound("quiz");
}

/** A wheel row; `sliceCount` null is Auto. */
function wheelRow(sliceCount: number | null = null): QuizshowDraftRound {
  const wheel = newWheel();
  return { ...wheel, settings: { ...wheel.settings, sliceCount } };
}

/** [R0, W1 Auto, R2, R3, W4 count 2, R5, R6, R7] */
function groupedRows(): QuizshowDraftRound[] {
  return [
    quizRow(),
    wheelRow(),
    quizRow(),
    quizRow(),
    wheelRow(2),
    quizRow(),
    quizRow(),
    quizRow(),
  ];
}

describe("railRowsOf", () => {
  it("numbers rows and groups each range under its wheel", () => {
    expect(railRowsOf(groupedRows())).toEqual([
      { kind: "round", roundIndex: 0, roundNumber: 1, wheelNumber: null },
      {
        kind: "wheel",
        roundIndex: 1,
        wheelNumber: 1,
        sliceCount: 2,
        pick: "round",
      },
      { kind: "round", roundIndex: 2, roundNumber: 2, wheelNumber: 1 },
      { kind: "round", roundIndex: 3, roundNumber: 3, wheelNumber: 1 },
      {
        kind: "wheel",
        roundIndex: 4,
        wheelNumber: 2,
        sliceCount: 2,
        pick: "round",
      },
      { kind: "round", roundIndex: 5, roundNumber: 4, wheelNumber: 2 },
      { kind: "round", roundIndex: 6, roundNumber: 5, wheelNumber: 2 },
      { kind: "round", roundIndex: 7, roundNumber: 6, wheelNumber: null },
    ]);
  });

  it("railRowsOf regroups when a wheel moves", () => {
    // The same rows after moveItem(rows, 1, 0): R0 now sits in wheel 1's range.
    const moved = moveItem(groupedRows(), 1, 0);
    expect(railRowsOf(moved)[1]).toMatchObject({
      kind: "round",
      roundIndex: 1,
      wheelNumber: 1,
    });
  });

  it("reports a wheel at the end with no slices", () => {
    expect(railRowsOf([quizRow(), wheelRow()])[1]).toMatchObject({
      kind: "wheel",
      sliceCount: 0,
    });
  });

  it("reads the wheel's pick", () => {
    const wheel = newWheel();
    const questionWheel: QuizshowDraftRound = {
      ...wheel,
      settings: { ...wheel.settings, wheelPick: "question" },
    };
    expect(railRowsOf([questionWheel, quizRow(), quizRow()])[0]).toMatchObject({
      kind: "wheel",
      pick: "question",
      sliceCount: 2,
    });
  });
});
