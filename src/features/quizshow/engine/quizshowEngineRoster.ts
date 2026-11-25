/**
 * Pulse Live demo engine roster commands: a player leaving and reacting, and
 * the host tools for the room (rename, move, teams for tables, the join lock,
 * auto-advance, the guest push, pairing) plus the lobby refresh. Ports of the
 * backend's quizshow-engine-roster.ts, the leave and auto-advance commands of
 * quizshow-engine-phases.ts and the session tools (contract 4.2, 4.3, 6.8,
 * 6.10, 6.11, 6.13 to 6.16, 6.19). This module never imports the commands
 * module: refusals go through Setup's `ackFailure`. The demo leaves out the
 * blocked-term filter, the guest push itself and pairing.
 */
import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_REACTION_IDS,
  QUIZSHOW_TEAM_COLOR_KEYS,
  type QuizshowErrorCode,
  type QuizshowPhase,
  type QuizshowQuiz,
  type QuizshowReactionId,
  type QuizshowTeamColorKey,
} from "../../../shared/contracts/quizshow";
import { hasAdultsRound } from "../api/quizshowDemoQuizzes";
import { foldNameKey, suggestedScreenNameFor } from "../quizshowNormalise";
import { emptyWheelProgress, progressCursorFields } from "../quizshowWheel";
import {
  isReactionPhase,
  reactionTokensAt,
} from "../stage/quizshowReactionRules";
import type { QuizshowClientPayload } from "../realtime/quizshowFrames";
import {
  ackFailure,
  activePlayers,
  buildPlayableQuiz,
  findPlayer,
  findTeam,
  isActivePlayer,
  isOpenStatus,
  mintId,
  statusRefusalCode,
  type QuizshowAckFailureExtras,
  type QuizshowEngineContext,
} from "./quizshowEngineSetup";
import {
  QUIZSHOW_ENGINE_QUESTION_PHASES,
  armAutoAdvance,
  closeIfEveryoneDone,
  refreshPodiumIfShown,
} from "./quizshowEngineTransitions";
import type {
  QuizshowCommandResult,
  QuizshowEngineEffect,
  QuizshowEnginePlayer,
  QuizshowEngineState,
  QuizshowHostFrameName,
  QuizshowHostHandler,
  QuizshowPlayerFrameName,
  QuizshowPlayerHandler,
} from "./quizshowEngineTypes";

/**
 * A host may not move a player while a question is asked, answered, voted on,
 * revealed or scored (contract 6.14, amended in 13): a rescore, hide or
 * favourite in reveal or scores recomputes that question's team points from
 * each player's current team, so a move there would hand them to the new team.
 */
const MOVE_REFUSED_PHASES: readonly QuizshowPhase[] = [
  ...QUIZSHOW_ENGINE_QUESTION_PHASES,
  "reveal",
  "scores",
];

function succeed(
  success: object,
  effects: QuizshowEngineEffect[],
): QuizshowCommandResult {
  return { ack: { ok: true, ...success }, effects };
}

function refuse(
  code: QuizshowErrorCode,
  state: QuizshowEngineState,
  extras?: QuizshowAckFailureExtras,
): QuizshowCommandResult {
  return { ack: ackFailure(code, state, extras), effects: [] };
}

function payloadAs<
  Name extends QuizshowPlayerFrameName | QuizshowHostFrameName,
>(payload: unknown): Partial<QuizshowClientPayload<Name>> {
  return typeof payload === "object" && payload !== null ? payload : {};
}

function textOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function isTeamFull(state: QuizshowEngineState, teamId: string): boolean {
  return (
    state.maxTeamSize !== null &&
    activePlayers(state).filter((player) => player.teamId === teamId).length >=
      state.maxTeamSize
  );
}

/**
 * Lobby only: deletes the team once no active player is left in it, so its
 * name and colour are free again. A host-made team waits empty for its table
 * and stays; once the game runs every team stays, as scores hang on it.
 */
function dropEmptyLobbyTeam(
  state: QuizshowEngineState,
  teamId: string | null,
): void {
  if (teamId === null || state.cursor.status !== "lobby") return;
  const team = findTeam(state, teamId);
  if (team === undefined || team.isHostMade) return;
  const hasActiveMember = activePlayers(state).some(
    (player) => player.teamId === teamId,
  );
  if (hasActiveMember) return;
  state.teams = state.teams.filter((candidate) => candidate.teamId !== teamId);
}

/**
 * `lobby:leave` (contract 6.14): any open status. The player keeps score,
 * streak, joker and team for a rejoin; in the lobby a team they leave empty
 * goes, unless a host made it. Their own sockets get a `session:state` with
 * `me` null through `player_left`.
 */
function leaveLobby(
  context: QuizshowEngineContext,
  player: QuizshowEnginePlayer,
  _payload: unknown,
  now: number,
): QuizshowCommandResult {
  const { state } = context;
  // runPlayerCommand already refused a removed player and one who left.
  if (!isOpenStatus(state.cursor.status)) {
    return refuse("quizshow_session_ended", state);
  }
  player.leftAt = now;
  dropEmptyLobbyTeam(state, player.teamId);
  return succeed({}, [
    { kind: "lobby_changed" },
    { kind: "player_left", playerId: player.playerId },
    ...refreshPodiumIfShown(state),
    ...closeIfEveryoneDone(context, now),
  ]);
}

function isReactionId(value: unknown): value is QuizshowReactionId {
  return (QUIZSHOW_REACTION_IDS as readonly unknown[]).includes(value);
}

/**
 * `reaction:send` (contract 6.19): between questions only, rate limited per
 * player. Counts are anonymous; the demo engine hook sends them to the screen
 * and the hosts on its trailing throttle.
 */
function sendReaction(
  { state }: QuizshowEngineContext,
  player: QuizshowEnginePlayer,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  // runPlayerCommand already refused a removed player and one who left.
  const { reactionId } = payloadAs<"reaction:send">(payload);
  // The server's payload check refuses an unknown id before the engine; the demo phone only sends the six ids.
  if (!isReactionPhase(state.cursor.phase) || !isReactionId(reactionId)) {
    return refuse("quizshow_reaction_not_now", state);
  }
  // The shared bucket rule the phone's reaction bar reads too.
  const tokens = reactionTokensAt(state.reactionBuckets[player.playerId], now);
  if (tokens < 1) return refuse("quizshow_rate_limited", state);
  state.reactionBuckets[player.playerId] = {
    tokens: tokens - 1,
    refilledAt: now,
  };
  state.reactionCounts[reactionId] =
    (state.reactionCounts[reactionId] ?? 0) + 1;
  return succeed({}, [{ kind: "reactions_changed" }]);
}

type RosterPlayerLookup =
  | { player: QuizshowEnginePlayer; refusal: null }
  | { player: null; refusal: QuizshowErrorCode };

/** The target of a host roster command: unknown and removed players are not found, a player who left is named as such. */
function lookUpRosterPlayer(
  state: QuizshowEngineState,
  playerId: string,
): RosterPlayerLookup {
  const player = findPlayer(state, playerId);
  if (player === undefined || player.isRemoved) {
    return { player: null, refusal: "quizshow_player_not_found" };
  }
  if (player.leftAt !== null) {
    return { player: null, refusal: "quizshow_player_left" };
  }
  return { player, refusal: null };
}

/**
 * `host:renamePlayer` (contract 6.13, 6.14): any open status, an active
 * player, a name that is not blank and that no other player of the session
 * holds (a player who left counts, since they may come back under it). The
 * same name is a no-op.
 */
function hostRenamePlayer(
  { state }: QuizshowEngineContext,
  payload: unknown,
): QuizshowCommandResult {
  if (!isOpenStatus(state.cursor.status)) {
    return refuse(statusRefusalCode(state.cursor.status, "open"), state, {
      withCursor: true,
    });
  }
  const input = payloadAs<"host:renamePlayer">(payload);
  const lookup = lookUpRosterPlayer(state, textOf(input.playerId));
  if (lookup.player === null) return refuse(lookup.refusal, state);
  const player = lookup.player;
  const screenName = textOf(input.screenName).trim();
  if (screenName === "") return refuse("quizshow_text_blank", state);
  const otherNames = state.players
    .filter(
      (otherPlayer) =>
        otherPlayer.playerId !== player.playerId && !otherPlayer.isRemoved,
    )
    .map((otherPlayer) => otherPlayer.screenName);
  const nameKey = foldNameKey(screenName);
  if (otherNames.some((otherName) => foldNameKey(otherName) === nameKey)) {
    return refuse("quizshow_screen_name_taken", state, {
      suggestedScreenName: suggestedScreenNameFor(screenName, otherNames),
    });
  }
  if (screenName === player.screenName) return succeed({ isNoop: true }, []);
  player.screenName = screenName;
  return succeed({ isNoop: false }, [
    { kind: "lobby_changed" },
    { kind: "me_changed", playerIds: [player.playerId] },
  ]);
}

/**
 * `host:movePlayer` (contract 6.14): teams play, any open status, an active
 * player and a team with room, outside the question phases (reveal and scores
 * count as question phases here). In the lobby the
 * old team goes when the move empties it, unless a host made it. Points the
 * player won before stay with the old team.
 */
function hostMovePlayer(
  { state }: QuizshowEngineContext,
  payload: unknown,
): QuizshowCommandResult {
  if (state.playMode === "solo") {
    return refuse("quizshow_teams_off", state, { withCursor: false });
  }
  if (!isOpenStatus(state.cursor.status)) {
    return refuse(statusRefusalCode(state.cursor.status, "open"), state, {
      withCursor: true,
    });
  }
  const input = payloadAs<"host:movePlayer">(payload);
  const lookup = lookUpRosterPlayer(state, textOf(input.playerId));
  if (lookup.player === null) return refuse(lookup.refusal, state);
  const player = lookup.player;
  const team = findTeam(state, textOf(input.teamId));
  if (team === undefined) return refuse("quizshow_team_not_found", state);
  if (MOVE_REFUSED_PHASES.includes(state.cursor.phase)) {
    return refuse("quizshow_move_during_question", state, {
      withCursor: true,
    });
  }
  if (player.teamId === team.teamId) return succeed({ isNoop: true }, []);
  if (isTeamFull(state, team.teamId)) {
    return refuse("quizshow_team_full", state);
  }
  const leftTeamId = player.teamId;
  player.teamId = team.teamId;
  dropEmptyLobbyTeam(state, leftTeamId);
  return succeed({ isNoop: false }, [
    { kind: "lobby_changed" },
    { kind: "me_changed", playerIds: [player.playerId] },
  ]);
}

/** The first keys of `QUIZSHOW_TEAM_COLOR_KEYS`, in order, that no team holds; null when fewer than `count` are free. */
function freeColorKeys(
  state: QuizshowEngineState,
  count: number,
): QuizshowTeamColorKey[] | null {
  const heldColorKeys = new Set(state.teams.map((team) => team.colorKey));
  const freeKeys = QUIZSHOW_TEAM_COLOR_KEYS.filter(
    (colorKey) => !heldColorKeys.has(colorKey),
  ).slice(0, count);
  return freeKeys.length === count ? freeKeys : null;
}

/**
 * `host:createTeams` (contract 6.11): lobby and teams play only. Every name is
 * trimmed and checked, and the names must be unique among themselves and the
 * existing teams by `foldNameKey`. All or nothing: one refused name creates no
 * team. The new teams take the first free colour keys and stay when they are
 * empty, since a host made them for the tables.
 */
function hostCreateTeams(
  { state }: QuizshowEngineContext,
  payload: unknown,
): QuizshowCommandResult {
  if (state.cursor.status !== "lobby") {
    return refuse("quizshow_not_in_lobby", state, { withCursor: true });
  }
  if (state.playMode === "solo") {
    return refuse("quizshow_teams_off", state, { withCursor: false });
  }
  const { names } = payloadAs<"host:createTeams">(payload);
  const trimmedNames = (Array.isArray(names) ? names : []).map((name) =>
    textOf(name).trim(),
  );
  if (trimmedNames.some((trimmedName) => trimmedName === "")) {
    return refuse("quizshow_text_blank", state);
  }
  const takenNameKeys = new Set(
    state.teams.map((team) => foldNameKey(team.name)),
  );
  for (const trimmedName of trimmedNames) {
    const nameKey = foldNameKey(trimmedName);
    if (takenNameKeys.has(nameKey)) {
      return refuse("quizshow_team_name_taken", state);
    }
    takenNameKeys.add(nameKey);
  }
  if (
    state.teams.length + trimmedNames.length >
    QUIZSHOW_LIMITS.teamsPerSessionMax
  ) {
    return refuse("quizshow_team_limit", state);
  }
  if (trimmedNames.length === 0) {
    return succeed({ isNoop: true, teamIds: [] }, []);
  }
  const colorKeys = freeColorKeys(state, trimmedNames.length);
  // The limit check above leaves a free key per team; this guards a state whose teams share keys.
  if (colorKeys === null) return refuse("quizshow_team_limit", state);
  const newTeams: Array<{ name: string; colorKey: QuizshowTeamColorKey }> = [];
  for (const [nameIndex, trimmedName] of trimmedNames.entries()) {
    const colorKey = colorKeys[nameIndex];
    if (colorKey === undefined) return refuse("quizshow_team_limit", state);
    newTeams.push({ name: trimmedName, colorKey });
  }
  const teamIds = newTeams.map(({ name, colorKey }) => {
    const teamId = mintId(state, "team");
    state.teams.push({
      teamId,
      name,
      colorKey,
      score: 0,
      hasUsedJoker: false,
      jokerRoundIndex: null,
      isHostMade: true,
    });
    return teamId;
  });
  return succeed({ isNoop: false, teamIds }, [{ kind: "lobby_changed" }]);
}

/** `host:setJoinLock` (contract 6.15): any open status; the same value is a no-op. Rejoins pass a lock. */
function hostSetJoinLock(
  { state }: QuizshowEngineContext,
  payload: unknown,
): QuizshowCommandResult {
  if (!isOpenStatus(state.cursor.status)) {
    return refuse(statusRefusalCode(state.cursor.status, "open"), state);
  }
  const isLocked = payloadAs<"host:setJoinLock">(payload).isLocked === true;
  if (state.isJoinLocked === isLocked) return succeed({ isNoop: true }, []);
  state.isJoinLocked = isLocked;
  return succeed({ isNoop: false }, [{ kind: "flags_changed" }]);
}

/**
 * `host:setAutoAdvance` (contract 6.16): any open status; the same value is a
 * no-op. On arms the running phase from now when it is one that moves on by
 * itself (`armAutoAdvance`); off clears the countdown. A changed countdown
 * also sends the cursor, so remotes draw or drop the ring.
 */
function hostSetAutoAdvance(
  { state }: QuizshowEngineContext,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  if (!isOpenStatus(state.cursor.status)) {
    return refuse(statusRefusalCode(state.cursor.status, "open"), state);
  }
  const isOn = payloadAs<"host:setAutoAdvance">(payload).isOn === true;
  if (state.isAutoAdvanceOn === isOn) return succeed({ isNoop: true }, []);
  state.isAutoAdvanceOn = isOn;
  const previousAutoAdvanceAt = state.cursor.autoAdvanceAt;
  armAutoAdvance(state, now);
  const effects: QuizshowEngineEffect[] = [{ kind: "flags_changed" }];
  if (state.cursor.autoAdvanceAt !== previousAutoAdvanceAt) {
    effects.push({ kind: "phase_changed" });
  }
  return succeed({ isNoop: false }, effects);
}

/**
 * `host:notifyGuests` (contract 6.8), in its refusal order. The demo sends no
 * push and has no cooldown: it records the send so the remote shows "Guests
 * have the code".
 */
function hostNotifyGuests(
  { state }: QuizshowEngineContext,
  _payload: unknown,
  now: number,
): QuizshowCommandResult {
  if (state.cursor.status !== "lobby") {
    return refuse("quizshow_not_in_lobby", state, { withCursor: false });
  }
  if (state.eventSlug === null) {
    return refuse("quizshow_guest_push_needs_event", state);
  }
  if (state.isPractice) return refuse("quizshow_guest_push_practice", state);
  if (state.guestPushSentAt !== null) {
    return refuse("quizshow_guest_push_already_sent", state);
  }
  state.guestPushSentAt = now;
  // Backend parity: only the hosts get a fresh state after the guest push.
  return succeed({ isNoop: false }, [{ kind: "state_reset", scope: "hosts" }]);
}

/** The demo has no pairing (contract 10, item 9): every code is unknown. The remote hides "Pair a screen" in demo. */
function hostPairDevice({
  state,
}: QuizshowEngineContext): QuizshowCommandResult {
  return refuse("quizshow_pairing_code_not_found", state);
}

/** The demo has no paired devices, so there is none to unpair. */
function hostUnpairDevice({
  state,
}: QuizshowEngineContext): QuizshowCommandResult {
  return refuse("quizshow_device_not_found", state);
}

/**
 * `hostRefreshQuiz` (contract 6.10): the lobby takes the latest saved quiz.
 * Lobby only; the same `sourceUpdatedAt` is a no-op. The 18+ consent is asked
 * only on a first join, so a lobby people already joined cannot turn 18+; an
 * empty lobby may. The new quiz is built as at creation (`buildPlayableQuiz`),
 * the wheel progress empties and the round count follows. Every viewer then
 * gets a fresh `session:state` through `state_reset`.
 */
export function refreshQuiz(
  { state, random }: QuizshowEngineContext,
  quiz: QuizshowQuiz,
  sourceUpdatedAt: string,
  now: number,
): QuizshowCommandResult {
  state.lastHostCommandAt = now;
  if (state.cursor.status !== "lobby") {
    return refuse("quizshow_not_in_lobby", state);
  }
  if (state.sourceUpdatedAt === sourceUpdatedAt) {
    return succeed({ isNoop: true }, []);
  }
  const isNextAdultsOnly = hasAdultsRound(quiz);
  const hasActivePlayer = state.players.some(isActivePlayer);
  if (!state.isAdultsOnly && isNextAdultsOnly && hasActivePlayer) {
    return refuse("quizshow_refresh_adults_lobby_joined", state, {
      withCursor: true,
    });
  }
  const playable = buildPlayableQuiz(quiz, random);
  state.quiz = playable.quiz;
  state.shuffledOrderOptions = playable.shuffledOrderOptions;
  state.sourceUpdatedAt = sourceUpdatedAt;
  // The demo keeps no separate scope 18+ flag, so it keeps the flag on once set.
  state.isAdultsOnly = state.isAdultsOnly || isNextAdultsOnly;
  state.wheelProgress = emptyWheelProgress();
  state.cursor = {
    ...state.cursor,
    ...progressCursorFields(playable.quiz.rounds, state.wheelProgress, "lobby"),
  };
  return succeed({ isNoop: false }, [{ kind: "state_reset" }]);
}

export const QUIZSHOW_ROSTER_PLAYER_HANDLERS: Record<
  "lobby:leave" | "reaction:send",
  QuizshowPlayerHandler
> = {
  "lobby:leave": leaveLobby,
  "reaction:send": sendReaction,
};

export const QUIZSHOW_ROSTER_HOST_HANDLERS: Record<
  | "host:renamePlayer"
  | "host:movePlayer"
  | "host:createTeams"
  | "host:setJoinLock"
  | "host:setAutoAdvance"
  | "host:notifyGuests"
  | "host:pairDevice"
  | "host:unpairDevice",
  QuizshowHostHandler
> = {
  "host:renamePlayer": hostRenamePlayer,
  "host:movePlayer": hostMovePlayer,
  "host:createTeams": hostCreateTeams,
  "host:setJoinLock": hostSetJoinLock,
  "host:setAutoAdvance": hostSetAutoAdvance,
  "host:notifyGuests": hostNotifyGuests,
  "host:pairDevice": hostPairDevice,
  "host:unpairDevice": hostUnpairDevice,
};
