import { describe, expect, it } from "vitest";
import type {
  QuizshowContentLabel,
  QuizshowOption,
  QuizshowQuestion,
  QuizshowQuestionInput,
  QuizshowQuiz,
  QuizshowRoundSettings,
} from "../../../shared/contracts/quizshow";
import {
  blankDraft,
  changeQuestionType,
  changeRoundKind,
  closestToleranceOf,
  defaultRoundSettings,
  draftFromQuiz,
  draftToInput,
  duplicateQuestionAt,
  isDraftDirty,
  isLastWrongOption,
  isQuestionTypeChangeLossy,
  mintOptionId,
  moveItem,
  newQuestion,
  newRound,
  newWheel,
  removeAt,
  withClosestTolerance,
  withCorrectOptionToggled,
  withNewQuestion,
  withOptionRemoved,
  type QuizshowDraft,
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
    mediaAlt: blankText,
    mediaReveal: "instant",
    revealNote: blankText,
    numberUnit: blankText,
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
    sourceTemplateId: null,
    sourceTemplate: null,
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
      wheelBonus: 0,
      wheelPick: "round",
      sliceCount: null,
      isWarmUp: false,
      talkSeconds: 0,
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
      answer: { correctIndexes: [2] },
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

  it("returns all ten settings with the wheel defaults", () => {
    expect(Object.keys(defaultRoundSettings())).toHaveLength(10);
    expect(defaultRoundSettings()).toMatchObject({
      wheelBonus: 0,
      wheelPick: "round",
      sliceCount: null,
    });
  });

  it("builds a wheel row with no questions", () => {
    const wheel = newWheel();
    expect(wheel).toMatchObject({
      kind: "wheel",
      contentLabel: "none",
      questions: [],
    });
    expect(wheel.title).toEqual(blankText);
  });

  it("never changes a wheel row's kind", () => {
    const wheel = newWheel();
    expect(changeRoundKind(wheel, "quiz")).toBe(wheel);
  });

  it("adds no question to a wheel row", () => {
    const wheel = newWheel();
    expect(withNewQuestion(wheel)).toBe(wheel);
    expect(withNewQuestion(newRound("quiz")).questions).toHaveLength(2);
    const caption = withNewQuestion(newRound("caption_this"));
    expect(at(caption.questions, 1).question.type).toBe("prompt");
  });

  it("fills the wheel defaults on load and stays clean", () => {
    const legacySettings = {
      timeLimitSeconds: 20,
      isSpeedBonusOn: true,
      isJokerAllowed: true,
      writeSeconds: 60,
      voteSeconds: 30,
    } as unknown as QuizshowRoundSettings;
    const legacyQuiz: QuizshowQuiz = {
      ...storedQuiz(),
      rounds: [{ ...at(storedQuiz().rounds, 0), settings: legacySettings }],
    };
    const draft = draftFromQuiz(legacyQuiz);
    expect(at(draft.rounds, 0).settings).toMatchObject({
      wheelBonus: 0,
      wheelPick: "round",
      sliceCount: null,
    });
    // The baseline spells the three defaults out by hand, so a load that
    // filled them differently would read as an edit.
    const baselineQuiz: QuizshowQuiz = {
      ...legacyQuiz,
      rounds: [
        {
          ...at(legacyQuiz.rounds, 0),
          settings: {
            ...legacySettings,
            wheelBonus: 0,
            wheelPick: "round",
            sliceCount: null,
          },
        },
      ],
    };
    expect(isDraftDirty(draft, draftFromQuiz(baselineQuiz))).toBe(false);
  });

  it("normalises wheel rows in the save body", () => {
    const withSettings = (
      round: QuizshowDraft["rounds"][number],
      patch: Partial<QuizshowRoundSettings>,
      contentLabel: QuizshowContentLabel = "none",
    ) => ({
      ...round,
      contentLabel,
      settings: { ...round.settings, ...patch },
    });
    const draft: QuizshowDraft = {
      ...blankDraft(),
      rounds: [
        withSettings(newRound("quiz"), { wheelBonus: 500 }),
        withSettings(newWheel(), { wheelBonus: 250 }, "spicy"),
        withSettings(newRound("quiz"), {
          wheelBonus: 250,
          sliceCount: 3,
          wheelPick: "question",
        }),
        newRound("quiz"),
      ],
    };
    const input = draftToInput(draft, null);
    expect(at(input.rounds, 0).settings.wheelBonus).toBe(0);
    expect(at(input.rounds, 1)).toMatchObject({
      contentLabel: "none",
      settings: { wheelBonus: 0 },
    });
    expect(at(input.rounds, 2).settings).toMatchObject({
      wheelBonus: 250,
      sliceCount: null,
      wheelPick: "round",
    });
    expect(at(draft.rounds, 1).contentLabel).toBe("spicy");
  });

  it("drops a bonus outside every range from the save body without dirtying the draft", () => {
    const baseline: QuizshowDraft = {
      ...blankDraft(),
      rounds: [
        newRound("quiz"),
        newWheel(),
        newRound("quiz"),
        newRound("quiz"),
      ],
    };
    const firstRound = at(baseline.rounds, 0);
    const draftWithBonusOutside: QuizshowDraft = {
      ...baseline,
      rounds: [
        {
          ...firstRound,
          settings: { ...firstRound.settings, wheelBonus: 500 },
        },
        ...baseline.rounds.slice(1),
      ],
    };
    expect(isDraftDirty(draftWithBonusOutside, baseline)).toBe(false);
    expect(at(draftWithBonusOutside.rounds, 0).settings.wheelBonus).toBe(500);
  });
});

type MultipleChoiceQuestion = Extract<
  QuizshowQuestionInput,
  { type: "multiple_choice" }
>;

function filledOptions(texts: readonly string[]): QuizshowOption[] {
  return texts.map((text, optionIndex) => ({
    id: String.fromCharCode(97 + optionIndex),
    text: { en: text, pt: text },
  }));
}

function multipleChoiceWith(
  texts: readonly string[],
  correctIndexes: number[] | null,
): MultipleChoiceQuestion {
  return {
    ...newQuestion("multiple_choice", "quiz"),
    prompt: { en: "Which?", pt: "Qual?" },
    options: filledOptions(texts),
    answer: correctIndexes === null ? null : { correctIndexes },
  };
}

describe("quizshowDraft Pulse Live v2 model", () => {
  it("hydrates a legacy multiple choice and closest number question", () => {
    // Stored before v2: one correct index and none of the margin, note, unit or alt fields.
    const legacyMultipleChoice = {
      id: "question-mc",
      mediaUrl: null,
      type: "multiple_choice",
      prompt: { en: "Pick", pt: "Escolhe" },
      mediaRef: null,
      timeLimitSeconds: null,
      points: 1000,
      options: filledOptions(["One", "Two", "Three"]),
      answer: { correctIndex: 1 },
      acceptedAnswers: [],
    };
    const legacyClosest = {
      id: "question-closest",
      mediaUrl: null,
      type: "closest_number",
      prompt: { en: "When?", pt: "Quando?" },
      mediaRef: null,
      timeLimitSeconds: null,
      points: 1000,
      options: [],
      answer: { value: 1969 },
      acceptedAnswers: [],
    };
    const legacyQuiz = {
      ...storedQuiz(),
      rounds: [
        {
          ...at(storedQuiz().rounds, 0),
          settings: {
            timeLimitSeconds: 20,
            isSpeedBonusOn: true,
            isJokerAllowed: true,
            writeSeconds: 60,
            voteSeconds: 30,
            wheelBonus: 0,
            wheelPick: "round",
            sliceCount: null,
          },
          questions: [legacyMultipleChoice, legacyClosest],
        },
      ],
    } as unknown as QuizshowQuiz;
    const draft = draftFromQuiz(legacyQuiz);
    const round = at(draft.rounds, 0);
    expect(round.settings).toMatchObject({ isWarmUp: false, talkSeconds: 0 });
    const multipleChoice = at(round.questions, 0).question;
    expect(multipleChoice.answer).toEqual({ correctIndexes: [1] });
    expect(multipleChoice).toMatchObject({
      mediaAlt: blankText,
      mediaReveal: "instant",
      revealNote: blankText,
      numberUnit: blankText,
    });
    const closest = at(round.questions, 1).question;
    expect(closest.answer).toEqual({
      value: 1969,
      tolerance: { mode: "absolute", amount: 10 },
    });
    // Hydrating the hydrated quiz again changes nothing.
    expect(isDraftDirty(draftFromQuiz(legacyQuiz), draft)).toBe(false);
  });

  it("fills the v2 fields on every new question and starts a poll with two blank options", () => {
    const question = newQuestion("type_answer", "quiz");
    expect(question).toMatchObject({
      mediaAlt: blankText,
      mediaReveal: "instant",
      revealNote: blankText,
      numberUnit: blankText,
    });
    const poll = newQuestion("poll", "quiz");
    expect(poll.answer).toBeNull();
    expect(poll.options).toHaveLength(2);
    expect(newQuestion("closest_number", "quiz").answer).toBeNull();
    expect(closestToleranceOf(newQuestion("closest_number", "quiz"))).toEqual({
      mode: "exact",
      amount: 0,
    });
  });

  it("keeps the options when multiple choice turns into a poll and back", () => {
    const original = {
      ...multipleChoiceWith(["Red", "Blue", "Green"], [1]),
      revealNote: { en: "Fun", pt: "Giro" },
    };
    const poll = changeQuestionType(original, "poll", "quiz");
    expect(poll.type).toBe("poll");
    expect(poll.options).toEqual(original.options);
    expect(poll.answer).toBeNull();
    expect(poll.revealNote).toEqual({ en: "Fun", pt: "Giro" });

    const backToChoice = changeQuestionType(poll, "multiple_choice", "quiz");
    expect(backToChoice.options).toEqual(original.options);
    expect(backToChoice.answer).toEqual({ correctIndexes: [0] });
  });

  it("pads multiple choice options to the order minimum and trims order items to the choice maximum", () => {
    const twoOptions = multipleChoiceWith(["First", "Second"], null);
    const order = changeQuestionType(twoOptions, "order", "quiz");
    expect(order.type).toBe("order");
    expect(optionsOf(order).map((option) => option.text.en)).toEqual([
      "First",
      "Second",
      "",
    ]);
    expect(new Set(optionsOf(order).map((option) => option.id)).size).toBe(3);

    const fiveItems: QuizshowQuestionInput = {
      ...newQuestion("order", "quiz"),
      options: filledOptions(["A", "B", "C", "D", "E"]),
    };
    const choice = changeQuestionType(fiveItems, "multiple_choice", "quiz");
    expect(optionsOf(choice).map((option) => option.text.en)).toEqual([
      "A",
      "B",
      "C",
      "D",
    ]);
    expect(choice.answer).toBeNull();
  });

  it("calls a type change lossy only when an option with text or a set answer would go", () => {
    const marked = multipleChoiceWith(["Red", "Blue"], [0]);
    expect(isQuestionTypeChangeLossy(marked, "poll")).toBe(false);
    expect(isQuestionTypeChangeLossy(marked, "order")).toBe(true);
    expect(isQuestionTypeChangeLossy(marked, "true_false")).toBe(true);
    expect(isQuestionTypeChangeLossy(marked, "multiple_choice")).toBe(false);

    const unmarked = multipleChoiceWith(["Red", "Blue"], null);
    expect(isQuestionTypeChangeLossy(unmarked, "order")).toBe(false);
    expect(isQuestionTypeChangeLossy(unmarked, "true_false")).toBe(true);
    expect(
      isQuestionTypeChangeLossy(
        newQuestion("multiple_choice", "quiz"),
        "true_false",
      ),
    ).toBe(false);

    const fiveItems: QuizshowQuestionInput = {
      ...newQuestion("order", "quiz"),
      options: filledOptions(["A", "B", "C", "D", "E"]),
    };
    expect(isQuestionTypeChangeLossy(fiveItems, "multiple_choice")).toBe(true);
    const fourItems: QuizshowQuestionInput = {
      ...fiveItems,
      options: filledOptions(["A", "B", "C", "D"]),
    };
    expect(isQuestionTypeChangeLossy(fourItems, "poll")).toBe(false);

    const answeredTrueFalse: QuizshowQuestionInput = {
      ...newQuestion("true_false", "quiz"),
      answer: { isTrue: true },
    };
    expect(isQuestionTypeChangeLossy(answeredTrueFalse, "type_answer")).toBe(
      true,
    );
    expect(
      isQuestionTypeChangeLossy(newQuestion("true_false", "quiz"), "order"),
    ).toBe(false);
  });

  it("marks several options correct and always leaves one wrong", () => {
    let question = multipleChoiceWith(["A", "B", "C"], null);
    question = withCorrectOptionToggled(question, 2);
    question = withCorrectOptionToggled(question, 0);
    expect(question.answer).toEqual({ correctIndexes: [0, 2] });
    expect(isLastWrongOption(question, 1)).toBe(true);
    expect(withCorrectOptionToggled(question, 1)).toBe(question);

    question = withCorrectOptionToggled(question, 2);
    question = withCorrectOptionToggled(question, 0);
    expect(question.answer).toBeNull();
  });

  it("moves the marks down when an option before them is removed", () => {
    const question = multipleChoiceWith(["A", "B", "C", "D"], [1, 3]);
    const removed = withOptionRemoved(question, 0);
    expect(removed.options.map((option) => option.id)).toEqual(["b", "c", "d"]);
    expect(removed.answer).toEqual({ correctIndexes: [0, 2] });
    expect(withOptionRemoved(removed, 0).answer).toEqual({
      correctIndexes: [1],
    });
  });

  it("sets the margin only on a question that has a number", () => {
    const closest = newQuestion("closest_number", "quiz");
    const margin = { mode: "absolute" as const, amount: 5 };
    expect(withClosestTolerance(closest, margin)).toBe(closest);
    const withNumber = {
      ...closest,
      answer: { value: 10, tolerance: { mode: "exact" as const, amount: 0 } },
    };
    expect(withClosestTolerance(withNumber, margin).answer).toEqual({
      value: 10,
      tolerance: margin,
    });
  });
});

describe("quizshowDraft marks read only valid indexes", () => {
  it("counts unique in-range marks and drops the rest on any toggle", () => {
    // An import can carry an index past the options or the same one twice.
    const imported = multipleChoiceWith(["A", "B", "C"], [0, 0, 7]);
    expect(isLastWrongOption(imported, 1)).toBe(false);
    const toggled = withCorrectOptionToggled(imported, 1);
    expect(toggled.answer).toEqual({ correctIndexes: [0, 1] });
    expect(isLastWrongOption(toggled, 2)).toBe(true);
  });

  it("keeps the marks inside the options after a removal", () => {
    const imported = multipleChoiceWith(["A", "B", "C"], [2, 9]);
    expect(withOptionRemoved(imported, 0).answer).toEqual({
      correctIndexes: [1],
    });
    expect(withOptionRemoved(imported, 2).answer).toBeNull();
  });
});
