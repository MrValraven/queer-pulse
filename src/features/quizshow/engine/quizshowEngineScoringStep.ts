/**
 * Pulse Live demo engine scoring: scores a question once at reveal, keeps team
 * points in step, withdraws a hidden answer's points and pays the host's
 * favourite. The arithmetic is quizshowScoring.ts; this module only applies it
 * to the engine state, as the backend's phases module does.
 */
import type { QuizshowAnswerPayload } from "../../../shared/contracts/quizshow";
import {
  captionAuthorPoints,
  closestNumberOutcomes,
  lieDetectorPlayerPoints,
  scoreQuizAnswer,
  teamQuestionPoints,
} from "./quizshowScoring";
import {
  eligiblePlayersNow,
  extraTimeMs,
  findPlayer,
  findTeam,
  isJokerActiveFor,
  isPartyRoundKind,
  openLimitMs,
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
  if (isPartyRoundKind(round.kind)) scorePartyQuestion(state, context);
  else scoreQuizQuestion(state, context);
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
