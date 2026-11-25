import {
  QUIZSHOW_CLOSEST_TOLERANCE_DEFAULT,
  QUIZSHOW_LIMITS,
  QUIZSHOW_WHEEL_SETTINGS_DEFAULTS,
  type QuizshowClosestTolerance,
  type QuizshowLanguage,
  type QuizshowLanguageMode,
  type QuizshowOption,
  type QuizshowPlayableRoundKind,
  type QuizshowQuestionInput,
  type QuizshowQuestionType,
  type QuizshowQuizInput,
  type QuizshowRoundInput,
  type QuizshowRoundKind,
  type QuizshowRoundSettings,
  type QuizshowScreenLanguage,
} from "../../../shared/contracts/quizshow";
import { normaliseStoredQuiz } from "../quizshowNormalise";
import {
  isQuizRoundKind,
  isWheelRoundKind,
  normaliseWheelRounds,
  withWheelSettingsDefaults,
} from "../quizshowWheel";

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
  /** 'both' only while `languages` is 'both' (contract 6.26). */
  screenLanguage: QuizshowScreenLanguage;
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
    ...QUIZSHOW_WHEEL_SETTINGS_DEFAULTS,
    isWarmUp: false,
    talkSeconds: 0,
  };
}

/** A copy of the tolerance a new closest number question starts with (contract 6.1). */
export function defaultClosestTolerance(): QuizshowClosestTolerance {
  return { ...QUIZSHOW_CLOSEST_TOLERANCE_DEFAULT };
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
    mediaAlt: blankText(),
    mediaReveal: "instant" as const,
    revealNote: blankText(),
    numberUnit: blankText(),
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
    case "poll":
      return {
        ...base,
        type,
        options: blankOptions(QUIZSHOW_LIMITS.multipleChoiceOptionsMin),
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

function defaultTypeFor(
  roundKind: QuizshowPlayableRoundKind,
): QuizshowQuestionType {
  return isQuizRoundKind(roundKind) ? "multiple_choice" : "prompt";
}

export function newRound(kind: QuizshowPlayableRoundKind): QuizshowDraftRound {
  return {
    draftKey: mintDraftKey(),
    kind,
    title: blankText(),
    contentLabel: "none",
    settings: defaultRoundSettings(),
    questions: [draftQuestionOf(newQuestion(defaultTypeFor(kind), kind), null)],
  };
}

/** A wheel row: no questions, its slices come from the rounds that follow it. */
export function newWheel(): QuizshowDraftRound {
  return {
    draftKey: mintDraftKey(),
    kind: "wheel",
    title: blankText(),
    contentLabel: "none",
    settings: defaultRoundSettings(),
    questions: [],
  };
}

/** The round with one more default question; a wheel row has no questions and comes back as it was. */
export function withNewQuestion(round: QuizshowDraftRound): QuizshowDraftRound {
  if (isWheelRoundKind(round.kind)) {
    return round;
  }
  return {
    ...round,
    questions: [
      ...round.questions,
      {
        draftKey: `${round.draftKey}-question-${crypto.randomUUID()}`,
        question: newQuestion(defaultTypeFor(round.kind), round.kind),
        mediaUrl: null,
      },
    ],
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

type QuizshowNormalisedQuiz = ReturnType<typeof normaliseStoredQuiz>;
type QuizshowNormalisedQuestion =
  QuizshowNormalisedQuiz["rounds"][number]["questions"][number];

function inputOfStoredQuestion(
  stored: QuizshowNormalisedQuestion,
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

/**
 * The draft of a stored quiz. A quiz saved before Pulse Live v2 (one correct
 * index, a closest answer without a margin, and none of the note or unit
 * fields) reads through the contract 2.4 normaliser first, so the studio
 * only ever edits the current shapes.
 */
export function draftFromQuiz(
  storedQuiz: Parameters<typeof normaliseStoredQuiz>[0],
): QuizshowDraft {
  const quiz = normaliseStoredQuiz(storedQuiz);
  return {
    title: quiz.title,
    languages: quiz.languages,
    screenLanguage: quiz.screenLanguage,
    rounds: quiz.rounds.map((round) => ({
      draftKey: mintDraftKey(),
      kind: round.kind,
      title: round.title,
      contentLabel: round.contentLabel,
      settings: withWheelSettingsDefaults(round.settings),
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
    rounds: normaliseWheelRounds(draft.rounds).map((round) => ({
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

interface OptionRange {
  min: number;
  max: number;
}

/** The option counts of the types that hold options (a poll takes the multiple choice rules, contract 6.22). */
const OPTION_RANGES: Partial<Record<QuizshowQuestionType, OptionRange>> = {
  multiple_choice: {
    min: QUIZSHOW_LIMITS.multipleChoiceOptionsMin,
    max: QUIZSHOW_LIMITS.multipleChoiceOptionsMax,
  },
  poll: {
    min: QUIZSHOW_LIMITS.multipleChoiceOptionsMin,
    max: QUIZSHOW_LIMITS.multipleChoiceOptionsMax,
  },
  order: {
    min: QUIZSHOW_LIMITS.orderItemsMin,
    max: QUIZSHOW_LIMITS.orderItemsMax,
  },
};

/** The options cut to the target's maximum, then padded with blank ones to its minimum. */
function fittedOptions(
  options: readonly QuizshowOption[],
  range: OptionRange,
): QuizshowOption[] {
  const fitted = options.slice(0, range.max);
  while (fitted.length < range.min) {
    fitted.push({ id: mintOptionId(fitted), text: blankText() });
  }
  return fitted;
}

function hasText(text: { en: string; pt: string }): boolean {
  return text.en.trim().length > 0 || text.pt.trim().length > 0;
}

/**
 * The question as `nextType`, keeping what both types share. Item 19:
 * multiple choice and poll swap their options as they are (a poll drops the
 * marks; a poll turned multiple choice starts with the first option marked),
 * and multiple choice, poll and order keep their option texts, cut or padded
 * to the target's range. Every other part of the answer starts fresh.
 */
export function changeQuestionType(
  question: QuizshowQuestionInput,
  nextType: QuizshowQuestionType,
  roundKind: QuizshowRoundKind,
): QuizshowQuestionInput {
  const isNextPrompt = nextType === "prompt";
  const changed = {
    ...newQuestion(nextType, roundKind),
    prompt: question.prompt,
    mediaRef: question.mediaRef,
    mediaAlt: question.mediaAlt,
    // A prompt lives in a party round, which only shows a picture at once.
    mediaReveal: isNextPrompt ? "instant" : question.mediaReveal,
    revealNote: isNextPrompt ? blankText() : question.revealNote,
    timeLimitSeconds: isNextPrompt ? null : question.timeLimitSeconds,
    points: question.points,
  };
  const sourceRange = OPTION_RANGES[question.type];
  const targetRange = OPTION_RANGES[nextType];
  if (sourceRange === undefined || targetRange === undefined) {
    return changed;
  }
  const options = fittedOptions(question.options, targetRange);
  if (changed.type === "multiple_choice") {
    return {
      ...changed,
      options,
      answer: question.type === "poll" ? { correctIndexes: [0] } : null,
    };
  }
  if (changed.type === "poll" || changed.type === "order") {
    return { ...changed, options };
  }
  return changed;
}

/** Whether the answer the host set would be gone after the change (the options are counted apart). */
function isAnswerLost(
  question: QuizshowQuestionInput,
  nextType: QuizshowQuestionType,
): boolean {
  switch (question.type) {
    case "multiple_choice":
      // Multiple choice and poll swap freely (contract 9.2 item 19).
      return (
        nextType !== "poll" &&
        question.answer !== null &&
        question.answer.correctIndexes.length > 0
      );
    case "true_false":
      return question.answer !== null;
    case "type_answer":
      return (
        (question.answer !== null && hasText(question.answer.text)) ||
        question.acceptedAnswers.length > 0
      );
    case "closest_number":
      return question.answer !== null || hasText(question.numberUnit);
    case "prompt":
      return question.answer !== null && hasText(question.answer.truth);
    case "order":
    case "poll":
      // An order lives in its options' order, and a poll has no answer.
      return false;
  }
}

/**
 * True when changing to `nextType` would remove an option with text in it or
 * an answer the host set (item 19). The studio asks before such a change and
 * applies any other change at once.
 */
export function isQuestionTypeChangeLossy(
  question: QuizshowQuestionInput,
  nextType: QuizshowQuestionType,
): boolean {
  if (nextType === question.type) return false;
  const keptOptionCount = OPTION_RANGES[nextType]?.max ?? 0;
  const isOptionLost = question.options
    .slice(keptOptionCount)
    .some((option) => hasText(option.text));
  return isOptionLost || isAnswerLost(question, nextType);
}

/** The margin a closest number question scores half within; the default while no number is set. */
export function closestToleranceOf(
  question: Extract<QuizshowQuestionInput, { type: "closest_number" }>,
): QuizshowClosestTolerance {
  return question.answer?.tolerance ?? defaultClosestTolerance();
}

/** The question with its margin set; a question with no number yet stays as it is. */
export function withClosestTolerance(
  question: Extract<QuizshowQuestionInput, { type: "closest_number" }>,
  tolerance: QuizshowClosestTolerance,
): Extract<QuizshowQuestionInput, { type: "closest_number" }> {
  if (question.answer === null) return question;
  return { ...question, answer: { ...question.answer, tolerance } };
}

type MarkableQuestion = Extract<
  QuizshowQuestionInput,
  { type: "multiple_choice" }
>;

/**
 * The marked options of a multiple choice question: unique, inside the
 * options, ascending. An index an import left outside the options or twice
 * is not a mark, so every count of marks reads from here.
 */
export function correctIndexesOf(question: MarkableQuestion): number[] {
  const stored = question.answer?.correctIndexes ?? [];
  const inRange = stored.filter(
    (optionIndex) =>
      Number.isInteger(optionIndex) &&
      optionIndex >= 0 &&
      optionIndex < question.options.length,
  );
  return [...new Set(inRange)].sort((first, second) => first - second);
}

/**
 * Marks or unmarks one option as correct (contract 6.22). At least one option
 * always stays wrong: marking the last unmarked option returns the question
 * unchanged. Unmarking the only marked option clears the answer. A toggle
 * writes only the valid marks, so an index outside the options drops out.
 */
export function withCorrectOptionToggled(
  question: MarkableQuestion,
  optionIndex: number,
): MarkableQuestion {
  const marked = correctIndexesOf(question);
  if (marked.includes(optionIndex)) {
    const remaining = marked.filter((index) => index !== optionIndex);
    return {
      ...question,
      answer: remaining.length > 0 ? { correctIndexes: remaining } : null,
    };
  }
  if (marked.length >= question.options.length - 1) return question;
  const correctIndexes = [...marked, optionIndex].sort(
    (first, second) => first - second,
  );
  return { ...question, answer: { correctIndexes } };
}

/**
 * True when marking this option would leave no wrong option: its toggle is
 * disabled, it cannot be removed, and the "Leave at least one option wrong"
 * hint shows. The options field reads all three from this one predicate.
 */
export function isLastWrongOption(
  question: MarkableQuestion,
  optionIndex: number,
): boolean {
  const marked = correctIndexesOf(question);
  return (
    !marked.includes(optionIndex) &&
    marked.length >= question.options.length - 1
  );
}

/** A question whose options the options field edits. */
export type QuizshowOptionListQuestion = Extract<
  QuizshowQuestionInput,
  { type: "multiple_choice" | "poll" }
>;

/** The question without the option at `optionIndex`; the marks after it move down by one. */
export function withOptionRemoved(
  question: QuizshowOptionListQuestion,
  optionIndex: number,
): QuizshowOptionListQuestion {
  const options = question.options.filter(
    (_option, index) => index !== optionIndex,
  );
  if (question.type === "poll" || question.answer === null) {
    return { ...question, options };
  }
  const correctIndexes = correctIndexesOf(question)
    .filter((index) => index !== optionIndex)
    .map((index) => (index > optionIndex ? index - 1 : index));
  return {
    ...question,
    options,
    answer: correctIndexes.length > 0 ? { correctIndexes } : null,
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
  nextKind: QuizshowPlayableRoundKind,
): QuizshowDraftRound {
  if (isWheelRoundKind(round.kind)) {
    return round;
  }
  const isNextQuiz = isQuizRoundKind(nextKind);
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
