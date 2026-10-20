import {
  QUIZSHOW_LIMITS,
  type QuizshowLanguage,
  type QuizshowLanguageMode,
  type QuizshowOption,
  type QuizshowQuestion,
  type QuizshowQuestionInput,
  type QuizshowQuestionType,
  type QuizshowQuiz,
  type QuizshowQuizInput,
  type QuizshowRoundInput,
  type QuizshowRoundKind,
  type QuizshowRoundSettings,
} from "../../../shared/contracts/quizshow";

export interface QuizshowDraftQuestion {
  /** Stable React key, local to the builder. */
  draftKey: string;
  question: QuizshowQuestionInput;
  /** Preview of a saved image; a fresh pick previews through ImageUploadField. */
  mediaUrl: string | null;
}

export interface QuizshowDraftRound extends Omit<
  QuizshowRoundInput,
  "questions"
> {
  draftKey: string;
  questions: QuizshowDraftQuestion[];
}

export interface QuizshowDraft {
  title: string;
  languages: QuizshowLanguageMode;
  screenLanguage: QuizshowLanguage;
  rounds: QuizshowDraftRound[];
}

let draftKeyCounter = 0;

function mintDraftKey(): string {
  draftKeyCounter += 1;
  return `draft-${draftKeyCounter}`;
}

function blankText(): { en: string; pt: string } {
  return { en: "", pt: "" };
}

function blankOptions(optionCount: number): QuizshowOption[] {
  return Array.from({ length: optionCount }, (_unused, optionIndex) => ({
    id: String.fromCharCode("a".charCodeAt(0) + optionIndex),
    text: blankText(),
  }));
}

export function defaultRoundSettings(): QuizshowRoundSettings {
  return {
    timeLimitSeconds: QUIZSHOW_LIMITS.timeLimitSecondsDefault,
    isSpeedBonusOn: true,
    isJokerAllowed: true,
    writeSeconds: QUIZSHOW_LIMITS.writeSecondsDefault,
    voteSeconds: QUIZSHOW_LIMITS.voteSecondsDefault,
  };
}

export function newQuestion<Type extends QuizshowQuestionType>(
  type: Type,
  roundKind: QuizshowRoundKind,
): Extract<QuizshowQuestionInput, { type: Type }>;
export function newQuestion(
  type: QuizshowQuestionType,
  roundKind: QuizshowRoundKind,
): QuizshowQuestionInput {
  const base = {
    prompt: blankText(),
    mediaRef: null,
    timeLimitSeconds: null,
    points: QUIZSHOW_LIMITS.pointsDefault,
  };
  switch (type) {
    case "multiple_choice":
      return {
        ...base,
        type,
        options: blankOptions(4),
        answer: null,
        acceptedAnswers: [],
      };
    case "order":
      return {
        ...base,
        type,
        options: blankOptions(3),
        answer: null,
        acceptedAnswers: [],
      };
    case "true_false":
      return { ...base, type, options: [], answer: null, acceptedAnswers: [] };
    case "type_answer":
      return { ...base, type, options: [], answer: null, acceptedAnswers: [] };
    case "closest_number":
      return { ...base, type, options: [], answer: null, acceptedAnswers: [] };
    case "prompt":
      return {
        ...base,
        type,
        options: [],
        answer: roundKind === "lie_detector" ? { truth: blankText() } : null,
        acceptedAnswers: [],
      };
  }
}

function draftQuestionOf(
  question: QuizshowQuestionInput,
  mediaUrl: string | null,
) {
  return { draftKey: mintDraftKey(), question, mediaUrl };
}

function defaultTypeFor(roundKind: QuizshowRoundKind): QuizshowQuestionType {
  return roundKind === "quiz" ? "multiple_choice" : "prompt";
}

export function newRound(kind: QuizshowRoundKind): QuizshowDraftRound {
  return {
    draftKey: mintDraftKey(),
    kind,
    title: blankText(),
    contentLabel: "none",
    settings: defaultRoundSettings(),
    questions: [draftQuestionOf(newQuestion(defaultTypeFor(kind), kind), null)],
  };
}

/** A new quiz, written in `language` (the app language when the host starts blank). */
export function blankDraft(language: QuizshowLanguage = "en"): QuizshowDraft {
  return {
    title: "",
    languages: language,
    screenLanguage: language,
    rounds: [newRound("quiz")],
  };
}

function inputOfStoredQuestion(
  stored: QuizshowQuestion,
): QuizshowQuestionInput {
  const input: Record<string, unknown> = { ...stored };
  delete input.id;
  delete input.mediaUrl;
  const question = input as unknown as QuizshowQuestionInput;
  if (question.type !== "order" || question.answer === null) {
    return question;
  }
  const { orderedIds } = question.answer;
  const sortedOptions = [...question.options].sort(
    (first, second) =>
      orderedIds.indexOf(first.id) - orderedIds.indexOf(second.id),
  );
  return { ...question, options: sortedOptions };
}

export function draftFromQuiz(quiz: QuizshowQuiz): QuizshowDraft {
  return {
    title: quiz.title,
    languages: quiz.languages,
    screenLanguage: quiz.screenLanguage,
    rounds: quiz.rounds.map((round) => ({
      draftKey: mintDraftKey(),
      kind: round.kind,
      title: round.title,
      contentLabel: round.contentLabel,
      settings: round.settings,
      questions: round.questions.map((stored) =>
        draftQuestionOf(inputOfStoredQuestion(stored), stored.mediaUrl),
      ),
    })),
  };
}

function questionBody(question: QuizshowQuestionInput): QuizshowQuestionInput {
  if (
    question.type === "order" &&
    question.options.every((option) => option.id.length > 0)
  ) {
    return {
      ...question,
      answer: { orderedIds: question.options.map((option) => option.id) },
    };
  }
  return question;
}

function quizBody(
  draft: QuizshowDraft,
): Omit<QuizshowQuizInput, "expectedUpdatedAt"> {
  return {
    title: draft.title,
    languages: draft.languages,
    screenLanguage: draft.screenLanguage,
    rounds: draft.rounds.map((round) => ({
      kind: round.kind,
      title: round.title,
      contentLabel: round.contentLabel,
      settings: { ...round.settings },
      questions: round.questions.map((draftQuestion) =>
        questionBody(draftQuestion.question),
      ),
    })),
  };
}

export function draftToInput(
  draft: QuizshowDraft,
  expectedUpdatedAt: string | null,
): QuizshowQuizInput {
  return { expectedUpdatedAt, ...quizBody(draft) };
}

export function changeQuestionType(
  question: QuizshowQuestionInput,
  nextType: QuizshowQuestionType,
  roundKind: QuizshowRoundKind,
): QuizshowQuestionInput {
  return {
    ...newQuestion(nextType, roundKind),
    prompt: question.prompt,
    mediaRef: question.mediaRef,
    timeLimitSeconds: question.timeLimitSeconds,
    points: question.points,
  };
}

function promptAnswerFor(nextKind: QuizshowRoundKind) {
  return nextKind === "lie_detector" ? { truth: blankText() } : null;
}

/** Lie Detector and Drag Name Generator questions carry no picture. */
function isPictureFreeKind(kind: QuizshowRoundKind): boolean {
  return kind === "lie_detector" || kind === "drag_name";
}

function withoutPicture(
  draftQuestion: QuizshowDraftQuestion,
): QuizshowDraftQuestion {
  return {
    ...draftQuestion,
    question: { ...draftQuestion.question, mediaRef: null },
    mediaUrl: null,
  };
}

export function changeRoundKind(
  round: QuizshowDraftRound,
  nextKind: QuizshowRoundKind,
): QuizshowDraftRound {
  const isNextQuiz = nextKind === "quiz";
  const keptQuestions = round.questions
    .filter(({ question }) => (question.type === "prompt") !== isNextQuiz)
    .map((draftQuestion) => {
      const { question } = draftQuestion;
      if (question.type !== "prompt" || round.kind === nextKind) {
        return draftQuestion;
      }
      return {
        ...draftQuestion,
        question: { ...question, answer: promptAnswerFor(nextKind) },
      };
    });
  const fittedQuestions = isPictureFreeKind(nextKind)
    ? keptQuestions.map(withoutPicture)
    : keptQuestions;
  return {
    ...round,
    kind: nextKind,
    questions:
      fittedQuestions.length > 0
        ? fittedQuestions
        : [
            draftQuestionOf(
              newQuestion(defaultTypeFor(nextKind), nextKind),
              null,
            ),
          ],
  };
}

export function moveItem<Item>(
  items: readonly Item[],
  fromIndex: number,
  toIndex: number,
): Item[] {
  const result = [...items];
  const isInRange = (index: number) => index >= 0 && index < items.length;
  if (!isInRange(fromIndex) || !isInRange(toIndex) || fromIndex === toIndex) {
    return result;
  }
  const [moved] = result.splice(fromIndex, 1);
  if (moved === undefined) {
    return [...items];
  }
  result.splice(toIndex, 0, moved);
  return result;
}

export function removeAt<Item>(items: readonly Item[], index: number): Item[] {
  return items.filter((_item, itemIndex) => itemIndex !== index);
}

export function duplicateQuestionAt(
  round: QuizshowDraftRound,
  questionIndex: number,
): QuizshowDraftRound {
  const source = round.questions[questionIndex];
  if (!source) {
    return round;
  }
  const copy: QuizshowDraftQuestion = {
    draftKey: mintDraftKey(),
    question: structuredClone(source.question),
    mediaUrl: source.mediaUrl,
  };
  const questions = [...round.questions];
  questions.splice(questionIndex + 1, 0, copy);
  return { ...round, questions };
}

export function mintOptionId(options: readonly QuizshowOption[]): string {
  const usedIds = new Set(options.map((option) => option.id));
  for (let letterCode = 97; letterCode <= 122; letterCode += 1) {
    const candidate = String.fromCharCode(letterCode);
    if (!usedIds.has(candidate)) {
      return candidate;
    }
  }
  let suffix = 1;
  while (usedIds.has(`o${suffix}`)) {
    suffix += 1;
  }
  return `o${suffix}`;
}

export function isDraftDirty(
  draft: QuizshowDraft,
  baseline: QuizshowDraft,
): boolean {
  return JSON.stringify(quizBody(draft)) !== JSON.stringify(quizBody(baseline));
}
