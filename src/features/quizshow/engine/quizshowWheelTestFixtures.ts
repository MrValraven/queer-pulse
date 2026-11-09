/**
 * Test data shared by the Pulse Live engine tests: round settings with the
 * three wheel fields, question, round, wheel and quiz builders, and the named
 * wheel nights the wheel specs replay.
 */
import {
  QUIZSHOW_WHEEL_SETTINGS_DEFAULTS,
  type QuizshowQuestion,
  type QuizshowQuiz,
  type QuizshowRound,
  type QuizshowRoundSettings,
  type QuizshowWheelBonus,
  type QuizshowWheelPick,
} from "../../../shared/contracts/quizshow";
import type { QuizshowEngineOptions } from "./quizshowEngineTypes";

export const WHEEL_TEST_SETTINGS: QuizshowRoundSettings = {
  timeLimitSeconds: 20,
  isSpeedBonusOn: true,
  isJokerAllowed: true,
  writeSeconds: 60,
  voteSeconds: 30,
  ...QUIZSHOW_WHEEL_SETTINGS_DEFAULTS,
};

export function wheelTestQuestion(id: string): QuizshowQuestion {
  return {
    id,
    type: "multiple_choice",
    prompt: { en: `Question ${id}`, pt: `Pergunta ${id}` },
    options: [
      { id: "a", text: { en: "First", pt: "Primeira" } },
      { id: "b", text: { en: "Second", pt: "Segunda" } },
      { id: "c", text: { en: "Third", pt: "Terceira" } },
      { id: "d", text: { en: "Fourth", pt: "Quarta" } },
    ],
    answer: { correctIndex: 1 },
    acceptedAnswers: [],
    mediaRef: null,
    mediaUrl: null,
    timeLimitSeconds: null,
    points: 1000,
  };
}

export function wheelTestRound(
  id: string,
  title: string,
  questionCount: number,
  wheelBonus: QuizshowWheelBonus = 0,
): QuizshowRound {
  return {
    id,
    kind: "quiz",
    title: { en: title, pt: title },
    contentLabel: "none",
    settings: { ...WHEEL_TEST_SETTINGS, wheelBonus },
    questions: Array.from({ length: questionCount }, (_unused, questionIndex) =>
      wheelTestQuestion(`${id}-q${questionIndex}`),
    ),
  };
}

export function wheelTestWheel(
  id: string,
  wheelPick: QuizshowWheelPick,
  sliceCount: number | null,
): QuizshowRound {
  return {
    id,
    kind: "wheel",
    title: { en: "", pt: "" },
    contentLabel: "none",
    settings: { ...WHEEL_TEST_SETTINGS, wheelPick, sliceCount },
    questions: [],
  };
}

export function wheelTestQuiz(rounds: QuizshowRound[]): QuizshowQuiz {
  return {
    title: "Wheel night",
    languages: "both",
    screenLanguage: "en",
    sourceTemplateId: null,
    updatedAt: "2026-11-09T00:00:00.000Z",
    rounds,
  };
}

export function wheelTestEngineOptions(
  quiz: QuizshowQuiz,
  overrides: Partial<QuizshowEngineOptions> = {},
): QuizshowEngineOptions {
  return {
    quiz,
    playMode: "solo",
    maxTeamSize: null,
    isReviewOn: true,
    eventSlug: "fixture",
    eventTitle: "Fixture",
    joinCode: "QZ7KP4",
    sessionId: "session",
    seed: 7,
    now: 0,
    ...overrides,
  };
}

/** R0 W1(round, 3 slices) R2(+500) R3 R4 R5: slices are rows 2, 3 and 4; M = 5. */
export const PICK_ROUND_NIGHT = wheelTestQuiz([
  wheelTestRound("r0", "Warm up", 1),
  wheelTestWheel("w1", "round", 3),
  wheelTestRound("r2", "Music", 2, 500),
  wheelTestRound("r3", "Film", 1),
  wheelTestRound("r4", "Icons", 1),
  wheelTestRound("r5", "Finale", 1),
]);

/** R0 W1(question, 2 slices) R2(+500) R3 R4: slices are rows 2 and 3, three questions to spin; M = 3. */
export const PICK_QUESTION_NIGHT = wheelTestQuiz([
  wheelTestRound("r0", "Warm up", 1),
  wheelTestWheel("w1", "question", 2),
  wheelTestRound("r2", "Music", 2, 500),
  wheelTestRound("r3", "Film", 1),
  wheelTestRound("r4", "Finale", 1),
]);

/** Four one-question rounds and no wheel; M = 4. */
export const UNPLANNED_NIGHT = wheelTestQuiz([
  wheelTestRound("r0", "Round one", 1),
  wheelTestRound("r1", "Round two", 1),
  wheelTestRound("r2", "Round three", 1),
  wheelTestRound("r3", "Round four", 1),
]);

/** A wheel before the first round: W0(round, Auto) R1 R2. */
export const WHEEL_FIRST_NIGHT = wheelTestQuiz([
  wheelTestWheel("w0", "round", null),
  wheelTestRound("r1", "Music", 1),
  wheelTestRound("r2", "Film", 1),
]);

/** A wheel with no slice to draw: R0 W1(round, Auto) as the last row. */
export const EMPTY_WHEEL_NIGHT = wheelTestQuiz([
  wheelTestRound("r0", "Warm up", 1),
  wheelTestWheel("w1", "round", null),
]);
