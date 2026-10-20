/**
 * Pulse Live demo engine views: the contract frame shapes and `session:state`
 * per role, built from the engine state, and the frames each effect sends to
 * each audience. Ports of the backend's quizshow-frames.ts. The demo serves no
 * avatars (`avatarUrl` is null everywhere) and no next event.
 *
 * Privacy boundary: the screen and players see no answer key, truth or vote
 * count before `reveal`.
 */
import {
  QUIZSHOW_LIMITS,
  type QuizshowAnswerKeyView,
  type QuizshowAttachRole,
  type QuizshowDistribution,
  type QuizshowHostLobby,
  type QuizshowHostQuestionView,
  type QuizshowHostState,
  type QuizshowHostVoteOptions,
  type QuizshowLeaderboardEntry,
  type QuizshowLobby,
  type QuizshowLobbyPlayer,
  type QuizshowMyReveal,
  type QuizshowMyScores,
  type QuizshowPhase,
  type QuizshowPhaseChangeFrame,
  type QuizshowPlayerState,
  type QuizshowPodiumEntry,
  type QuizshowQuestion,
  type QuizshowQuestionView,
  type QuizshowReveal,
  type QuizshowReviewList,
  type QuizshowRound,
  type QuizshowRoundCard,
  type QuizshowScores,
  type QuizshowScoresScope,
  type QuizshowSessionEnd,
  type QuizshowSessionState,
  type QuizshowStateBase,
  type QuizshowVoteOptions,
} from "../../../shared/contracts/quizshow";
import type { QuizshowServerFrame } from "../realtime/quizshowFrames";
import { closestNumberOutcomes, competitionRanks } from "./quizshowScoring";
import {
  activePlayerOf,
  activePlayers,
  eligiblePlayersNow,
  entrantIdOf,
  entrantTotals,
  findPlayer,
  isEligible,
  isJokerActiveFor,
  isPartyRoundKind,
  roundAt,
  shownOptionsOf,
  toMe,
  type QuizshowEntrantTotal,
} from "./quizshowEngineSetup";
import { answerById, answerOf, authorIdOf } from "./quizshowEngineScoringStep";
import type {
  QuizshowEngineAnswer,
  QuizshowEngineEffect,
  QuizshowEngineFrame,
  QuizshowEnginePlayer,
  QuizshowEngineQuestionPlay,
  QuizshowEngineState,
  QuizshowEngineVoteOption,
} from "./quizshowEngineTypes";

/** Phases that show the current question: `read` to `scores` in a quiz round, `write` to `reveal` in a party round. */
const QUESTION_PHASES: readonly QuizshowPhase[] = [
  "read",
  "open",
  "write",
  "review",
  "vote",
  "reveal",
  "scores",
];

/** Phases whose `answer:count` is live; `read` carries the zero count the question opens with. */
const COUNTED_PHASES: readonly QuizshowPhase[] = [
  "read",
  "open",
  "write",
  "review",
  "vote",
];

const REVEAL_PHASES: readonly QuizshowPhase[] = ["reveal", "scores"];

const ROUNDLESS_PHASES: readonly QuizshowPhase[] = ["lobby", "podium", "ended"];

interface QuizshowShownQuestion {
  round: QuizshowRound;
  question: QuizshowQuestion;
  roundIndex: number;
  questionIndex: number;
  /** The live play of that question, or null when the state holds another one. */
  play: QuizshowEngineQuestionPlay | null;
}

/** The question on show in this phase; null outside question phases. */
function shownQuestion(
  state: QuizshowEngineState,
): QuizshowShownQuestion | null {
  if (!QUESTION_PHASES.includes(state.cursor.phase)) return null;
  const roundIndex = state.current?.roundIndex ?? state.cursor.roundIndex;
  const questionIndex =
    state.current?.questionIndex ?? state.cursor.questionIndex;
  if (roundIndex === null || questionIndex === null) return null;
  const round = roundAt(state, roundIndex);
  const question = round?.questions[questionIndex];
  if (round === null || question === undefined) return null;
  const play =
    state.current !== null && state.current.questionId === question.id
      ? state.current
      : null;
  return { round, question, roundIndex, questionIndex, play };
}

export function toRoundCard(
  round: QuizshowRound,
  roundIndex: number,
): QuizshowRoundCard {
  return {
    roundIndex,
    kind: round.kind,
    title: round.title,
    contentLabel: round.contentLabel,
    questionCount: round.questions.length,
    isJokerAllowed: round.settings.isJokerAllowed,
    isSpeedBonusOn: round.settings.isSpeedBonusOn,
  };
}

/** Screen and players: built field by field so no answer key can ride along. */
function toQuestionView(
  state: QuizshowEngineState,
  shown: QuizshowShownQuestion,
): QuizshowQuestionView {
  const { round, question } = shown;
  return {
    questionId: question.id,
    roundIndex: shown.roundIndex,
    questionIndex: shown.questionIndex,
    roundKind: round.kind,
    type: question.type,
    prompt: { ...question.prompt },
    mediaUrl: question.mediaUrl,
    points: question.points,
    timeLimitSeconds: isPartyRoundKind(round.kind)
      ? round.settings.writeSeconds
      : (question.timeLimitSeconds ?? round.settings.timeLimitSeconds),
    options: shownOptionsOf(state, question),
  };
}

export function toAnswerKeyView(
  round: QuizshowRound,
  question: QuizshowQuestion,
): QuizshowAnswerKeyView | null {
  if (round.kind === "caption_this" || round.kind === "drag_name") return null;
  if (question.answer === null) return null;
  switch (question.type) {
    case "multiple_choice":
      return {
        type: "multiple_choice",
        correctIndex: question.answer.correctIndex,
      };
    case "true_false":
      return { type: "true_false", isTrue: question.answer.isTrue };
    case "type_answer":
      return {
        type: "type_answer",
        text: { ...question.answer.text },
        acceptedAnswers: [...question.acceptedAnswers],
      };
    case "order":
      return { type: "order", orderedIds: [...question.answer.orderedIds] };
    case "closest_number":
      return { type: "closest_number", value: question.answer.value };
    case "prompt":
      return round.kind === "lie_detector"
        ? { type: "lie_detector", truth: { ...question.answer.truth } }
        : null;
  }
}

function publicQuestionView(
  state: QuizshowEngineState,
): QuizshowQuestionView | null {
  const shown = shownQuestion(state);
  return shown === null ? null : toQuestionView(state, shown);
}

function hostQuestionView(
  state: QuizshowEngineState,
): QuizshowHostQuestionView | null {
  const shown = shownQuestion(state);
  if (shown === null) return null;
  return {
    ...toQuestionView(state, shown),
    answerKey: toAnswerKeyView(shown.round, shown.question),
  };
}

function currentRoundCard(
  state: QuizshowEngineState,
): QuizshowRoundCard | null {
  const { phase, roundIndex } = state.cursor;
  if (ROUNDLESS_PHASES.includes(phase) || roundIndex === null) return null;
  const round = roundAt(state, roundIndex);
  return round === null ? null : toRoundCard(round, roundIndex);
}

function toLobbyPlayer(player: QuizshowEnginePlayer): QuizshowLobbyPlayer {
  return {
    playerId: player.playerId,
    screenName: player.screenName,
    teamId: player.teamId,
    avatarUrl: null,
  };
}

function lobbyTeams(state: QuizshowEngineState): QuizshowLobby["teams"] {
  if (state.playMode === "solo") return [];
  const players = activePlayers(state);
  return state.teams.map((team) => ({
    teamId: team.teamId,
    name: team.name,
    colorKey: team.colorKey,
    memberCount: players.filter((player) => player.teamId === team.teamId)
      .length,
  }));
}

/** `lobby:update` for the screen and the players room. */
export function buildLobby(state: QuizshowEngineState): QuizshowLobby {
  const players = activePlayers(state);
  return {
    players: players.map(toLobbyPlayer),
    teams: lobbyTeams(state),
    playerCount: players.length,
  };
}

/** `lobby:update` for the hosts room: scores, jokers and extra time. */
export function buildHostLobby(state: QuizshowEngineState): QuizshowHostLobby {
  const players = activePlayers(state);
  return {
    players: players.map((player) => ({
      ...toLobbyPlayer(player),
      isCohostPlayer: player.isCohostPlayer,
      hasExtraTime: player.hasExtraTime,
      hasUsedJoker: toMe(state, player.playerId).hasUsedJoker,
      score: player.score,
      isConnected: true,
      joinedAt: player.joinedAt,
    })),
    teams: lobbyTeams(state).map((team) => {
      const engineTeam = state.teams.find(
        (candidate) => candidate.teamId === team.teamId,
      );
      return {
        ...team,
        score: engineTeam?.score ?? 0,
        hasUsedJoker: engineTeam?.hasUsedJoker ?? false,
      };
    }),
    playerCount: players.length,
  };
}

export function buildPhaseChange(
  state: QuizshowEngineState,
  audience: "public" | "host",
): QuizshowPhaseChangeFrame {
  return {
    cursor: { ...state.cursor },
    round: currentRoundCard(state),
    question:
      audience === "host" ? hostQuestionView(state) : publicQuestionView(state),
  };
}

/** Answers in `read`, `open` and `write`, submissions in `review`, votes in `vote`, out of the eligible players still in. */
export function buildAnswerCount(
  state: QuizshowEngineState,
): { phaseId: string; count: number; total: number } | null {
  if (!COUNTED_PHASES.includes(state.cursor.phase)) return null;
  const play = shownQuestion(state)?.play ?? null;
  if (play === null) return null;
  const eligiblePlayers = eligiblePlayersNow(state);
  const isCountingVotes = state.cursor.phase === "vote";
  const count = eligiblePlayers.filter((player) =>
    isCountingVotes
      ? play.votes.some((vote) => vote.voterPlayerId === player.playerId)
      : answerOf(play, player.playerId) !== undefined,
  ).length;
  return {
    phaseId: state.cursor.phaseId,
    count,
    total: eligiblePlayers.length,
  };
}

function partyTextOf(answer: QuizshowEngineAnswer): string | null {
  return answer.payload.type === "prompt" ? answer.payload.text : null;
}

function byReceivedAt(
  first: QuizshowEngineAnswer,
  second: QuizshowEngineAnswer,
): number {
  return first.receivedAt - second.receivedAt;
}

/** `review:list` for hosts during `review`: every submission with its author, hidden ones flagged. */
export function buildReviewList(
  state: QuizshowEngineState,
): QuizshowReviewList | null {
  if (state.cursor.phase !== "review") return null;
  const play = shownQuestion(state)?.play ?? null;
  if (play === null) return null;
  const submissions = [...play.answers].sort(byReceivedAt).flatMap((answer) => {
    const author = findPlayer(state, answer.playerId);
    const text = partyTextOf(answer);
    if (author === undefined || text === null) return [];
    return [
      {
        answerId: answer.answerId,
        playerId: answer.playerId,
        screenName: author.screenName,
        text,
        isHidden: answer.isHidden,
        receivedAt: answer.receivedAt,
      },
    ];
  });
  return {
    phaseId: state.cursor.phaseId,
    questionId: play.questionId,
    submissions,
  };
}

/** The truth always shows; a submission shows while it is not hidden and its author is still in. */
function visibleVoteOptions(
  state: QuizshowEngineState,
  play: QuizshowEngineQuestionPlay,
): QuizshowEngineVoteOption[] {
  return (play.voteOptions ?? []).filter((option) => {
    if (option.answerId === null) return true;
    const answer = answerById(play, option.answerId);
    return (
      answer !== undefined &&
      !answer.isHidden &&
      activePlayerOf(state, answer.playerId) !== null
    );
  });
}

function votingPlay(
  state: QuizshowEngineState,
): QuizshowEngineQuestionPlay | null {
  if (state.cursor.phase !== "vote") return null;
  const play = shownQuestion(state)?.play ?? null;
  return play !== null && play.voteOptions !== null ? play : null;
}

/** `vote:options` with no author and no truth flag; `ownOptionId` is the receiving player's own answer. */
export function buildVoteOptions(
  state: QuizshowEngineState,
  forPlayerId: string | null,
): QuizshowVoteOptions | null {
  const play = votingPlay(state);
  if (play === null) return null;
  const options = visibleVoteOptions(state, play);
  const ownOption =
    forPlayerId === null
      ? undefined
      : options.find((option) => authorIdOf(play, option) === forPlayerId);
  return {
    phaseId: state.cursor.phaseId,
    questionId: play.questionId,
    options: options.map((option) => ({
      optionId: option.optionId,
      text: option.text,
    })),
    ownOptionId: ownOption?.optionId ?? null,
  };
}

function authorNameOf(
  state: QuizshowEngineState,
  play: QuizshowEngineQuestionPlay,
  option: QuizshowEngineVoteOption,
): string | null {
  if (option.isTruth) return null;
  const authorId = authorIdOf(play, option);
  return authorId === null
    ? null
    : (findPlayer(state, authorId)?.screenName ?? null);
}

/** `vote:options` for hosts: each option with its answer id, author screen name and truth flag. */
export function buildHostVoteOptions(
  state: QuizshowEngineState,
): QuizshowHostVoteOptions | null {
  const play = votingPlay(state);
  if (play === null) return null;
  return {
    phaseId: state.cursor.phaseId,
    questionId: play.questionId,
    options: visibleVoteOptions(state, play).map((option) => ({
      optionId: option.optionId,
      text: option.text,
      answerId: option.answerId,
      authorName: authorNameOf(state, play, option),
      isTruth: option.isTruth,
    })),
    ownOptionId: null,
  };
}

/** The phase id the question was revealed in: the current one in `reveal`, the one before in `scores`. */
function revealPhaseId(state: QuizshowEngineState): string {
  const lastTransition = state.lastTransition;
  if (
    state.cursor.phase === "scores" &&
    lastTransition !== null &&
    lastTransition.toPhaseId === state.cursor.phaseId
  ) {
    return lastTransition.fromPhaseId;
  }
  return state.cursor.phaseId;
}

function correctPositionsOf(
  question: QuizshowQuestion,
  answer: QuizshowEngineAnswer,
): number {
  if (question.type !== "order" || answer.payload.type !== "order") return 0;
  const orderedIds = question.answer?.orderedIds ?? [];
  const submittedIds = answer.payload.orderedIds;
  return orderedIds.filter(
    (optionId, position) => submittedIds[position] === optionId,
  ).length;
}

function eligibleAnswersOf(
  play: QuizshowEngineQuestionPlay,
  eligiblePlayers: readonly QuizshowEnginePlayer[],
): QuizshowEngineAnswer[] {
  return eligiblePlayers.flatMap((player) => {
    const answer = answerOf(play, player.playerId);
    return answer === undefined ? [] : [answer];
  });
}

function closestDistribution(
  question: QuizshowQuestion,
  answers: readonly QuizshowEngineAnswer[],
  eligiblePlayers: readonly QuizshowEnginePlayer[],
): QuizshowDistribution {
  const submittedValues = answers.flatMap((answer) =>
    answer.payload.type === "closest_number"
      ? [{ playerId: answer.playerId, value: answer.payload.value }]
      : [],
  );
  const outcomes =
    question.type === "closest_number" && question.answer !== null
      ? closestNumberOutcomes(question.answer.value, submittedValues)
      : new Map<string, { isClosest: boolean; isWithinBand: boolean }>();
  const closestPlayers = eligiblePlayers.filter(
    (player) => outcomes.get(player.playerId)?.isClosest === true,
  );
  const firstClosestPlayer = closestPlayers[0];
  return {
    kind: "closest",
    closestValue:
      firstClosestPlayer === undefined
        ? null
        : (submittedValues.find(
            (submitted) => submitted.playerId === firstClosestPlayer.playerId,
          )?.value ?? null),
    closestNames: closestPlayers.map((player) => player.screenName),
    withinBandCount: [...outcomes.values()].filter(
      (outcome) => outcome.isWithinBand && !outcome.isClosest,
    ).length,
  };
}

/** Vote options as built at `vote`; a question that never reached `vote` falls back to its visible submissions. */
function votesDistribution(
  state: QuizshowEngineState,
  play: QuizshowEngineQuestionPlay,
): QuizshowDistribution {
  const options =
    play.voteOptions !== null
      ? visibleVoteOptions(state, play)
      : [...play.answers].sort(byReceivedAt).flatMap((answer) => {
          const text = partyTextOf(answer);
          const isVisible =
            !answer.isHidden && activePlayerOf(state, answer.playerId) !== null;
          if (text === null || !isVisible) return [];
          return [
            {
              optionId: answer.answerId,
              answerId: answer.answerId,
              isTruth: false,
              text,
            },
          ];
        });
  const entries = options.map((option) => ({
    optionId: option.optionId,
    answerId: option.answerId,
    text: option.text,
    authorName: authorNameOf(state, play, option),
    isTruth: option.isTruth,
    voteCount: play.votes.filter((vote) => vote.optionId === option.optionId)
      .length,
    authorPoints:
      option.answerId === null
        ? 0
        : (answerById(play, option.answerId)?.pointsAwarded ?? 0),
  }));
  const favouriteOptionId = entries.some(
    (entry) => entry.optionId === play.favouriteOptionId,
  )
    ? play.favouriteOptionId
    : null;
  return { kind: "votes", entries, favouriteOptionId };
}

function buildDistribution(
  state: QuizshowEngineState,
  question: QuizshowQuestion,
  play: QuizshowEngineQuestionPlay,
  eligiblePlayers: readonly QuizshowEnginePlayer[],
): QuizshowDistribution {
  const answers = eligibleAnswersOf(play, eligiblePlayers);
  switch (question.type) {
    case "multiple_choice": {
      const counts = question.options.map(() => 0);
      for (const answer of answers) {
        if (answer.payload.type !== "multiple_choice") continue;
        const count = counts[answer.payload.optionIndex];
        if (count !== undefined) counts[answer.payload.optionIndex] = count + 1;
      }
      return { kind: "options", counts };
    }
    case "true_false": {
      const trueCount = answers.filter(
        (answer) =>
          answer.payload.type === "true_false" && answer.payload.isTrue,
      ).length;
      return {
        kind: "true_false",
        trueCount,
        falseCount: answers.length - trueCount,
      };
    }
    case "type_answer": {
      const correctCount = answers.filter(
        (answer) => play.myReveals[answer.playerId]?.isCorrect === true,
      ).length;
      return {
        kind: "typed",
        correctCount,
        incorrectCount: answers.length - correctCount,
      };
    }
    case "order": {
      const itemCount = question.answer?.orderedIds.length ?? 0;
      const positions = answers.map((answer) =>
        correctPositionsOf(question, answer),
      );
      const exactCount = positions.filter(
        (correct) => itemCount > 0 && correct === itemCount,
      ).length;
      const partialCount = positions.filter(
        (correct) => correct > 0 && correct !== itemCount,
      ).length;
      return {
        kind: "order",
        exactCount,
        partialCount,
        noneCount: answers.length - exactCount - partialCount,
      };
    }
    case "closest_number":
      return closestDistribution(question, answers, eligiblePlayers);
    case "prompt":
      return votesDistribution(state, play);
  }
}

/** `reveal` in `reveal` and `scores`: the correct answer and the distribution, authors named by screen name. */
export function buildReveal(state: QuizshowEngineState): QuizshowReveal | null {
  if (!REVEAL_PHASES.includes(state.cursor.phase)) return null;
  const shown = shownQuestion(state);
  const play = shown?.play ?? null;
  if (shown === null || play === null) return null;
  const eligiblePlayers = eligiblePlayersNow(state);
  return {
    phaseId: revealPhaseId(state),
    questionId: play.questionId,
    correct: toAnswerKeyView(shown.round, shown.question),
    answeredCount: eligibleAnswersOf(play, eligiblePlayers).length,
    eligibleCount: eligiblePlayers.length,
    distribution: buildDistribution(
      state,
      shown.question,
      play,
      eligiblePlayers,
    ),
  };
}

function rankedEntrants(
  state: QuizshowEngineState,
): Array<QuizshowEntrantTotal & { rank: number }> {
  return competitionRanks(entrantTotals(state));
}

function rankOf(
  ranked: ReadonlyArray<QuizshowEntrantTotal & { rank: number }>,
  entrantId: string | null,
): number {
  const entry = ranked.find((ranking) => ranking.entrantId === entrantId);
  return entry?.rank ?? ranked.length + 1;
}

/** `reveal:mine` for an eligible player still in, in `reveal` and `scores`. */
export function buildMyReveal(
  state: QuizshowEngineState,
  playerId: string,
): QuizshowMyReveal | null {
  if (!REVEAL_PHASES.includes(state.cursor.phase)) return null;
  const play = shownQuestion(state)?.play ?? null;
  const player = activePlayerOf(state, playerId);
  if (play === null || player === null) return null;
  if (!play.eligiblePlayerIds.includes(playerId)) return null;
  const stored = play.myReveals[playerId];
  const answer = answerOf(play, playerId);
  const team =
    state.playMode === "teams" && player.teamId !== null
      ? state.teams.find((candidate) => candidate.teamId === player.teamId)
      : undefined;
  return {
    phaseId: revealPhaseId(state),
    questionId: play.questionId,
    hasAnswered: answer !== undefined,
    ownAnswerId: answer?.answerId ?? null,
    isCorrect: stored?.isCorrect ?? null,
    correctPositions: stored?.correctPositions ?? null,
    pointsAwarded: play.pointsByPlayer[playerId] ?? 0,
    streakBonus: stored?.streakBonus ?? 0,
    isJokerActive: isJokerActiveFor(state, playerId, play.roundIndex),
    streak: player.streak,
    score: player.score,
    teamScore: state.playMode === "teams" ? (team?.score ?? 0) : null,
    rank: rankOf(rankedEntrants(state), entrantIdOf(state, player)),
  };
}

function scoresScopeOf(phase: QuizshowPhase): QuizshowScoresScope | null {
  if (phase === "scores") return "question";
  if (phase === "leaderboard") return "round";
  if (phase === "podium") return "final";
  return null;
}

/** The entrant's score at the previous `scores` frame; 0 when absent. */
function previousScoreOf(
  state: QuizshowEngineState,
  entrantId: string,
): number {
  const lastScoresFrame = state.lastScoresFrame;
  if (
    lastScoresFrame !== null &&
    lastScoresFrame.phaseId === state.cursor.phaseId
  ) {
    return lastScoresFrame.previousByEntrant[entrantId] ?? 0;
  }
  return state.scoresAtLastFrame[entrantId] ?? 0;
}

export function buildScores(state: QuizshowEngineState): QuizshowScores | null {
  const scope = scoresScopeOf(state.cursor.phase);
  if (scope === null) return null;
  const ranked = rankedEntrants(state);
  return {
    phaseId: state.cursor.phaseId,
    scope,
    entries: ranked
      .slice(0, QUIZSHOW_LIMITS.leaderboardTopCount)
      .map((entry): QuizshowLeaderboardEntry => ({
        rank: entry.rank,
        kind: entry.kind,
        entrantId: entry.entrantId,
        name: entry.name,
        colorKey: entry.colorKey,
        score: entry.score,
        previousScore: previousScoreOf(state, entry.entrantId),
      })),
    entrantCount: ranked.length,
  };
}

export function buildMyScores(
  state: QuizshowEngineState,
  playerId: string,
): QuizshowMyScores | null {
  if (scoresScopeOf(state.cursor.phase) === null) return null;
  const player = activePlayerOf(state, playerId);
  if (player === null) return null;
  const ranked = rankedEntrants(state);
  const entrantId = entrantIdOf(state, player);
  const entry = ranked.find((ranking) => ranking.entrantId === entrantId);
  return {
    phaseId: state.cursor.phaseId,
    rank: rankOf(ranked, entrantId),
    score: entry?.score ?? 0,
    previousScore: entrantId === null ? 0 : previousScoreOf(state, entrantId),
    ownScore: player.score,
  };
}

/** The stored podium with players removed since left out. */
function podiumEntries(state: QuizshowEngineState): QuizshowPodiumEntry[] {
  return (state.podium ?? [])
    .filter(
      (entry) =>
        entry.kind === "team" ||
        activePlayerOf(state, entry.entrantId) !== null,
    )
    .map((entry) => ({ ...entry }));
}

export function buildPodiumFrame(
  state: QuizshowEngineState,
): { phaseId: string; entries: QuizshowPodiumEntry[] } | null {
  if (state.cursor.phase !== "podium") return null;
  return { phaseId: state.cursor.phaseId, entries: podiumEntries(state) };
}

export function buildSessionEnd(
  state: QuizshowEngineState,
): QuizshowSessionEnd {
  const isFinished = state.cursor.status === "finished";
  return {
    sessionId: state.sessionId,
    status: isFinished ? "finished" : "abandoned",
    podium: isFinished ? podiumEntries(state) : [],
    nextEvent: null,
    hasResults: isFinished,
  };
}

function stateBase(state: QuizshowEngineState): QuizshowStateBase {
  const { phase, status } = state.cursor;
  const isPodiumShown =
    phase === "podium" || (phase === "ended" && status === "finished");
  return {
    sessionId: state.sessionId,
    kind: state.gameId !== null ? "game" : "event",
    eventSlug: state.eventSlug,
    eventTitle: state.eventTitle,
    gameId: state.gameId,
    isAdultsOnly: state.isAdultsOnly,
    joinCode: state.joinCode,
    quizTitle: state.quiz.title,
    languages: state.quiz.languages,
    screenLanguage: state.quiz.screenLanguage,
    playMode: state.playMode,
    maxTeamSize: state.maxTeamSize,
    isReviewOn: state.isReviewOn,
    isScreenMuted: state.isScreenMuted,
    cursor: { ...state.cursor },
    rounds: state.quiz.rounds.map((round, roundIndex) =>
      toRoundCard(round, roundIndex),
    ),
    round: currentRoundCard(state),
    reveal: buildReveal(state),
    scores: buildScores(state),
    podium: isPodiumShown ? podiumEntries(state) : null,
    nextEvent: null,
  };
}

function answerCountOf(
  state: QuizshowEngineState,
): { count: number; total: number } | null {
  const answerCount = buildAnswerCount(state);
  return answerCount === null
    ? null
    : { count: answerCount.count, total: answerCount.total };
}

function playerSessionState(
  state: QuizshowEngineState,
  playerId: string | null,
  suggestedScreenName: string,
): QuizshowPlayerState {
  const player = activePlayerOf(state, playerId);
  const shown = shownQuestion(state);
  const play = shown?.play ?? null;
  const answer =
    player === null || play === null
      ? undefined
      : answerOf(play, player.playerId);
  const vote =
    player === null || play === null
      ? undefined
      : play.votes.find(
          (candidate) => candidate.voterPlayerId === player.playerId,
        );
  return {
    ...stateBase(state),
    role: "player",
    lobby: buildLobby(state),
    question: publicQuestionView(state),
    voteOptions: buildVoteOptions(state, player?.playerId ?? null),
    me: player === null ? null : toMe(state, player.playerId),
    suggestedScreenName,
    isEligibleForQuestion:
      player !== null && (shown === null || isEligible(state, player.playerId)),
    myAnswer:
      answer === undefined
        ? null
        : {
            questionId: answer.questionId,
            phaseId: answer.phaseId,
            payload: answer.payload,
            receivedAt: answer.receivedAt,
          },
    myVote:
      vote === undefined || play === null
        ? null
        : { questionId: play.questionId, optionId: vote.optionId },
    myReveal: player === null ? null : buildMyReveal(state, player.playerId),
    myScores: player === null ? null : buildMyScores(state, player.playerId),
  };
}

function hostSessionState(state: QuizshowEngineState): QuizshowHostState {
  return {
    ...stateBase(state),
    role: "host",
    lobby: buildHostLobby(state),
    question: hostQuestionView(state),
    answerCount: answerCountOf(state),
    voteOptions: buildHostVoteOptions(state),
    reviewList: buildReviewList(state),
  };
}

/** The player id of a member, removed players included; null before `lobby:join`. */
export function playerIdOf(
  state: QuizshowEngineState,
  memberKey: string,
): string | null {
  return (
    state.players.find((player) => player.memberKey === memberKey)?.playerId ??
    null
  );
}

/** `session:state` for one viewer, filtered by role; every role carries `isScreenMuted`. */
export function engineSessionStateFor(
  state: QuizshowEngineState,
  viewer:
    | { role: "screen" }
    | { role: "host" }
    | { role: "player"; memberKey: string; suggestedScreenName: string },
): QuizshowSessionState {
  if (viewer.role === "screen") {
    return {
      ...stateBase(state),
      role: "screen",
      lobby: buildLobby(state),
      question: publicQuestionView(state),
      answerCount: answerCountOf(state),
      voteOptions: buildVoteOptions(state, null),
    };
  }
  if (viewer.role === "host") return hostSessionState(state);
  return playerSessionState(
    state,
    playerIdOf(state, viewer.memberKey),
    viewer.suggestedScreenName,
  );
}

/** The frames one viewer receives, in emission order. */
export function framesForViewer(
  frames: readonly QuizshowEngineFrame[],
  viewer: { role: QuizshowAttachRole; playerId: string | null },
): QuizshowServerFrame[] {
  return frames
    .filter(({ audience }) => {
      if (viewer.role === "screen") return audience === "screen";
      if (viewer.role === "host") return audience === "hosts";
      if (audience === "players") return true;
      return (
        typeof audience === "object" &&
        viewer.playerId !== null &&
        audience.playerId === viewer.playerId
      );
    })
    .map(({ frame }) => frame);
}

const EVERY_AUDIENCE = ["screen", "players", "hosts"] as const;

function toEveryAudience(frame: QuizshowServerFrame): QuizshowEngineFrame[] {
  return EVERY_AUDIENCE.map((audience) => ({ audience, frame }));
}

function revealFrames(
  state: QuizshowEngineState,
  playerIds: readonly string[],
): QuizshowEngineFrame[] {
  const reveal = buildReveal(state);
  const frames =
    reveal === null
      ? []
      : toEveryAudience({ event: "reveal", payload: reveal });
  for (const playerId of playerIds) {
    const myReveal = buildMyReveal(state, playerId);
    if (myReveal !== null) {
      frames.push({
        audience: { playerId },
        frame: { event: "reveal:mine", payload: myReveal },
      });
    }
  }
  return frames;
}

function voteOptionFrames(state: QuizshowEngineState): QuizshowEngineFrame[] {
  const screenOptions = buildVoteOptions(state, null);
  const hostOptions = buildHostVoteOptions(state);
  if (screenOptions === null || hostOptions === null) return [];
  const frames: QuizshowEngineFrame[] = [
    {
      audience: "screen",
      frame: { event: "vote:options", payload: screenOptions },
    },
  ];
  for (const player of activePlayers(state)) {
    const ownOptions = buildVoteOptions(state, player.playerId);
    if (ownOptions !== null) {
      frames.push({
        audience: { playerId: player.playerId },
        frame: { event: "vote:options", payload: ownOptions },
      });
    }
  }
  frames.push({
    audience: "hosts",
    frame: { event: "vote:options", payload: hostOptions },
  });
  return frames;
}

function scoresFrames(state: QuizshowEngineState): QuizshowEngineFrame[] {
  const scores = buildScores(state);
  if (scores === null) return [];
  const frames = toEveryAudience({ event: "scores", payload: scores });
  for (const player of activePlayers(state)) {
    const myScores = buildMyScores(state, player.playerId);
    if (myScores !== null) {
      frames.push({
        audience: { playerId: player.playerId },
        frame: { event: "scores:mine", payload: myScores },
      });
    }
  }
  return frames;
}

/** The frames one effect sends, read from the state at the end of the step. */
function framesForEffect(
  state: QuizshowEngineState,
  effect: QuizshowEngineEffect,
): QuizshowEngineFrame[] {
  switch (effect.kind) {
    case "phase_changed":
      return [
        {
          audience: "screen",
          frame: {
            event: "phase:change",
            payload: buildPhaseChange(state, "public"),
          },
        },
        {
          audience: "players",
          frame: {
            event: "phase:change",
            payload: buildPhaseChange(state, "public"),
          },
        },
        {
          audience: "hosts",
          frame: {
            event: "phase:change",
            payload: buildPhaseChange(state, "host"),
          },
        },
      ];
    case "lobby_changed":
      return [
        {
          audience: "screen",
          frame: { event: "lobby:update", payload: buildLobby(state) },
        },
        {
          audience: "players",
          frame: { event: "lobby:update", payload: buildLobby(state) },
        },
        {
          audience: "hosts",
          frame: { event: "lobby:update", payload: buildHostLobby(state) },
        },
      ];
    case "me_changed":
      return effect.playerIds.flatMap((playerId) =>
        activePlayerOf(state, playerId) === null
          ? []
          : [
              {
                audience: { playerId },
                frame: {
                  event: "me:update",
                  payload: { me: toMe(state, playerId) },
                },
              },
            ],
      );
    case "answer_accepted":
      return [
        {
          audience: { playerId: effect.playerId },
          frame: { event: "answer:ack", payload: effect.answer },
        },
      ];
    case "answer_count_changed": {
      const answerCount = buildAnswerCount(state);
      if (answerCount === null) return [];
      return [
        {
          audience: "screen",
          frame: { event: "answer:count", payload: answerCount },
        },
        {
          audience: "hosts",
          frame: { event: "answer:count", payload: answerCount },
        },
      ];
    }
    case "review_list_changed": {
      const reviewList = buildReviewList(state);
      return reviewList === null
        ? []
        : [
            {
              audience: "hosts",
              frame: { event: "review:list", payload: reviewList },
            },
          ];
    }
    case "vote_options_shown":
      return voteOptionFrames(state);
    case "revealed":
      return revealFrames(
        state,
        eligiblePlayersNow(state).map((player) => player.playerId),
      );
    case "reveal_updated":
      return revealFrames(state, effect.playerIds);
    case "answer_hidden": {
      const frame: QuizshowServerFrame = {
        event: "answer:hidden",
        payload: effect.hidden,
      };
      return effect.isForEveryAudience
        ? toEveryAudience(frame)
        : [{ audience: "hosts", frame }];
    }
    case "scores_shown":
      return scoresFrames(state);
    case "podium_shown": {
      const podium = buildPodiumFrame(state);
      return podium === null
        ? []
        : toEveryAudience({ event: "podium", payload: podium });
    }
    case "player_removed":
      return [
        {
          audience: { playerId: effect.playerId },
          frame: {
            event: "player:removed",
            payload: { sessionId: state.sessionId },
          },
        },
      ];
    case "session_ended":
      return toEveryAudience({
        event: "session:end",
        payload: buildSessionEnd(state),
      });
    case "screen_muted": {
      const frame: QuizshowServerFrame = {
        event: "screen:muted",
        payload: { isMuted: state.isScreenMuted },
      };
      return [
        { audience: "screen", frame },
        { audience: "hosts", frame },
      ];
    }
    case "session_state": {
      const player = findPlayer(state, effect.playerId);
      const payload = playerSessionState(
        state,
        effect.playerId,
        player?.screenName ?? "",
      );
      return [
        {
          audience: { playerId: effect.playerId },
          frame: { event: "session:state", payload },
        },
      ];
    }
  }
}

/** Effects that read the whole state send their frames once per step. */
const ONCE_PER_STEP_KINDS: ReadonlySet<QuizshowEngineEffect["kind"]> = new Set([
  "phase_changed",
  "lobby_changed",
  "answer_count_changed",
  "review_list_changed",
  "vote_options_shown",
  "revealed",
  "scores_shown",
  "podium_shown",
  "session_ended",
  "screen_muted",
]);

/** The step's frames: `phase:change` first, then every other effect's frames in order, each state-wide frame once. */
export function engineFramesFor(
  state: QuizshowEngineState,
  effects: readonly QuizshowEngineEffect[],
): QuizshowEngineFrame[] {
  const orderedEffects = [
    ...effects.filter((effect) => effect.kind === "phase_changed"),
    ...effects.filter((effect) => effect.kind !== "phase_changed"),
  ];
  const sentKinds = new Set<QuizshowEngineEffect["kind"]>();
  const frames: QuizshowEngineFrame[] = [];
  for (const effect of orderedEffects) {
    if (ONCE_PER_STEP_KINDS.has(effect.kind)) {
      if (sentKinds.has(effect.kind)) continue;
      sentKinds.add(effect.kind);
    }
    frames.push(...framesForEffect(state, effect));
  }
  return frames;
}
