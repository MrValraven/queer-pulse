/**
 * Pulse Live demo engine scoring: scores a question once at reveal, rescores
 * it after a host correction, keeps team points in step, withdraws a hidden
 * answer's points and pays the host's favourite. The arithmetic is quizshowScoring.ts; this module only applies it
 * to the engine state, as the backend's phases module does.
 */
import type {
  QuizshowAnswerKeyView,
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
  currentPlayContext,
  eligiblePlayersNow,
  entrantTotals,
  extraTimeMs,
  findPlayer,
  findTeam,
  isActivePlayer,
  isJokerActiveFor,
  isPartyRoundKind,
  openLimitMs,
  questionAt,
  roundAt,
  type QuizshowEngineContext,
  type QuizshowPlayContext,
} from "./quizshowEngineSetup";
import type {
  QuizshowEngineAnswer,
  QuizshowEngineEffect,
  QuizshowEnginePlayer,
  QuizshowEngineQuestionPlay,
  QuizshowEngineState,
  QuizshowEngineVoteOption,
} from "./quizshowEngineTypes";
import { toAnswerKeyView } from "./quizshowEngineViews";

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

/** The key the night judges by: a host correction when one was made, else the authored key (C6.4). */
export function effectiveAnswerKey(
  state: QuizshowEngineState,
  play: QuizshowEngineQuestionPlay,
): QuizshowAnswerKeyView | null {
  if (play.keyOverride !== null) return play.keyOverride;
  const round = roundAt(state, play.roundIndex);
  const question = questionAt(state, play.roundIndex, play.questionIndex);
  return round === null || question === null
    ? null
    : toAnswerKeyView(round, question);
}

/**
 * Judges every eligible answer against the effective key and the texts a
 * host accepted. A prompt scores nobody; a poll is never judged; a warm-up
 * round judges but awards 0 and keeps streaks. The first scoring records each
 * eligible player's streak so a rescore can restore it. `scoredPlayers`
 * defaults to the eligible players active now; a rescore passes its own set.
 */
function scoreQuizQuestion(
  state: QuizshowEngineState,
  { play, round, question }: QuizshowPlayContext,
  scoredPlayers: readonly QuizshowEnginePlayer[] = eligiblePlayersNow(state),
): void {
  if (Object.keys(play.streakBeforeByPlayer).length === 0) {
    for (const player of scoredPlayers) {
      play.streakBeforeByPlayer[player.playerId] = player.streak;
    }
  }
  const answerKey = effectiveAnswerKey(state, play);
  const limitMs = openLimitMs(round, question);
  const closestOutcomes =
    answerKey?.type === "closest_number"
      ? closestNumberOutcomes(
          answerKey.value,
          answerKey.tolerance,
          scoredPlayers.flatMap((player) => {
            const payload = answerOf(play, player.playerId)?.payload;
            return payload?.type === "closest_number"
              ? [{ playerId: player.playerId, value: payload.value }]
              : [];
          }),
        )
      : null;
  for (const player of scoredPlayers) {
    const answer = answerOf(play, player.playerId) ?? null;
    const isJokerActive = isJokerActiveFor(
      state,
      player.playerId,
      play.roundIndex,
    );
    if (
      question.type === "prompt" ||
      (answerKey === null && question.type !== "poll")
    ) {
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
      answerKey,
      acceptedTexts: play.acceptedTexts,
      isWarmUp: round.settings.isWarmUp,
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
  // A vote stops counting once its voter is no longer active: removed by a
  // host, removed with rejoin, or gone with a leave (contract 6.14).
  const votesReceivedBy = (playerId: string): number =>
    play.votes.filter((vote) => {
      const option = optionOfVote(vote.optionId);
      const voter = findPlayer(state, vote.voterPlayerId);
      const isVoterGone = voter !== undefined && !isActivePlayer(voter);
      return (
        option !== null && !isVoterGone && authorIdOf(play, option) === playerId
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

/**
 * Who a rescore covers: exactly the players the first scoring judged (the
 * keys of `streakBeforeByPlayer`) whose row a host did not remove, each with
 * the streak they had before it. A player who left after the reveal is
 * included and gets the corrected points and streak; one who left before it
 * was never judged and stays out; a host-removed player keeps their score.
 */
function rescoredPlayersOf(
  state: QuizshowEngineState,
  play: QuizshowEngineQuestionPlay,
): Array<{ player: QuizshowEnginePlayer; streakBefore: number }> {
  return Object.entries(play.streakBeforeByPlayer).flatMap(
    ([playerId, streakBefore]) => {
      const player = findPlayer(state, playerId);
      return player === undefined || player.isRemoved
        ? []
        : [{ player, streakBefore }];
    },
  );
}

/** After a correction no player or team total goes below 0. */
function clampScoresAtZero(state: QuizshowEngineState): void {
  for (const player of state.players) player.score = Math.max(player.score, 0);
  for (const team of state.teams) team.score = Math.max(team.score, 0);
}

/**
 * C6.4 step 4 on the question in play, over `rescoredPlayersOf`: takes back
 * what it paid, restores each streak from before its first scoring, judges again against the effective
 * key and the accepted texts (a joker doubles the corrected points as before),
 * moves each team by the difference so host adjustments stay, clamps every
 * player and team total at 0, and marks the reveal corrected. In `scores` the frame totals become the corrected ones, so
 * the count-up still starts from the totals before the question. The accept
 * command adds `typed_answers_changed` itself.
 */
export function rescoreQuestion(
  context: QuizshowEngineContext,
): QuizshowEngineEffect[] {
  const { state } = context;
  const playContext = currentPlayContext(state);
  const { play } = playContext;
  const rescored = rescoredPlayersOf(state, play);
  for (const { player, streakBefore } of rescored) {
    player.score -= play.pointsByPlayer[player.playerId] ?? 0;
    player.streak = streakBefore;
    delete play.pointsByPlayer[player.playerId];
  }
  scoreQuizQuestion(
    state,
    playContext,
    rescored.map(({ player }) => player),
  );
  applyTeamPoints(state, play);
  clampScoresAtZero(state);
  play.wasCorrected = true;
  const isInScores = state.cursor.phase === "scores";
  if (isInScores) {
    state.scoresAtLastFrame = Object.fromEntries(
      entrantTotals(state).map((entrant) => [entrant.entrantId, entrant.score]),
    );
  }
  // Frames go to players still playing; one who left has no socket to read them.
  const activeScoredPlayerIds = eligiblePlayersNow(state).map(
    (player) => player.playerId,
  );
  const effects: QuizshowEngineEffect[] = [
    {
      kind: "reveal_updated",
      playerIds: activeScoredPlayerIds,
      scope: "everyone",
    },
  ];
  if (isInScores) effects.push({ kind: "scores_shown" });
  effects.push(
    { kind: "lobby_changed" },
    { kind: "me_changed", playerIds: activeScoredPlayerIds },
  );
  return effects;
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
