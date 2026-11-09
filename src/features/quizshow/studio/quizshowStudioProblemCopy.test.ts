import { describe, expect, it } from "vitest";
import type { QuizshowLocalProblem } from "../builder/quizshowValidation";
import { studioProblemCopyOf } from "./quizshowStudioProblemCopy";

function problemAt(
  code: QuizshowLocalProblem["code"],
  roundIndex: number,
): QuizshowLocalProblem {
  return { code, roundIndex, questionIndex: null, language: null };
}

function quizProblem(code: QuizshowLocalProblem["code"]): QuizshowLocalProblem {
  return { code, roundIndex: null, questionIndex: null, language: null };
}

describe("studioProblemCopyOf", () => {
  it("numbers rounds and wheels by kind", () => {
    const rounds = [
      { kind: "quiz" },
      { kind: "wheel" },
      { kind: "quiz" },
      { kind: "wheel" },
    ] as const;
    expect(
      studioProblemCopyOf(problemAt("round_empty", 2), "event", rounds).values
        .round,
    ).toBe(2);
    expect(
      studioProblemCopyOf(problemAt("wheel_too_few_slices", 3), "event", rounds)
        .values.wheel,
    ).toBe(2);
    expect(
      studioProblemCopyOf(problemAt("round_empty", 2), "event", rounds).values
        .wheel,
    ).toBe("");
  });

  it("reads the wheel limit", () => {
    const copy = studioProblemCopyOf(
      quizProblem("too_many_wheels"),
      "template",
      [],
    );
    expect(copy).toMatchObject({
      key: "quizshow:problems.too_many_wheels",
      values: { max: 3 },
    });
  });

  it("keeps the game's own keys", () => {
    expect(
      studioProblemCopyOf(quizProblem("title_missing"), "game", []).key,
    ).toBe("quizshow:problems.title_missing_game");
  });
});
