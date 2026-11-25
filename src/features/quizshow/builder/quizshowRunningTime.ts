import { readPhaseMsFor } from "../engine/quizshowEngineSetup";
import { isQuizRoundKind, isWheelRoundKind } from "../quizshowWheel";
import type { QuizshowDraft, QuizshowDraftRound } from "./quizshowDraft";

/** Item 56 (C9.2): the fixed beats a game spends around its questions. */
const QUIZ_QUESTION_EXTRA_MS = 12_000;
const PARTY_QUESTION_EXTRA_MS = 25_000;
const ROUND_INTRO_MS = 8_000;
const ROUND_LEADERBOARD_MS = 15_000;
const WHEEL_MS = 20_000;
const ROUNDING_MINUTES = 5;
const MINIMUM_MINUTES = 5;
const MS_PER_SECOND = 1_000;
const MS_PER_MINUTE = 60_000;

/** One quiz round: each question's read, its time limit and the beats after it. */
function quizRoundMs(
  round: QuizshowDraftRound,
  languages: QuizshowDraft["languages"],
): number {
  return round.questions.reduce((sum, { question }) => {
    const limitSeconds =
      question.timeLimitSeconds ?? round.settings.timeLimitSeconds;
    return (
      sum +
      readPhaseMsFor(question, languages) +
      limitSeconds * MS_PER_SECOND +
      QUIZ_QUESTION_EXTRA_MS
    );
  }, 0);
}

/** One party round: each prompt's writing and voting time and the beats after it. */
function partyRoundMs(round: QuizshowDraftRound): number {
  const perQuestionMs =
    (round.settings.writeSeconds + round.settings.voteSeconds) * MS_PER_SECOND +
    PARTY_QUESTION_EXTRA_MS;
  return round.questions.length * perQuestionMs;
}

/** A row's share of the game: a wheel spin, or a round with its intro and (after a scored round) its leaderboard. */
function rowMs(
  round: QuizshowDraftRound,
  languages: QuizshowDraft["languages"],
): number {
  if (isWheelRoundKind(round.kind)) return WHEEL_MS;
  const questionsMs = isQuizRoundKind(round.kind)
    ? quizRoundMs(round, languages)
    : partyRoundMs(round);
  const leaderboardMs = round.settings.isWarmUp ? 0 : ROUND_LEADERBOARD_MS;
  return ROUND_INTRO_MS + questionsMs + leaderboardMs;
}

/**
 * About how long the draft takes to play, in minutes (item 56, C9.2): per
 * quiz question its read phase, its time limit and 12 s; per party question
 * its writing and voting time and 25 s; per round an 8 s intro and a 15 s
 * leaderboard (a warm-up round shows none); per wheel 20 s. Rounded to the
 * nearest 5 minutes, and never under 5. Pure.
 */
export function estimateRunningMinutes(draft: QuizshowDraft): number {
  const totalMs = draft.rounds.reduce(
    (sum, round) => sum + rowMs(round, draft.languages),
    0,
  );
  const roundedMinutes =
    Math.round(totalMs / MS_PER_MINUTE / ROUNDING_MINUTES) * ROUNDING_MINUTES;
  return Math.max(roundedMinutes, MINIMUM_MINUTES);
}
