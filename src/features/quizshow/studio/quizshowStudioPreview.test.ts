import { describe, expect, it } from "vitest";
import type { QuizshowQuestionInput } from "../../../shared/contracts/quizshow";
import {
  newQuestion,
  newRound,
  newWheel,
  type QuizshowDraft,
} from "../builder/quizshowDraft";
import {
  studioPlayerQuestionPropsFor,
  studioScreenStateFor,
} from "./quizshowStudioPreview";

const NO_PREVIEWS: ReadonlyMap<string, string> = new Map();

const MULTIPLE_CHOICE: QuizshowQuestionInput = {
  ...newQuestion("multiple_choice", "quiz"),
  prompt: {
    en: "Which year was the first Pride march?",
    pt: "Em que ano foi a primeira marcha?",
  },
  options: [
    { id: "a", text: { en: "1965", pt: "1965" } },
    { id: "b", text: { en: "1970", pt: "1970" } },
    { id: "c", text: { en: "1975", pt: "1975" } },
  ],
  answer: { correctIndex: 1 },
};

function draftOf(): QuizshowDraft {
  const round = newRound("quiz");
  return {
    title: "Pride trivia",
    languages: "both",
    screenLanguage: "en",
    rounds: [
      {
        ...round,
        title: { en: "Our history", pt: "A nossa história" },
        questions: [
          { draftKey: "question-1", question: MULTIPLE_CHOICE, mediaUrl: null },
        ],
      },
    ],
  };
}

const QUESTION_SELECTION = {
  kind: "question",
  roundIndex: 0,
  questionIndex: 0,
} as const;

describe("studioScreenStateFor", () => {
  it("draws a multiple choice question with the draft's options in order", () => {
    const state = studioScreenStateFor(draftOf(), QUESTION_SELECTION, {
      language: "en",
      phase: "open",
      pickedPreviewUrls: NO_PREVIEWS,
    });
    expect(state.role).toBe("screen");
    expect(state.cursor.phase).toBe("open");
    expect(state.question?.type).toBe("multiple_choice");
    expect(state.question?.options?.map((option) => option.text.en)).toEqual([
      "1965",
      "1970",
      "1975",
    ]);
    // No answer key before the reveal, and nobody has answered.
    expect(state.reveal).toBeNull();
    expect(state.answerCount).toBeNull();
  });

  it("marks the right option in reveal", () => {
    const state = studioScreenStateFor(draftOf(), QUESTION_SELECTION, {
      language: "en",
      phase: "reveal",
      pickedPreviewUrls: NO_PREVIEWS,
    });
    expect(state.cursor.phase).toBe("reveal");
    expect(state.reveal?.questionId).toBe(state.question?.questionId);
    expect(state.reveal?.correct).toEqual({
      type: "multiple_choice",
      correctIndex: 1,
    });
    expect(state.reveal?.distribution).toEqual({
      kind: "options",
      counts: [0, 0, 0],
    });
  });

  it("carries the round title in the round intro phase", () => {
    const state = studioScreenStateFor(draftOf(), QUESTION_SELECTION, {
      language: "pt",
      phase: "round_intro",
      pickedPreviewUrls: NO_PREVIEWS,
    });
    expect(state.cursor.phase).toBe("round_intro");
    expect(state.round?.title).toEqual({
      en: "Our history",
      pt: "A nossa história",
    });
    expect(state.screenLanguage).toBe("pt");
    expect(state.question).toBeNull();
  });

  it("draws a selected round header as its intro card", () => {
    const state = studioScreenStateFor(
      draftOf(),
      { kind: "round", roundIndex: 0 },
      { language: "en", phase: "open", pickedPreviewUrls: NO_PREVIEWS },
    );
    expect(state.cursor.phase).toBe("round_intro");
    expect(state.round?.roundIndex).toBe(0);
  });

  it("keeps the question id while the prompt changes", () => {
    const draft = draftOf();
    const options = {
      language: "en",
      phase: "open",
      pickedPreviewUrls: NO_PREVIEWS,
    } as const;
    const before = studioScreenStateFor(draft, QUESTION_SELECTION, options);
    const edited: QuizshowDraft = {
      ...draft,
      rounds: draft.rounds.map((round) => ({
        ...round,
        questions: round.questions.map((draftQuestion) => ({
          ...draftQuestion,
          question: {
            ...draftQuestion.question,
            prompt: { en: "Edited", pt: "Editada" },
          },
        })),
      })),
    };
    const after = studioScreenStateFor(edited, QUESTION_SELECTION, options);
    expect(after.question?.questionId).toBe(before.question?.questionId);
    expect(after.question?.prompt.en).toBe("Edited");
  });
});

describe("studioPlayerQuestionPropsFor", () => {
  it("gives the phone's answering view of the selected question", () => {
    const props = studioPlayerQuestionPropsFor(draftOf(), QUESTION_SELECTION, {
      language: "pt",
      phase: "reveal",
      pickedPreviewUrls: NO_PREVIEWS,
    });
    expect(props?.language).toBe("pt");
    expect(props?.question.options).toHaveLength(3);
    expect(props?.controller.state.session?.role).toBe("player");
    expect(props?.controller.state.session?.cursor.phase).toBe("open");
  });

  it("is null when no question is selected", () => {
    expect(
      studioPlayerQuestionPropsFor(
        draftOf(),
        { kind: "quiz" },
        { language: "en", phase: "open", pickedPreviewUrls: NO_PREVIEWS },
      ),
    ).toBeNull();
  });
});

const WHEEL_OPTIONS = {
  language: "en",
  phase: "open",
  pickedPreviewUrls: NO_PREVIEWS,
} as const;

/** Rows: quiz, wheel (Auto), quiz, quiz. */
function wheelDraftOf(): QuizshowDraft {
  const base = draftOf();
  const quizRow = base.rounds[0];
  if (quizRow === undefined) throw new Error("The base draft has no round.");
  return {
    ...base,
    rounds: [quizRow, newWheel(), newRound("quiz"), newRound("quiz")],
  };
}

describe("studioScreenStateFor with a wheel row", () => {
  it("shows a wheel row as the wheel phase at rest", () => {
    const state = studioScreenStateFor(
      wheelDraftOf(),
      { kind: "round", roundIndex: 1 },
      WHEEL_OPTIONS,
    );
    expect(state.cursor).toMatchObject({
      phase: "wheel",
      roundIndex: 1,
      questionIndex: null,
    });
    expect(state.round).toBeNull();
    expect(state.question).toBeNull();
    expect(state.wheel?.slices.map((slice) => slice.roundIndex)).toEqual([
      2, 3,
    ]);
    expect(state.wheel).toMatchObject({
      wheelRoundIndex: 1,
      pick: "round",
      spin: null,
      spinNumber: 1,
      spinTotal: 2,
    });
    expect(state.wheelBonus).toBeNull();
  });

  it("numbers a round behind a wheel by playable rows", () => {
    const state = studioScreenStateFor(
      wheelDraftOf(),
      { kind: "round", roundIndex: 2 },
      { ...WHEEL_OPTIONS, phase: "round_intro" },
    );
    expect(state.cursor).toMatchObject({
      roundNumber: 2,
      roundCount: 3,
      upNext: null,
      canSpinForNextRound: false,
    });
    expect(state.wheel).toBeNull();
  });

  it("counts a pick-a-question wheel once and its slices zero, as a live night does", () => {
    const draft = wheelDraftOf();
    const wheelRow = draft.rounds[1];
    if (wheelRow === undefined) throw new Error("The draft has no wheel row.");
    const questionWheelDraft: QuizshowDraft = {
      ...draft,
      rounds: [
        draft.rounds[0] ?? wheelRow,
        {
          ...wheelRow,
          settings: { ...wheelRow.settings, wheelPick: "question" },
        },
        ...draft.rounds.slice(2),
      ],
    };
    const state = studioScreenStateFor(
      questionWheelDraft,
      { kind: "round", roundIndex: 2 },
      { ...WHEEL_OPTIONS, phase: "round_intro" },
    );
    // The first quiz row, plus the wheel once.
    expect(state.cursor.roundCount).toBe(2);
  });
});
