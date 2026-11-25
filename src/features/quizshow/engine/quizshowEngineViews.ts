/**
 * Pulse Live demo engine views: the contract frame shapes and `session:state`
 * per role, built from the engine state, and the frames each effect sends to
 * each audience. Ports of the backend's quizshow-frames.ts. In the demo
 * `avatarUrl` and `nextEvent` are always null and the paired device list is
 * always empty.
 *
 * Privacy boundary: the screen and players see no answer key, truth, reveal
 * note or vote count before `reveal`. During a host-paced podium the screen
 * and players see only the places revealed so far (contract 6.7).
 */
import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_REACTION_IDS,
  type QuizshowAnswerCountFrame,
  type QuizshowAnswerKeyView,
  type QuizshowAttachRole,
  type QuizshowDistribution,
  type QuizshowGivingLink,
  type QuizshowHostLobby,
  type QuizshowHostPlayer,
  type QuizshowHostQuestionView,
  type QuizshowHostState,
  type QuizshowHostTeam,
  type QuizshowHostTypedAnswers,
  type QuizshowHostVoteOptions,
  type QuizshowLeaderboardEntry,
  type QuizshowLobby,
  type QuizshowLobbyPlayer,
  type QuizshowLobbyTeam,
  type QuizshowMyReveal,
  type QuizshowMyScores,
  type QuizshowOption,
  type QuizshowPhase,
  type QuizshowPhaseChangeFrame,
  type QuizshowPlayMode,
  type QuizshowPlayerLobby,
  type QuizshowPlayerState,
  type QuizshowPodiumEntry,
  type QuizshowPodiumFrame,
  type QuizshowQuestion,
  type QuizshowQuestionView,
  type QuizshowReactionsFrame,
  type QuizshowReveal,
  type QuizshowReviewList,
  type QuizshowRound,
  type QuizshowRoundCard,
  type QuizshowScores,
  type QuizshowScoresScope,
  type QuizshowSessionEnd,
  type QuizshowSessionState,
  type QuizshowStateBase,
  type QuizshowText,
  type QuizshowTypedAnswerGroup,
  type QuizshowVoteOptions,
} from "../../../shared/contracts/quizshow";
import type { QuizshowServerFrame } from "../realtime/quizshowFrames";
import {
  isQuizRoundKind,
  isWheelRoundKind,
  wheelBonusViewForCursor,
  wheelViewForCursor,
} from "../quizshowWheel";
import { closestNumberOutcomes, normaliseAnswerText } from "./quizshowScoring";
import {
  activePlayerOf,
  activePlayers,
  eligiblePlayersNow,
  entrantIdOf,
  findPlayer,
  isEligible,
  isJokerActiveFor,
  readPhaseMsFor,
  roundAt,
  shownOptionsOf,
  toMe,
} from "./quizshowEngineSetup";
import { podiumStepsOf } from "./quizshowEngineTransitions";
import { answerOf, effectiveAnswerKey } from "./quizshowEngineScoringStep";
import {
  buildRankIndex,
  rankOf,
  type QuizshowRankIndex,
} from "./quizshowEngineRanks";
import type {
  QuizshowEngineAnswer,
  QuizshowEngineEffect,
  QuizshowEngineFrame,
  QuizshowEnginePlayer,
  QuizshowEngineQuestionPlay,
  QuizshowEngineState,
  QuizshowEngineVoteOption,
} from "./quizshowEngineTypes";

/** Contract 7.1 names the views as the home of the rank index; it lives in its own module so phases can share it. */
export { buildRankIndex } from "./quizshowEngineRanks";

/** Who a withholding frame is for: the screen and players see revealed podium places only, hosts see every place. */
export type QuizshowFrameAudience = "public" | "hosts";

/** The most distinct wrong spellings `typed:answers` lists (contract 2.6). */
const TYPED_ANSWER_GROUPS_MAX = 30;

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

const ROUNDLESS_PHASES: readonly QuizshowPhase[] = [
  "lobby",
  "wheel",
  "podium",
  "ended",
];

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

/** Solo play has no team to talk with, so its cards carry `talkSeconds` 0 (contract 6.20). The studio preview leaves `playMode` out and sees the authored value. */
export function toRoundCard(
  round: QuizshowRound,
  roundIndex: number,
  playMode: QuizshowPlayMode = "teams",
): QuizshowRoundCard {
  if (isWheelRoundKind(round.kind)) {
    // A wheel is a plain card: zero questions, the joker off and the label none.
    return {
      roundIndex,
      kind: "wheel",
      title: round.title,
      contentLabel: "none",
      questionCount: 0,
      isJokerAllowed: false,
      isSpeedBonusOn: round.settings.isSpeedBonusOn,
      isWarmUp: false,
      talkSeconds: 0,
    };
  }
  return {
    roundIndex,
    kind: round.kind,
    title: round.title,
    contentLabel: round.contentLabel,
    questionCount: round.questions.length,
    isJokerAllowed: round.settings.isJokerAllowed,
    isSpeedBonusOn: round.settings.isSpeedBonusOn,
    isWarmUp: round.settings.isWarmUp,
    talkSeconds: playMode === "solo" ? 0 : round.settings.talkSeconds,
  };
}

/** The `read` length the question got: the play's when it opened, else the contract 6.12 formula; 0 in a party round, which opens on `write`. */
function readMsOf(
  state: QuizshowEngineState,
  shown: QuizshowShownQuestion,
  shownOptions: readonly QuizshowOption[] | null,
): number {
  if (!isQuizRoundKind(shown.round.kind)) return 0;
  return (
    shown.play?.readMs ??
    readPhaseMsFor(shown.question, state.quiz.languages, shownOptions)
  );
}

/** Screen and players: built field by field so no answer key or reveal note can ride along. */
function toQuestionView(
  state: QuizshowEngineState,
  shown: QuizshowShownQuestion,
): QuizshowQuestionView {
  const { round, question } = shown;
  const options = shownOptionsOf(state, question);
  return {
    questionId: question.id,
    roundIndex: shown.roundIndex,
    questionIndex: shown.questionIndex,
    roundKind: round.kind,
    type: question.type,
    prompt: { ...question.prompt },
    mediaUrl: question.mediaUrl,
    mediaAlt: { ...question.mediaAlt },
    mediaReveal: question.mediaReveal,
    numberUnit: { ...question.numberUnit },
    points: question.points,
    timeLimitSeconds: isQuizRoundKind(round.kind)
      ? (question.timeLimitSeconds ?? round.settings.timeLimitSeconds)
      : round.settings.writeSeconds,
    readMs: readMsOf(state, shown, options),
    options,
  };
}

export function toAnswerKeyView(
  round: Pick<QuizshowRound, "kind">,
  question: QuizshowQuestion,
): QuizshowAnswerKeyView | null {
  if (round.kind === "caption_this" || round.kind === "drag_name") return null;
  switch (question.type) {
    case "multiple_choice":
      return question.answer === null
        ? null
        : {
            type: "multiple_choice",
            correctIndexes: [...question.answer.correctIndexes],
          };
    case "true_false":
      return question.answer === null
        ? null
        : { type: "true_false", isTrue: question.answer.isTrue };
    case "type_answer":
      return question.answer === null
        ? null
        : {
            type: "type_answer",
            text: { ...question.answer.text },
            acceptedAnswers: [...question.acceptedAnswers],
          };
    case "order":
      return question.answer === null
        ? null
        : { type: "order", orderedIds: [...question.answer.orderedIds] };
    case "closest_number":
      return question.answer === null
        ? null
        : {
            type: "closest_number",
            value: question.answer.value,
            tolerance: { ...question.answer.tolerance },
          };
    case "prompt":
      return round.kind === "lie_detector" && question.answer !== null
        ? { type: "lie_detector", truth: { ...question.answer.truth } }
        : null;
    case "poll":
      // A poll has no right answer, so there is no key to show.
      return null;
  }
}

/** The key the night judges by: a host correction when one was made (contract 6.4 rule 8). */
function shownAnswerKey(
  state: QuizshowEngineState,
  shown: QuizshowShownQuestion,
): QuizshowAnswerKeyView | null {
  return shown.play === null
    ? toAnswerKeyView(shown.round, shown.question)
    : effectiveAnswerKey(state, shown.play);
}

function publicQuestionView(
  state: QuizshowEngineState,
): QuizshowQuestionView | null {
  const shown = shownQuestion(state);
  return shown === null ? null : toQuestionView(state, shown);
}

/** Hosts see the effective key and the reveal note from `read` on; the public view never carries either. */
function hostQuestionView(
  state: QuizshowEngineState,
): QuizshowHostQuestionView | null {
  const shown = shownQuestion(state);
  if (shown === null) return null;
  return {
    ...toQuestionView(state, shown),
    answerKey: shownAnswerKey(state, shown),
    revealNote: { ...shown.question.revealNote },
  };
}

function currentRoundCard(
  state: QuizshowEngineState,
): QuizshowRoundCard | null {
  const { phase, roundIndex } = state.cursor;
  if (ROUNDLESS_PHASES.includes(phase) || roundIndex === null) return null;
  const round = roundAt(state, roundIndex);
  return round === null ? null : toRoundCard(round, roundIndex, state.playMode);
}

function toLobbyPlayer(player: QuizshowEnginePlayer): QuizshowLobbyPlayer {
  return {
    playerId: player.playerId,
    screenName: player.screenName,
    teamId: player.teamId,
    avatarUrl: null,
  };
}

/** Members per team in one pass over the active players (contract 7.1), so a 24 team lobby costs one walk. */
function memberCountsByTeam(
  players: readonly QuizshowEnginePlayer[],
): Map<string, number> {
  const memberCounts = new Map<string, number>();
  for (const player of players) {
    if (player.teamId === null) continue;
    memberCounts.set(player.teamId, (memberCounts.get(player.teamId) ?? 0) + 1);
  }
  return memberCounts;
}

/** Teams in created order with their member counts; [] in solo play. */
function lobbyTeams(
  state: QuizshowEngineState,
  players: readonly QuizshowEnginePlayer[],
): QuizshowLobbyTeam[] {
  if (state.playMode === "solo") return [];
  const memberCounts = memberCountsByTeam(players);
  return state.teams.map((team) => ({
    teamId: team.teamId,
    name: team.name,
    colorKey: team.colorKey,
    memberCount: memberCounts.get(team.teamId) ?? 0,
    isHostMade: team.isHostMade,
  }));
}

/** `lobby:update` for the screen: the roster. */
export function buildLobby(state: QuizshowEngineState): QuizshowLobby {
  const players = activePlayers(state);
  return {
    players: players.map(toLobbyPlayer),
    teams: lobbyTeams(state, players),
    playerCount: players.length,
  };
}

/** `lobby:update` and the lobby of `session:state` for the players room (W2): team cards and the head count only. */
export function buildPlayerLobby(
  state: QuizshowEngineState,
): QuizshowPlayerLobby {
  const players = activePlayers(state);
  return { teams: lobbyTeams(state, players), playerCount: players.length };
}

/** `lobby:update` for the hosts room: scores, streaks, jokers, extra time and connection state. */
export function buildHostLobby(state: QuizshowEngineState): QuizshowHostLobby {
  const players = activePlayers(state);
  return {
    players: players.map((player): QuizshowHostPlayer => ({
      ...toLobbyPlayer(player),
      isCohostPlayer: player.isCohostPlayer,
      hasExtraTime: player.hasExtraTime,
      hasUsedJoker: toMe(state, player.playerId).hasUsedJoker,
      score: player.score,
      streak: player.streak,
      // The browser has no sockets: no disconnect time reads as connected.
      isConnected: player.disconnectedAt === null,
      disconnectedAt: player.disconnectedAt,
      joinedAt: player.joinedAt,
    })),
    teams: lobbyTeams(state, players).map((team): QuizshowHostTeam => {
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

/** `session:flags` to every role room (contract 6.15, 6.16). */
export function buildSessionFlags(state: QuizshowEngineState): {
  isJoinLocked: boolean;
  isAutoAdvanceOn: boolean;
} {
  return {
    isJoinLocked: state.isJoinLocked,
    isAutoAdvanceOn: state.isAutoAdvanceOn,
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
    wheel: wheelViewForCursor(
      state.quiz.rounds,
      state.wheelProgress,
      state.cursor,
    ),
    wheelBonus: wheelBonusViewForCursor(state.wheelProgress, state.cursor),
  };
}

/** Answers in `read`, `open` and `write`, submissions in `review`, votes in `vote`, out of the eligible players still in. */
export function buildAnswerCount(
  state: QuizshowEngineState,
): QuizshowAnswerCountFrame | null {
  if (!COUNTED_PHASES.includes(state.cursor.phase)) return null;
  const play = shownQuestion(state)?.play ?? null;
  if (play === null) return null;
  const eligiblePlayers = eligiblePlayersNow(state);
  const isCountingVotes = state.cursor.phase === "vote";
  const voterIds = new Set(play.votes.map((vote) => vote.voterPlayerId));
  const answeredIds = new Set(play.answers.map((answer) => answer.playerId));
  const count = eligiblePlayers.filter((player) =>
    isCountingVotes
      ? voterIds.has(player.playerId)
      : answeredIds.has(player.playerId),
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

/** One map of the play's answers by id (W1): a vote round reads it once per option. */
function answersByIdOf(
  play: QuizshowEngineQuestionPlay,
): Map<string, QuizshowEngineAnswer> {
  return new Map(play.answers.map((answer) => [answer.answerId, answer]));
}

function activePlayerIdsOf(state: QuizshowEngineState): Set<string> {
  return new Set(activePlayers(state).map((player) => player.playerId));
}

/**
 * The vote options a voter may see: the truth always, a submission while it
 * is not hidden and its author is still in the session. A `vote:options`
 * fan-out computes them once and passes them to every `buildVoteOptions`
 * call (W1), with the one `answersById` map it built for the fan-out.
 */
export function visibleVoteOptions(
  state: QuizshowEngineState,
  play: QuizshowEngineQuestionPlay,
  answersById: ReadonlyMap<string, QuizshowEngineAnswer> = answersByIdOf(play),
): QuizshowEngineVoteOption[] {
  const activePlayerIds = activePlayerIdsOf(state);
  return (play.voteOptions ?? []).filter((option) => {
    if (option.answerId === null) return true;
    const answer = answersById.get(option.answerId);
    return (
      answer !== undefined &&
      !answer.isHidden &&
      activePlayerIds.has(answer.playerId)
    );
  });
}

/** What one `vote:options` fan-out builds once and hands to every per-player call (W1). */
export interface QuizshowVoteFanOut {
  visibleOptions: readonly QuizshowEngineVoteOption[];
  answersById: ReadonlyMap<string, QuizshowEngineAnswer>;
}

function votingPlay(
  state: QuizshowEngineState,
): QuizshowEngineQuestionPlay | null {
  if (state.cursor.phase !== "vote") return null;
  const play = shownQuestion(state)?.play ?? null;
  return play !== null && play.voteOptions !== null ? play : null;
}

/** The author of a submission option; null on the truth. */
function optionAuthorId(
  answersById: ReadonlyMap<string, QuizshowEngineAnswer>,
  option: QuizshowEngineVoteOption,
): string | null {
  if (option.answerId === null) return null;
  return answersById.get(option.answerId)?.playerId ?? null;
}

/**
 * `vote:options` with no author and no truth flag; `ownOptionId` is the
 * receiving player's own answer. `fanOut` holds the visible options and the
 * answers-by-id map built once for the whole fan-out; without it this call
 * builds its own.
 */
export function buildVoteOptions(
  state: QuizshowEngineState,
  forPlayerId: string | null,
  fanOut?: QuizshowVoteFanOut,
): QuizshowVoteOptions | null {
  const play = votingPlay(state);
  if (play === null) return null;
  const answersById = fanOut?.answersById ?? answersByIdOf(play);
  const options =
    fanOut?.visibleOptions ?? visibleVoteOptions(state, play, answersById);
  const ownOption =
    forPlayerId === null
      ? undefined
      : options.find(
          (option) => optionAuthorId(answersById, option) === forPlayerId,
        );
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
  answersById: ReadonlyMap<string, QuizshowEngineAnswer>,
  option: QuizshowEngineVoteOption,
): string | null {
  if (option.isTruth) return null;
  const authorId = optionAuthorId(answersById, option);
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
  const answersById = answersByIdOf(play);
  return {
    phaseId: state.cursor.phaseId,
    questionId: play.questionId,
    options: visibleVoteOptions(state, play, answersById).map((option) => ({
      optionId: option.optionId,
      text: option.text,
      answerId: option.answerId,
      authorName: authorNameOf(state, answersById, option),
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
  answerKey: QuizshowAnswerKeyView | null,
  answer: QuizshowEngineAnswer,
): number {
  if (answerKey?.type !== "order" || answer.payload.type !== "order") return 0;
  const submittedIds = answer.payload.orderedIds;
  return answerKey.orderedIds.filter(
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

/** Multiple choice and poll: picks per shown option. Which options are right rides in `correct`, null on a poll. */
function optionsDistribution(
  state: QuizshowEngineState,
  question: QuizshowQuestion,
  answers: readonly QuizshowEngineAnswer[],
): QuizshowDistribution {
  const shownOptions = shownOptionsOf(state, question) ?? question.options;
  const counts = shownOptions.map(() => 0);
  for (const answer of answers) {
    if (
      answer.payload.type !== "multiple_choice" &&
      answer.payload.type !== "poll"
    ) {
      continue;
    }
    const optionIndex = answer.payload.optionIndex;
    const count = counts[optionIndex];
    if (count !== undefined) counts[optionIndex] = count + 1;
  }
  return { kind: "options", counts };
}

function trueFalseDistribution(
  answers: readonly QuizshowEngineAnswer[],
): QuizshowDistribution {
  let trueCount = 0;
  let falseCount = 0;
  for (const answer of answers) {
    if (answer.payload.type !== "true_false") continue;
    if (answer.payload.isTrue) trueCount += 1;
    else falseCount += 1;
  }
  return { kind: "true_false", trueCount, falseCount };
}

function typedDistribution(
  play: QuizshowEngineQuestionPlay,
  answers: readonly QuizshowEngineAnswer[],
): QuizshowDistribution {
  const correctCount = answers.filter(
    (answer) => play.myReveals[answer.playerId]?.isCorrect === true,
  ).length;
  return {
    kind: "typed",
    correctCount,
    incorrectCount: answers.length - correctCount,
  };
}

function orderDistribution(
  answerKey: QuizshowAnswerKeyView | null,
  answers: readonly QuizshowEngineAnswer[],
): QuizshowDistribution {
  const itemCount =
    answerKey?.type === "order" ? answerKey.orderedIds.length : 0;
  let exactCount = 0;
  let partialCount = 0;
  let noneCount = 0;
  for (const answer of answers) {
    const correctPositions = correctPositionsOf(answerKey, answer);
    if (itemCount > 0 && correctPositions === itemCount) exactCount += 1;
    else if (correctPositions > 0) partialCount += 1;
    else noneCount += 1;
  }
  return { kind: "order", exactCount, partialCount, noneCount };
}

/** The closest players' names in joined order, the first one's value, and how many others landed inside the question's tolerance band (contract 6.1). */
function closestDistribution(
  answerKey: QuizshowAnswerKeyView | null,
  answers: readonly QuizshowEngineAnswer[],
  eligiblePlayers: readonly QuizshowEnginePlayer[],
): QuizshowDistribution {
  const submittedValues = answers.flatMap((answer) =>
    answer.payload.type === "closest_number"
      ? [{ playerId: answer.playerId, value: answer.payload.value }]
      : [],
  );
  const outcomes =
    answerKey?.type === "closest_number"
      ? closestNumberOutcomes(
          answerKey.value,
          answerKey.tolerance,
          submittedValues,
        )
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
function revealOptions(
  state: QuizshowEngineState,
  play: QuizshowEngineQuestionPlay,
  answersById: ReadonlyMap<string, QuizshowEngineAnswer>,
): QuizshowEngineVoteOption[] {
  if (play.voteOptions !== null) {
    return visibleVoteOptions(state, play, answersById);
  }
  const activePlayerIds = activePlayerIdsOf(state);
  return [...play.answers].sort(byReceivedAt).flatMap((answer) => {
    const text = partyTextOf(answer);
    const isVisible = !answer.isHidden && activePlayerIds.has(answer.playerId);
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
}

function votesDistribution(
  state: QuizshowEngineState,
  play: QuizshowEngineQuestionPlay,
): QuizshowDistribution {
  const answersById = answersByIdOf(play);
  const entries = revealOptions(state, play, answersById).map((option) => ({
    optionId: option.optionId,
    answerId: option.answerId,
    text: option.text,
    authorName: authorNameOf(state, answersById, option),
    isTruth: option.isTruth,
    voteCount: play.votes.filter((vote) => vote.optionId === option.optionId)
      .length,
    authorPoints:
      option.answerId === null
        ? 0
        : (answersById.get(option.answerId)?.pointsAwarded ?? 0),
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
  shown: QuizshowShownQuestion,
  play: QuizshowEngineQuestionPlay,
  eligiblePlayers: readonly QuizshowEnginePlayer[],
): QuizshowDistribution {
  const answers = eligibleAnswersOf(play, eligiblePlayers);
  const question = shown.question;
  switch (question.type) {
    case "multiple_choice":
    case "poll":
      return optionsDistribution(state, question, answers);
    case "true_false":
      return trueFalseDistribution(answers);
    case "type_answer":
      return typedDistribution(play, answers);
    case "order":
      return orderDistribution(shownAnswerKey(state, shown), answers);
    case "closest_number":
      return closestDistribution(
        shownAnswerKey(state, shown),
        answers,
        eligiblePlayers,
      );
    case "prompt":
      return votesDistribution(state, play);
  }
}

/** The question's reveal note while either language holds text; it rides `reveal` only, so the public never sees it before then. */
function revealNoteOf(question: QuizshowQuestion): QuizshowText | null {
  const note = question.revealNote;
  return note.en === "" && note.pt === "" ? null : { ...note };
}

/**
 * `reveal` in `reveal` and `scores`: the correct answer (a host correction
 * when one was made), the distribution with authors named by screen name, the
 * reveal note and whether a host corrected the question.
 */
export function buildReveal(state: QuizshowEngineState): QuizshowReveal | null {
  if (!REVEAL_PHASES.includes(state.cursor.phase)) return null;
  const shown = shownQuestion(state);
  const play = shown?.play ?? null;
  if (shown === null || play === null) return null;
  const eligiblePlayers = eligiblePlayersNow(state);
  return {
    phaseId: revealPhaseId(state),
    questionId: play.questionId,
    correct: shownAnswerKey(state, shown),
    answeredCount: eligibleAnswersOf(play, eligiblePlayers).length,
    eligibleCount: eligiblePlayers.length,
    distribution: buildDistribution(state, shown, play, eligiblePlayers),
    note: revealNoteOf(shown.question),
    wasCorrected: play.wasCorrected,
  };
}

/**
 * `typed:answers` for hosts in `reveal` and `scores` of a type_answer
 * question (contract 6.4 rule 9): the eligible answers judged wrong, grouped
 * by the text the accept command compares, each with its earliest spelling,
 * most written first, at most 30 groups. Answers whose text normalises to ''
 * stay out of every group.
 */
export function buildTypedAnswers(
  state: QuizshowEngineState,
): QuizshowHostTypedAnswers | null {
  if (!REVEAL_PHASES.includes(state.cursor.phase)) return null;
  const shown = shownQuestion(state);
  const play = shown?.play ?? null;
  if (shown === null || play === null) return null;
  if (shown.question.type !== "type_answer") return null;
  const wrongAnswers = eligibleAnswersOf(play, eligiblePlayersNow(state))
    .filter((answer) => play.myReveals[answer.playerId]?.isCorrect === false)
    .sort(byReceivedAt);
  const groupsByText = new Map<string, QuizshowTypedAnswerGroup>();
  for (const answer of wrongAnswers) {
    if (answer.payload.type !== "type_answer") continue;
    const normalisedText = normaliseAnswerText(answer.payload.text);
    // Text that folds to nothing (punctuation or symbols alone) cannot be accepted, since the accept frame needs 1 to 80 characters.
    if (normalisedText === "") continue;
    const group = groupsByText.get(normalisedText);
    if (group === undefined) {
      groupsByText.set(normalisedText, {
        normalisedText,
        sampleText: answer.payload.text,
        count: 1,
      });
    } else {
      group.count += 1;
    }
  }
  const groups = [...groupsByText.values()]
    .sort(
      (firstGroup, secondGroup) =>
        secondGroup.count - firstGroup.count ||
        firstGroup.sampleText.localeCompare(secondGroup.sampleText, "en"),
    )
    .slice(0, TYPED_ANSWER_GROUPS_MAX);
  return {
    phaseId: revealPhaseId(state),
    questionId: play.questionId,
    groups,
  };
}

/**
 * `reveal:mine` for an eligible player still in, in `reveal` and `scores`. A
 * fan-out passes one `rankIndex` to every call (W1); without it this call
 * ranks on its own.
 */
export function buildMyReveal(
  state: QuizshowEngineState,
  playerId: string,
  rankIndex?: QuizshowRankIndex,
): QuizshowMyReveal | null {
  if (!REVEAL_PHASES.includes(state.cursor.phase)) return null;
  const shown = shownQuestion(state);
  const play = shown?.play ?? null;
  const player = activePlayerOf(state, playerId);
  if (shown === null || play === null || player === null) return null;
  if (!play.eligiblePlayerIds.includes(playerId)) return null;
  const stored = play.myReveals[playerId];
  const answer = answerOf(play, playerId);
  // Party questions and polls are never judged right or wrong (contract 6.22).
  const isUnjudgedQuestion =
    shown.question.type === "prompt" || shown.question.type === "poll";
  const team =
    state.playMode === "teams" && player.teamId !== null
      ? state.teams.find((candidate) => candidate.teamId === player.teamId)
      : undefined;
  return {
    phaseId: revealPhaseId(state),
    questionId: play.questionId,
    hasAnswered: answer !== undefined,
    ownAnswerId: answer?.answerId ?? null,
    isCorrect: isUnjudgedQuestion ? null : (stored?.isCorrect ?? false),
    correctPositions:
      shown.question.type === "order" && answer !== undefined
        ? (stored?.correctPositions ??
          correctPositionsOf(shownAnswerKey(state, shown), answer))
        : null,
    pointsAwarded: play.pointsByPlayer[playerId] ?? 0,
    streakBonus: stored?.streakBonus ?? 0,
    isJokerActive: isJokerActiveFor(state, playerId, play.roundIndex),
    streak: player.streak,
    score: player.score,
    teamScore: state.playMode === "teams" ? (team?.score ?? 0) : null,
    rank: rankOf(
      rankIndex ?? buildRankIndex(state),
      entrantIdOf(state, player),
    ),
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

/**
 * The leaderboard streak (contract 6.18): the player's own in solo play, the
 * best among a team's active members in teams play (0 with none). One pass
 * over the players per frame.
 */
function streaksByEntrant(state: QuizshowEngineState): Map<string, number> {
  const streaks = new Map<string, number>();
  for (const player of activePlayers(state)) {
    const entrantId = entrantIdOf(state, player);
    if (entrantId === null) continue;
    streaks.set(
      entrantId,
      Math.max(streaks.get(entrantId) ?? 0, player.streak),
    );
  }
  return streaks;
}

function isPodiumPlace(rank: number): rank is 1 | 2 | 3 {
  return rank === 1 || rank === 2 || rank === 3;
}

/** Places shown so far while the phase is podium; null in every other phase (nothing withheld). */
function revealedPodiumPlaces(
  state: QuizshowEngineState,
): ReadonlySet<number> | null {
  if (state.cursor.phase !== "podium") return null;
  const steps = podiumStepsOf(state);
  const revealedCount = state.cursor.podiumRevealedCount ?? steps.length;
  return new Set<number>(steps.slice(0, revealedCount));
}

/** A podium place the host has not revealed yet; `revealedPlaces` is null outside the podium phase, where nothing is withheld. */
function isWithheldRank(
  rank: number,
  revealedPlaces: ReadonlySet<number> | null,
): boolean {
  return (
    revealedPlaces !== null && isPodiumPlace(rank) && !revealedPlaces.has(rank)
  );
}

/**
 * `scores` in `scores`, `leaderboard` and `podium`: the top of the
 * competition ranking. A fan-out passes one `rankIndex` (W1). During the
 * podium the public copy takes the top 10 first, then leaves out every podium
 * place not revealed yet, while hosts get every entry (contract 6.7);
 * `entrantCount` always counts every entrant.
 */
export function buildScores(
  state: QuizshowEngineState,
  rankIndex?: QuizshowRankIndex,
  audience: QuizshowFrameAudience = "public",
): QuizshowScores | null {
  const scope = scoresScopeOf(state.cursor.phase);
  if (scope === null) return null;
  const { ranked } = rankIndex ?? buildRankIndex(state);
  const revealedPlaces =
    audience === "hosts" ? null : revealedPodiumPlaces(state);
  const streaks = streaksByEntrant(state);
  return {
    phaseId: state.cursor.phaseId,
    scope,
    entries: ranked
      .slice(0, QUIZSHOW_LIMITS.leaderboardTopCount)
      .filter((entry) => !isWithheldRank(entry.rank, revealedPlaces))
      .map((entry): QuizshowLeaderboardEntry => ({
        rank: entry.rank,
        kind: entry.kind,
        entrantId: entry.entrantId,
        name: entry.name,
        colorKey: entry.colorKey,
        score: entry.score,
        previousScore: previousScoreOf(state, entry.entrantId),
        streak: streaks.get(entry.entrantId) ?? 0,
      })),
    entrantCount: ranked.length,
  };
}

/**
 * `scores:mine`: the player's rank and score (their team's in teams play) and
 * their own total. Null while the player's entrant sits on a podium place not
 * revealed yet (contract 6.7), so no phone learns its place early.
 */
export function buildMyScores(
  state: QuizshowEngineState,
  playerId: string,
  rankIndex?: QuizshowRankIndex,
): QuizshowMyScores | null {
  if (scoresScopeOf(state.cursor.phase) === null) return null;
  const player = activePlayerOf(state, playerId);
  if (player === null) return null;
  const index = rankIndex ?? buildRankIndex(state);
  const entrantId = entrantIdOf(state, player);
  const rank = rankOf(index, entrantId);
  if (isWithheldRank(rank, revealedPodiumPlaces(state))) return null;
  return {
    phaseId: state.cursor.phaseId,
    rank,
    score: entrantScoreOf(state, player),
    previousScore: entrantId === null ? 0 : previousScoreOf(state, entrantId),
    ownScore: player.score,
  };
}

/** The score `entrantTotals` ranks the player's entrant by: their own in solo play, their team's in teams play (0 without a team). */
function entrantScoreOf(
  state: QuizshowEngineState,
  player: QuizshowEnginePlayer,
): number {
  if (state.playMode === "solo") return player.score;
  if (player.teamId === null) return 0;
  return state.teams.find((team) => team.teamId === player.teamId)?.score ?? 0;
}

/** The stored podium (players gone since left out), or one ranked from the totals. */
function podiumEntries(
  state: QuizshowEngineState,
  rankIndex?: QuizshowRankIndex,
): QuizshowPodiumEntry[] {
  if (state.podium !== null) {
    return state.podium
      .filter(
        (entry) =>
          entry.kind === "team" ||
          activePlayerOf(state, entry.entrantId) !== null,
      )
      .map((entry) => ({ ...entry }));
  }
  const { ranked } = rankIndex ?? buildRankIndex(state);
  return ranked.flatMap((entry): QuizshowPodiumEntry[] =>
    isPodiumPlace(entry.rank)
      ? [
          {
            place: entry.rank,
            kind: entry.kind,
            entrantId: entry.entrantId,
            name: entry.name,
            colorKey: entry.colorKey,
            score: entry.score,
          },
        ]
      : [],
  );
}

/** Podium entries for the audience: in the podium phase the public sees revealed places only; hosts and `ended` see every entry. */
function podiumEntriesFor(
  state: QuizshowEngineState,
  audience: QuizshowFrameAudience,
  rankIndex?: QuizshowRankIndex,
): QuizshowPodiumEntry[] {
  const entries = podiumEntries(state, rankIndex);
  const revealedPlaces =
    audience === "hosts" ? null : revealedPodiumPlaces(state);
  if (revealedPlaces === null) return entries;
  return entries.filter((entry) => revealedPlaces.has(entry.place));
}

/**
 * `podium` during the podium phase, one per audience (contract 6.7): the
 * screen and players get the places revealed so far, hosts every entry.
 * `revealedCount` falls back to every step for a podium shown without a
 * count.
 */
export function buildPodiumFrame(
  state: QuizshowEngineState,
  audience: QuizshowFrameAudience,
): QuizshowPodiumFrame | null {
  if (state.cursor.phase !== "podium") return null;
  return {
    phaseId: state.cursor.phaseId,
    entries: podiumEntriesFor(state, audience),
    revealedCount:
      state.cursor.podiumRevealedCount ?? podiumStepsOf(state).length,
  };
}

/**
 * `reactions` to the screen and hosts (contract 6.19): the window's counts
 * with zeros left out, then a new window starts. It resets
 * `reactionCounts` on the state it reads; null when the window is empty.
 */
export function buildReactionsFrame(
  state: QuizshowEngineState,
): QuizshowReactionsFrame | null {
  const frame: QuizshowReactionsFrame = { counts: {} };
  for (const reactionId of QUIZSHOW_REACTION_IDS) {
    const count = state.reactionCounts[reactionId] ?? 0;
    if (count > 0) frame.counts[reactionId] = count;
  }
  state.reactionCounts = {};
  return Object.keys(frame.counts).length === 0 ? null : frame;
}

/** The community support link, only on the `ended` state of a finished session (contract 6.27); always null in demo unless a demo event seeds one. */
function givingOf(state: QuizshowEngineState): QuizshowGivingLink | null {
  return state.cursor.phase === "ended" &&
    state.cursor.status === "finished" &&
    !state.isPractice
    ? state.giving
    : null;
}

/** `session:end` to every room; results exist only for a finished session that was not a practice (contract 6.9). */
export function buildSessionEnd(
  state: QuizshowEngineState,
): QuizshowSessionEnd {
  const isFinished = state.cursor.status === "finished";
  return {
    sessionId: state.sessionId,
    status: isFinished ? "finished" : "abandoned",
    podium: isFinished ? podiumEntries(state) : [],
    nextEvent: null,
    hasResults: isFinished && !state.isPractice,
    isPractice: state.isPractice,
    giving: givingOf(state),
  };
}

function sessionPodium(
  state: QuizshowEngineState,
  audience: QuizshowFrameAudience,
  rankIndex: QuizshowRankIndex,
): QuizshowPodiumEntry[] | null {
  if (state.cursor.phase === "podium") {
    return podiumEntriesFor(state, audience, rankIndex);
  }
  if (state.cursor.phase === "ended" && state.cursor.status === "finished") {
    return podiumEntries(state, rankIndex);
  }
  return null;
}

/** Fields every role's `session:state` shares; `scores` and `podium` follow the audience's withholding (contract 6.7). */
function stateBase(
  state: QuizshowEngineState,
  audience: QuizshowFrameAudience,
  rankIndex: QuizshowRankIndex,
): QuizshowStateBase {
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
    isPractice: state.isPractice,
    isJoinLocked: state.isJoinLocked,
    isAutoAdvanceOn: state.isAutoAdvanceOn,
    giving: givingOf(state),
    isScreenMuted: state.isScreenMuted,
    cursor: { ...state.cursor },
    rounds: state.quiz.rounds.map((round, roundIndex) =>
      toRoundCard(round, roundIndex, state.playMode),
    ),
    round: currentRoundCard(state),
    reveal: buildReveal(state),
    scores: buildScores(state, rankIndex, audience),
    podium: sessionPodium(state, audience, rankIndex),
    nextEvent: null,
    wheel: wheelViewForCursor(
      state.quiz.rounds,
      state.wheelProgress,
      state.cursor,
    ),
    wheelBonus: wheelBonusViewForCursor(state.wheelProgress, state.cursor),
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

/** One rank index serves the whole state (W1): `scores`, `podium`, `myReveal` and `myScores` all read it. */
function playerSessionState(
  state: QuizshowEngineState,
  playerId: string | null,
  suggestedScreenName: string,
): QuizshowPlayerState {
  const rankIndex = buildRankIndex(state);
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
    ...stateBase(state, "public", rankIndex),
    role: "player",
    lobby: buildPlayerLobby(state),
    answerCount: answerCountOf(state),
    question: publicQuestionView(state),
    voteOptions: buildVoteOptions(state, player?.playerId ?? null),
    me: player === null ? null : toMe(state, player.playerId),
    suggestedScreenName,
    // A question shown from the cursor alone has no play yet, so nobody is left out of it (the backend's rule).
    isEligibleForQuestion:
      player !== null &&
      (shown === null ||
        shown.play === null ||
        isEligible(state, player.playerId)),
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
    myReveal:
      player === null ? null : buildMyReveal(state, player.playerId, rankIndex),
    myScores:
      player === null ? null : buildMyScores(state, player.playerId, rankIndex),
  };
}

function hostSessionState(state: QuizshowEngineState): QuizshowHostState {
  return {
    ...stateBase(state, "hosts", buildRankIndex(state)),
    role: "host",
    lobby: buildHostLobby(state),
    question: hostQuestionView(state),
    answerCount: answerCountOf(state),
    voteOptions: buildHostVoteOptions(state),
    reviewList: buildReviewList(state),
    pairedDevices: state.pairedDevices.map((device) => ({ ...device })),
    typedAnswers: buildTypedAnswers(state),
    guestPushSentAt: state.guestPushSentAt,
  };
}

/** The player id of a member, removed and left players included; null before `lobby:join`. */
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
      ...stateBase(state, "public", buildRankIndex(state)),
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
const PUBLIC_AUDIENCES = ["screen", "players"] as const;

function toEveryAudience(frame: QuizshowServerFrame): QuizshowEngineFrame[] {
  return EVERY_AUDIENCE.map((audience) => ({ audience, frame }));
}

function toPublicAudiences(frame: QuizshowServerFrame): QuizshowEngineFrame[] {
  return PUBLIC_AUDIENCES.map((audience) => ({ audience, frame }));
}

/** `reveal` to every room, then `reveal:mine` to each listed player still eligible; one rank index serves every player (contract 7.1). */
function revealFrames(
  state: QuizshowEngineState,
  playerIds: readonly string[],
): QuizshowEngineFrame[] {
  const reveal = buildReveal(state);
  const frames =
    reveal === null
      ? []
      : toEveryAudience({ event: "reveal", payload: reveal });
  const rankIndex = buildRankIndex(state);
  for (const playerId of playerIds) {
    const myReveal = buildMyReveal(state, playerId, rankIndex);
    if (myReveal !== null) {
      frames.push({
        audience: { playerId },
        frame: { event: "reveal:mine", payload: myReveal },
      });
    }
  }
  return frames;
}

/** `typed:answers` to hosts while a type_answer question is revealed (contract 6.4 rule 6). */
function typedAnswersFrames(state: QuizshowEngineState): QuizshowEngineFrame[] {
  const typedAnswers = buildTypedAnswers(state);
  return typedAnswers === null
    ? []
    : [
        {
          audience: "hosts",
          frame: { event: "typed:answers", payload: typedAnswers },
        },
      ];
}

/** `vote:options` per room and per player; the visible options are filtered once for every player (contract 7.1). */
function voteOptionFrames(state: QuizshowEngineState): QuizshowEngineFrame[] {
  const play = votingPlay(state);
  if (play === null) return [];
  const answersById = answersByIdOf(play);
  const fanOut: QuizshowVoteFanOut = {
    visibleOptions: visibleVoteOptions(state, play, answersById),
    answersById,
  };
  const screenOptions = buildVoteOptions(state, null, fanOut);
  const hostOptions = buildHostVoteOptions(state);
  if (screenOptions === null || hostOptions === null) return [];
  const frames: QuizshowEngineFrame[] = [
    {
      audience: "screen",
      frame: { event: "vote:options", payload: screenOptions },
    },
  ];
  for (const player of activePlayers(state)) {
    const ownOptions = buildVoteOptions(state, player.playerId, fanOut);
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

/**
 * `scores` per room (the public one leaves out unrevealed podium places,
 * contract 6.7), then `scores:mine` to each player whose place is shown; one
 * rank index serves every frame (contract 7.1).
 */
function scoresFrames(state: QuizshowEngineState): QuizshowEngineFrame[] {
  const rankIndex = buildRankIndex(state);
  const publicScores = buildScores(state, rankIndex, "public");
  const hostScores = buildScores(state, rankIndex, "hosts");
  if (publicScores === null || hostScores === null) return [];
  const frames: QuizshowEngineFrame[] = [
    ...toPublicAudiences({ event: "scores", payload: publicScores }),
    { audience: "hosts", frame: { event: "scores", payload: hostScores } },
  ];
  for (const player of activePlayers(state)) {
    const myScores = buildMyScores(state, player.playerId, rankIndex);
    if (myScores !== null) {
      frames.push({
        audience: { playerId: player.playerId },
        frame: { event: "scores:mine", payload: myScores },
      });
    }
  }
  return frames;
}

/** Screen and phones see only the places revealed so far; hosts see every place (contract 6.7). */
function podiumFrames(state: QuizshowEngineState): QuizshowEngineFrame[] {
  const publicPodium = buildPodiumFrame(state, "public");
  const hostPodium = buildPodiumFrame(state, "hosts");
  if (publicPodium === null || hostPodium === null) return [];
  return [
    ...toPublicAudiences({ event: "podium", payload: publicPodium }),
    { audience: "hosts", frame: { event: "podium", payload: hostPodium } },
  ];
}

function lobbyFrames(state: QuizshowEngineState): QuizshowEngineFrame[] {
  return [
    {
      audience: "screen",
      frame: { event: "lobby:update", payload: buildLobby(state) },
    },
    {
      audience: "players",
      frame: { event: "lobby:update", payload: buildPlayerLobby(state) },
    },
    {
      audience: "hosts",
      frame: { event: "lobby:update", payload: buildHostLobby(state) },
    },
  ];
}

function phaseChangeFrames(state: QuizshowEngineState): QuizshowEngineFrame[] {
  const publicFrame: QuizshowServerFrame = {
    event: "phase:change",
    payload: buildPhaseChange(state, "public"),
  };
  return [
    ...toPublicAudiences(publicFrame),
    {
      audience: "hosts",
      frame: {
        event: "phase:change",
        payload: buildPhaseChange(state, "host"),
      },
    },
  ];
}

/** A player's own `session:state`, with `me` null once they left (contract 6.14). */
function playerStateFrame(
  state: QuizshowEngineState,
  playerId: string,
): QuizshowEngineFrame {
  const payload = playerSessionState(
    state,
    playerId,
    findPlayer(state, playerId)?.screenName ?? "",
  );
  return {
    audience: { playerId },
    frame: { event: "session:state", payload },
  };
}

/**
 * A fresh `session:state` per role: after a lobby refresh (contract 6.10)
 * the screen, the hosts and every player row not removed; after a guest push
 * (scope "hosts") the hosts alone. A visitor on the player page who has not
 * joined gets theirs from the demo engine hook.
 */
function stateResetFrames(
  state: QuizshowEngineState,
  scope: "everyone" | "hosts",
): QuizshowEngineFrame[] {
  const hostsFrame: QuizshowEngineFrame = {
    audience: "hosts",
    frame: { event: "session:state", payload: hostSessionState(state) },
  };
  if (scope === "hosts") return [hostsFrame];
  return [
    {
      audience: "screen",
      frame: {
        event: "session:state",
        payload: engineSessionStateFor(state, { role: "screen" }),
      },
    },
    hostsFrame,
    ...state.players
      .filter((player) => !player.isRemoved)
      .map((player) => playerStateFrame(state, player.playerId)),
  ];
}

/** The players a reveal update reaches: every eligible player after a rescore, else the ones the effect names. */
function revealUpdatePlayerIds(
  state: QuizshowEngineState,
  effect: Extract<QuizshowEngineEffect, { kind: "reveal_updated" }>,
): readonly string[] {
  return effect.scope === "everyone"
    ? (state.current?.eligiblePlayerIds ?? [])
    : effect.playerIds;
}

/** Effects whose frames go to fixed rooms and read nothing but the state. */
function roomFramesForEffect(
  state: QuizshowEngineState,
  effect: QuizshowEngineEffect,
): QuizshowEngineFrame[] | null {
  switch (effect.kind) {
    case "phase_changed":
      return phaseChangeFrames(state);
    case "lobby_changed":
      return lobbyFrames(state);
    case "answer_count_changed": {
      const answerCount = buildAnswerCount(state);
      // Phones show "9 of 14 answered" too (contract 6.21).
      return answerCount === null
        ? []
        : toEveryAudience({ event: "answer:count", payload: answerCount });
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
    case "typed_answers_changed":
      return typedAnswersFrames(state);
    case "scores_shown":
      return scoresFrames(state);
    case "podium_shown":
      return podiumFrames(state);
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
    case "flags_changed":
      return toEveryAudience({
        event: "session:flags",
        payload: buildSessionFlags(state),
      });
    case "state_reset":
      return stateResetFrames(state, effect.scope ?? "everyone");
    case "reactions_changed":
      // The demo engine hook sends `reactions` on its own trailing throttle (contract 6.19).
      return [];
    default:
      return null;
  }
}

/** The frames one effect sends, read from the state at the end of the step. */
function framesForEffect(
  state: QuizshowEngineState,
  effect: QuizshowEngineEffect,
): QuizshowEngineFrame[] {
  const roomFrames = roomFramesForEffect(state, effect);
  if (roomFrames !== null) return roomFrames;
  switch (effect.kind) {
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
    case "revealed":
      return [
        ...revealFrames(state, state.current?.eligiblePlayerIds ?? []),
        ...typedAnswersFrames(state),
      ];
    case "reveal_updated":
      return revealFrames(state, revealUpdatePlayerIds(state, effect));
    case "answer_hidden": {
      const frame: QuizshowServerFrame = {
        event: "answer:hidden",
        payload: effect.hidden,
      };
      return effect.isForEveryAudience
        ? toEveryAudience(frame)
        : [{ audience: "hosts", frame }];
    }
    case "player_removed":
      return [
        {
          audience: { playerId: effect.playerId },
          frame: {
            event: "player:removed",
            payload: {
              sessionId: state.sessionId,
              canRejoin: effect.canRejoin,
            },
          },
        },
      ];
    case "session_state":
    case "player_left":
      return [playerStateFrame(state, effect.playerId)];
    default:
      return [];
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
  "flags_changed",
  "state_reset",
  "typed_answers_changed",
  "reactions_changed",
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
