import { describe, expect, it } from "vitest";
import type {
  QuizshowQuestionInput,
  QuizshowRoundInput,
  QuizshowRoundKind,
  QuizshowRoundSettings,
} from "../../../shared/contracts/quizshow";
import { wheelSliceRoundIndexes } from "../quizshowWheel";
import {
  demoImportResultOf,
  quizFromInput,
  type DemoImportTarget,
  type DemoQuizBody,
} from "./quizshowDemoQuizzes";

const ROUND_SETTINGS: QuizshowRoundSettings = {
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

const STORED_UPDATED_AT = "2026-10-25T00:00:00.000Z";
const STORED_COPIED_AT = "2026-09-01T10:00:00.000Z";
const APPEND_AT = "2026-11-24T12:00:00.000Z";
const TEMPLATE_ID = "template-pride";

function trueFalseQuestion(promptText: string): QuizshowQuestionInput {
  return {
    type: "true_false",
    prompt: { en: promptText, pt: promptText },
    options: [],
    answer: { isTrue: true },
    acceptedAnswers: [],
    mediaRef: null,
    mediaAlt: { en: "", pt: "" },
    mediaReveal: "instant",
    revealNote: { en: "", pt: "" },
    numberUnit: { en: "", pt: "" },
    timeLimitSeconds: null,
    points: 1000,
  };
}

function roundOf(title: string, kind: QuizshowRoundKind): QuizshowRoundInput {
  return {
    kind,
    title: { en: title, pt: title },
    contentLabel: "none",
    settings: { ...ROUND_SETTINGS },
    questions: kind === "wheel" ? [] : [trueFalseQuestion(`${title} question`)],
  };
}

function bodyOf(rounds: QuizshowRoundInput[]): DemoQuizBody {
  return { title: "Source", languages: "both", screenLanguage: "en", rounds };
}

function targetOf(stored: DemoImportTarget["stored"]): DemoImportTarget {
  return { stored, keptTitle: null, assertAllowed: () => undefined };
}

function storedQuizWithSource(sourceTemplateId: string | null) {
  return {
    quiz: quizFromInput(bodyOf([roundOf("Stored round", "quiz")]), {
      idPrefix: "stored",
      updatedAt: STORED_UPDATED_AT,
      sourceTemplateId,
    }),
    sourceTemplateCopiedAt: sourceTemplateId === null ? null : STORED_COPIED_AT,
  };
}

describe("demo append of a chosen wheel", () => {
  it("pins a chosen Auto wheel to the slices it brought, so a later chosen row stays a plain round", () => {
    const sourceBody = bodyOf([
      roundOf("Spin", "wheel"),
      roundOf("Slice one", "quiz"),
      roundOf("Slice two", "quiz"),
      roundOf("Second spin", "wheel"),
      roundOf("Second slice", "quiz"),
      roundOf("Second slice two", "quiz"),
    ]);

    // The Auto wheel and a slice row of the second wheel, chosen without that wheel.
    const result = demoImportResultOf(
      {
        from: "event",
        eventSlug: "source-event",
        mode: "append",
        roundIndexes: [0, 4],
        expectedUpdatedAt: null,
      },
      { body: sourceBody, sourceTemplateId: null },
      targetOf(null),
      APPEND_AT,
    );

    const rounds = result.body.rounds;
    expect(rounds.map((round) => round.title.en)).toEqual([
      "Spin",
      "Slice one",
      "Slice two",
      "Second slice",
    ]);
    expect(rounds[0]?.settings.sliceCount).toBe(2);
    expect(wheelSliceRoundIndexes(rounds, 0)).toEqual([1, 2]);
  });
});

describe("demo template append stamp", () => {
  it("refreshes the copy stamp on an append from the quiz's own template", () => {
    const result = demoImportResultOf(
      {
        from: "template",
        templateId: TEMPLATE_ID,
        mode: "append",
        roundIndexes: null,
        expectedUpdatedAt: STORED_UPDATED_AT,
      },
      {
        body: bodyOf([roundOf("Template round", "quiz")]),
        sourceTemplateId: TEMPLATE_ID,
      },
      targetOf(storedQuizWithSource(TEMPLATE_ID)),
      APPEND_AT,
    );

    expect(result.sourceTemplateId).toBe(TEMPLATE_ID);
    expect(result.sourceTemplateCopiedAt).toBe(APPEND_AT);
  });

  it("keeps the stored source and stamp on an append from another template", () => {
    const result = demoImportResultOf(
      {
        from: "template",
        templateId: "template-other",
        mode: "append",
        roundIndexes: null,
        expectedUpdatedAt: STORED_UPDATED_AT,
      },
      {
        body: bodyOf([roundOf("Template round", "quiz")]),
        sourceTemplateId: "template-other",
      },
      targetOf(storedQuizWithSource(TEMPLATE_ID)),
      APPEND_AT,
    );

    expect(result.sourceTemplateId).toBe(TEMPLATE_ID);
    expect(result.sourceTemplateCopiedAt).toBe(STORED_COPIED_AT);
  });
});
