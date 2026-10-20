/**
 * Pulse Live scoring for the demo engine. Pure functions with no clock and no
 * randomness, copied from the backend's quizshow-scoring.ts and
 * quizshow-answer-normaliser.ts so a demo session scores like a live one.
 */
import {
  QUIZSHOW_LIMITS,
  type QuizshowAnswerPayload,
  type QuizshowQuestion,
  type QuizshowText,
} from "../../../shared/contracts/quizshow";

/** Shortest space-free candidate that tolerates one typo. */
const TYPO_TOLERANT_MIN_LENGTH = 5;

/**
 * Lowercases, strips accents (NFD then every combining mark), turns every run
 * of characters outside letters and numbers into one space, collapses spaces,
 * trims. The backend's quizshow-answer-normaliser.ts, line for line.
 */
export function normaliseAnswerText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/ +/g, " ")
    .trim();
}

function spaceFreeForm(text: string): string {
  return normaliseAnswerText(text).replace(/ /g, "");
}

/**
 * Optimal string alignment distance of at most 1: equal lengths allow one
 * substitution or one swap of neighbours, lengths one apart allow one
 * insertion or deletion, lengths further apart never match.
 */
function isWithinOneEdit(left: string, right: string): boolean {
  const lengthDifference = left.length - right.length;
  if (Math.abs(lengthDifference) > 1) return false;

  if (lengthDifference === 0) {
    let mismatchIndex = 0;
    while (
      mismatchIndex < left.length &&
      left[mismatchIndex] === right[mismatchIndex]
    ) {
      mismatchIndex += 1;
    }
    if (mismatchIndex === left.length) return true;
    if (left.slice(mismatchIndex + 1) === right.slice(mismatchIndex + 1))
      return true;
    const isNeighbourSwap =
      mismatchIndex + 1 < left.length &&
      left[mismatchIndex] === right[mismatchIndex + 1] &&
      left[mismatchIndex + 1] === right[mismatchIndex];
    return (
      isNeighbourSwap &&
      left.slice(mismatchIndex + 2) === right.slice(mismatchIndex + 2)
    );
  }

  const shorter = lengthDifference < 0 ? left : right;
  const longer = lengthDifference < 0 ? right : left;
  let mismatchIndex = 0;
  while (
    mismatchIndex < shorter.length &&
    shorter[mismatchIndex] === longer[mismatchIndex]
  ) {
    mismatchIndex += 1;
  }
  return shorter.slice(mismatchIndex) === longer.slice(mismatchIndex + 1);
}

/**
 * A submission matches a candidate when their space-free normalised forms are
 * equal, or one edit apart once the candidate has five or more characters.
 * A blank submission matches nothing and blank candidates are skipped.
 */
function isTypedAnswerMatch(
  submitted: string,
  candidates: readonly string[],
): boolean {
  const submittedForm = spaceFreeForm(submitted);
  if (submittedForm === "") return false;
  return candidates.some((candidate) => {
    const candidateForm = spaceFreeForm(candidate);
    if (candidateForm === "") return false;
    if (candidateForm === submittedForm) return true;
    return (
      candidateForm.length >= TYPO_TOLERANT_MIN_LENGTH &&
      isWithinOneEdit(submittedForm, candidateForm)
    );
  });
}

/** Matches against the key in both languages plus every accepted answer. */
export function isTypedAnswerCorrect(
  submitted: string,
  key: QuizshowText,
  acceptedAnswers: readonly string[],
): boolean {
  return isTypedAnswerMatch(submitted, [key.en, key.pt, ...acceptedAnswers]);
}

/** A Lie Detector fake the typed-answer matcher would accept as the truth. */
export function isFakeTooClose(fake: string, truth: QuizshowText): boolean {
  return isTypedAnswerMatch(fake, [truth.en, truth.pt]);
}

/**
 * The full base at zero elapsed, falling linearly to half the base at the
 * player's own limit. Elapsed is clamped to `[0, limitMs]`.
 */
export function speedPoints(
  base: number,
  elapsedMs: number,
  limitMs: number,
  isSpeedBonusOn: boolean,
): number {
  if (!isSpeedBonusOn) return base;
  const clampedElapsedMs = Math.min(Math.max(elapsedMs, 0), limitMs);
  return Math.round(base * (1 - clampedElapsedMs / limitMs / 2));
}

/** The streak bonus for the streak length that includes this answer. */
export function streakBonusFor(streakAfterAnswer: number): number {
  return Math.min(
    streakAfterAnswer * QUIZSHOW_LIMITS.streakStep,
    QUIZSHOW_LIMITS.streakCap,
  );
}

export interface ClosestNumberOutcome {
  isClosest: boolean;
  isWithinBand: boolean;
}

/** A distance rounded to 12 significant digits, as the backend compares it. */
const distanceKey = (distance: number): number =>
  Number(distance.toPrecision(12));

/**
 * Every answer at the minimum distance from the key is closest; an answer is
 * within the band when its distance is at most 10% of the key (a key of 0
 * bands at 0, so only an exact answer). Distances compare at 12 significant
 * digits so float noise keeps a decimal tie fair and an answer at the band
 * edge inside.
 */
export function closestNumberOutcomes(
  keyValue: number,
  answers: ReadonlyArray<{ playerId: string; value: number }>,
): Map<string, ClosestNumberOutcome> {
  const outcomes = new Map<string, ClosestNumberOutcome>();
  if (answers.length === 0) return outcomes;
  const minimumDistance = Math.min(
    ...answers.map((answer) => Math.abs(answer.value - keyValue)),
  );
  const minimumDistanceKey = distanceKey(minimumDistance);
  const bandWidthKey = distanceKey(
    QUIZSHOW_LIMITS.closestNumberBand * Math.abs(keyValue),
  );
  for (const answer of answers) {
    const answerDistanceKey = distanceKey(Math.abs(answer.value - keyValue));
    outcomes.set(answer.playerId, {
      isClosest: answerDistanceKey === minimumDistanceKey,
      isWithinBand: answerDistanceKey <= bandWidthKey,
    });
  }
  return outcomes;
}

export interface QuizAnswerScoringInput {
  /** A quiz-round type with a non-null answer. */
  question: QuizshowQuestion;
  /** null when the player did not answer. */
  payload: QuizshowAnswerPayload | null;
  /** receivedAt minus phaseStartedAt of open. */
  elapsedMs: number;
  /** The player's own limit (x1.5 with extra time). */
  limitMs: number;
  isSpeedBonusOn: boolean;
  streakBefore: number;
  isJokerActive: boolean;
  /** closest_number only. */
  closest: ClosestNumberOutcome | null;
}

export interface QuizAnswerScore {
  isCorrect: boolean;
  /** order only. */
  correctPositions: number | null;
  basePoints: number;
  streakBonus: number;
  streakAfter: number;
  pointsAwarded: number;
}

/**
 * Speed points on a correct answer (closest number takes the plain base),
 * order partials and the closest-number band without speed, the streak bonus
 * on a correct answer, and the joker doubling the whole question total.
 */
export function scoreQuizAnswer(
  input: QuizAnswerScoringInput,
): QuizAnswerScore {
  const { question, payload } = input;
  const base = question.points;
  let isCorrect = false;
  let correctPositions: number | null = null;
  let basePoints = 0;
  if (payload !== null && question.answer !== null) {
    switch (question.type) {
      case "multiple_choice":
        isCorrect =
          payload.type === "multiple_choice" &&
          payload.optionIndex === question.answer.correctIndex;
        break;
      case "true_false":
        isCorrect =
          payload.type === "true_false" &&
          payload.isTrue === question.answer.isTrue;
        break;
      case "type_answer":
        isCorrect =
          payload.type === "type_answer" &&
          isTypedAnswerCorrect(
            payload.text,
            question.answer.text,
            question.acceptedAnswers,
          );
        break;
      case "order": {
        // A payload of another type leaves positions null, as the backend does.
        if (payload.type !== "order") break;
        const correctIds = question.answer.orderedIds;
        const submittedIds = payload.orderedIds;
        const matchedPositions = correctIds.filter(
          (optionId, position) => submittedIds[position] === optionId,
        ).length;
        correctPositions = matchedPositions;
        isCorrect =
          correctIds.length > 0 && matchedPositions === correctIds.length;
        if (!isCorrect && matchedPositions > 0)
          basePoints = Math.round(
            (base * matchedPositions) / correctIds.length,
          );
        break;
      }
      case "closest_number": {
        const isClosestNumberPayload = payload.type === "closest_number";
        isCorrect = isClosestNumberPayload && input.closest?.isClosest === true;
        const isWithinBand =
          isClosestNumberPayload && input.closest?.isWithinBand === true;
        basePoints = isCorrect ? base : isWithinBand ? Math.round(base / 2) : 0;
        break;
      }
      case "prompt":
        break;
    }
    if (isCorrect && question.type !== "closest_number") {
      basePoints = speedPoints(
        base,
        input.elapsedMs,
        input.limitMs,
        input.isSpeedBonusOn,
      );
    }
  }
  const streakAfter = isCorrect ? input.streakBefore + 1 : 0;
  const streakBonus = isCorrect ? streakBonusFor(streakAfter) : 0;
  const multiplier = input.isJokerActive ? QUIZSHOW_LIMITS.jokerMultiplier : 1;
  return {
    isCorrect,
    correctPositions,
    basePoints,
    streakBonus,
    streakAfter,
    pointsAwarded: (basePoints + streakBonus) * multiplier,
  };
}

export interface PartyAuthorScoreInput {
  votesReceived: number;
  isFavourite: boolean;
  isJokerActive: boolean;
}

/** Caption This and Drag Name Generator: per vote received plus the host's favourite. */
export function captionAuthorPoints(input: PartyAuthorScoreInput): number {
  const multiplier = input.isJokerActive ? QUIZSHOW_LIMITS.jokerMultiplier : 1;
  const favouritePoints = input.isFavourite
    ? QUIZSHOW_LIMITS.hostFavouritePoints
    : 0;
  return (
    (input.votesReceived * QUIZSHOW_LIMITS.partyVotePoints + favouritePoints) *
    multiplier
  );
}

/** Lie Detector: the truth pays its voter, every player fooled pays the fake's author. */
export function lieDetectorPlayerPoints(input: {
  hasPickedTruth: boolean;
  playersFooled: number;
  isJokerActive: boolean;
}): number {
  const multiplier = input.isJokerActive ? QUIZSHOW_LIMITS.jokerMultiplier : 1;
  const truthPoints = input.hasPickedTruth
    ? QUIZSHOW_LIMITS.lieDetectorTruthPoints
    : 0;
  return (
    (truthPoints +
      input.playersFooled * QUIZSHOW_LIMITS.lieDetectorFooledPoints) *
    multiplier
  );
}

/**
 * Team points for one question: the rounded mean over the members present when
 * the question opened, where a member who did not answer counts 0. A team with
 * no such member scores 0.
 */
export function teamQuestionPoints(
  memberPointsAwarded: readonly number[],
): number {
  if (memberPointsAwarded.length === 0) return 0;
  const sum = memberPointsAwarded.reduce((total, points) => total + points, 0);
  return Math.round(sum / memberPointsAwarded.length);
}

/**
 * Standard competition ranking: score descending, then name (English locale,
 * base sensitivity), then entrant id by plain character comparison, exactly
 * as the backend sorts. Equal scores share a rank and the next rank skips
 * (1, 1, 3).
 */
export function competitionRanks<
  Entry extends { entrantId: string; score: number; name: string },
>(entries: readonly Entry[]): Array<Entry & { rank: number }> {
  const sortedEntries = [...entries].sort(
    (leftEntry, rightEntry) =>
      rightEntry.score - leftEntry.score ||
      leftEntry.name.localeCompare(rightEntry.name, "en", {
        sensitivity: "base",
      }) ||
      (leftEntry.entrantId < rightEntry.entrantId
        ? -1
        : leftEntry.entrantId > rightEntry.entrantId
          ? 1
          : 0),
  );
  return sortedEntries.map((entry) => ({
    ...entry,
    rank:
      1 + entries.filter((otherEntry) => otherEntry.score > entry.score).length,
  }));
}
