import { describe, expect, it } from "vitest";
import type {
  QuizshowOption,
  QuizshowQuestion,
  QuizshowQuestionInput,
  QuizshowQuiz,
} from "../../../shared/contracts/quizshow";
import {
  blankDraft,
  changeQuestionType,
  changeRoundKind,
  defaultRoundSettings,
  draftFromQuiz,
  draftToInput,
  duplicateQuestionAt,
  isDraftDirty,
  mintOptionId,
  moveItem,
  newQuestion,
  newRound,
  removeAt,
} from "./quizshowDraft";

const blankText = { en: "", pt: "" };

function at<Item>(items: readonly Item[], index: number): Item {
  const item = items[index];
  if (item === undefined) {
    throw new Error(`No item at index ${index}`);
  }
  return item;
}

function optionsOf(question: QuizshowQuestionInput): QuizshowOption[] {
  return question.options as QuizshowOption[];
}

function storedOrderQuestion(): QuizshowQuestion {
  return {
    id: "question-1",
    mediaUrl: "https://cdn.example/photo.jpg",
    type: "order",
    prompt: { en: "Sort them", pt: "Ordena" },
    mediaRef: "uploads/photo.jpg",
    timeLimitSeconds: null,
    points: 1000,
    options: [
      { id: "c", text: { en: "Third", pt: "Terceiro" } },
      { id: "a", text: { en: "First", pt: "Primeiro" } },
      { id: "b", text: { en: "Second", pt: "Segundo" } },
    ],
    answer: { orderedIds: ["a", "b", "c"] },
    acceptedAnswers: [],
  };
}

function storedQuiz(): QuizshowQuiz {
  return {
    title: "Night",
    languages: "both",
    screenLanguage: "en",
    starterPackKey: null,
    updatedAt: "2026-10-19T10:00:00.000Z",
    rounds: [
      {
        id: "round-1",
        kind: "quiz",
        title: blankText,
        contentLabel: "none",
        settings: defaultRoundSettings(),
        questions: [storedOrderQuestion()],
      },
    ],
  };
}

describe("quizshowDraft", () => {
  it("starts a blank quiz with one quiz round and one multiple choice question", () => {
    const draft = blankDraft();
    expect(draft.title).toBe("");
    expect(draft.languages).toBe("en");
    expect(draft.screenLanguage).toBe("en");
    expect(draft.rounds).toHaveLength(1);
    expect(at(draft.rounds, 0).kind).toBe("quiz");
    expect(at(draft.rounds, 0).questions).toHaveLength(1);
    expect(at(at(draft.rounds, 0).questions, 0).question.type).toBe(
      "multiple_choice",
    );
  });

  it("gives each question type its default shape", () => {
    const multipleChoice = newQuestion("multiple_choice", "quiz");
    expect(optionsOf(multipleChoice).map((option) => option.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
    expect(
      optionsOf(multipleChoice).every(
        (option) => option.text.en === "" && option.text.pt === "",
      ),
    ).toBe(true);
    expect(multipleChoice.answer).toBeNull();

    const order = newQuestion("order", "quiz");
    expect(optionsOf(order).map((option) => option.id)).toEqual([
      "a",
      "b",
      "c",
    ]);

    expect(newQuestion("prompt", "lie_detector").answer).toEqual({
      truth: { en: "", pt: "" },
    });
    expect(newQuestion("prompt", "caption_this").answer).toBeNull();
    expect(newQuestion("prompt", "drag_name").answer).toBeNull();

    for (const type of [
      "multiple_choice",
      "true_false",
      "type_answer",
      "order",
      "closest_number",
    ] as const) {
      const question = newQuestion(type, "quiz");
      expect(question.timeLimitSeconds).toBeNull();
      expect(question.points).toBe(1000);
    }
    expect(newQuestion("prompt", "drag_name").points).toBe(1000);
    expect(newQuestion("prompt", "drag_name").timeLimitSeconds).toBeNull();
    expect(defaultRoundSettings()).toEqual({
      timeLimitSeconds: 20,
      isSpeedBonusOn: true,
      isJokerAllowed: true,
      writeSeconds: 60,
      voteSeconds: 30,
    });
  });

  it("opens an order question in its correct order", () => {
    const draft = draftFromQuiz(storedQuiz());
    const question: QuizshowQuestionInput = at(
      at(draft.rounds, 0).questions,
      0,
    ).question;
    expect(optionsOf(question).map((option) => option.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(at(at(draft.rounds, 0).questions, 0).mediaUrl).toBe(
      "https://cdn.example/photo.jpg",
    );
  });

  it("sends an order question's answer as its items' order", () => {
    const draft = blankDraft();
    const question = newQuestion("order", "quiz");
    at(at(draft.rounds, 0).questions, 0).question = {
      ...question,
      options: [
        at(question.options, 2),
        at(question.options, 0),
        at(question.options, 1),
      ],
    };
    const body = draftToInput(draft, null);
    const sent = at(at(body.rounds, 0).questions, 0);
    expect(sent.type === "order" && sent.answer?.orderedIds).toEqual([
      "c",
      "a",
      "b",
    ]);
  });

  it("drops draft keys and preview urls from the body", () => {
    const draft = draftFromQuiz(storedQuiz());
    const body = draftToInput(draft, "2026-10-19T10:00:00.000Z");
    const serialised = JSON.stringify(body);
    expect(serialised).not.toContain("draftKey");
    expect(serialised).not.toContain("mediaUrl");
    expect(serialised).not.toContain("question-1");
    expect(body.expectedUpdatedAt).toBe("2026-10-19T10:00:00.000Z");
    expect(at(body.rounds, 0).settings).toEqual(defaultRoundSettings());
    expect(at(at(body.rounds, 0).questions, 0).mediaRef).toBe(
      "uploads/photo.jpg",
    );
  });

  it("keeps the prompt, picture and points when the type changes, and resets the answer", () => {
    const original = {
      ...newQuestion("multiple_choice", "quiz"),
      prompt: { en: "Hello", pt: "Ola" },
      mediaRef: "uploads/x.jpg",
      points: 2000,
      answer: { correctIndex: 2 },
    } as ReturnType<typeof newQuestion>;
    const changed = changeQuestionType(original, "true_false", "quiz");
    expect(changed.type).toBe("true_false");
    expect(changed.prompt).toEqual({ en: "Hello", pt: "Ola" });
    expect(changed.mediaRef).toBe("uploads/x.jpg");
    expect(changed.points).toBe(2000);
    expect(changed.answer).toBeNull();
    expect(changed.options).toEqual([]);
  });

  it("removes the questions that fit the old kind when a round changes kind, keeping one default question", () => {
    const quizRound = newRound("quiz");
    const toParty = changeRoundKind(quizRound, "lie_detector");
    expect(toParty.kind).toBe("lie_detector");
    expect(toParty.questions).toHaveLength(1);
    expect(at(toParty.questions, 0).question.type).toBe("prompt");
    expect(at(toParty.questions, 0).question.answer).toEqual({
      truth: { en: "", pt: "" },
    });

    const toQuiz = changeRoundKind(toParty, "quiz");
    expect(toQuiz.questions).toHaveLength(1);
    expect(at(toQuiz.questions, 0).question.type).toBe("multiple_choice");

    const lieRound = newRound("lie_detector");
    at(lieRound.questions, 0).question = {
      ...at(lieRound.questions, 0).question,
      prompt: { en: "Kept", pt: "Mantido" },
    };
    const toCaption = changeRoundKind(lieRound, "caption_this");
    expect(at(toCaption.questions, 0).question.prompt.en).toBe("Kept");
    expect(at(toCaption.questions, 0).question.answer).toBeNull();
  });

  it("moves, removes and duplicates without touching the source array", () => {
    const source = ["x", "y", "z"];
    expect(moveItem(source, 0, 2)).toEqual(["y", "z", "x"]);
    expect(removeAt(source, 1)).toEqual(["x", "z"]);
    expect(source).toEqual(["x", "y", "z"]);

    const round = newRound("quiz");
    const duplicated = duplicateQuestionAt(round, 0);
    expect(round.questions).toHaveLength(1);
    expect(duplicated.questions).toHaveLength(2);
    expect(at(duplicated.questions, 1).draftKey).not.toBe(
      at(duplicated.questions, 0).draftKey,
    );
    expect(at(duplicated.questions, 1).question).toEqual(
      at(duplicated.questions, 0).question,
    );
    expect(at(duplicated.questions, 1).question).not.toBe(
      at(duplicated.questions, 0).question,
    );
  });

  it("mints the first unused option id", () => {
    expect(mintOptionId([])).toBe("a");
    expect(
      mintOptionId([
        { id: "a", text: blankText },
        { id: "c", text: blankText },
      ]),
    ).toBe("b");
  });

  it("sees a reorder as a change and an untouched draft as clean", () => {
    const quiz = storedQuiz();
    const baseline = draftFromQuiz(quiz);
    expect(isDraftDirty(draftFromQuiz(quiz), baseline)).toBe(false);
    const reordered = draftFromQuiz(quiz);
    const question: QuizshowQuestionInput = at(
      at(reordered.rounds, 0).questions,
      0,
    ).question;
    at(at(reordered.rounds, 0).questions, 0).question = {
      ...question,
      options: moveItem(optionsOf(question), 0, 1),
    } as QuizshowQuestionInput;
    expect(isDraftDirty(reordered, baseline)).toBe(true);
  });
});

describe("quizshowDraft final fixes", () => {
  it("switching a caption round to Lie Detector drops its picture", () => {
    const captionRound = newRound("caption_this");
    at(captionRound.questions, 0).question = {
      ...at(captionRound.questions, 0).question,
      prompt: { en: "Caption this", pt: "Legenda isto" },
      mediaRef: "uploads/caption.jpg",
    };
    at(captionRound.questions, 0).mediaUrl = "https://cdn.example/caption.jpg";

    const toLieDetector = changeRoundKind(captionRound, "lie_detector");
    const keptQuestion = at(toLieDetector.questions, 0);
    expect(keptQuestion.question.prompt.en).toBe("Caption this");
    expect(keptQuestion.question.mediaRef).toBeNull();
    expect(keptQuestion.mediaUrl).toBeNull();

    const toDragName = changeRoundKind(captionRound, "drag_name");
    expect(at(toDragName.questions, 0).question.mediaRef).toBeNull();
    expect(at(toDragName.questions, 0).mediaUrl).toBeNull();

    // The source round is left as it was.
    expect(at(captionRound.questions, 0).question.mediaRef).toBe(
      "uploads/caption.jpg",
    );
  });

  it("changing the question type keeps its time limit", () => {
    const original: QuizshowQuestionInput = {
      ...newQuestion("multiple_choice", "quiz"),
      timeLimitSeconds: 45,
    };
    const changed = changeQuestionType(original, "closest_number", "quiz");
    expect(changed.type).toBe("closest_number");
    expect(changed.timeLimitSeconds).toBe(45);

    const roundDefault = changeQuestionType(
      newQuestion("true_false", "quiz"),
      "order",
      "quiz",
    );
    expect(roundDefault.timeLimitSeconds).toBeNull();
  });

  it("starts a blank quiz in the language it is given", () => {
    const portugueseDraft = blankDraft("pt");
    expect(portugueseDraft.languages).toBe("pt");
    expect(portugueseDraft.screenLanguage).toBe("pt");
    expect(blankDraft().languages).toBe("en");
  });
});
