import {
  QUIZSHOW_LIMITS,
  type QuizshowAnswerKeyView,
  type QuizshowMyAnswer,
  type QuizshowMyReveal,
  type QuizshowQuestionView,
  type QuizshowText,
} from "../../../shared/contracts/quizshow";

/**
 * One quiz-round question of the player's night (item 15). Built only from
 * frames the phone already received and held in memory only: nothing here is
 * stored or sent (C0.1).
 */
export interface QuizshowNightEntry {
  questionId: string;
  roundIndex: number;
  questionIndex: number;
  /** The round card's isWarmUp when the question arrived. */
  isWarmUp: boolean;
  question: QuizshowQuestionView;
  myAnswer: QuizshowMyAnswer | null;
  myReveal: QuizshowMyReveal | null;
  correct: QuizshowAnswerKeyView | null;
  note: QuizshowText | null;
}

export type QuizshowNightEntryUpdate = Partial<QuizshowNightEntry> & {
  questionId: string;
};

function newNightEntry(
  update: QuizshowNightEntryUpdate,
): QuizshowNightEntry | null {
  const question = update.question;
  if (question === undefined) return null;
  return {
    questionId: update.questionId,
    roundIndex: update.roundIndex ?? question.roundIndex,
    questionIndex: update.questionIndex ?? question.questionIndex,
    isWarmUp: update.isWarmUp ?? false,
    question,
    myAnswer: update.myAnswer ?? null,
    myReveal: update.myReveal ?? null,
    correct: update.correct ?? null,
    note: update.note ?? null,
  };
}

/**
 * Merges `update` into the entry of its question, keeping every field the
 * update leaves out. A question not in the log yet is appended, in the order
 * the questions arrived, once the update carries its question view; without
 * one the log comes back unchanged.
 */
export function withNightEntry(
  log: readonly QuizshowNightEntry[],
  update: QuizshowNightEntryUpdate,
): QuizshowNightEntry[] {
  const index = log.findIndex(
    (entry) => entry.questionId === update.questionId,
  );
  if (index === -1) {
    const created = newNightEntry(update);
    return created === null ? [...log] : [...log, created];
  }
  // A key given as undefined keeps the field, as a key left out does; an explicit null clears it.
  const definedFields = Object.fromEntries(
    Object.entries(update).filter(([, value]) => value !== undefined),
  ) as QuizshowNightEntryUpdate;
  return log.map((entry, entryIndex) =>
    entryIndex === index ? { ...entry, ...definedFields } : entry,
  );
}

export interface QuizshowNightSummary {
  /** Scored questions with isCorrect true. */
  rightCount: number;
  /** Scored questions answered (poll, party and warm-up rows left out). */
  answeredCount: number;
  bestStreak: number;
  /** pointsAwarded on rows with isJokerActive, the doubled half. */
  jokerPoints: number;
  finalPlace: number | null;
}

/** Polls and warm-up questions score nothing, so the summary leaves them out. */
function isScoredEntry(entry: QuizshowNightEntry): boolean {
  return entry.question.type !== "poll" && !entry.isWarmUp;
}

/** Answered counts scored answers only: the reveal said so. */
function hasAnsweredEntry(entry: QuizshowNightEntry): boolean {
  return entry.myReveal !== null && entry.myReveal.hasAnswered;
}

function jokerPointsOf(reveal: QuizshowMyReveal | null): number {
  if (reveal === null || !reveal.isJokerActive) return 0;
  const multiplier = QUIZSHOW_LIMITS.jokerMultiplier;
  return reveal.pointsAwarded - reveal.pointsAwarded / multiplier;
}

export function summariseNight(
  log: readonly QuizshowNightEntry[],
  finalPlace: number | null,
): QuizshowNightSummary {
  const scoredEntries = log.filter(isScoredEntry);
  const answeredEntries = scoredEntries.filter(hasAnsweredEntry);
  return {
    rightCount: answeredEntries.filter(
      (entry) => entry.myReveal?.isCorrect === true,
    ).length,
    answeredCount: answeredEntries.length,
    bestStreak: log.reduce(
      (best, entry) => Math.max(best, entry.myReveal?.streak ?? 0),
      0,
    ),
    jokerPoints: scoredEntries.reduce(
      (total, entry) => total + jokerPointsOf(entry.myReveal),
      0,
    ),
    finalPlace,
  };
}
