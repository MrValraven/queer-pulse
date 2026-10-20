import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_PARTY_ROUND_KINDS,
  type QuizshowLanguage,
  type QuizshowLanguageMode,
  type QuizshowOption,
  type QuizshowQuestionInput,
  type QuizshowQuizInput,
  type QuizshowQuizProblem,
  type QuizshowQuizProblemCode,
  type QuizshowRoundKind,
} from "../../../shared/contracts/quizshow";

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
  "too_many_questions",
  "too_many_questions_in_round",
  "question_type_not_allowed",
  "option_count",
  "option_ids_not_unique",
  "answer_out_of_range",
  "order_answer_not_permutation",
  "answer_not_allowed",
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
  if (question.type === "multiple_choice") {
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
    const { correctIndex } = question.answer;
    return (
      Number.isInteger(correctIndex) &&
      correctIndex >= 0 &&
      correctIndex < question.options.length
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
  const isTypeAllowed = isPartyRound
    ? question.type === "prompt"
    : question.type !== "prompt";
  const checks: Array<[QuizshowLocalProblemCode, boolean]> = [
    ["question_type_not_allowed", !isTypeAllowed],
    ["option_count", !isOptionCountValid(question)],
    ["option_ids_not_unique", !hasUniqueWellFormedOptionIds(question.options)],
    ["answer_out_of_range", !isAnswerInRange(question)],
    ["order_answer_not_permutation", !isOrderAnswerPermutation(question)],
    ["answer_not_allowed", !isAnswerAllowed(question, roundKind)],
  ];
  return checks
    .filter(([, isFailing]) => isFailing)
    .map(([code]) => problem(code, roundIndex, questionIndex));
}

function structuralProblems(input: ProblemInput): QuizshowLocalProblem[] {
  const problems: QuizshowLocalProblem[] = [];
  if (input.rounds.length > QUIZSHOW_LIMITS.roundsMax) {
    problems.push(problem("too_many_rounds", null, null));
  }
  const totalQuestions = input.rounds.reduce(
    (runningTotal, round) => runningTotal + round.questions.length,
    0,
  );
  if (totalQuestions > QUIZSHOW_LIMITS.questionsPerQuizMax) {
    problems.push(problem("too_many_questions", null, null));
  }
  input.rounds.forEach((round, roundIndex) => {
    if (round.questions.length > QUIZSHOW_LIMITS.questionsPerRoundMax) {
      problems.push(problem("too_many_questions_in_round", roundIndex, null));
    }
    round.questions.forEach((question, questionIndex) => {
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
  if (question.type !== "prompt" && question.answer === null) {
    return [problem("answer_missing", roundIndex, questionIndex)];
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
  if (input.rounds.length === 0) {
    problems.push(problem("no_rounds", null, null));
  }
  if (isBlank(input.title)) {
    problems.push(problem("title_missing", null, null));
  }
  const languages = usedLanguagesOf(input.languages);
  input.rounds.forEach((round, roundIndex) => {
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
        round.contentLabel === "adults"
          ? [problem("adults_round_needs_adults_event", roundIndex, null)]
          : [],
      );
  return [
    ...structuralProblems(input),
    ...adultsProblems,
    ...completenessProblems(input),
  ];
}
