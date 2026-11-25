import { describe, expect, it } from "vitest";
import type {
  QuizshowQuizInput,
  QuizshowQuizProblemCode,
  QuizshowQuestionInput,
  QuizshowRoundInput,
} from "../../../shared/contracts/quizshow";
import { QUIZSHOW_QUIZ_PROBLEM_CODES } from "../../../shared/contracts/quizshow";
import {
  blankDraft,
  defaultRoundSettings,
  newQuestion,
  newRound,
  newWheel,
} from "./quizshowDraft";
import {
  isStructuralProblem,
  problemsOfRound,
  quizshowProblemsFor,
  quizshowProblemsFromServer,
  usedLanguagesOf,
} from "./quizshowValidation";

type Body = Omit<QuizshowQuizInput, "expectedUpdatedAt">;

const filled = (text: string) => ({ en: text, pt: text });

function validMultipleChoice(): Extract<
  QuizshowQuestionInput,
  { type: "multiple_choice" }
> {
  return {
    ...newQuestion("multiple_choice", "quiz"),
    prompt: filled("Question"),
    options: [
      { id: "a", text: filled("One") },
      { id: "b", text: filled("Two") },
    ],
    answer: { correctIndexes: [0] },
  };
}

function roundOf(
  questions: QuizshowQuestionInput[],
  overrides: Partial<QuizshowRoundInput> = {},
): QuizshowRoundInput {
  return {
    kind: "quiz",
    title: filled("Round"),
    contentLabel: "none",
    settings: defaultRoundSettings(),
    questions,
    ...overrides,
  };
}

function wheelRow(
  sliceCount: number | null = null,
  questions: QuizshowQuestionInput[] = [],
): QuizshowRoundInput {
  return roundOf(questions, {
    kind: "wheel",
    settings: { ...defaultRoundSettings(), sliceCount },
  });
}

function validClosest(tolerance: {
  mode: "exact" | "absolute" | "percent";
  amount: number;
}): QuizshowQuestionInput {
  return {
    ...newQuestion("closest_number", "quiz"),
    prompt: filled("When?"),
    answer: { value: 1969, tolerance },
  };
}

function validPoll(): QuizshowQuestionInput {
  return {
    ...newQuestion("poll", "quiz"),
    prompt: filled("Which one?"),
    options: [
      { id: "a", text: filled("One") },
      { id: "b", text: filled("Two") },
    ],
  };
}

function warmUpRound(): QuizshowRoundInput {
  return roundOf([validMultipleChoice()], {
    settings: { ...defaultRoundSettings(), isWarmUp: true },
  });
}

function completeRounds(roundCount: number): QuizshowRoundInput[] {
  return Array.from({ length: roundCount }, () =>
    roundOf([validMultipleChoice()]),
  );
}

function tooFewProblemsOf(body: Body) {
  return quizshowProblemsFor(body, { isAdultsEvent: true }).filter(
    (found) => found.code === "wheel_too_few_slices",
  );
}

function bodyOf(
  rounds: QuizshowRoundInput[],
  overrides: Partial<Body> = {},
): Body {
  return {
    title: "Night",
    languages: "both",
    screenLanguage: "en",
    rounds,
    ...overrides,
  };
}

function codesOf(body: Body, isAdultsEvent = true) {
  return quizshowProblemsFor(body, { isAdultsEvent }).map(
    (found) => found.code,
  );
}

function withQuestion(question: Partial<QuizshowQuestionInput>): Body {
  return bodyOf([
    roundOf([
      { ...validMultipleChoice(), ...question } as QuizshowQuestionInput,
    ]),
  ]);
}

const cases: Array<[QuizshowQuizProblemCode, () => Body]> = [
  [
    "too_many_rounds",
    () =>
      bodyOf(
        Array.from({ length: 11 }, () => roundOf([])).map((round) => ({
          ...round,
          questions: [],
        })),
      ),
  ],
  [
    "too_many_wheels",
    () =>
      bodyOf([
        wheelRow(),
        ...completeRounds(2),
        wheelRow(),
        ...completeRounds(2),
        wheelRow(),
        ...completeRounds(2),
        wheelRow(),
        ...completeRounds(2),
      ]),
  ],
  ["wheel_too_few_slices", () => bodyOf([...completeRounds(1), wheelRow()])],
  [
    "too_many_questions",
    () =>
      bodyOf(
        Array.from({ length: 3 }, () =>
          roundOf(Array.from({ length: 17 }, () => validMultipleChoice())),
        ),
      ),
  ],
  [
    "too_many_questions_in_round",
    () =>
      bodyOf([
        roundOf(Array.from({ length: 21 }, () => validMultipleChoice())),
      ]),
  ],
  [
    "question_type_not_allowed",
    () =>
      bodyOf([
        roundOf([{ ...newQuestion("prompt", "quiz"), prompt: filled("P") }]),
      ]),
  ],
  [
    "option_count",
    () => withQuestion({ options: [{ id: "a", text: filled("Only") }] }),
  ],
  [
    "option_ids_not_unique",
    () =>
      withQuestion({
        options: [
          { id: "a", text: filled("One") },
          { id: "a", text: filled("Two") },
        ],
      }),
  ],
  [
    "answer_out_of_range",
    () => withQuestion({ answer: { correctIndexes: [5] } }),
  ],
  [
    "order_answer_not_permutation",
    () =>
      bodyOf([
        roundOf([
          {
            ...newQuestion("order", "quiz"),
            prompt: filled("Sort"),
            options: ["a", "b", "c"].map((id) => ({ id, text: filled(id) })),
            answer: { orderedIds: ["a", "b", "x"] },
          },
        ]),
      ]),
  ],
  ["answer_not_allowed", () => withQuestion({ acceptedAnswers: ["x"] })],
  ["no_rounds", () => bodyOf([])],
  [
    "title_missing",
    () => bodyOf([roundOf([validMultipleChoice()])], { title: "  " }),
  ],
  ["round_empty", () => bodyOf([roundOf([])])],
  ["prompt_missing", () => withQuestion({ prompt: { en: "Ok", pt: "" } })],
  [
    "option_text_missing",
    () =>
      withQuestion({
        options: [
          { id: "a", text: { en: "One", pt: "" } },
          { id: "b", text: filled("Two") },
        ],
      }),
  ],
  ["answer_missing", () => withQuestion({ answer: null })],
  [
    "truth_missing",
    () =>
      bodyOf([
        roundOf(
          [
            {
              ...newQuestion("prompt", "lie_detector"),
              prompt: filled("Q"),
              answer: { truth: { en: "Truth", pt: "" } },
            },
          ],
          { kind: "lie_detector" },
        ),
      ]),
  ],
  [
    "media_missing",
    () =>
      bodyOf([
        roundOf([newQuestion("prompt", "caption_this")], {
          kind: "caption_this",
        }),
      ]),
  ],
  [
    "correct_option_missing",
    () => withQuestion({ answer: { correctIndexes: [] } }),
  ],
  [
    "too_many_correct_options",
    () => withQuestion({ answer: { correctIndexes: [0, 1] } }),
  ],
  [
    "tolerance_out_of_range",
    () => bodyOf([roundOf([validClosest({ mode: "percent", amount: 70 })])]),
  ],
  [
    "poll_in_party_round",
    () => bodyOf([roundOf([validPoll()], { kind: "drag_name" })]),
  ],
  ["slow_reveal_needs_picture", () => withQuestion({ mediaReveal: "slow" })],
  [
    "warm_up_not_first",
    () => bodyOf([roundOf([validMultipleChoice()]), warmUpRound()]),
  ],
];

describe("quizshowProblemsFor", () => {
  it("accepts a complete quiz", () => {
    expect(codesOf(bodyOf([roundOf([validMultipleChoice()])]))).toEqual([]);
  });

  it("covers every contract problem code", () => {
    expect(cases.map(([code]) => code).sort()).toEqual(
      [...QUIZSHOW_QUIZ_PROBLEM_CODES].sort(),
    );
  });

  it.each(cases)("fires %s exactly once on a crafted input", (code, build) => {
    const body = build();
    const matching = quizshowProblemsFor(body, { isAdultsEvent: true }).filter(
      (found) => found.code === code,
    );
    expect(matching).toHaveLength(1);
  });

  it("checks only the languages the quiz uses", () => {
    const question = {
      ...validMultipleChoice(),
      prompt: { en: "", pt: "Pergunta" },
      options: [
        { id: "a", text: { en: "", pt: "Um" } },
        { id: "b", text: { en: "", pt: "Dois" } },
      ],
    } as QuizshowQuestionInput;
    const body = bodyOf([roundOf([question])], { languages: "pt" });
    expect(codesOf(body)).toEqual([]);
    expect(usedLanguagesOf("pt")).toEqual(["pt"]);
    expect(usedLanguagesOf("both")).toEqual(["en", "pt"]);
  });

  it("exempts a Caption This prompt and asks for its picture", () => {
    const withoutPicture = bodyOf([
      roundOf([newQuestion("prompt", "caption_this")], {
        kind: "caption_this",
      }),
    ]);
    expect(codesOf(withoutPicture)).toEqual(["media_missing"]);
    const withPicture = bodyOf([
      roundOf(
        [
          {
            ...newQuestion("prompt", "caption_this"),
            mediaRef: "uploads/a.jpg",
          },
        ],
        {
          kind: "caption_this",
        },
      ),
    ]);
    expect(codesOf(withPicture)).toEqual([]);
  });

  it("flags an adults round on an event without 18+", () => {
    const body = bodyOf([
      roundOf([validMultipleChoice()], { contentLabel: "adults" }),
    ]);
    expect(codesOf(body, false)).toEqual(["adults_round_needs_adults_event"]);
    expect(codesOf(body, true)).toEqual([]);
  });

  it("lists structural problems before completeness problems", () => {
    const body = bodyOf(
      [
        roundOf(
          [
            {
              ...validMultipleChoice(),
              answer: { correctIndexes: [9] },
              prompt: filled(""),
            },
          ],
          {
            contentLabel: "adults",
          },
        ),
      ],
      { title: "" },
    );
    const codes = codesOf(body, false);
    expect(codes).toEqual([
      "answer_out_of_range",
      "adults_round_needs_adults_event",
      "title_missing",
      "prompt_missing",
      "prompt_missing",
    ]);
    expect(isStructuralProblem("answer_out_of_range")).toBe(true);
    expect(isStructuralProblem("adults_round_needs_adults_event")).toBe(true);
    expect(isStructuralProblem("title_missing")).toBe(false);
  });

  it("reads server problems as local problems", () => {
    const problems = [
      {
        code: "title_missing" as const,
        roundIndex: null,
        questionIndex: null,
        language: null,
      },
    ];
    expect(quizshowProblemsFromServer(problems)).toEqual(problems);
  });
});

describe("quizshowProblemsFor with wheel rows", () => {
  it("counts only non-wheel rows toward the round limit", () => {
    const body = bodyOf([
      wheelRow(),
      ...completeRounds(3),
      wheelRow(),
      ...completeRounds(3),
      wheelRow(),
      ...completeRounds(4),
    ]);
    expect(body.rounds).toHaveLength(13);
    const codes = codesOf(body);
    expect(codes).not.toContain("too_many_rounds");
    expect(codes).not.toContain("too_many_wheels");
    expect(codes).toEqual([]);
  });

  it("flags an eleventh round and a fourth wheel as structural", () => {
    expect(codesOf(bodyOf(completeRounds(11)))).toContain("too_many_rounds");
    const fourWheels = quizshowProblemsFor(
      bodyOf([
        wheelRow(),
        ...completeRounds(2),
        wheelRow(),
        ...completeRounds(2),
        wheelRow(),
        ...completeRounds(2),
        wheelRow(),
        ...completeRounds(2),
      ]),
      { isAdultsEvent: true },
    );
    expect(fourWheels).toContainEqual({
      code: "too_many_wheels",
      roundIndex: null,
      questionIndex: null,
      language: null,
    });
    expect(isStructuralProblem("too_many_wheels")).toBe(true);
  });

  it("flags a wheel with fewer than 2 slices on its own row", () => {
    const wheelAtEnd = bodyOf([...completeRounds(1), wheelRow()]);
    expect(
      quizshowProblemsFor(wheelAtEnd, { isAdultsEvent: true }),
    ).toContainEqual({
      code: "wheel_too_few_slices",
      roundIndex: 1,
      questionIndex: null,
      language: null,
    });
    const backToBack = bodyOf([wheelRow(), wheelRow(), ...completeRounds(2)]);
    expect(
      tooFewProblemsOf(backToBack).map((found) => found.roundIndex),
    ).toEqual([0]);
    const cutShort = bodyOf([
      wheelRow(3),
      ...completeRounds(1),
      wheelRow(),
      ...completeRounds(2),
    ]);
    expect(tooFewProblemsOf(cutShort).map((found) => found.roundIndex)).toEqual(
      [0],
    );
  });

  it("accepts the contract 3.2 example", () => {
    const body = bodyOf([
      ...completeRounds(1),
      wheelRow(null),
      ...completeRounds(3),
      wheelRow(2),
      ...completeRounds(3),
    ]);
    expect(quizshowProblemsFor(body, { isAdultsEvent: true })).toEqual([]);
  });

  it("skips wheel rows for round_empty and counts no_rounds on playable rows", () => {
    expect(codesOf(bodyOf([wheelRow()]))).toContain("no_rounds");
    const emptyRoundsAroundWheel = bodyOf([
      roundOf([]),
      wheelRow(),
      roundOf([]),
    ]);
    const problems = quizshowProblemsFor(emptyRoundsAroundWheel, {
      isAdultsEvent: true,
    });
    expect(
      problems
        .filter((found) => found.code === "round_empty")
        .map((found) => found.roundIndex),
    ).toEqual([0, 2]);
    expect(problems.map((found) => [found.code, found.roundIndex])).toEqual([
      ["round_empty", 0],
      ["wheel_too_few_slices", 1],
      ["round_empty", 2],
    ]);
  });

  it("ignores an adults label on a wheel row", () => {
    const body = bodyOf([
      ...completeRounds(1),
      {
        ...wheelRow(),
        contentLabel: "adults",
      },
      ...completeRounds(2),
    ]);
    expect(codesOf(body, false)).toEqual([]);
  });

  it("refuses a question on a wheel row and raises nothing else for it", () => {
    const brokenQuestion = {
      ...validMultipleChoice(),
      options: [],
      prompt: filled(""),
    } as QuizshowQuestionInput;
    const body = bodyOf([
      ...completeRounds(1),
      wheelRow(null, [brokenQuestion]),
      ...completeRounds(2),
    ]);
    expect(quizshowProblemsFor(body, { isAdultsEvent: true })).toEqual([
      {
        code: "question_type_not_allowed",
        roundIndex: 1,
        questionIndex: 0,
        language: null,
      },
    ]);
  });
});

describe("quizshowProblemsFor with the Pulse Live v2 rules", () => {
  it("accepts a poll, several correct options and every margin inside its range", () => {
    const body = bodyOf([
      roundOf([
        validPoll(),
        {
          ...validMultipleChoice(),
          options: [
            { id: "a", text: filled("One") },
            { id: "b", text: filled("Two") },
            { id: "c", text: filled("Three") },
          ],
          answer: { correctIndexes: [0, 2] },
        },
        validClosest({ mode: "exact", amount: 0 }),
        validClosest({ mode: "absolute", amount: 2.5 }),
        validClosest({ mode: "percent", amount: 50 }),
      ]),
    ]);
    expect(codesOf(body)).toEqual([]);
  });

  it("refuses each margin outside its mode's range", () => {
    for (const tolerance of [
      { mode: "exact" as const, amount: 1 },
      { mode: "absolute" as const, amount: 0 },
      { mode: "percent" as const, amount: 0 },
      { mode: "percent" as const, amount: 51 },
      { mode: "percent" as const, amount: 2.5 },
    ]) {
      expect(codesOf(bodyOf([roundOf([validClosest(tolerance)])]))).toEqual([
        "tolerance_out_of_range",
      ]);
    }
    expect(isStructuralProblem("tolerance_out_of_range")).toBe(true);
  });

  it("lets the first non-wheel row be the warm-up when no wheel range holds it", () => {
    expect(codesOf(bodyOf([warmUpRound(), ...completeRounds(1)]))).toEqual([]);
    // A row right behind a wheel is one of its slices, drawn only when the wheel lands on it.
    const onWheelSlice = quizshowProblemsFor(
      bodyOf([wheelRow(), warmUpRound(), ...completeRounds(1)]),
      { isAdultsEvent: true },
    );
    expect(onWheelSlice).toEqual([
      {
        code: "warm_up_not_first",
        roundIndex: 1,
        questionIndex: null,
        language: null,
      },
    ]);
    const secondRow = quizshowProblemsFor(
      bodyOf([...completeRounds(1), warmUpRound()]),
      { isAdultsEvent: true },
    );
    expect(secondRow).toEqual([
      {
        code: "warm_up_not_first",
        roundIndex: 1,
        questionIndex: null,
        language: null,
      },
    ]);
    expect(isStructuralProblem("warm_up_not_first")).toBe(true);
  });

  it("needs no answer on a poll and names a poll in a party round", () => {
    expect(codesOf(bodyOf([roundOf([validPoll()])]))).toEqual([]);
    expect(
      codesOf(bodyOf([roundOf([validPoll()], { kind: "lie_detector" })])),
    ).toEqual(["poll_in_party_round"]);
  });

  it("asks for a picture behind a slow reveal in a quiz round only", () => {
    expect(codesOf(withQuestion({ mediaReveal: "slow" }))).toEqual([
      "slow_reveal_needs_picture",
    ]);
    expect(
      codesOf(withQuestion({ mediaReveal: "slow", mediaRef: "uploads/a.jpg" })),
    ).toEqual([]);
  });

  it("lists one row's problems with problemsOfRound", () => {
    const draft = {
      ...blankDraft(),
      title: "Night",
      rounds: [newRound("quiz"), newWheel()],
    };
    const firstRow = problemsOfRound(draft, 0);
    expect(firstRow.length).toBeGreaterThan(0);
    expect(firstRow.every((found) => found.roundIndex === 0)).toBe(true);
    expect(problemsOfRound(draft, 1).map((found) => found.code)).toEqual([
      "wheel_too_few_slices",
    ]);
  });
});
