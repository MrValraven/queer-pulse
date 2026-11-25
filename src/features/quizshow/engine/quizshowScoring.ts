/**
 * Pulse Live scoring for the demo engine. Pure functions with no clock and no
 * randomness, copied from the backend's quizshow-scoring.ts and
 * quizshow-answer-normaliser.ts so a demo session scores like a live one.
 */
import {
  QUIZSHOW_LIMITS,
  type QuizshowAnswerKeyView,
  type QuizshowAnswerPayload,
  type QuizshowClosestTolerance,
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

/** The contract's name for the typed-answer normaliser (C6.4): the same function. */
export const normaliseTypedAnswer = normaliseAnswerText;

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

/**
 * Matches against the key in both languages plus every accepted answer, or
 * holds a normalised text a host accepted on the night (`acceptedTexts`).
 */
export function isTypedAnswerCorrect(
  submitted: string,
  key: QuizshowText,
  acceptedAnswers: readonly string[],
  acceptedTexts: readonly string[] = [],
): boolean {
  return (
    isTypedAnswerMatch(submitted, [key.en, key.pt, ...acceptedAnswers]) ||
    acceptedTexts.includes(normaliseTypedAnswer(submitted))
  );
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
  /** At most the band width away; the half-points `band` outcome is this without `isClosest`. */
  isWithinBand: boolean;
}

/** A distance rounded to 12 significant digits, as the backend compares it. */
const distanceKey = (distance: number): number =>
  Number(distance.toPrecision(12));

/** Half-points band around the truth; 0 means only the closest answers score. */
export function closestBandWidth(
  truth: number,
  tolerance: QuizshowClosestTolerance,
): number {
  switch (tolerance.mode) {
    case "exact":
      return 0;
    case "absolute":
      return tolerance.amount;
    case "percent":
      return (Math.abs(truth) * tolerance.amount) / 100;
  }
}

/**
 * Every answer at the minimum distance from the truth is closest; any other
 * answer whose distance is at most the question's band width
 * (`closestBandWidth`) is in the band and takes half. An exact tolerance, or a
 * percent tolerance on a truth of 0, bands at 0. Distances compare at 12
 * significant digits so float noise keeps a decimal tie fair and an answer at
 * the band edge inside.
 */
export function closestNumberOutcomes(
  truth: number,
  tolerance: QuizshowClosestTolerance,
  answers: ReadonlyArray<{ playerId: string; value: number }>,
): Map<string, ClosestNumberOutcome> {
  const outcomes = new Map<string, ClosestNumberOutcome>();
  if (answers.length === 0) return outcomes;
  const minimumDistance = Math.min(
    ...answers.map((answer) => Math.abs(answer.value - truth)),
  );
  const minimumDistanceKey = distanceKey(minimumDistance);
  const bandWidthKey = distanceKey(closestBandWidth(truth, tolerance));
  for (const answer of answers) {
    const answerDistanceKey = distanceKey(Math.abs(answer.value - truth));
    outcomes.set(answer.playerId, {
      isClosest: answerDistanceKey === minimumDistanceKey,
      isWithinBand: answerDistanceKey <= bandWidthKey,
    });
  }
  return outcomes;
}

export interface QuizAnswerScoringInput {
  /** A quiz-round type: a poll scores nothing, the rest need a key. */
  question: QuizshowQuestion;
  /**
   * The key to judge by: a host correction when one was made (C6.4). Left
   * out, the question's own answer is the key.
   */
  answerKey?: QuizshowAnswerKeyView | null;
  /** Normalised texts a host accepted on a typed answer (C6.4 rule 2). */
  acceptedTexts?: readonly string[];
  /** A warm-up round: judged, 0 points, streak kept (C6.19). */
  isWarmUp?: boolean;
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
  /** null on a poll, which has no right answer. */
  isCorrect: boolean | null;
  /** order only. */
  correctPositions: number | null;
  basePoints: number;
  streakBonus: number;
  streakAfter: number;
  pointsAwarded: number;
}

/**
 * The authored key of a quiz question; null on a poll, a prompt or a missing
 * answer. Twin of `toAnswerKeyView` in quizshowEngineViews.ts, kept here so
 * this module stays pure; the two must read the same fields.
 */
function answerKeyOfQuestion(
  question: QuizshowQuestion,
): QuizshowAnswerKeyView | null {
  if (question.type === "prompt" || question.type === "poll") return null;
  if (question.answer === null) return null;
  switch (question.type) {
    case "multiple_choice":
      return {
        type: "multiple_choice",
        correctIndexes: question.answer.correctIndexes,
      };
    case "true_false":
      return { type: "true_false", isTrue: question.answer.isTrue };
    case "type_answer":
      return {
        type: "type_answer",
        text: question.answer.text,
        acceptedAnswers: question.acceptedAnswers,
      };
    case "order":
      return { type: "order", orderedIds: question.answer.orderedIds };
    case "closest_number":
      return {
        type: "closest_number",
        value: question.answer.value,
        tolerance: question.answer.tolerance,
      };
  }
}

interface QuizAnswerJudgement {
  isCorrect: boolean;
  correctPositions: number | null;
  /** Order only: partial points by position; 0 elsewhere. */
  partialBasePoints: number;
}

/** Whether a payload is right against its key; a payload of another type is wrong. */
function judgeQuizAnswer(
  answerKey: QuizshowAnswerKeyView,
  payload: QuizshowAnswerPayload,
  base: number,
  closest: ClosestNumberOutcome | null,
  acceptedTexts: readonly string[],
): QuizAnswerJudgement {
  const wrongJudgement: QuizAnswerJudgement = {
    isCorrect: false,
    correctPositions: null,
    partialBasePoints: 0,
  };
  switch (answerKey.type) {
    case "multiple_choice":
      return payload.type === "multiple_choice"
        ? {
            ...wrongJudgement,
            isCorrect: answerKey.correctIndexes.includes(payload.optionIndex),
          }
        : wrongJudgement;
    case "true_false":
      return payload.type === "true_false"
        ? { ...wrongJudgement, isCorrect: payload.isTrue === answerKey.isTrue }
        : wrongJudgement;
    case "type_answer":
      return payload.type === "type_answer"
        ? {
            ...wrongJudgement,
            isCorrect: isTypedAnswerCorrect(
              payload.text,
              answerKey.text,
              answerKey.acceptedAnswers,
              acceptedTexts,
            ),
          }
        : wrongJudgement;
    case "order": {
      // A payload of another type leaves positions null, as the backend does.
      if (payload.type !== "order") return wrongJudgement;
      const correctIds = answerKey.orderedIds;
      const matchedPositions = correctIds.filter(
        (optionId, position) => payload.orderedIds[position] === optionId,
      ).length;
      const isCorrect =
        correctIds.length > 0 && matchedPositions === correctIds.length;
      return {
        isCorrect,
        correctPositions: matchedPositions,
        partialBasePoints:
          !isCorrect && matchedPositions > 0
            ? Math.round((base * matchedPositions) / correctIds.length)
            : 0,
      };
    }
    case "closest_number": {
      if (payload.type !== "closest_number") return wrongJudgement;
      const isCorrect = closest?.isClosest === true;
      return {
        isCorrect,
        correctPositions: null,
        partialBasePoints:
          !isCorrect && closest?.isWithinBand === true
            ? Math.round(base / 2)
            : 0,
      };
    }
    case "lie_detector":
      return wrongJudgement;
  }
}

/**
 * Speed points on a correct answer (closest number takes the plain base),
 * order partials and the closest-number band without speed, the streak bonus
 * on a correct answer, and the joker doubling the whole question total. A
 * poll is never judged: `isCorrect` null, 0 points, streak kept. A warm-up
 * answer is judged and scores 0 with the streak kept, so the warm-up never
 * moves the standings.
 */
export function scoreQuizAnswer(
  input: QuizAnswerScoringInput,
): QuizAnswerScore {
  const { question, payload } = input;
  if (question.type === "poll") {
    return {
      isCorrect: null,
      correctPositions: null,
      basePoints: 0,
      streakBonus: 0,
      streakAfter: input.streakBefore,
      pointsAwarded: 0,
    };
  }
  const answerKey =
    input.answerKey === undefined
      ? answerKeyOfQuestion(question)
      : input.answerKey;
  const base = question.points;
  const judgement =
    payload !== null && answerKey !== null
      ? judgeQuizAnswer(
          answerKey,
          payload,
          base,
          input.closest,
          input.acceptedTexts ?? [],
        )
      : { isCorrect: false, correctPositions: null, partialBasePoints: 0 };
  const { isCorrect, correctPositions } = judgement;
  if (input.isWarmUp === true) {
    return {
      isCorrect,
      correctPositions,
      basePoints: 0,
      streakBonus: 0,
      streakAfter: input.streakBefore,
      pointsAwarded: 0,
    };
  }
  const basePoints = !isCorrect
    ? judgement.partialBasePoints
    : question.type === "closest_number"
      ? base
      : speedPoints(base, input.elapsedMs, input.limitMs, input.isSpeedBonusOn);
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

/** Entrant ids with the highest points when that best is above 0; every tie wins. Input order is kept. */
export function wheelBonusWinnerIds(
  entries: ReadonlyArray<{ entrantId: string; points: number }>,
): string[] {
  let bestPoints = 0;
  for (const entry of entries) {
    if (entry.points > bestPoints) bestPoints = entry.points;
  }
  if (bestPoints <= 0) return [];
  return entries
    .filter((entry) => entry.points === bestPoints)
    .map((entry) => entry.entrantId);
}

/** Points each entrant scored since the baseline; an entrant missing from the baseline started at 0. */
export function pointsSinceBaseline(
  baselineByEntrant: Readonly<Record<string, number>>,
  totals: ReadonlyArray<{ entrantId: string; score: number }>,
): Array<{ entrantId: string; points: number }> {
  return totals.map((total) => ({
    entrantId: total.entrantId,
    points: total.score - (baselineByEntrant[total.entrantId] ?? 0),
  }));
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
