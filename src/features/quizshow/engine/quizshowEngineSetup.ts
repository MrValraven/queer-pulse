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
  type QuizshowLanguage,
  type QuizshowLanguageMode,
  type QuizshowMe,
  type QuizshowOption,
  type QuizshowPhase,
  type QuizshowQuestion,
  type QuizshowQuiz,
  type QuizshowRound,
  type QuizshowRoundKind,
  type QuizshowSessionStatus,
  type QuizshowTeamColorKey,
} from "../../../shared/contracts/quizshow";
import { hasAdultsRound } from "../api/quizshowDemoQuizzes";
import { normaliseStoredQuiz } from "../quizshowNormalise";
import {
  emptyWheelProgress,
  normaliseWheelRounds,
  progressCursorFields,
} from "../quizshowWheel";
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

/** Codes whose refusal carries the current cursor: the stale phase and every phase or status cause of contract 3.2. */
const CURSOR_CODES: readonly QuizshowErrorCode[] = [
  "quizshow_stale_phase",
  "quizshow_command_not_allowed",
  "quizshow_session_ended",
  "quizshow_already_started",
  "quizshow_session_not_started",
  "quizshow_session_paused",
  "quizshow_spin_not_available",
  "quizshow_no_wheel_open",
  "quizshow_no_timer_running",
  "quizshow_already_revealed",
  "quizshow_nothing_to_reveal",
  "quizshow_nothing_to_skip",
  "quizshow_review_not_open",
  "quizshow_unhide_review_only",
  "quizshow_author_removed",
  "quizshow_favourite_not_available",
  "quizshow_teams_off",
  "quizshow_not_in_lobby",
  "quizshow_move_during_question",
  "quizshow_rescore_not_now",
  "quizshow_adjust_not_now",
];

/** Contract 3.1 verbatim: why a command that needs `required` cannot run in the session's status. */
export function statusRefusalCode(
  status: QuizshowSessionStatus,
  required: "lobby" | "running" | "open",
): QuizshowErrorCode {
  if (status === "finished" || status === "abandoned") {
    return "quizshow_session_ended";
  }
  if (required === "lobby") return "quizshow_already_started";
  if (status === "lobby") return "quizshow_session_not_started";
  return "quizshow_session_paused"; // required 'running', status 'paused'
}

/** Still playing: neither removed by a host nor gone with a leave (contract 6.14). */
export function isActivePlayer(
  player: Pick<QuizshowEnginePlayer, "isRemoved" | "leftAt">,
): boolean {
  return !player.isRemoved && player.leftAt === null;
}

/**
 * No socket connected for at least `awayAfterMs` (contract 6.2). The browser
 * has no sockets: `disconnectedAt === null` reads as connected, and the demo
 * never sets it, so demo players never go away.
 */
export function isAwayAt(
  player: Pick<QuizshowEnginePlayer, "disconnectedAt">,
  now: number,
): boolean {
  return (
    player.disconnectedAt !== null &&
    now - player.disconnectedAt >= QUIZSHOW_LIMITS.awayAfterMs
  );
}

/** Contract 6.12: the `read` length scales with the longest shown language, prompt plus options. */
export function readPhaseMsFor(
  question: Pick<QuizshowQuestion, "prompt" | "options">,
  languages: QuizshowLanguageMode,
  shownOptions?: readonly QuizshowOption[] | null,
): number {
  const shown: QuizshowLanguage[] =
    languages === "both" ? ["en", "pt"] : [languages];
  const characters = Math.max(
    ...shown.map(
      (language) =>
        question.prompt[language].length +
        (shownOptions ?? question.options).reduce(
          (sum, option) => sum + option.text[language].length,
          0,
        ),
    ),
  );
  return Math.min(
    Math.max(
      QUIZSHOW_LIMITS.readPhaseBaseMs +
        QUIZSHOW_LIMITS.readPhaseMsPerChar * characters,
      QUIZSHOW_LIMITS.readPhaseMinMs,
    ),
    QUIZSHOW_LIMITS.readPhaseMaxMs,
  );
}

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

/** The rematch's teams (contract 6.17): host-made, empty, with fresh ids. */
function initialTeamsOf(
  state: QuizshowEngineState,
  initialTeams: QuizshowEngineOptions["initialTeams"],
): QuizshowEngineTeam[] {
  return (initialTeams ?? []).map((team) => ({
    teamId: mintId(state, "team"),
    name: team.name,
    colorKey: team.colorKey,
    score: 0,
    hasUsedJoker: false,
    jokerRoundIndex: null,
    isHostMade: true,
  }));
}

/**
 * The quiz a session plays, as the server snapshot builds it: stored shapes
 * through the contract 2.4 normaliser, settings defaulted, wheel fields
 * normalised, and every order question shuffled once. Lobby creation and the
 * lobby refresh (contract 6.10) both build it here.
 */
export function buildPlayableQuiz(
  rawQuiz: QuizshowQuiz,
  random: QuizshowRandom,
): {
  quiz: QuizshowQuiz;
  shuffledOrderOptions: Record<string, QuizshowOption[]>;
} {
  const clonedQuiz = normaliseStoredQuiz(structuredClone(rawQuiz));
  const quiz: QuizshowQuiz = {
    ...clonedQuiz,
    rounds: normaliseWheelRounds(clonedQuiz.rounds),
  };
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
  return { quiz, shuffledOrderOptions };
}

/** A fresh session in the lobby at phase id `'0'`; order questions are shuffled once, here. */
export function createQuizshowEngineState(
  options: QuizshowEngineOptions,
): QuizshowEngineState {
  const random = quizshowRandomFrom(options.seed);
  const { quiz, shuffledOrderOptions } = buildPlayableQuiz(
    options.quiz,
    random,
  );
  const wheelProgress = emptyWheelProgress();
  const state: QuizshowEngineState = {
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
      phaseStartedAt: null,
      deadline: null,
      extraTimeDeadline: null,
      pausedRemainingMs: null,
      pausedExtraTimeRemainingMs: null,
      isRestartRecovery: false,
      talkStartsAt: null,
      autoAdvanceAt: null,
      podiumRevealedCount: null,
      ...progressCursorFields(quiz.rounds, wheelProgress, "lobby"),
    },
    lastTransition: null,
    pausedAt: null,
    lastHostCommandAt: options.now,
    players: [],
    teams: [],
    current: null,
    wheelProgress,
    isScreenMuted: false,
    hasScoredQuestion: false,
    scoresAtLastFrame: {},
    lastScoresFrame: null,
    podium: null,
    idCounter: 0,
    randomState: random.state(),
    isPractice: options.isPractice ?? false,
    isJoinLocked: false,
    isAutoAdvanceOn: false,
    guestPushSentAt: null,
    pairedDevices: [],
    reactionCounts: {},
    reactionBuckets: {},
    adjustRequestIds: [],
    sourceUpdatedAt: options.sourceUpdatedAt ?? options.quiz.updatedAt,
    giving: options.giving ?? null,
  };
  state.teams = initialTeamsOf(state, options.initialTeams);
  return state;
}

export interface QuizshowCursorAdvance {
  phase: QuizshowPhase;
  roundIndex: number | null;
  questionIndex: number | null;
  now: number;
  durationMs: number | null;
  extraTimeMs: number | null;
  /** The talk beat's start in `read` (contract 6.20); null when left out. */
  talkStartsAt?: number | null;
  /** When the engine moves on by itself (contract 6.16); null when left out. */
  autoAdvanceAt?: number | null;
  /** Podium places shown (contract 6.7); null when left out. */
  podiumRevealedCount?: number | null;
}

/** Moves to the next phase: a new phase id, the transition it came from, fresh deadlines, a cleared paused remainder, the talk, auto-advance and podium fields as given (null when left out, since each belongs to one phase) and the four progress fields recounted; the status stays as set. Callers change `wheelProgress` first and call this last. */
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
    talkStartsAt: next.talkStartsAt ?? null,
    autoAdvanceAt: next.autoAdvanceAt ?? null,
    podiumRevealedCount: next.podiumRevealedCount ?? null,
    ...progressCursorFields(state.quiz.rounds, state.wheelProgress, next.phase),
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
  return state.players.filter(isActivePlayer);
}

/** The player behind an id while they are still in the session. */
export function activePlayerOf(
  state: QuizshowEngineState,
  playerId: string | null,
): QuizshowEnginePlayer | null {
  if (playerId === null) return null;
  const player = findPlayer(state, playerId);
  return player !== undefined && isActivePlayer(player) ? player : null;
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

/** MC and poll options in authored order, order options in their shuffled order, null on every other type. */
export function shownOptionsOf(
  state: QuizshowEngineState,
  question: QuizshowQuestion,
): QuizshowOption[] | null {
  if (question.type === "multiple_choice" || question.type === "poll") {
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

/** Who competes: active players in solo play, teams in teams play (created order); a team keeps its score when members leave. */
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

export interface QuizshowAckFailureExtras {
  /** Overrides the code list where the server's choice differs per command (`host:createTeams` refuses `quizshow_teams_off` with no cursor). */
  withCursor?: boolean;
  /** Only on `quizshow_screen_name_taken`. */
  suggestedScreenName?: string | null;
}

/** A refusal ack: the message is the code; the stale phase and the phase or status causes carry a copy of the cursor. */
export function ackFailure(
  code: QuizshowErrorCode,
  state: QuizshowEngineState,
  extras: QuizshowAckFailureExtras = {},
): QuizshowAckFailure {
  const withCursor = extras.withCursor ?? CURSOR_CODES.includes(code);
  const failure: QuizshowAckFailure = withCursor
    ? { ok: false, code, message: code, cursor: { ...state.cursor } }
    : { ok: false, code, message: code };
  if (
    extras.suggestedScreenName !== undefined &&
    extras.suggestedScreenName !== null
  ) {
    failure.suggestedScreenName = extras.suggestedScreenName;
  }
  return failure;
}
