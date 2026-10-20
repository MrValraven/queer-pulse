/**
 * Pulse Live demo engine setup and the state helpers every other engine
 * module reads: the lobby state, the cursor, who plays, limits, jokers,
 * entrants, `me` and refusals. Ports of the backend's quizshow-engine-state.ts
 * and quizshow-snapshot.ts onto the JSON state.
 */
import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_PARTY_ROUND_KINDS,
  QUIZSHOW_TIMED_PHASES,
  type QuizshowAckFailure,
  type QuizshowErrorCode,
  type QuizshowMe,
  type QuizshowOption,
  type QuizshowPhase,
  type QuizshowQuestion,
  type QuizshowRound,
  type QuizshowRoundKind,
  type QuizshowSessionStatus,
  type QuizshowTeamColorKey,
} from "../../../shared/contracts/quizshow";
import { hasAdultsRound } from "../api/quizshowDemoQuizzes";
import { quizshowRandomFrom, type QuizshowRandom } from "./quizshowRandom";
import type {
  QuizshowEngineOptions,
  QuizshowEnginePlayer,
  QuizshowEngineQuestionPlay,
  QuizshowEngineState,
  QuizshowEngineTeam,
} from "./quizshowEngineTypes";

/** What a command or a tick works with: the cloned state and the seeded generator. */
export interface QuizshowEngineContext {
  state: QuizshowEngineState;
  random: QuizshowRandom;
}

export interface QuizshowEntrantTotal {
  entrantId: string;
  kind: "player" | "team";
  name: string;
  colorKey: QuizshowTeamColorKey | null;
  score: number;
}

const OPEN_STATUSES: readonly QuizshowSessionStatus[] = [
  "lobby",
  "running",
  "paused",
];

/** Codes whose refusal carries the current cursor. */
const CURSOR_CODES: readonly QuizshowErrorCode[] = [
  "quizshow_stale_phase",
  "quizshow_command_not_allowed",
];

export function isOpenStatus(status: QuizshowSessionStatus): boolean {
  return OPEN_STATUSES.includes(status);
}

export function isTimedPhase(phase: QuizshowPhase): boolean {
  return (QUIZSHOW_TIMED_PHASES as readonly QuizshowPhase[]).includes(phase);
}

export function isPartyRoundKind(kind: QuizshowRoundKind): boolean {
  return (QUIZSHOW_PARTY_ROUND_KINDS as readonly QuizshowRoundKind[]).includes(
    kind,
  );
}

/** The next id of a kind, from the one counter: `demo-player-1`, `demo-team-2`, `demo-answer-3`, `demo-option-4`. */
export function mintId(
  state: QuizshowEngineState,
  kind: "player" | "team" | "answer" | "option",
): string {
  state.idCounter += 1;
  return `demo-${kind}-${state.idCounter}`;
}

/** Fisher-Yates, then a left rotation by one when the shuffle equals the correct order. */
function shownOrderOptions(
  options: readonly QuizshowOption[],
  correctIds: readonly string[],
  random: QuizshowRandom,
): QuizshowOption[] {
  const shuffled = random.shuffle(options);
  const isCorrectOrder =
    shuffled.length === correctIds.length &&
    shuffled.every((option, position) => option.id === correctIds[position]);
  if (isCorrectOrder && shuffled.length > 1) {
    const first = shuffled.shift();
    if (first !== undefined) shuffled.push(first);
  }
  return shuffled.map((option) => ({
    id: option.id,
    text: { ...option.text },
  }));
}

/** A fresh session in the lobby at phase id `'0'`; order questions are shuffled once, here. */
export function createQuizshowEngineState(
  options: QuizshowEngineOptions,
): QuizshowEngineState {
  const random = quizshowRandomFrom(options.seed);
  const quiz = structuredClone(options.quiz);
  const shuffledOrderOptions: Record<string, QuizshowOption[]> = {};
  for (const round of quiz.rounds) {
    for (const question of round.questions) {
      if (question.type !== "order") continue;
      shuffledOrderOptions[question.id] = shownOrderOptions(
        question.options,
        question.answer?.orderedIds ?? [],
        random,
      );
    }
  }
  return {
    sessionId: options.sessionId,
    eventSlug: options.eventSlug,
    eventTitle: options.eventTitle,
    gameId: options.gameId ?? null,
    isAdultsOnly: (options.isAdultsOnly ?? false) || hasAdultsRound(quiz),
    joinCode: options.joinCode,
    quiz,
    shuffledOrderOptions,
    playMode: options.playMode,
    maxTeamSize: options.maxTeamSize,
    isReviewOn: options.isReviewOn,
    phaseCounter: 0,
    cursor: {
      phaseId: "0",
      status: "lobby",
      phase: "lobby",
      roundIndex: null,
      questionIndex: null,
      roundCount: quiz.rounds.length,
      phaseStartedAt: null,
      deadline: null,
      extraTimeDeadline: null,
      pausedRemainingMs: null,
      pausedExtraTimeRemainingMs: null,
      isRestartRecovery: false,
    },
    lastTransition: null,
    pausedAt: null,
    lastHostCommandAt: options.now,
    players: [],
    teams: [],
    current: null,
    isScreenMuted: false,
    hasScoredQuestion: false,
    scoresAtLastFrame: {},
    lastScoresFrame: null,
    podium: null,
    idCounter: 0,
    randomState: random.state(),
  };
}

export interface QuizshowCursorAdvance {
  phase: QuizshowPhase;
  roundIndex: number | null;
  questionIndex: number | null;
  now: number;
  durationMs: number | null;
  extraTimeMs: number | null;
}

/** Moves to the next phase: a new phase id, the transition it came from, fresh deadlines and a cleared paused remainder; the status stays as set. */
export function advanceCursor(
  state: QuizshowEngineState,
  next: QuizshowCursorAdvance,
): void {
  const fromPhaseId = state.cursor.phaseId;
  state.phaseCounter += 1;
  const toPhaseId = String(state.phaseCounter);
  state.lastTransition = { fromPhaseId, toPhaseId };
  state.cursor = {
    ...state.cursor,
    phaseId: toPhaseId,
    phase: next.phase,
    roundIndex: next.roundIndex,
    questionIndex: next.questionIndex,
    phaseStartedAt: next.now,
    deadline: next.durationMs === null ? null : next.now + next.durationMs,
    extraTimeDeadline:
      next.extraTimeMs === null ? null : next.now + next.extraTimeMs,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
  };
}

export function setSessionStatus(
  state: QuizshowEngineState,
  status: QuizshowSessionStatus,
): void {
  state.cursor.status = status;
}

export function findPlayer(
  state: QuizshowEngineState,
  playerId: string,
): QuizshowEnginePlayer | undefined {
  return state.players.find((player) => player.playerId === playerId);
}

export function findTeam(
  state: QuizshowEngineState,
  teamId: string,
): QuizshowEngineTeam | undefined {
  return state.teams.find((team) => team.teamId === teamId);
}

/** Players still in the session, in joined order. */
export function activePlayers(
  state: QuizshowEngineState,
): QuizshowEnginePlayer[] {
  return state.players.filter((player) => !player.isRemoved);
}

/** The player behind an id while they are still in the session. */
export function activePlayerOf(
  state: QuizshowEngineState,
  playerId: string | null,
): QuizshowEnginePlayer | null {
  if (playerId === null) return null;
  const player = findPlayer(state, playerId);
  return player !== undefined && !player.isRemoved ? player : null;
}

/** Players eligible for the current question who are still in the session; [] with no current question. */
export function eligiblePlayersNow(
  state: QuizshowEngineState,
): QuizshowEnginePlayer[] {
  const current = state.current;
  if (current === null) return [];
  return activePlayers(state).filter((player) =>
    current.eligiblePlayerIds.includes(player.playerId),
  );
}

export function isEligible(
  state: QuizshowEngineState,
  playerId: string,
): boolean {
  return state.current?.eligiblePlayerIds.includes(playerId) ?? false;
}

/** The deadline the player answers against: the extra-time one when the question gave them extra time. */
export function ownDeadline(
  state: QuizshowEngineState,
  playerId: string,
): number | null {
  const hasExtraTime =
    state.current?.extraTimePlayerIds.includes(playerId) ?? false;
  return hasExtraTime ? state.cursor.extraTimeDeadline : state.cursor.deadline;
}

export function roundAt(
  state: QuizshowEngineState,
  roundIndex: number,
): QuizshowRound | null {
  return state.quiz.rounds[roundIndex] ?? null;
}

export function questionAt(
  state: QuizshowEngineState,
  roundIndex: number,
  questionIndex: number,
): QuizshowQuestion | null {
  return state.quiz.rounds[roundIndex]?.questions[questionIndex] ?? null;
}

export interface QuizshowPlayContext {
  play: QuizshowEngineQuestionPlay;
  round: QuizshowRound;
  question: QuizshowQuestion;
}

/** The question in play with its round; a missing one breaks an engine invariant. */
export function currentPlayContext(
  state: QuizshowEngineState,
): QuizshowPlayContext {
  const play = state.current;
  if (play === null) {
    throw new Error(
      `Pulse Live demo ${state.sessionId} has no question in play.`,
    );
  }
  const round = roundAt(state, play.roundIndex);
  const question = questionAt(state, play.roundIndex, play.questionIndex);
  if (round === null || question === null) {
    throw new Error(
      `Pulse Live demo ${state.sessionId} names a question outside its quiz.`,
    );
  }
  return { play, round, question };
}

/** MC options in authored order, order options in their shuffled order, null on every other type. */
export function shownOptionsOf(
  state: QuizshowEngineState,
  question: QuizshowQuestion,
): QuizshowOption[] | null {
  if (question.type === "multiple_choice") {
    return question.options.map((option) => ({
      id: option.id,
      text: { ...option.text },
    }));
  }
  if (question.type === "order") {
    const shown = state.shuffledOrderOptions[question.id] ?? question.options;
    return shown.map((option) => ({ id: option.id, text: { ...option.text } }));
  }
  return null;
}

export function openLimitMs(
  round: QuizshowRound,
  question: QuizshowQuestion,
): number {
  return (question.timeLimitSeconds ?? round.settings.timeLimitSeconds) * 1000;
}

export function writeLimitMs(round: QuizshowRound): number {
  return round.settings.writeSeconds * 1000;
}

export function voteLimitMs(round: QuizshowRound): number {
  return round.settings.voteSeconds * 1000;
}

export function extraTimeMs(limitMs: number): number {
  return Math.round(limitMs * QUIZSHOW_LIMITS.extraTimeFactor);
}

export function isLastQuestionOfRound(
  state: QuizshowEngineState,
  roundIndex: number,
  questionIndex: number,
): boolean {
  const round = roundAt(state, roundIndex);
  return round !== null && questionIndex === round.questions.length - 1;
}

export function isLastRound(
  state: QuizshowEngineState,
  roundIndex: number,
): boolean {
  return roundIndex === state.quiz.rounds.length - 1;
}

/** The joker that counts for the player: their own in solo play, their team's in teams play. */
function jokerHolderOf(
  state: QuizshowEngineState,
  player: QuizshowEnginePlayer,
): Pick<QuizshowEnginePlayer, "hasUsedJoker" | "jokerRoundIndex"> | null {
  if (state.playMode === "solo") return player;
  if (player.teamId === null) return null;
  return findTeam(state, player.teamId) ?? null;
}

export function isJokerActiveFor(
  state: QuizshowEngineState,
  playerId: string,
  roundIndex: number,
): boolean {
  const player = findPlayer(state, playerId);
  if (player === undefined) return false;
  const holder = jokerHolderOf(state, player);
  return holder !== null && holder.jokerRoundIndex === roundIndex;
}

/** Who competes: active players in solo play, teams in teams play (created order). */
export function entrantTotals(
  state: QuizshowEngineState,
): QuizshowEntrantTotal[] {
  if (state.playMode === "solo") {
    return activePlayers(state).map((player) => ({
      entrantId: player.playerId,
      kind: "player",
      name: player.screenName,
      colorKey: null,
      score: player.score,
    }));
  }
  return state.teams.map((team) => ({
    entrantId: team.teamId,
    kind: "team",
    name: team.name,
    colorKey: team.colorKey,
    score: team.score,
  }));
}

/** The entrant a player competes as: themselves in solo play, their team in teams play. */
export function entrantIdOf(
  state: QuizshowEngineState,
  player: QuizshowEnginePlayer,
): string | null {
  return state.playMode === "solo" ? player.playerId : player.teamId;
}

/** The player's own `me`; the joker fields are the team's in teams play. */
export function toMe(state: QuizshowEngineState, playerId: string): QuizshowMe {
  const player = findPlayer(state, playerId);
  if (player === undefined) {
    throw new Error(
      `Pulse Live demo player ${playerId} is not in the session.`,
    );
  }
  const holder = jokerHolderOf(state, player);
  return {
    playerId: player.playerId,
    screenName: player.screenName,
    isAvatarShown: player.isAvatarShown,
    hasExtraTime: player.hasExtraTime,
    teamId: player.teamId,
    isCohostPlayer: player.isCohostPlayer,
    score: player.score,
    streak: player.streak,
    hasUsedJoker: holder?.hasUsedJoker ?? false,
    jokerRoundIndex: holder?.jokerRoundIndex ?? null,
  };
}

/** A refusal ack: the message is the code, and the two cursor codes carry a copy of the cursor. */
export function ackFailure(
  code: QuizshowErrorCode,
  state: QuizshowEngineState,
): QuizshowAckFailure {
  return CURSOR_CODES.includes(code)
    ? { ok: false, code, message: code, cursor: { ...state.cursor } }
    : { ok: false, code, message: code };
}
