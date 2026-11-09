/**
 * Pulse Live demo engine scoring: scores a question once at reveal, keeps team
 * points in step, withdraws a hidden answer's points and pays the host's
 * favourite. The arithmetic is quizshowScoring.ts; this module only applies it
 * to the engine state, as the backend's phases module does.
 */
import type {
  QuizshowAnswerPayload,
  QuizshowWheelBonusView,
} from "../../../shared/contracts/quizshow";
import { isQuizRoundKind, withWheelSettingsDefaults } from "../quizshowWheel";
import {
  captionAuthorPoints,
  closestNumberOutcomes,
  lieDetectorPlayerPoints,
  pointsSinceBaseline,
  scoreQuizAnswer,
  teamQuestionPoints,
  wheelBonusWinnerIds,
} from "./quizshowScoring";
import {
  eligiblePlayersNow,
  entrantTotals,
  extraTimeMs,
  findPlayer,
  findTeam,
  isJokerActiveFor,
  isPartyRoundKind,
  openLimitMs,
  roundAt,
  type QuizshowPlayContext,
} from "./quizshowEngineSetup";
import type {
  QuizshowEngineAnswer,
  QuizshowEngineQuestionPlay,
  QuizshowEngineState,
  QuizshowEngineVoteOption,
} from "./quizshowEngineTypes";

export function answerOf(
  play: QuizshowEngineQuestionPlay,
  playerId: string,
): QuizshowEngineAnswer | undefined {
  return play.answers.find((answer) => answer.playerId === playerId);
}

export function answerById(
  play: QuizshowEngineQuestionPlay,
  answerId: string,
): QuizshowEngineAnswer | undefined {
  return play.answers.find((answer) => answer.answerId === answerId);
}

/** The author of a vote option; null for the Lie Detector truth. */
export function authorIdOf(
  play: QuizshowEngineQuestionPlay,
  option: QuizshowEngineVoteOption,
): string | null {
  if (option.answerId === null) return null;
  return answerById(play, option.answerId)?.playerId ?? null;
}

/** The truth always counts; a submission counts while it is not hidden. */
function isOptionCounted(
  play: QuizshowEngineQuestionPlay,
  option: QuizshowEngineVoteOption,
): boolean {
  if (option.answerId === null) return true;
  return answerById(play, option.answerId)?.isHidden === false;
}

/** Moves what the question earned a player by `delta`, on the play and on their own reveal. */
function addQuestionPoints(
  play: QuizshowEngineQuestionPlay,
  playerId: string,
  delta: number,
): void {
  if (!(playerId in play.pointsByPlayer)) return;
  play.pointsByPlayer[playerId] = (play.pointsByPlayer[playerId] ?? 0) + delta;
  const reveal = play.myReveals[playerId];
  if (reveal !== undefined) reveal.pointsAwarded += delta;
}

function scoreQuizQuestion(
  state: QuizshowEngineState,
  { play, round, question }: QuizshowPlayContext,
): void {
  const eligiblePlayers = eligiblePlayersNow(state);
  const limitMs = openLimitMs(round, question);
  const closestOutcomes =
    question.type === "closest_number" && question.answer !== null
      ? closestNumberOutcomes(
          question.answer.value,
          eligiblePlayers.flatMap((player) => {
            const payload = answerOf(play, player.playerId)?.payload;
            return payload?.type === "closest_number"
              ? [{ playerId: player.playerId, value: payload.value }]
              : [];
          }),
        )
      : null;
  for (const player of eligiblePlayers) {
    const answer = answerOf(play, player.playerId) ?? null;
    const isJokerActive = isJokerActiveFor(
      state,
      player.playerId,
      play.roundIndex,
    );
    if (question.answer === null || question.type === "prompt") {
      play.pointsByPlayer[player.playerId] = 0;
      play.myReveals[player.playerId] = {
        questionId: play.questionId,
        hasAnswered: answer !== null,
        isCorrect: false,
        correctPositions: null,
        pointsAwarded: 0,
        streakBonus: 0,
        isJokerActive,
        streak: player.streak,
      };
      continue;
    }
    const payload: QuizshowAnswerPayload | null = answer?.payload ?? null;
    const score = scoreQuizAnswer({
      question,
      payload,
      elapsedMs: answer?.elapsedMs ?? 0,
      limitMs: play.extraTimePlayerIds.includes(player.playerId)
        ? extraTimeMs(limitMs)
        : limitMs,
      isSpeedBonusOn: round.settings.isSpeedBonusOn,
      streakBefore: player.streak,
      isJokerActive,
      closest: closestOutcomes?.get(player.playerId) ?? null,
    });
    if (answer !== null) answer.pointsAwarded = score.pointsAwarded;
    player.score += score.pointsAwarded;
    player.streak = score.streakAfter;
    play.pointsByPlayer[player.playerId] = score.pointsAwarded;
    play.myReveals[player.playerId] = {
      questionId: play.questionId,
      hasAnswered: answer !== null,
      isCorrect: score.isCorrect,
      correctPositions: answer === null ? null : score.correctPositions,
      pointsAwarded: score.pointsAwarded,
      streakBonus: score.streakBonus,
      isJokerActive,
      streak: score.streakAfter,
    };
  }
}

/** Votes for counted options only; each author's share lands on their answer, every total on the player. */
function scorePartyQuestion(
  state: QuizshowEngineState,
  { play, round }: QuizshowPlayContext,
): void {
  const countedOptions = (play.voteOptions ?? []).filter((option) =>
    isOptionCounted(play, option),
  );
  const optionOfVote = (optionId: string): QuizshowEngineVoteOption | null =>
    countedOptions.find((option) => option.optionId === optionId) ?? null;
  // Votes from a voter removed before the reveal count for nobody.
  const votesReceivedBy = (playerId: string): number =>
    play.votes.filter((vote) => {
      const option = optionOfVote(vote.optionId);
      const isVoterRemoved =
        findPlayer(state, vote.voterPlayerId)?.isRemoved === true;
      return (
        option !== null &&
        !isVoterRemoved &&
        authorIdOf(play, option) === playerId
      );
    }).length;
  const isLieDetector = round.kind === "lie_detector";
  const authorShareOf = (playerId: string): number => {
    const isJokerActive = isJokerActiveFor(state, playerId, play.roundIndex);
    const votesReceived = votesReceivedBy(playerId);
    if (votesReceived === 0) return 0;
    return isLieDetector
      ? lieDetectorPlayerPoints({
          hasPickedTruth: false,
          playersFooled: votesReceived,
          isJokerActive,
        })
      : captionAuthorPoints({
          votesReceived,
          isFavourite: false,
          isJokerActive,
        });
  };
  for (const answer of play.answers) {
    answer.pointsAwarded = answer.isHidden ? 0 : authorShareOf(answer.playerId);
  }
  for (const player of eligiblePlayersNow(state)) {
    const isJokerActive = isJokerActiveFor(
      state,
      player.playerId,
      play.roundIndex,
    );
    const ownVote = play.votes.find(
      (vote) => vote.voterPlayerId === player.playerId,
    );
    const hasPickedTruth =
      ownVote !== undefined && optionOfVote(ownVote.optionId)?.isTruth === true;
    const truthPoints =
      isLieDetector && hasPickedTruth
        ? lieDetectorPlayerPoints({
            hasPickedTruth: true,
            playersFooled: 0,
            isJokerActive,
          })
        : 0;
    const points = truthPoints + authorShareOf(player.playerId);
    player.score += points;
    play.pointsByPlayer[player.playerId] = points;
    play.myReveals[player.playerId] = {
      questionId: play.questionId,
      hasAnswered: answerOf(play, player.playerId) !== undefined,
      isCorrect: null,
      correctPositions: null,
      pointsAwarded: points,
      streakBonus: 0,
      isJokerActive,
      streak: player.streak,
    };
  }
}

/**
 * Team points over the members present when the question opened (a member
 * removed before the reveal counts 0), with each team's total moved by the
 * difference.
 */
export function applyTeamPoints(
  state: QuizshowEngineState,
  play: QuizshowEngineQuestionPlay,
): void {
  if (state.playMode === "solo") return;
  const memberPointsByTeam = new Map<string, number[]>();
  for (const playerId of play.eligiblePlayerIds) {
    const teamId = findPlayer(state, playerId)?.teamId ?? null;
    if (teamId === null) continue;
    memberPointsByTeam.set(teamId, [
      ...(memberPointsByTeam.get(teamId) ?? []),
      play.pointsByPlayer[playerId] ?? 0,
    ]);
  }
  const nextTeamPoints: Record<string, number> = {};
  for (const [teamId, memberPoints] of memberPointsByTeam) {
    nextTeamPoints[teamId] = teamQuestionPoints(memberPoints);
  }
  const teamIds = new Set([
    ...Object.keys(play.teamPoints),
    ...Object.keys(nextTeamPoints),
  ]);
  for (const teamId of teamIds) {
    const team = findTeam(state, teamId);
    if (team === undefined) continue;
    team.score +=
      (nextTeamPoints[teamId] ?? 0) - (play.teamPoints[teamId] ?? 0);
  }
  play.teamPoints = nextTeamPoints;
}

/** Scores the question in play once: quiz answers, or party votes; then the teams. */
export function scoreQuestionOnce(
  state: QuizshowEngineState,
  context: QuizshowPlayContext,
): void {
  const { play, round } = context;
  if (play.isScored) return;
  if (isQuizRoundKind(round.kind)) scoreQuizQuestion(state, context);
  else if (isPartyRoundKind(round.kind)) scorePartyQuestion(state, context);
  else {
    throw new Error(
      `Pulse Live demo ${state.sessionId} tried to score a question on a ${round.kind} row.`,
    );
  }
  applyTeamPoints(state, play);
  play.isScored = true;
}

/** A hidden answer of a scored question: its author loses what it earned and the team average follows. */
export function withdrawAnswerPoints(
  state: QuizshowEngineState,
  play: QuizshowEngineQuestionPlay,
  answer: QuizshowEngineAnswer,
): void {
  const withdrawnPoints = answer.pointsAwarded;
  const author = findPlayer(state, answer.playerId);
  if (author !== undefined) author.score -= withdrawnPoints;
  addQuestionPoints(play, answer.playerId, -withdrawnPoints);
  answer.pointsAwarded = 0;
  applyTeamPoints(state, play);
}

/** The host's favourite: its author gains the favourite points, doubled under their joker. */
export function awardFavourite(
  state: QuizshowEngineState,
  play: QuizshowEngineQuestionPlay,
  answer: QuizshowEngineAnswer,
): void {
  const bonus = captionAuthorPoints({
    votesReceived: 0,
    isFavourite: true,
    isJokerActive: isJokerActiveFor(state, answer.playerId, play.roundIndex),
  });
  answer.pointsAwarded += bonus;
  const author = findPlayer(state, answer.playerId);
  if (author !== undefined) author.score += bonus;
  addQuestionPoints(play, answer.playerId, bonus);
  applyTeamPoints(state, play);
}

/**
 * Gives the slice's bonus to every entrant tied for the most points on it and
 * returns the view; null when no wheel is open, the slice carries no bonus or
 * nobody scored above 0. Pick a round counts the points that reached totals
 * since the round opened; pick a question counts the points the current
 * question earned. Teams play credits the team score only. The caller emits
 * the refreshed host lobby scores and each awarded solo player's own score.
 */
export function applyWheelBonus(
  state: QuizshowEngineState,
  sliceRoundIndex: number,
): QuizshowWheelBonusView | null {
  const wheel = state.wheelProgress.wheel;
  if (wheel === null) return null;
  const sliceRow = roundAt(state, sliceRoundIndex);
  if (sliceRow === null) return null;
  const bonus = withWheelSettingsDefaults(sliceRow.settings).wheelBonus;
  if (bonus === 0) return null;

  const totals = entrantTotals(state);
  const isSolo = state.playMode === "solo";
  const pointsByEntrant =
    wheel.pick === "round"
      ? pointsSinceBaseline(wheel.baselineByEntrant ?? {}, totals)
      : totals.map((total) => ({
          entrantId: total.entrantId,
          points:
            (isSolo
              ? state.current?.pointsByPlayer[total.entrantId]
              : state.current?.teamPoints[total.entrantId]) ?? 0,
        }));

  const winnerIds = new Set(wheelBonusWinnerIds(pointsByEntrant));
  if (winnerIds.size === 0) return null;
  const winners = totals.filter((total) => winnerIds.has(total.entrantId));
  for (const winner of winners) {
    const entrant = isSolo
      ? findPlayer(state, winner.entrantId)
      : findTeam(state, winner.entrantId);
    if (entrant !== undefined) entrant.score += bonus;
  }
  return {
    points: bonus,
    pick: wheel.pick,
    sliceRoundIndex,
    sliceTitle: sliceRow.title,
    winners: winners.map((winner) => ({
      entrantId: winner.entrantId,
      kind: winner.kind,
      name: winner.name,
      colorKey: winner.colorKey,
    })),
  };
}
