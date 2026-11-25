import { describe, expect, it } from "vitest";
import { QUIZSHOW_LIMITS } from "../../../shared/contracts/quizshow";
import { blankDraft, newWheel } from "./quizshowDraft";
import {
  QUIZSHOW_PASTE_TEXT_MAX,
  closestAnswerOf,
  closestAnswerTextOf,
  importLimitIssuesOf,
  importedQuestionCountOf,
  plainNumberTextOf,
  importedTextOf,
  parsePastedQuestions,
  withImportedRounds,
  type QuizshowImportResult,
} from "./quizshowPasteFormat";

const ISSUE = "quizshow:studio.paste.issue.";

function reasonsOf(result: QuizshowImportResult): string[] {
  return result.issues.map(
    (issue) => `${issue.line} ${issue.reasonKey.slice(ISSUE.length)}`,
  );
}

function onlyQuestionOf(result: QuizshowImportResult) {
  expect(result.rounds).toHaveLength(1);
  expect(result.rounds[0]?.questions).toHaveLength(1);
  return result.rounds[0]?.questions[0]?.question;
}

describe("importedTextOf", () => {
  it("splits EN | PT at the first bar", () => {
    expect(importedTextOf(" Who? | Quem? ", "both")).toEqual({
      en: "Who?",
      pt: "Quem?",
    });
  });

  it("puts text without a bar in the quiz's language", () => {
    expect(importedTextOf("Quem?", "pt")).toEqual({ en: "", pt: "Quem?" });
    expect(importedTextOf("Who?", "en")).toEqual({ en: "Who?", pt: "" });
    expect(importedTextOf("Who?", "both")).toEqual({ en: "Who?", pt: "" });
  });
});

describe("parsePastedQuestions: line kinds", () => {
  it("reads a # round title, a bilingual Q:, options and the * correct one", () => {
    const result = parsePastedQuestions(
      [
        "# Music | Música",
        "Q: Who sang Vogue? | Quem cantou Vogue?",
        "- Cher",
        "* Madonna",
      ].join("\n"),
      "both",
    );
    expect(result.issues).toEqual([]);
    expect(result.rounds[0]?.title).toEqual({ en: "Music", pt: "Música" });
    expect(result.rounds[0]?.kind).toBe("quiz");
    const question = onlyQuestionOf(result);
    expect(question?.type).toBe("multiple_choice");
    expect(question?.prompt).toEqual({
      en: "Who sang Vogue?",
      pt: "Quem cantou Vogue?",
    });
    expect(question?.options.map((option) => option.id)).toEqual(["a", "b"]);
    expect(question?.answer).toEqual({ correctIndexes: [1] });
  });

  it("puts an untitled first block in an untitled round", () => {
    const result = parsePastedQuestions(
      "Q: Capital of Portugal?\nA: Lisbon",
      "en",
    );
    expect(result.rounds[0]?.title).toEqual({ en: "", pt: "" });
    expect(result.rounds[0]?.line).toBe(1);
  });

  it("allows several correct options", () => {
    const question = onlyQuestionOf(
      parsePastedQuestions(
        "Q: Pick the colours\n* Pink\n- Bread\n* Blue",
        "en",
      ),
    );
    expect(question?.answer).toEqual({ correctIndexes: [0, 2] });
  });

  it("makes a typed answer from an A: line that is no number", () => {
    const question = onlyQuestionOf(
      parsePastedQuestions(
        "Q: Capital? | Capital?\nA: Lisbon | Lisboa",
        "both",
      ),
    );
    expect(question?.type).toBe("type_answer");
    expect(question?.answer).toEqual({ text: { en: "Lisbon", pt: "Lisboa" } });
  });

  it("ends a question at a blank line and starts a round at #", () => {
    const result = parsePastedQuestions(
      [
        "Q: One",
        "A: 1",
        "",
        "Q: Two",
        "A: two",
        "# Second",
        "Q: Three",
        "A: 3",
      ].join("\n"),
      "en",
    );
    expect(result.issues).toEqual([]);
    expect(result.rounds.map((round) => round.questions.length)).toEqual([
      2, 1,
    ]);
    expect(result.rounds[1]?.questions[0]?.line).toBe(7);
  });

  it("reads CRLF line ends", () => {
    const result = parsePastedQuestions(
      "Q: One\r\nA: yes\r\n\r\nQ: Two\r\nA: no",
      "en",
    );
    expect(result.rounds[0]?.questions).toHaveLength(2);
  });
});

describe("parsePastedQuestions: closest numbers", () => {
  it("reads a bare number as exact", () => {
    const question = onlyQuestionOf(
      parsePastedQuestions("Q: Stonewall?\nA: 1969", "en"),
    );
    expect(question?.type).toBe("closest_number");
    expect(question?.answer).toEqual({
      value: 1969,
      tolerance: { mode: "exact", amount: 0 },
    });
  });

  it("reads ~10 as within 10 and ~10% as within 10 percent", () => {
    expect(closestAnswerOf("1969 ~10")).toEqual({
      value: 1969,
      tolerance: { mode: "absolute", amount: 10 },
    });
    expect(closestAnswerOf("1969 ~10%")).toEqual({
      value: 1969,
      tolerance: { mode: "percent", amount: 10 },
    });
    expect(closestAnswerOf("-2.5~0.5")).toEqual({
      value: -2.5,
      tolerance: { mode: "absolute", amount: 0.5 },
    });
  });

  it("refuses a percent outside the contract range", () => {
    expect(
      closestAnswerOf(`100 ~${QUIZSHOW_LIMITS.closestPercentMax + 1}%`),
    ).toBe("invalid");
    expect(closestAnswerOf("100 ~2.5%")).toBe("invalid");
    const result = parsePastedQuestions("Q: How many?\nA: 100 ~90%", "en");
    expect(reasonsOf(result)).toEqual(["2 badClosest"]);
  });

  it("treats a number with words as a typed answer", () => {
    expect(closestAnswerOf("1969 riots")).toBeNull();
  });
});

describe("parsePastedQuestions: issues", () => {
  it("asks for a * when no option is marked", () => {
    const result = parsePastedQuestions("Q: Which?\n- One\n- Two", "en");
    expect(reasonsOf(result)).toEqual(["1 noCorrect"]);
    expect(result.rounds).toEqual([]);
  });

  it("asks for one wrong option when every option is marked", () => {
    expect(
      reasonsOf(parsePastedQuestions("Q: Which?\n* One\n* Two", "en")),
    ).toEqual(["1 allCorrect"]);
  });

  it("names unknown lines, options before a question and doubled answers", () => {
    const result = parsePastedQuestions(
      ["- stray", "* stray too", "Q: One", "hello", "A: a", "A: b"].join("\n"),
      "en",
    );
    expect(reasonsOf(result)).toEqual([
      "1 noQuestion",
      "4 unknownLine",
      "6 twoAnswers",
    ]);
  });

  it("names a question with options and an A: line, and one with neither", () => {
    const result = parsePastedQuestions(
      "Q: Both\n* x\n- y\nA: z\n\nQ: Neither",
      "en",
    );
    expect(reasonsOf(result)).toEqual(["1 mixedAnswer", "6 noAnswer"]);
  });

  it("names option counts outside multiple choice's range", () => {
    // The count is the cause even when the one option is marked.
    expect(reasonsOf(parsePastedQuestions("Q: One option\n* x", "en"))).toEqual(
      ["1 tooFewOptions"],
    );
    const five = ["Q: Five", "* a", "- b", "- c", "- d", "- e"].join("\n");
    expect(reasonsOf(parsePastedQuestions(five, "en"))).toEqual([
      "1 tooManyOptions",
    ]);
  });

  it("names an empty round and a round past the question limit", () => {
    const tooLong = Array.from(
      { length: QUIZSHOW_LIMITS.questionsPerRoundMax + 1 },
      (_unused, index) => `Q: ${index}\nA: ${index}\n`,
    ).join("\n");
    const result = parsePastedQuestions(`# Empty\n# Full\n${tooLong}`, "en");
    expect(result.issues.map((issue) => issue.reasonKey)).toEqual([
      `${ISSUE}emptyRound`,
      `${ISSUE}roundTooLong`,
    ]);
    expect(result.rounds).toHaveLength(1);
  });

  it("never throws on garbage", () => {
    const garbage = [
      "",
      "\u0000\u0001|||",
      "Q:",
      "A:",
      "*",
      "-",
      "# | |",
      "~~~ 12 ~%",
      "Q: x\nA: 1e999 ~",
      "\uFEFF\r\r\n\n",
      "Q: x\n".repeat(500),
    ];
    for (const text of garbage) {
      expect(() => parsePastedQuestions(text, "both")).not.toThrow();
    }
    expect(() =>
      parsePastedQuestions(undefined as unknown as string, "en"),
    ).not.toThrow();
  });
});

describe("importLimitIssuesOf and withImportedRounds", () => {
  it("refuses rounds past roundsMax and questions past questionsPerQuizMax", () => {
    // A blank quiz gives its untouched starter round up, so all roundsMax fit and one more does not.
    const pasted = Array.from(
      { length: QUIZSHOW_LIMITS.roundsMax + 1 },
      (_unused, index) => `# Round ${index}\nQ: q\nA: a`,
    ).join("\n");
    const result = parsePastedQuestions(pasted, "en");
    const issues = importLimitIssuesOf(blankDraft(), result.rounds);
    expect(issues.map((issue) => issue.reasonKey)).toEqual([
      `${ISSUE}tooManyRounds`,
    ]);
    expect(issues[0]?.line).toBe(result.rounds.at(-1)?.line);
  });

  it("appends the rounds and pins a trailing wheel to its current slices", () => {
    const base = blankDraft();
    const draft = {
      ...base,
      rounds: [newWheel(), ...base.rounds, ...blankDraft().rounds],
    };
    const result = parsePastedQuestions("Q: One\nA: 1", "en");
    const next = withImportedRounds(draft, result.rounds);
    expect(next.rounds).toHaveLength(4);
    expect(next.rounds[0]?.settings.sliceCount).toBe(2);
    expect(next.rounds[3]?.questions[0]?.question.type).toBe("closest_number");
    expect(next.rounds[3]?.draftKey).not.toBe(next.rounds[2]?.draftKey);
  });
});

describe("fix round 1", () => {
  it("reads \\| as a bar inside a text", () => {
    expect(importedTextOf("A \\| B | C \\| D", "both")).toEqual({
      en: "A | B",
      pt: "C | D",
    });
    expect(importedTextOf("Only \\| one", "en")).toEqual({
      en: "Only | one",
      pt: "",
    });
  });

  it("names a text past its limit at its own line", () => {
    const longPrompt = "p".repeat(QUIZSHOW_LIMITS.promptMax + 1);
    const longOption = "o".repeat(QUIZSHOW_LIMITS.optionTextMax + 1);
    const longAnswer = "a".repeat(QUIZSHOW_LIMITS.answerTextMax + 1);
    const longTitle = "t".repeat(QUIZSHOW_LIMITS.roundTitleMax + 1);
    const result = parsePastedQuestions(
      [
        `# ${longTitle}`,
        `Q: ${longPrompt}`,
        "A: x",
        "",
        "Q: ok",
        "- fine",
        `* ${longOption}`,
        "",
        "Q: ok",
        `A: ${longAnswer}`,
      ].join("\n"),
      "en",
    );
    expect(reasonsOf(result)).toEqual([
      "1 tooLong",
      "2 tooLong",
      "7 tooLong",
      "10 tooLong",
    ]);
    expect(result.issues[0]?.values).toEqual({
      max: QUIZSHOW_LIMITS.roundTitleMax,
    });
  });

  it("names an option with no text in either language", () => {
    expect(
      reasonsOf(parsePastedQuestions("Q: Which?\n* yes\n- |", "both")),
    ).toEqual(["1 emptyOption"]);
  });

  it("keeps a pasted U+2028 inside a text", () => {
    const question = onlyQuestionOf(
      parsePastedQuestions("Q: One\u2028two\nA: three", "en"),
    );
    expect(question?.prompt.en).toBe("One\u2028two");
  });

  it("counts lines the same with CR-only line ends", () => {
    expect(
      reasonsOf(parsePastedQuestions("Q: a\rA: b\r\rhello", "en")),
    ).toEqual(["4 unknownLine"]);
  });

  it("reads a long paste in one pass", () => {
    const longLine = `- ${"a".repeat(QUIZSHOW_PASTE_TEXT_MAX)}`;
    expect(() => parsePastedQuestions(longLine, "en")).not.toThrow();
    const manyQuestions = Array.from(
      { length: 2000 },
      (_unused, index) => `Q: ${index}\nA: ${index} ~1`,
    ).join("\n\n");
    const result = parsePastedQuestions(manyQuestions, "en");
    expect(importedQuestionCountOf(result.rounds)).toBe(2000);
  });

  it("writes tiny and huge numbers in plain digits that read back", () => {
    expect(plainNumberTextOf(0.0000001)).toBe("0.0000001");
    expect(plainNumberTextOf(-1.5e-7)).toBe("-0.00000015");
    expect(plainNumberTextOf(1969)).toBe("1969");
    const text = closestAnswerTextOf({
      value: 0.0000001,
      tolerance: { mode: "absolute", amount: 0.00000005 },
    });
    expect(text).toBe("0.0000001 ~0.00000005");
    expect(closestAnswerOf(text)).toEqual({
      value: 0.0000001,
      tolerance: { mode: "absolute", amount: 0.00000005 },
    });
  });

  it("replaces the untouched starter round of a blank quiz", () => {
    const result = parsePastedQuestions("# Music\nQ: One\nA: 1", "en");
    const next = withImportedRounds(blankDraft(), result.rounds);
    expect(next.rounds).toHaveLength(1);
    expect(next.rounds[0]?.title.en).toBe("Music");
  });

  it("keeps a starter round the host has touched", () => {
    const base = blankDraft();
    const touched = {
      ...base,
      rounds: base.rounds.map((round) => ({
        ...round,
        title: { en: "Mine", pt: "" },
      })),
    };
    const result = parsePastedQuestions("Q: One\nA: 1", "en");
    expect(withImportedRounds(touched, result.rounds).rounds).toHaveLength(2);
  });
});
