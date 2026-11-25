import {
  QUIZSHOW_LIMITS,
  type QuizshowClosestTolerance,
  type QuizshowLanguageMode,
  type QuizshowMediaReveal,
  type QuizshowQuestionInput,
  type QuizshowQuiz,
  type QuizshowQuizShape,
  type QuizshowRound,
  type QuizshowRoundInput,
  type QuizshowRoundSettings,
  type QuizshowScreenLanguage,
  type QuizshowSourceTemplateRef,
  type QuizshowText,
} from "../../shared/contracts/quizshow";

/**
 * Read-side normalisers for quiz JSON stored before Pulse Live v2 (contract 2.4):
 * the draft hydrator, the snapshot readers and the demo stores run every stored
 * question through here. Each function returns a new object, leaves its input
 * untouched and is idempotent. The backend twin is `quizshow-stored-shapes.ts`.
 * Pure: imports only the contract mirror, so every layer can use it.
 */

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

/** A question as rows, snapshots, templates and demo data may still hold it (C2.4 read table). */
export type QuizshowStoredQuestionInput = DistributiveOmit<
  QuizshowQuestionInput,
  "answer" | "mediaAlt" | "mediaReveal" | "revealNote" | "numberUnit"
> & {
  answer:
    | QuizshowQuestionInput["answer"]
    | { correctIndex: number }
    | { value: number }
    | null;
  mediaAlt?: QuizshowText;
  mediaReveal?: QuizshowMediaReveal;
  revealNote?: QuizshowText;
  numberUnit?: QuizshowText;
};

export type QuizshowStoredRoundSettings = Omit<
  QuizshowRoundSettings,
  "isWarmUp" | "talkSeconds"
> &
  Partial<Pick<QuizshowRoundSettings, "isWarmUp" | "talkSeconds">>;

export interface QuizshowStoredRoundInput extends Omit<
  QuizshowRoundInput,
  "settings" | "questions"
> {
  settings: QuizshowStoredRoundSettings;
  questions: QuizshowStoredQuestionInput[];
}

export interface QuizshowStoredQuizShape {
  title: string;
  languages: QuizshowLanguageMode;
  screenLanguage: QuizshowScreenLanguage;
  rounds: QuizshowStoredRoundInput[];
}

type QuizshowStoredQuestion = QuizshowStoredQuestionInput & {
  id: string;
  mediaUrl: string | null;
};

type QuizshowStoredRound = Omit<QuizshowRound, "settings" | "questions"> & {
  settings: QuizshowStoredRoundSettings;
  questions: QuizshowStoredQuestion[];
};

type QuizshowStoredQuiz = Omit<QuizshowQuiz, "rounds" | "sourceTemplate"> & {
  sourceTemplate?: QuizshowSourceTemplateRef | null;
  rounds: QuizshowStoredRound[];
};

function emptyText(): QuizshowText {
  return { en: "", pt: "" };
}

const YEAR_FIRST = 1000;
const YEAR_LAST = 2100;
const YEAR_WIDE_MARGIN_BEFORE = 1990;
const YEAR_WIDE_MARGIN = 10;
const YEAR_NARROW_MARGIN = 5;

/**
 * The band a closest-number answer without a tolerance gets: a whole year from
 * 1000 to 2100 gets an absolute margin (10 before 1990, 5 from 1990), the rule
 * the v2 migration applies; every other value keeps the legacy percent band
 * (backend quizshow-stored-shapes.ts twin).
 */
function legacyClosestTolerance(value: unknown): QuizshowClosestTolerance {
  const isYear =
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= YEAR_FIRST &&
    value <= YEAR_LAST;
  if (isYear) {
    return {
      mode: "absolute",
      amount:
        value < YEAR_WIDE_MARGIN_BEFORE ? YEAR_WIDE_MARGIN : YEAR_NARROW_MARGIN,
    };
  }
  return { mode: "percent", amount: QUIZSHOW_LIMITS.closestLegacyPercent };
}

function normaliseStoredAnswer(
  raw: QuizshowStoredQuestionInput,
): QuizshowQuestionInput["answer"] {
  const answer = raw.answer;
  if (answer === null) return null;
  if (raw.type === "multiple_choice" && "correctIndex" in answer)
    return { correctIndexes: [answer.correctIndex] };
  if (
    raw.type === "closest_number" &&
    "value" in answer &&
    !("tolerance" in answer)
  )
    return {
      value: answer.value,
      tolerance: legacyClosestTolerance(answer.value),
    };
  return answer as QuizshowQuestionInput["answer"];
}

/** C2.4 read table; idempotent; keeps every other field (id, mediaUrl) as given. */
export function normaliseStoredQuestion<
  Raw extends QuizshowStoredQuestionInput,
>(
  raw: Raw,
): Omit<Raw, keyof QuizshowStoredQuestionInput> & QuizshowQuestionInput {
  const normalised = {
    ...raw,
    answer: normaliseStoredAnswer(raw),
    mediaAlt: raw.mediaAlt ?? emptyText(),
    mediaReveal: raw.mediaReveal ?? "instant",
    revealNote: raw.revealNote ?? emptyText(),
    numberUnit: raw.numberUnit ?? emptyText(),
  };
  return normalised as unknown as Omit<Raw, keyof QuizshowStoredQuestionInput> &
    QuizshowQuestionInput;
}

export function normaliseStoredRoundSettings(
  raw: QuizshowStoredRoundSettings,
): QuizshowRoundSettings {
  return {
    ...raw,
    isWarmUp: raw.isWarmUp ?? false,
    talkSeconds: raw.talkSeconds ?? 0,
  };
}

export function normaliseStoredQuizShape(
  raw: QuizshowStoredQuizShape,
): QuizshowQuizShape {
  return {
    ...raw,
    rounds: raw.rounds.map((round) => ({
      ...round,
      settings: normaliseStoredRoundSettings(round.settings),
      questions: round.questions.map((question) =>
        normaliseStoredQuestion(question),
      ),
    })),
  };
}

/** For a stored QuizshowQuiz-like object (ids and mediaUrl kept); fills sourceTemplate null when missing. */
export function normaliseStoredQuiz(raw: QuizshowStoredQuiz): QuizshowQuiz {
  return {
    ...raw,
    sourceTemplate: raw.sourceTemplate ?? null,
    rounds: raw.rounds.map((round) => ({
      ...round,
      settings: normaliseStoredRoundSettings(round.settings),
      questions: round.questions.map((question) =>
        normaliseStoredQuestion(question),
      ),
    })),
  };
}

/** C6.13, verbatim: the key two screen names collide on. */
export function foldNameKey(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en")
    .replace(/\s+/g, " ")
    .trim();
}

const SUGGESTION_NUMBER_FIRST = 2;
const SUGGESTION_NUMBER_LAST = 99;

/** C6.13: first free "<base> <n>" for n = 2..99 whose key no name in `takenNames` holds; null when none is free. */
export function suggestedScreenNameFor(
  base: string,
  takenNames: readonly string[],
): string | null {
  const takenKeys = new Set(takenNames.map((name) => foldNameKey(name)));
  for (
    let suggestionNumber = SUGGESTION_NUMBER_FIRST;
    suggestionNumber <= SUGGESTION_NUMBER_LAST;
    suggestionNumber += 1
  ) {
    const suffix = ` ${suggestionNumber}`;
    const trimmedBase = base
      .trim()
      .slice(0, QUIZSHOW_LIMITS.screenNameMax - suffix.length)
      .trimEnd();
    const suggestion = `${trimmedBase}${suffix}`;
    if (!takenKeys.has(foldNameKey(suggestion))) return suggestion;
  }
  return null;
}
