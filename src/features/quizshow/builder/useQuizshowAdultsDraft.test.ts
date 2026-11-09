import { describe, expect, it } from "vitest";
import {
  blankDraft,
  newRound,
  newWheel,
  type QuizshowDraft,
} from "./quizshowDraft";
import { adultsRoundNumbersOf } from "./useQuizshowAdultsDraft";

function draftOf(rounds: QuizshowDraft["rounds"]): QuizshowDraft {
  return { ...blankDraft(), rounds };
}

describe("adultsRoundNumbersOf", () => {
  it("numbers rounds by display number, skipping wheel rows", () => {
    const adultsRound = {
      ...newRound("quiz"),
      contentLabel: "adults" as const,
    };
    const draft = draftOf([newWheel(), newRound("quiz"), adultsRound]);
    expect(adultsRoundNumbersOf(draft)).toEqual([2]);
  });

  it("lists nothing when no round carries the adults label", () => {
    const draft = draftOf([newRound("quiz"), newWheel(), newRound("quiz")]);
    expect(adultsRoundNumbersOf(draft)).toEqual([]);
  });
});
