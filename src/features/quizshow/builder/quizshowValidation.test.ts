import { describe, expect, it } from "vitest";
import type {
  QuizshowQuizInput,
  QuizshowQuizProblemCode,
  QuizshowQuestionInput,
  QuizshowRoundInput,
} from "../../../shared/contracts/quizshow";
import { QUIZSHOW_QUIZ_PROBLEM_CODES } from "../../../shared/contracts/quizshow";
import { defaultRoundSettings, newQuestion } from "./quizshowDraft";
import {
  isStructuralProblem,
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
    answer: { correctIndex: 0 },
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
  ["answer_out_of_range", () => withQuestion({ answer: { correctIndex: 5 } })],
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
              answer: { correctIndex: 9 },
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
