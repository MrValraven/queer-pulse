import { describe, expect, it } from "vitest";
import type {
  QuizshowQuestion,
  QuizshowQuiz,
  QuizshowRound,
  QuizshowRoundSettings,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import {
  buildAnswerSheets,
  buildHostSheet,
  printSheetOf,
} from "./quizshowPrintModel";

const BLANK: QuizshowText = { en: "", pt: "" };

function text(en: string, pt = en): QuizshowText {
  return { en, pt };
}

const SETTINGS: QuizshowRoundSettings = {
  timeLimitSeconds: 20,
  isSpeedBonusOn: true,
  isJokerAllowed: true,
  writeSeconds: 60,
  voteSeconds: 30,
  wheelBonus: 0,
  wheelPick: "round",
  sliceCount: null,
  isWarmUp: false,
  talkSeconds: 0,
};

const BASE = {
  mediaRef: null,
  mediaUrl: null,
  mediaAlt: BLANK,
  mediaReveal: "instant" as const,
  revealNote: BLANK,
  numberUnit: BLANK,
  timeLimitSeconds: null,
  points: 1000,
};

const OPTIONS = [
  { id: "o1", text: text("Lisbon", "Lisboa") },
  { id: "o2", text: text("Porto") },
  { id: "o3", text: text("Faro") },
  { id: "o4", text: text("Braga") },
];

const QUESTIONS: QuizshowQuestion[] = [
  {
    ...BASE,
    id: "q-mc",
    type: "multiple_choice",
    prompt: text("Capital?", "Capital?"),
    options: OPTIONS,
    answer: { correctIndexes: [0, 2] },
    acceptedAnswers: [],
    revealNote: text("Fun fact", "Curiosidade"),
  },
  {
    ...BASE,
    id: "q-tf",
    type: "true_false",
    // 85 characters in both languages: 1500 + 25 x 85 = 3625 ms of read time.
    prompt: text(
      "The first Pride march in Lisbon took place in 2000, with a few hundred people walking",
    ),
    options: [],
    answer: { isTrue: false },
    acceptedAnswers: [],
    timeLimitSeconds: 10,
  },
  {
    ...BASE,
    id: "q-typed",
    type: "type_answer",
    prompt: text("Who sang it?"),
    options: [],
    answer: { text: text("Madonna") },
    acceptedAnswers: ["madonna ciccone"],
  },
  {
    ...BASE,
    id: "q-closest",
    type: "closest_number",
    prompt: text("What year?"),
    options: [],
    answer: { value: 1969, tolerance: { mode: "absolute", amount: 5 } },
    acceptedAnswers: [],
    numberUnit: text("years", "anos"),
  },
  {
    ...BASE,
    id: "q-order",
    type: "order",
    prompt: text("Oldest first"),
    options: OPTIONS.slice(0, 3),
    answer: { orderedIds: ["o3", "o1", "o2"] },
    acceptedAnswers: [],
  },
  {
    ...BASE,
    id: "q-poll",
    type: "poll",
    prompt: text("Favourite?"),
    options: OPTIONS.slice(0, 2),
    answer: null,
    acceptedAnswers: [],
    revealNote: text("Every vote counts"),
  },
  {
    ...BASE,
    id: "q-missing",
    type: "multiple_choice",
    prompt: text("Not ready"),
    options: OPTIONS.slice(0, 3),
    answer: null,
    acceptedAnswers: [],
  },
];

function round(
  kind: QuizshowRound["kind"],
  questions: QuizshowQuestion[],
  settings: Partial<QuizshowRoundSettings> = {},
): QuizshowRound {
  return {
    id: `round-${kind}-${questions.length}`,
    kind,
    title: text(`${kind} round`),
    contentLabel: "none",
    settings: { ...SETTINGS, ...settings },
    questions,
  };
}

const LIE: Extract<QuizshowQuestion, { type: "prompt" }> = {
  ...BASE,
  id: "q-lie",
  type: "prompt",
  prompt: text("What is a gaff?"),
  options: [],
  answer: { truth: text("A tucking garment") },
  acceptedAnswers: [],
  timeLimitSeconds: null,
};

const CAPTION: Extract<QuizshowQuestion, { type: "prompt" }> = {
  ...LIE,
  id: "q-caption",
  prompt: BLANK,
  answer: null,
  mediaRef: "uploads/caption.jpg",
  mediaUrl: "https://cdn.example/caption.jpg",
  mediaAlt: text("A queen on a horse", "Uma rainha a cavalo"),
};

const CAPTION_WITHOUT_ALT: Extract<QuizshowQuestion, { type: "prompt" }> = {
  ...CAPTION,
  id: "q-caption-bare",
  mediaAlt: BLANK,
};

const DRAG: Extract<QuizshowQuestion, { type: "prompt" }> = {
  ...LIE,
  id: "q-drag",
  prompt: text("Your name if you were a cake", "O teu nome se fosses um bolo"),
  answer: null,
};

function quizOf(rounds: QuizshowRound[]): QuizshowQuiz {
  return {
    title: "Friday quiz",
    languages: "both",
    screenLanguage: "en",
    sourceTemplateId: null,
    sourceTemplate: null,
    updatedAt: "2026-11-24T20:00:00.000Z",
    rounds,
  };
}

const QUIZ = quizOf([
  round("quiz", QUESTIONS, { talkSeconds: 30 }),
  round("wheel", []),
  round("lie_detector", [LIE]),
  round("caption_this", [CAPTION, CAPTION_WITHOUT_ALT]),
  round("drag_name", [DRAG]),
  round("quiz", []),
]);

function hostRow(questionId: string) {
  const row = buildHostSheet(QUIZ)
    .flatMap((hostRound) => hostRound.rows)
    .find((candidate) => candidate.questionId === questionId);
  if (row === undefined) throw new Error(`No host row ${questionId}`);
  return row;
}

describe("printSheetOf", () => {
  it("reads answers and falls back to the host sheet", () => {
    expect(printSheetOf("answers")).toBe("answers");
    expect(printSheetOf("host")).toBe("host");
    expect(printSheetOf(null)).toBe("host");
    expect(printSheetOf("poster")).toBe("host");
  });
});

describe("buildHostSheet", () => {
  it("lists playable rounds with questions, numbered past the wheel", () => {
    const rounds = buildHostSheet(QUIZ);
    expect(
      rounds.map((hostRound) => [hostRound.roundIndex, hostRound.roundNumber]),
    ).toEqual([
      [0, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ]);
    expect(rounds[0]?.rows.map((row) => row.questionNumber)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it("lists every MC option, answers with the correct letters and keeps the reveal note", () => {
    const row = hostRow("q-mc");
    expect(row.answer).toEqual({ kind: "options", letters: ["A", "C"] });
    expect(row.note).toEqual(text("Fun fact", "Curiosidade"));
    expect(row.options).toEqual([
      { letter: "A", text: text("Lisbon", "Lisboa"), isCorrect: true },
      { letter: "B", text: text("Porto"), isCorrect: false },
      { letter: "C", text: text("Faro"), isCorrect: true },
      { letter: "D", text: text("Braga"), isCorrect: false },
    ]);
    expect(row.picture).toBeNull();
  });

  it("times a quiz question with its read phase, its limit and the talk time", () => {
    const row = hostRow("q-tf");
    expect(row.answer).toEqual({ kind: "trueFalse", isTrue: false });
    expect(row.timing).toEqual({
      kind: "quiz",
      readSeconds: 4,
      limitSeconds: 10,
      talkSeconds: 30,
    });
    expect(row.note).toBeNull();
  });

  it("falls back to the round limit when the question has none", () => {
    const timing = hostRow("q-mc").timing;
    expect(timing.kind === "quiz" && timing.limitSeconds).toBe(20);
  });

  it("keeps the typed answer and the accepted answers", () => {
    expect(hostRow("q-typed").answer).toEqual({
      kind: "typed",
      text: text("Madonna"),
      acceptedAnswers: ["madonna ciccone"],
    });
  });

  it("keeps the closest value with its margin and unit", () => {
    expect(hostRow("q-closest").answer).toEqual({
      kind: "closest",
      value: 1969,
      tolerance: { mode: "absolute", amount: 5 },
      unit: text("years", "anos"),
    });
  });

  it("sorts the MC correct letters ascending", () => {
    const firstQuestion = QUESTIONS[0];
    if (firstQuestion?.type !== "multiple_choice") {
      throw new Error("The first fixture question is multiple choice");
    }
    const unsortedQuiz = quizOf([
      round("quiz", [
        { ...firstQuestion, answer: { correctIndexes: [3, 0, 2] } },
      ]),
    ]);
    expect(buildHostSheet(unsortedQuiz)[0]?.rows[0]?.answer).toEqual({
      kind: "options",
      letters: ["A", "C", "D"],
    });
  });

  it("lists every order option and answers with the letters in the right sequence", () => {
    const row = hostRow("q-order");
    expect(row.answer).toEqual({ kind: "order", letters: ["C", "A", "B"] });
    expect(row.options.map((option) => option.letter)).toEqual(["A", "B", "C"]);
  });

  it("prints the read time in whole seconds", () => {
    for (const questionId of ["q-mc", "q-tf", "q-typed"]) {
      const timing = hostRow(questionId).timing;
      expect(
        timing.kind === "quiz" && Number.isInteger(timing.readSeconds),
      ).toBe(true);
    }
  });

  it("reads the read time at the minimum for a short prompt", () => {
    const timing = hostRow("q-typed").timing;
    expect(timing.kind === "quiz" && timing.readSeconds).toBe(3);
  });

  it("marks a poll as unscored and keeps its note", () => {
    const row = hostRow("q-poll");
    expect(row.answer).toEqual({ kind: "poll" });
    expect(row.options).toHaveLength(2);
    expect(row.note).toEqual(text("Every vote counts"));
  });

  it("says an answer is missing when none is set", () => {
    expect(hostRow("q-missing").answer).toEqual({
      kind: "none",
      isMissing: true,
    });
  });

  it("gives Lie Detector its truth and party rounds their write and vote time", () => {
    const row = hostRow("q-lie");
    expect(row.answer).toEqual({
      kind: "truth",
      text: text("A tucking garment"),
    });
    expect(row.timing).toEqual({
      kind: "party",
      writeSeconds: 60,
      voteSeconds: 30,
    });
  });

  it("has no answer to read out for Caption This and keeps the picture description", () => {
    const row = hostRow("q-caption");
    expect(row.answer).toEqual({ kind: "none", isMissing: false });
    expect(row.picture).toEqual({
      alt: text("A queen on a horse", "Uma rainha a cavalo"),
    });
    expect(hostRow("q-caption-bare").picture).toEqual({ alt: null });
  });

  it("gives a Drag Name prompt party timing and leaves its answer and note empty", () => {
    const row = hostRow("q-drag");
    expect(row.prompt).toEqual(
      text("Your name if you were a cake", "O teu nome se fosses um bolo"),
    );
    expect(row.answer).toEqual({ kind: "none", isMissing: false });
    expect(row.note).toBeNull();
    expect(row.options).toEqual([]);
    expect(row.timing).toEqual({
      kind: "party",
      writeSeconds: 60,
      voteSeconds: 30,
    });
  });
});

describe("buildAnswerSheets", () => {
  it("gives each round numbered lines: letter boxes for MC and poll, True and False boxes, else a written line", () => {
    const rounds = buildAnswerSheets(QUIZ);
    expect(rounds).toHaveLength(4);
    expect(rounds[0]?.lines).toEqual([
      { questionNumber: 1, kind: "letters", letters: ["A", "B", "C", "D"] },
      { questionNumber: 2, kind: "trueFalse" },
      { questionNumber: 3, kind: "write" },
      { questionNumber: 4, kind: "write" },
      { questionNumber: 5, kind: "write" },
      { questionNumber: 6, kind: "letters", letters: ["A", "B"] },
      { questionNumber: 7, kind: "letters", letters: ["A", "B", "C"] },
    ]);
    expect(rounds[1]?.lines).toEqual([{ questionNumber: 1, kind: "write" }]);
    expect(rounds.map((answerRound) => answerRound.roundNumber)).toEqual([
      1, 2, 3, 4,
    ]);
  });

  it("returns nothing for a quiz with only wheels and empty rounds", () => {
    expect(
      buildAnswerSheets(quizOf([round("wheel", []), round("quiz", [])])),
    ).toEqual([]);
  });
});
