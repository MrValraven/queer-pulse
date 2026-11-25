import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_PARTY_ROUND_KINDS,
  type QuizshowClosestTolerance,
  type QuizshowLanguage,
  type QuizshowLanguageMode,
  type QuizshowOption,
  type QuizshowQuestionInput,
  type QuizshowQuizInput,
  type QuizshowQuizProblem,
  type QuizshowQuizProblemCode,
  type QuizshowRoundKind,
} from "../../../shared/contracts/quizshow";
import {
  isInWheelRange,
  isWheelRoundKind,
  playableRoundCount,
  wheelSliceRoundIndexes,
} from "../quizshowWheel";
import { draftToInput, type QuizshowDraft } from "./quizshowDraft";

export type QuizshowLocalProblemCode =
  QuizshowQuizProblemCode | "adults_round_needs_adults_event";

export interface QuizshowLocalProblem {
  code: QuizshowLocalProblemCode;
  roundIndex: number | null;
  questionIndex: number | null;
  language: QuizshowLanguage | null;
}

const STRUCTURAL_CODES: readonly QuizshowLocalProblemCode[] = [
  "too_many_rounds",
  "too_many_wheels",
  "too_many_questions",
  "too_many_questions_in_round",
  "question_type_not_allowed",
  "option_count",
  "option_ids_not_unique",
  "answer_out_of_range",
  "order_answer_not_permutation",
  "answer_not_allowed",
  "too_many_correct_options",
  "tolerance_out_of_range",
  "poll_in_party_round",
  "slow_reveal_needs_picture",
  "warm_up_not_first",
  "adults_round_needs_adults_event",
];

export function usedLanguagesOf(
  mode: QuizshowLanguageMode,
): QuizshowLanguage[] {
  return mode === "both" ? ["en", "pt"] : [mode];
}

export function isStructuralProblem(code: QuizshowLocalProblemCode): boolean {
  return STRUCTURAL_CODES.includes(code);
}

export function quizshowProblemsFromServer(
  problems: readonly QuizshowQuizProblem[],
): QuizshowLocalProblem[] {
  return problems.map((serverProblem) => ({ ...serverProblem }));
}

type ProblemInput = Omit<QuizshowQuizInput, "expectedUpdatedAt">;

function problem(
  code: QuizshowLocalProblemCode,
  roundIndex: number | null,
  questionIndex: number | null,
  language: QuizshowLanguage | null = null,
): QuizshowLocalProblem {
  return { code, roundIndex, questionIndex, language };
}

function isBlank(text: string | null | undefined): boolean {
  return typeof text !== "string" || text.trim().length === 0;
}

function isOptionCountValid(question: QuizshowQuestionInput): boolean {
  const optionCount = question.options.length;
  // A poll takes the multiple choice option rules (contract 6.22).
  if (question.type === "multiple_choice" || question.type === "poll") {
    return (
      optionCount >= QUIZSHOW_LIMITS.multipleChoiceOptionsMin &&
      optionCount <= QUIZSHOW_LIMITS.multipleChoiceOptionsMax
    );
  }
  if (question.type === "order") {
    return (
      optionCount >= QUIZSHOW_LIMITS.orderItemsMin &&
      optionCount <= QUIZSHOW_LIMITS.orderItemsMax
    );
  }
  return optionCount === 0;
}

function hasUniqueWellFormedOptionIds(
  options: readonly QuizshowOption[],
): boolean {
  const seenIds = new Set<string>();
  for (const option of options) {
    if (
      typeof option.id !== "string" ||
      !QUIZSHOW_LIMITS.optionIdPattern.test(option.id) ||
      seenIds.has(option.id)
    ) {
      return false;
    }
    seenIds.add(option.id);
  }
  return true;
}

function isAnswerInRange(question: QuizshowQuestionInput): boolean {
  if (question.type === "multiple_choice" && question.answer !== null) {
    // An index outside the options or a repeated one has no code of its own,
    // so it stays this answer problem (as on the server).
    const { correctIndexes } = question.answer;
    if (!Array.isArray(correctIndexes)) {
      return false;
    }
    return (
      new Set(correctIndexes).size === correctIndexes.length &&
      correctIndexes.every(
        (optionIndex) =>
          Number.isInteger(optionIndex) &&
          optionIndex >= 0 &&
          optionIndex < question.options.length,
      )
    );
  }
  if (question.type === "closest_number" && question.answer !== null) {
    const { value } = question.answer;
    return (
      Number.isFinite(value) && Math.abs(value) <= QUIZSHOW_LIMITS.numberAbsMax
    );
  }
  return true;
}

/** At least one option stays wrong, or the question gives every answer away. */
function hasTooManyCorrectOptions(question: QuizshowQuestionInput): boolean {
  if (question.type !== "multiple_choice" || question.answer === null) {
    return false;
  }
  const { correctIndexes } = question.answer;
  // An empty list is the completeness problem `correct_option_missing`.
  return (
    Array.isArray(correctIndexes) &&
    correctIndexes.length > 0 &&
    correctIndexes.length >= question.options.length
  );
}

/** Contract 6.1: the amount each tolerance mode allows. */
function isToleranceInRange(question: QuizshowQuestionInput): boolean {
  if (question.type !== "closest_number" || question.answer === null) {
    return true;
  }
  const tolerance = question.answer.tolerance as
    QuizshowClosestTolerance | null | undefined;
  if (tolerance === null || typeof tolerance !== "object") {
    return false;
  }
  const { mode, amount } = tolerance;
  switch (mode) {
    case "exact":
      return amount === 0;
    case "absolute":
      return (
        Number.isFinite(amount) &&
        amount > 0 &&
        amount <= QUIZSHOW_LIMITS.numberAbsMax
      );
    case "percent":
      return (
        Number.isInteger(amount) &&
        amount >= QUIZSHOW_LIMITS.closestPercentMin &&
        amount <= QUIZSHOW_LIMITS.closestPercentMax
      );
    default:
      return false;
  }
}

/** Contract 6.23: a slow reveal blurs a picture in, so it needs one. */
function isSlowRevealMissingPicture(question: QuizshowQuestionInput): boolean {
  return question.mediaReveal === "slow" && question.mediaRef === null;
}

function isOrderAnswerPermutation(question: QuizshowQuestionInput): boolean {
  if (question.type !== "order" || question.answer === null) {
    return true;
  }
  const { orderedIds } = question.answer;
  const optionIds = new Set(question.options.map((option) => option.id));
  return (
    orderedIds.length === question.options.length &&
    new Set(orderedIds).size === orderedIds.length &&
    orderedIds.every((orderedId) => optionIds.has(orderedId))
  );
}

function isAnswerAllowed(
  question: QuizshowQuestionInput,
  roundKind: QuizshowRoundKind,
): boolean {
  if (question.type === "prompt") {
    if (question.answer !== null && roundKind !== "lie_detector") {
      return false;
    }
    if (question.timeLimitSeconds !== null) {
      return false;
    }
  }
  // A poll has no right answer to store (contract 2.4).
  if (question.type === "poll" && question.answer !== null) {
    return false;
  }
  return (
    question.type === "type_answer" || question.acceptedAnswers.length === 0
  );
}

function questionStructuralProblems(
  question: QuizshowQuestionInput,
  roundKind: QuizshowRoundKind,
  roundIndex: number,
  questionIndex: number,
): QuizshowLocalProblem[] {
  const isPartyRound = (
    QUIZSHOW_PARTY_ROUND_KINDS as readonly string[]
  ).includes(roundKind);
  // A poll in a party round names its own problem, so the studio can say why.
  const isPollInPartyRound = isPartyRound && question.type === "poll";
  const isTypeAllowed = isPartyRound
    ? question.type === "prompt"
    : question.type !== "prompt";
  const checks: Array<[QuizshowLocalProblemCode, boolean]> = [
    ["poll_in_party_round", isPollInPartyRound],
    ["question_type_not_allowed", !isPollInPartyRound && !isTypeAllowed],
    ["option_count", !isOptionCountValid(question)],
    ["option_ids_not_unique", !hasUniqueWellFormedOptionIds(question.options)],
    ["answer_out_of_range", !isAnswerInRange(question)],
    ["too_many_correct_options", hasTooManyCorrectOptions(question)],
    ["tolerance_out_of_range", !isToleranceInRange(question)],
    // Save stores 'instant' on party rows, so only a quiz round can hold 'slow'.
    [
      "slow_reveal_needs_picture",
      !isPartyRound && isSlowRevealMissingPicture(question),
    ],
    ["order_answer_not_permutation", !isOrderAnswerPermutation(question)],
    ["answer_not_allowed", !isAnswerAllowed(question, roundKind)],
  ];
  return checks
    .filter(([, isFailing]) => isFailing)
    .map(([code]) => problem(code, roundIndex, questionIndex));
}

function structuralProblems(input: ProblemInput): QuizshowLocalProblem[] {
  const problems: QuizshowLocalProblem[] = [];
  if (playableRoundCount(input.rounds) > QUIZSHOW_LIMITS.roundsMax) {
    problems.push(problem("too_many_rounds", null, null));
  }
  const wheelCount = input.rounds.filter((round) =>
    isWheelRoundKind(round.kind),
  ).length;
  if (wheelCount > QUIZSHOW_LIMITS.wheelStepsMax) {
    problems.push(problem("too_many_wheels", null, null));
  }
  const totalQuestions = input.rounds.reduce(
    (runningTotal, round) => runningTotal + round.questions.length,
    0,
  );
  if (totalQuestions > QUIZSHOW_LIMITS.questionsPerQuizMax) {
    problems.push(problem("too_many_questions", null, null));
  }
  const firstPlayableRoundIndex = input.rounds.findIndex(
    (round) => !isWheelRoundKind(round.kind),
  );
  input.rounds.forEach((round, roundIndex) => {
    if (round.questions.length > QUIZSHOW_LIMITS.questionsPerRoundMax) {
      problems.push(problem("too_many_questions_in_round", roundIndex, null));
    }
    // Contract 6.19: the warm-up opens the night (decision A29). A wheel slice
    // plays only when the wheel draws it, so a warm-up on one never opens the night.
    if (
      round.settings.isWarmUp === true &&
      (roundIndex !== firstPlayableRoundIndex ||
        isInWheelRange(input.rounds, roundIndex))
    ) {
      problems.push(problem("warm_up_not_first", roundIndex, null));
    }
    round.questions.forEach((question, questionIndex) => {
      if (isWheelRoundKind(round.kind)) {
        // A wheel row holds no questions, so each one gets this single problem.
        problems.push(
          problem("question_type_not_allowed", roundIndex, questionIndex),
        );
        return;
      }
      problems.push(
        ...questionStructuralProblems(
          question,
          round.kind,
          roundIndex,
          questionIndex,
        ),
      );
    });
  });
  return problems;
}

function answerProblems(
  question: QuizshowQuestionInput,
  languages: readonly QuizshowLanguage[],
  roundIndex: number,
  questionIndex: number,
): QuizshowLocalProblem[] {
  if (question.type === "type_answer") {
    if (question.answer === null) {
      return [problem("answer_missing", roundIndex, questionIndex)];
    }
    const { text } = question.answer;
    return languages
      .filter((language) => isBlank(text?.[language]))
      .map((language) =>
        problem("answer_missing", roundIndex, questionIndex, language),
      );
  }
  // A prompt and a poll have no right answer to miss.
  if (
    question.type !== "prompt" &&
    question.type !== "poll" &&
    question.answer === null
  ) {
    return [problem("answer_missing", roundIndex, questionIndex)];
  }
  if (
    question.type === "multiple_choice" &&
    question.answer !== null &&
    Array.isArray(question.answer.correctIndexes) &&
    question.answer.correctIndexes.length === 0
  ) {
    return [problem("correct_option_missing", roundIndex, questionIndex)];
  }
  return [];
}

function questionCompletenessProblems(
  question: QuizshowQuestionInput,
  roundKind: QuizshowRoundKind,
  languages: readonly QuizshowLanguage[],
  roundIndex: number,
  questionIndex: number,
): QuizshowLocalProblem[] {
  const problems: QuizshowLocalProblem[] = [];
  if (roundKind !== "caption_this") {
    for (const language of languages) {
      if (isBlank(question.prompt?.[language])) {
        problems.push(
          problem("prompt_missing", roundIndex, questionIndex, language),
        );
      }
    }
  }
  for (const language of languages) {
    if (question.options.some((option) => isBlank(option.text?.[language]))) {
      problems.push(
        problem("option_text_missing", roundIndex, questionIndex, language),
      );
    }
  }
  problems.push(
    ...answerProblems(question, languages, roundIndex, questionIndex),
  );
  if (roundKind === "lie_detector" && question.type === "prompt") {
    for (const language of languages) {
      const truthText =
        question.answer === null ? null : question.answer.truth?.[language];
      if (isBlank(truthText)) {
        problems.push(
          problem("truth_missing", roundIndex, questionIndex, language),
        );
      }
    }
  }
  if (roundKind === "caption_this" && isBlank(question.mediaRef)) {
    problems.push(problem("media_missing", roundIndex, questionIndex));
  }
  return problems;
}

function completenessProblems(input: ProblemInput): QuizshowLocalProblem[] {
  const problems: QuizshowLocalProblem[] = [];
  if (playableRoundCount(input.rounds) === 0) {
    problems.push(problem("no_rounds", null, null));
  }
  if (isBlank(input.title)) {
    problems.push(problem("title_missing", null, null));
  }
  const languages = usedLanguagesOf(input.languages);
  input.rounds.forEach((round, roundIndex) => {
    if (isWheelRoundKind(round.kind)) {
      // A wheel row holds no questions, so only its slice count can be short.
      if (
        wheelSliceRoundIndexes(input.rounds, roundIndex).length <
        QUIZSHOW_LIMITS.wheelSlicesMin
      ) {
        problems.push(problem("wheel_too_few_slices", roundIndex, null));
      }
      return;
    }
    if (round.questions.length === 0) {
      problems.push(problem("round_empty", roundIndex, null));
    }
    round.questions.forEach((question, questionIndex) => {
      problems.push(
        ...questionCompletenessProblems(
          question,
          round.kind,
          languages,
          roundIndex,
          questionIndex,
        ),
      );
    });
  });
  return problems;
}

export function quizshowProblemsFor(
  input: ProblemInput,
  options: { isAdultsEvent: boolean },
): QuizshowLocalProblem[] {
  const adultsProblems = options.isAdultsEvent
    ? []
    : input.rounds.flatMap((round, roundIndex) =>
        !isWheelRoundKind(round.kind) && round.contentLabel === "adults"
          ? [problem("adults_round_needs_adults_event", roundIndex, null)]
          : [],
      );
  return [
    ...structuralProblems(input),
    ...adultsProblems,
    ...completenessProblems(input),
  ];
}

/**
 * The problems of one row of the draft, checked against the whole quiz (a
 * warm-up or a wheel's slices depend on the rows around it). The 18+ rule is
 * left out unless `options` says the event is not 18+.
 */
export function problemsOfRound(
  draft: QuizshowDraft,
  roundIndex: number,
  options: { isAdultsEvent: boolean } = { isAdultsEvent: true },
): QuizshowLocalProblem[] {
  return quizshowProblemsFor(draftToInput(draft, null), options).filter(
    (found) => found.roundIndex === roundIndex,
  );
}
