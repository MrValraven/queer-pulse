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
  answer: { correctIndexes: [1] },
};

const TWO_CORRECT: QuizshowQuestionInput = {
  ...newQuestion("multiple_choice", "quiz"),
  prompt: { en: "Which of these are colours?", pt: "Quais destas são cores?" },
  options: [
    { id: "a", text: { en: "Lilac", pt: "Lilás" } },
    { id: "b", text: { en: "Tuesday", pt: "Terça" } },
    { id: "c", text: { en: "Teal", pt: "Azul-petróleo" } },
  ],
  answer: { correctIndexes: [0, 2] },
  revealNote: {
    en: "Lilac was a Pride colour long before the flag",
    pt: "O lilás era uma cor do Pride muito antes da bandeira",
  },
};

const POLL: QuizshowQuestionInput = {
  ...newQuestion("poll", "quiz"),
  prompt: {
    en: "Which decade had the best Pride anthems?",
    pt: "Que década teve os melhores hinos do Pride?",
  },
  options: [
    { id: "a", text: { en: "The 1970s", pt: "Os anos 70" } },
    { id: "b", text: { en: "The 1980s", pt: "Os anos 80" } },
    { id: "c", text: { en: "The 1990s", pt: "Os anos 90" } },
  ],
};

function draftOf(
  questions: readonly QuizshowQuestionInput[] = [MULTIPLE_CHOICE],
): QuizshowDraft {
  const round = newRound("quiz");
  return {
    title: "Pride trivia",
    languages: "both",
    screenLanguage: "en",
    rounds: [
      {
        ...round,
        title: { en: "Our history", pt: "A nossa história" },
        questions: questions.map((question, questionIndex) => ({
          draftKey: `question-${questionIndex + 1}`,
          question,
          mediaUrl: null,
        })),
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
      correctIndexes: [1],
    });
    expect(state.reveal?.distribution).toEqual({
      kind: "options",
      counts: [0, 0, 0],
    });
    expect(state.reveal?.note).toBeNull();
    expect(state.reveal?.wasCorrected).toBe(false);
  });

  it("marks every right option of a two-correct question in reveal, with its note", () => {
    const state = studioScreenStateFor(
      draftOf([TWO_CORRECT]),
      QUESTION_SELECTION,
      {
        language: "en",
        phase: "reveal",
        pickedPreviewUrls: NO_PREVIEWS,
      },
    );
    expect(state.reveal?.correct).toEqual({
      type: "multiple_choice",
      correctIndexes: [0, 2],
    });
    expect(state.reveal?.note).toEqual({
      en: "Lilac was a Pride colour long before the flag",
      pt: "O lilás era uma cor do Pride muito antes da bandeira",
    });
  });

  it("keeps the reveal note out of the open phase", () => {
    const state = studioScreenStateFor(
      draftOf([TWO_CORRECT]),
      QUESTION_SELECTION,
      {
        language: "en",
        phase: "open",
        pickedPreviewUrls: NO_PREVIEWS,
      },
    );
    expect(state.reveal).toBeNull();
    expect(state.question).not.toHaveProperty("revealNote");
  });

  it("draws a poll with its options in order and no right answer", () => {
    const options = {
      language: "en",
      pickedPreviewUrls: NO_PREVIEWS,
    } as const;
    const open = studioScreenStateFor(draftOf([POLL]), QUESTION_SELECTION, {
      ...options,
      phase: "open",
    });
    expect(open.question?.type).toBe("poll");
    expect(open.question?.options?.map((option) => option.text.en)).toEqual([
      "The 1970s",
      "The 1980s",
      "The 1990s",
    ]);
    // Contract 6.12: 1500 + 25 per character of the longer language (PT, 73).
    expect(open.question?.readMs).toBe(3325);
    const reveal = studioScreenStateFor(draftOf([POLL]), QUESTION_SELECTION, {
      ...options,
      phase: "reveal",
    });
    expect(reveal.reveal?.correct).toBeNull();
    expect(reveal.reveal?.distribution).toEqual({
      kind: "options",
      counts: [0, 0, 0],
    });
  });

  it("fills every live-only field with its neutral value", () => {
    const state = studioScreenStateFor(draftOf(), QUESTION_SELECTION, {
      language: "en",
      phase: "open",
      pickedPreviewUrls: NO_PREVIEWS,
    });
    expect(state).toMatchObject({
      isPractice: false,
      isJoinLocked: false,
      isAutoAdvanceOn: false,
      giving: null,
    });
    expect(state.cursor).toMatchObject({
      talkStartsAt: null,
      autoAdvanceAt: null,
      podiumRevealedCount: null,
    });
    expect(state.question).toMatchObject({
      mediaAlt: { en: "", pt: "" },
      mediaReveal: "instant",
      numberUnit: { en: "", pt: "" },
      // A short question reads for the 3 s floor.
      readMs: 3000,
    });
  });

  it("carries the round's warm-up and talk seconds on its card", () => {
    const draft = draftOf();
    const warmUpDraft: QuizshowDraft = {
      ...draft,
      rounds: draft.rounds.map((round) => ({
        ...round,
        settings: { ...round.settings, isWarmUp: true, talkSeconds: 30 },
      })),
    };
    const state = studioScreenStateFor(
      warmUpDraft,
      { kind: "round", roundIndex: 0 },
      { language: "en", phase: "open", pickedPreviewUrls: NO_PREVIEWS },
    );
    expect(state.round).toMatchObject({ isWarmUp: true, talkSeconds: 30 });
  });

  it("shows both languages when the quiz shows both on the screen", () => {
    const state = studioScreenStateFor(
      { ...draftOf(), screenLanguage: "both" },
      QUESTION_SELECTION,
      { language: "pt", phase: "open", pickedPreviewUrls: NO_PREVIEWS },
    );
    expect(state.screenLanguage).toBe("both");
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
    // The big screen draws in the quiz's own screen language, whatever
    // language the host types in.
    expect(state.screenLanguage).toBe("en");
    expect(state.question).toBeNull();
  });

  it("keeps a Portuguese screen in Portuguese while the host types in English", () => {
    const state = studioScreenStateFor(
      { ...draftOf(), screenLanguage: "pt" },
      QUESTION_SELECTION,
      { language: "en", phase: "open", pickedPreviewUrls: NO_PREVIEWS },
    );
    expect(state.screenLanguage).toBe("pt");
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
    expect(props?.controller.state.session).toMatchObject({
      lobby: { teams: [], playerCount: 0 },
      answerCount: null,
    });
  });

  it("gives the phone a poll to vote on", () => {
    const props = studioPlayerQuestionPropsFor(
      draftOf([POLL]),
      QUESTION_SELECTION,
      { language: "en", phase: "open", pickedPreviewUrls: NO_PREVIEWS },
    );
    expect(props?.question.type).toBe("poll");
    expect(props?.question.options).toHaveLength(3);
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
