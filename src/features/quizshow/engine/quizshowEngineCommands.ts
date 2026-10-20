/**
 * Pulse Live demo engine commands: every player frame (join, names, teams,
 * settings, the joker, answers and votes) and every host frame, with the
 * contract's refusals in the backend's order. Ports of the backend's
 * quizshow-engine-players.ts and the host commands of quizshow-engine-phases.ts.
 * The demo leaves out the blocked-term filter, rate limits and avatars.
 */
import {
  QUIZSHOW_LIMITS,
  type QuizshowAnswerPayload,
  type QuizshowErrorCode,
  type QuizshowMyAnswer,
  type QuizshowPhase,
  type QuizshowQuestion,
  type QuizshowRound,
  type QuizshowTeamColorKey,
} from "../../../shared/contracts/quizshow";
import type { QuizshowClientPayload } from "../realtime/quizshowFrames";
import { isFakeTooClose } from "./quizshowScoring";
import {
  ackFailure,
  activePlayers,
  currentPlayContext,
  findPlayer,
  findTeam,
  isEligible,
  isOpenStatus,
  isTimedPhase,
  mintId,
  ownDeadline,
  roundAt,
  setSessionStatus,
  shownOptionsOf,
  toMe,
  type QuizshowEngineContext,
} from "./quizshowEngineSetup";
import {
  answerById,
  answerOf,
  authorIdOf,
  awardFavourite,
  withdrawAnswerPoints,
} from "./quizshowEngineScoringStep";
import {
  QUIZSHOW_ENGINE_QUESTION_PHASES,
  abandonSession,
  afterQuestion,
  checkMovingCommand,
  closeIfEveryoneDone,
  closeTimedPhase,
  finishSession,
  isQuizRoundInPlay,
  openAnswers,
  openQuestion,
  openRoundIntro,
  refreshPodiumIfShown,
  refreshScoresIfShown,
  showPodium,
  showScores,
  startVote,
} from "./quizshowEngineTransitions";
import type {
  QuizshowCommandResult,
  QuizshowEngineAnswer,
  QuizshowEngineEffect,
  QuizshowEnginePlayer,
  QuizshowEngineQuestionPlay,
  QuizshowEngineState,
  QuizshowHostFrameName,
  QuizshowPlayerFrameName,
} from "./quizshowEngineTypes";

/** Too-close fakes a player may try per Lie Detector question; after these the question takes no more fakes from them. */
export const QUIZSHOW_TOO_CLOSE_FAKES_MAX = 3;

function succeed(
  success: object,
  effects: QuizshowEngineEffect[],
): QuizshowCommandResult {
  return { ack: { ok: true, ...success }, effects };
}

function refuse(
  code: QuizshowErrorCode,
  state: QuizshowEngineState,
): QuizshowCommandResult {
  return { ack: ackFailure(code, state), effects: [] };
}

function payloadAs<
  Name extends QuizshowPlayerFrameName | QuizshowHostFrameName,
>(payload: unknown): Partial<QuizshowClientPayload<Name>> {
  return typeof payload === "object" && payload !== null ? payload : {};
}

function textOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function teamNameKey(name: string): string {
  return name.trim().toLowerCase();
}

function isTeamFull(state: QuizshowEngineState, teamId: string): boolean {
  return (
    state.maxTeamSize !== null &&
    activePlayers(state).filter((player) => player.teamId === teamId).length >=
      state.maxTeamSize
  );
}

/** A team a player wants to found: a name, the session's team limit, a free name and a free colour. */
function newTeamRefusal(
  state: QuizshowEngineState,
  trimmedName: string,
  colorKey: QuizshowTeamColorKey,
): QuizshowErrorCode | null {
  if (trimmedName === "") return "quizshow_text_blank";
  if (state.teams.length >= QUIZSHOW_LIMITS.teamsPerSessionMax) {
    return "quizshow_team_limit";
  }
  const nameKey = teamNameKey(trimmedName);
  if (state.teams.some((team) => teamNameKey(team.name) === nameKey)) {
    return "quizshow_team_name_taken";
  }
  if (state.teams.some((team) => team.colorKey === colorKey)) {
    return "quizshow_team_color_taken";
  }
  return null;
}

function addTeam(
  state: QuizshowEngineState,
  trimmedName: string,
  colorKey: QuizshowTeamColorKey,
): string {
  const teamId = mintId(state, "team");
  state.teams.push({
    teamId,
    name: trimmedName,
    colorKey,
    score: 0,
    hasUsedJoker: false,
    jokerRoundIndex: null,
  });
  return teamId;
}

/** The team a joiner lands in, or the refusal; teams play only. */
function joinTeamOf(
  state: QuizshowEngineState,
  team: QuizshowClientPayload<"lobby:join">["team"] | undefined,
): { teamId: string | null; refusal: QuizshowErrorCode | null } {
  if (state.playMode === "solo") {
    return team === null || team === undefined
      ? { teamId: null, refusal: null }
      : { teamId: null, refusal: "quizshow_command_not_allowed" };
  }
  if (team === null || team === undefined) {
    return { teamId: null, refusal: "quizshow_team_required" };
  }
  if ("teamId" in team) {
    const pickedTeam = findTeam(state, team.teamId);
    if (pickedTeam === undefined) {
      return { teamId: null, refusal: "quizshow_team_not_found" };
    }
    if (isTeamFull(state, pickedTeam.teamId)) {
      return { teamId: null, refusal: "quizshow_team_full" };
    }
    return { teamId: pickedTeam.teamId, refusal: null };
  }
  if (state.cursor.status !== "lobby") {
    return { teamId: null, refusal: "quizshow_team_change_closed" };
  }
  const teamName = textOf(team.newTeam.name).trim();
  const refusal = newTeamRefusal(state, teamName, team.newTeam.colorKey);
  if (refusal !== null) return { teamId: null, refusal };
  return {
    teamId: addTeam(state, teamName, team.newTeam.colorKey),
    refusal: null,
  };
}

/**
 * `lobby:join`. A member who already has a row gets its `me` back unchanged;
 * a late joiner enters with `joinedAt = now` and plays from the next question.
 * A first join to an 18+ session needs `hasAcceptedAdultContent: true`; a
 * rejoin skips that check, as on the server.
 * The player's own room then gets a fresh `session:state`.
 */
function joinLobby(
  context: QuizshowEngineContext,
  memberKey: string,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  const { state } = context;
  const input = payloadAs<"lobby:join">(payload);
  const existingPlayer = state.players.find(
    (player) => player.memberKey === memberKey,
  );
  if (existingPlayer !== undefined) {
    if (existingPlayer.isRemoved)
      return refuse("quizshow_player_removed", state);
    return succeed({ me: toMe(state, existingPlayer.playerId) }, [
      { kind: "session_state", playerId: existingPlayer.playerId },
    ]);
  }
  if (state.isAdultsOnly && input.hasAcceptedAdultContent !== true) {
    return refuse("quizshow_adult_consent_required", state);
  }
  if (!isOpenStatus(state.cursor.status)) {
    return refuse("quizshow_session_finished", state);
  }
  if (activePlayers(state).length >= QUIZSHOW_LIMITS.playersPerSessionMax) {
    return refuse("quizshow_session_full", state);
  }
  const screenName = textOf(input.screenName).trim();
  if (screenName === "") return refuse("quizshow_text_blank", state);
  const teamChoice = joinTeamOf(state, input.team);
  if (teamChoice.refusal !== null) return refuse(teamChoice.refusal, state);
  const player: QuizshowEnginePlayer = {
    playerId: mintId(state, "player"),
    memberKey,
    screenName,
    teamId: teamChoice.teamId,
    isAvatarShown: input.isAvatarShown === true,
    hasExtraTime: input.hasExtraTime === true,
    isCohostPlayer: false,
    score: 0,
    streak: 0,
    hasUsedJoker: false,
    jokerRoundIndex: null,
    joinedAt: now,
    isRemoved: false,
  };
  state.players.push(player);
  return succeed({ me: toMe(state, player.playerId) }, [
    { kind: "lobby_changed" },
    { kind: "session_state", playerId: player.playerId },
  ]);
}

/** The effects of a change to one player's own row. */
function playerChanged(
  state: QuizshowEngineState,
  playerId: string,
): QuizshowCommandResult {
  return succeed({ me: toMe(state, playerId) }, [
    { kind: "lobby_changed" },
    { kind: "me_changed", playerIds: [playerId] },
  ]);
}

function unchanged(
  state: QuizshowEngineState,
  playerId: string,
): QuizshowCommandResult {
  return succeed({ me: toMe(state, playerId) }, []);
}

function setScreenName(
  { state }: QuizshowEngineContext,
  player: QuizshowEnginePlayer,
  payload: unknown,
): QuizshowCommandResult {
  if (state.cursor.status !== "lobby") {
    return refuse("quizshow_team_change_closed", state);
  }
  const screenName = textOf(
    payloadAs<"lobby:setName">(payload).screenName,
  ).trim();
  if (screenName === "") return refuse("quizshow_text_blank", state);
  if (screenName === player.screenName)
    return unchanged(state, player.playerId);
  player.screenName = screenName;
  return playerChanged(state, player.playerId);
}

function pickTeam(
  { state }: QuizshowEngineContext,
  player: QuizshowEnginePlayer,
  payload: unknown,
): QuizshowCommandResult {
  if (state.playMode === "solo") {
    return refuse("quizshow_command_not_allowed", state);
  }
  if (state.cursor.status !== "lobby") {
    return refuse("quizshow_team_change_closed", state);
  }
  const team = findTeam(
    state,
    textOf(payloadAs<"lobby:pickTeam">(payload).teamId),
  );
  if (team === undefined) return refuse("quizshow_team_not_found", state);
  if (player.teamId === team.teamId) return unchanged(state, player.playerId);
  if (isTeamFull(state, team.teamId))
    return refuse("quizshow_team_full", state);
  player.teamId = team.teamId;
  return playerChanged(state, player.playerId);
}

function createTeam(
  { state }: QuizshowEngineContext,
  player: QuizshowEnginePlayer,
  payload: unknown,
): QuizshowCommandResult {
  if (state.playMode === "solo") {
    return refuse("quizshow_command_not_allowed", state);
  }
  if (state.cursor.status !== "lobby") {
    return refuse("quizshow_team_change_closed", state);
  }
  const input = payloadAs<"lobby:createTeam">(payload);
  const teamName = textOf(input.name).trim();
  const colorKey = input.colorKey ?? "circle";
  // A double tap finds the player already in the team they asked for: ack it with their current me.
  const heldTeam =
    player.teamId === null ? undefined : findTeam(state, player.teamId);
  if (
    heldTeam !== undefined &&
    heldTeam.colorKey === colorKey &&
    teamNameKey(heldTeam.name) === teamNameKey(teamName)
  ) {
    return succeed(
      { me: toMe(state, player.playerId), teamId: heldTeam.teamId },
      [],
    );
  }
  const refusal = newTeamRefusal(state, teamName, colorKey);
  if (refusal !== null) return refuse(refusal, state);
  const teamId = addTeam(state, teamName, colorKey);
  player.teamId = teamId;
  return succeed({ me: toMe(state, player.playerId), teamId }, [
    { kind: "lobby_changed" },
    { kind: "me_changed", playerIds: [player.playerId] },
  ]);
}

function setExtraTime(
  { state }: QuizshowEngineContext,
  player: QuizshowEnginePlayer,
  payload: unknown,
): QuizshowCommandResult {
  const hasExtraTime =
    payloadAs<"settings:extraTime">(payload).hasExtraTime === true;
  if (player.hasExtraTime === hasExtraTime) {
    return unchanged(state, player.playerId);
  }
  player.hasExtraTime = hasExtraTime;
  return playerChanged(state, player.playerId);
}

function setAvatarShown(
  { state }: QuizshowEngineContext,
  player: QuizshowEnginePlayer,
  payload: unknown,
): QuizshowCommandResult {
  const isAvatarShown =
    payloadAs<"settings:avatar">(payload).isAvatarShown === true;
  if (player.isAvatarShown === isAvatarShown) {
    return unchanged(state, player.playerId);
  }
  player.isAvatarShown = isAvatarShown;
  return playerChanged(state, player.playerId);
}

/** The lobby for round 0, the intro of the round, or the leaderboard just before it. */
function isJokerMoment(
  state: QuizshowEngineState,
  roundIndex: number,
): boolean {
  const { phase, roundIndex: cursorRoundIndex } = state.cursor;
  if (phase === "lobby") return roundIndex === 0;
  if (phase === "round_intro") return cursorRoundIndex === roundIndex;
  if (phase === "leaderboard") {
    return cursorRoundIndex !== null && roundIndex === cursorRoundIndex + 1;
  }
  return false;
}

/** A double tap: the joker of the player (solo) or their team (teams) is already on this round, even when the moment has passed since. */
function isJokerAlreadyOnRound(
  state: QuizshowEngineState,
  player: QuizshowEnginePlayer,
  roundIndex: number,
): boolean {
  if (state.playMode === "solo") {
    return player.hasUsedJoker && player.jokerRoundIndex === roundIndex;
  }
  const team =
    player.teamId === null ? undefined : findTeam(state, player.teamId);
  return (
    team !== undefined &&
    team.hasUsedJoker &&
    team.jokerRoundIndex === roundIndex
  );
}

/** `joker:play`: once per player in solo play, once per team in teams play. */
function playJoker(
  { state }: QuizshowEngineContext,
  player: QuizshowEnginePlayer,
  payload: unknown,
): QuizshowCommandResult {
  const roundIndex = payloadAs<"joker:play">(payload).roundIndex ?? -1;
  if (isJokerAlreadyOnRound(state, player, roundIndex)) {
    return unchanged(state, player.playerId);
  }
  const round = roundAt(state, roundIndex);
  if (
    round === null ||
    !round.settings.isJokerAllowed ||
    !isJokerMoment(state, roundIndex)
  ) {
    return refuse("quizshow_joker_not_allowed", state);
  }
  if (state.playMode === "solo") {
    if (player.hasUsedJoker) return refuse("quizshow_joker_used", state);
    player.hasUsedJoker = true;
    player.jokerRoundIndex = roundIndex;
    return playerChanged(state, player.playerId);
  }
  const team =
    player.teamId === null ? undefined : findTeam(state, player.teamId);
  if (team === undefined) return refuse("quizshow_joker_not_allowed", state);
  if (team.hasUsedJoker) return refuse("quizshow_joker_used", state);
  team.hasUsedJoker = true;
  team.jokerRoundIndex = roundIndex;
  const memberIds = activePlayers(state)
    .filter((member) => member.teamId === team.teamId)
    .map((member) => member.playerId);
  return succeed({ me: toMe(state, player.playerId) }, [
    { kind: "lobby_changed" },
    { kind: "me_changed", playerIds: memberIds },
  ]);
}

function toMyAnswer(answer: QuizshowEngineAnswer): QuizshowMyAnswer {
  return {
    questionId: answer.questionId,
    phaseId: answer.phaseId,
    payload: answer.payload,
    receivedAt: answer.receivedAt,
  };
}

/**
 * The checks answers and votes share once the duplicate check passed: the
 * phase id, a running session in the accepting phase, the question in play,
 * eligibility and the player's own deadline plus grace.
 */
function submissionRefusal(
  state: QuizshowEngineState,
  playerId: string,
  input: { phaseId?: unknown; questionId?: unknown },
  acceptingPhases: readonly QuizshowPhase[],
  now: number,
): QuizshowErrorCode | null {
  if (input.phaseId !== state.cursor.phaseId) return "quizshow_stale_phase";
  if (
    state.cursor.status !== "running" ||
    !acceptingPhases.includes(state.cursor.phase)
  ) {
    return "quizshow_phase_closed";
  }
  if (state.current === null || state.current.questionId !== input.questionId) {
    return "quizshow_wrong_question";
  }
  if (!isEligible(state, playerId)) return "quizshow_not_eligible";
  const deadline = ownDeadline(state, playerId);
  if (deadline !== null && now > deadline + QUIZSHOW_LIMITS.answerGraceMs) {
    return "quizshow_phase_closed";
  }
  return null;
}

function isPermutationOf(
  orderedIds: readonly unknown[],
  shownIds: readonly string[],
): boolean {
  if (orderedIds.length !== shownIds.length) return false;
  const remaining = new Set(shownIds);
  for (const optionId of orderedIds) {
    if (typeof optionId !== "string" || !remaining.delete(optionId))
      return false;
  }
  return remaining.size === 0;
}

type PayloadCheck =
  | { payload: QuizshowAnswerPayload; refusal: null }
  | { payload: null; refusal: QuizshowErrorCode };

const INVALID_ANSWER: PayloadCheck = {
  payload: null,
  refusal: "quizshow_invalid_answer",
};

/** Typed and party text: trimmed and refused when blank, and on Lie Detector refused when too close to the truth. */
function checkTextPayload(
  round: QuizshowRound,
  question: QuizshowQuestion,
  type: "type_answer" | "prompt",
  rawText: unknown,
): PayloadCheck {
  if (typeof rawText !== "string") return INVALID_ANSWER;
  const text = rawText.trim();
  if (text === "") return { payload: null, refusal: "quizshow_text_blank" };
  if (
    type === "prompt" &&
    round.kind === "lie_detector" &&
    question.type === "prompt" &&
    question.answer !== null &&
    isFakeTooClose(text, question.answer.truth)
  ) {
    return { payload: null, refusal: "quizshow_fake_too_close" };
  }
  return { payload: { type, text }, refusal: null };
}

/** Checks a payload against the question in play and returns it as stored. */
function checkAnswerPayload(
  state: QuizshowEngineState,
  round: QuizshowRound,
  question: QuizshowQuestion,
  payload: unknown,
): PayloadCheck {
  if (typeof payload !== "object" || payload === null) return INVALID_ANSWER;
  const candidate = payload as Partial<Record<string, unknown>>;
  if (candidate.type !== question.type) return INVALID_ANSWER;
  const shownOptions = shownOptionsOf(state, question) ?? [];
  switch (question.type) {
    case "multiple_choice": {
      const optionIndex = candidate.optionIndex;
      return typeof optionIndex === "number" &&
        Number.isInteger(optionIndex) &&
        optionIndex >= 0 &&
        optionIndex < shownOptions.length
        ? { payload: { type: "multiple_choice", optionIndex }, refusal: null }
        : INVALID_ANSWER;
    }
    case "true_false":
      return typeof candidate.isTrue === "boolean"
        ? {
            payload: { type: "true_false", isTrue: candidate.isTrue },
            refusal: null,
          }
        : INVALID_ANSWER;
    case "order": {
      const orderedIds = candidate.orderedIds;
      return Array.isArray(orderedIds) &&
        isPermutationOf(
          orderedIds,
          shownOptions.map((option) => option.id),
        )
        ? {
            payload: { type: "order", orderedIds: orderedIds.map(String) },
            refusal: null,
          }
        : INVALID_ANSWER;
    }
    case "closest_number": {
      const value = candidate.value;
      return typeof value === "number" &&
        Number.isFinite(value) &&
        Math.abs(value) <= QUIZSHOW_LIMITS.numberAbsMax
        ? { payload: { type: "closest_number", value }, refusal: null }
        : INVALID_ANSWER;
    }
    case "type_answer":
    case "prompt":
      return checkTextPayload(round, question, question.type, candidate.text);
  }
}

/** `answer:submit`: the first answer per player per question wins and is never stored when refused. */
function submitAnswer(
  context: QuizshowEngineContext,
  player: QuizshowEnginePlayer,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  const { state } = context;
  const input = payloadAs<"answer:submit">(payload);
  const current = state.current;
  const storedAnswer =
    current !== null && current.questionId === input.questionId
      ? answerOf(current, player.playerId)
      : undefined;
  if (storedAnswer !== undefined) {
    return succeed({ answer: toMyAnswer(storedAnswer), isDuplicate: true }, []);
  }
  const refusal = submissionRefusal(
    state,
    player.playerId,
    input,
    ["open", "write"],
    now,
  );
  if (refusal !== null) return refuse(refusal, state);
  const { play, round, question } = currentPlayContext(state);
  const payloadCheck = checkAnswerPayload(
    state,
    round,
    question,
    input.payload,
  );
  if (payloadCheck.refusal === "quizshow_fake_too_close") {
    // The refusal is kept (the reducer returns this state), so probing stops after the third hit.
    const fakeCounts = play.tooCloseFakeCounts ?? {};
    play.tooCloseFakeCounts = {
      ...fakeCounts,
      [player.playerId]: (fakeCounts[player.playerId] ?? 0) + 1,
    };
    return refuse("quizshow_fake_too_close", state);
  }
  if (payloadCheck.payload === null) return refuse(payloadCheck.refusal, state);
  const isFakeLockedOut =
    round.kind === "lie_detector" &&
    (play.tooCloseFakeCounts?.[player.playerId] ?? 0) >=
      QUIZSHOW_TOO_CLOSE_FAKES_MAX;
  if (isFakeLockedOut) return refuse("quizshow_fake_too_close", state);
  const answer: QuizshowEngineAnswer = {
    answerId: mintId(state, "answer"),
    playerId: player.playerId,
    questionId: play.questionId,
    phaseId: state.cursor.phaseId,
    payload: payloadCheck.payload,
    receivedAt: now,
    elapsedMs:
      question.type === "prompt"
        ? null
        : now - (state.cursor.phaseStartedAt ?? now),
    isHidden: false,
    pointsAwarded: 0,
  };
  play.answers.push(answer);
  const myAnswer = toMyAnswer(answer);
  return succeed({ answer: myAnswer, isDuplicate: false }, [
    { kind: "answer_accepted", playerId: player.playerId, answer: myAnswer },
    { kind: "answer_count_changed" },
    ...closeIfEveryoneDone(context, now),
  ]);
}

/** `vote:submit`: one vote per player per question, for a visible option the voter did not write. */
function submitVote(
  context: QuizshowEngineContext,
  player: QuizshowEnginePlayer,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  const { state } = context;
  const input = payloadAs<"vote:submit">(payload);
  const current = state.current;
  if (current !== null && current.questionId === input.questionId) {
    const storedVote = current.votes.find(
      (vote) => vote.voterPlayerId === player.playerId,
    );
    if (storedVote !== undefined) {
      return succeed(
        {
          vote: {
            questionId: current.questionId,
            optionId: storedVote.optionId,
          },
          isDuplicate: true,
        },
        [],
      );
    }
  }
  const refusal = submissionRefusal(
    state,
    player.playerId,
    input,
    ["vote"],
    now,
  );
  if (refusal !== null || current === null) {
    return refuse(refusal ?? "quizshow_wrong_question", state);
  }
  const option = (current.voteOptions ?? []).find(
    (voteOption) => voteOption.optionId === input.optionId,
  );
  const isHiddenOption =
    option?.answerId !== null &&
    option?.answerId !== undefined &&
    answerById(current, option.answerId)?.isHidden === true;
  if (option === undefined || isHiddenOption) {
    return refuse("quizshow_vote_option_not_found", state);
  }
  if (authorIdOf(current, option) === player.playerId) {
    return refuse("quizshow_own_answer_vote", state);
  }
  current.votes.push({
    voterPlayerId: player.playerId,
    optionId: option.optionId,
  });
  return succeed(
    {
      vote: { questionId: current.questionId, optionId: option.optionId },
      isDuplicate: false,
    },
    [{ kind: "answer_count_changed" }, ...closeIfEveryoneDone(context, now)],
  );
}

type PlayerHandler = (
  context: QuizshowEngineContext,
  player: QuizshowEnginePlayer,
  payload: unknown,
  now: number,
) => QuizshowCommandResult;

const PLAYER_HANDLERS: Record<
  Exclude<QuizshowPlayerFrameName, "lobby:join">,
  PlayerHandler
> = {
  "lobby:setName": setScreenName,
  "lobby:pickTeam": pickTeam,
  "lobby:createTeam": createTeam,
  "settings:extraTime": setExtraTime,
  "settings:avatar": setAvatarShown,
  "answer:submit": submitAnswer,
  "vote:submit": submitVote,
  "joker:play": playJoker,
};

/** A player frame from the member behind `memberKey`: unknown members have not joined, removed ones stay out. */
export function runPlayerCommand(
  context: QuizshowEngineContext,
  memberKey: string,
  name: QuizshowPlayerFrameName,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  if (name === "lobby:join") return joinLobby(context, memberKey, payload, now);
  const { state } = context;
  const player = state.players.find(
    (candidate) => candidate.memberKey === memberKey,
  );
  if (player === undefined) return refuse("quizshow_not_joined", state);
  if (player.isRemoved) return refuse("quizshow_player_removed", state);
  return PLAYER_HANDLERS[name](context, player, payload, now);
}

/** A host command that acted or was a no-op; `lastHostCommandAt` is kept for parity only, the demo has no idle clock. */
function hostActed(
  state: QuizshowEngineState,
  now: number,
  effects: QuizshowEngineEffect[],
  isNoop: boolean,
): QuizshowCommandResult {
  state.lastHostCommandAt = now;
  return succeed({ isNoop }, effects);
}

/** The stale and no-op answer of a moving command, or null when it acts. */
function movingRefusal(
  state: QuizshowEngineState,
  payload: unknown,
  now: number,
): QuizshowCommandResult | null {
  const movingCheck = checkMovingCommand(
    state,
    textOf(payloadAs<"host:next">(payload).phaseId),
  );
  if (movingCheck === "stale") return refuse("quizshow_stale_phase", state);
  if (movingCheck === "noop") return hostActed(state, now, [], true);
  return null;
}

function hostStart(
  context: QuizshowEngineContext,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  const { state } = context;
  const earlyAnswer = movingRefusal(state, payload, now);
  if (earlyAnswer !== null) return earlyAnswer;
  if (state.cursor.status !== "lobby") {
    return refuse("quizshow_command_not_allowed", state);
  }
  const players = activePlayers(state);
  if (players.length === 0) return refuse("quizshow_no_players", state);
  const effects: QuizshowEngineEffect[] = [];
  const keptTeams = state.teams.filter((team) =>
    players.some((player) => player.teamId === team.teamId),
  );
  if (keptTeams.length !== state.teams.length) {
    state.teams = keptTeams;
    effects.push({ kind: "lobby_changed" });
  }
  setSessionStatus(state, "running");
  effects.push(...openRoundIntro(state, 0, now));
  return hostActed(state, now, effects, false);
}

/** What `host:next` does in the current phase; null where it is not allowed. */
function nextEffects(
  context: QuizshowEngineContext,
  now: number,
): QuizshowEngineEffect[] | null {
  const { state } = context;
  const { phase, roundIndex } = state.cursor;
  switch (phase) {
    case "round_intro":
      return roundIndex === null
        ? null
        : openQuestion(state, roundIndex, 0, now);
    case "read":
      return openAnswers(state, now);
    case "open":
    case "write":
    case "vote":
      return closeTimedPhase(context, now, false);
    case "review":
      return startVote(context, now);
    case "reveal":
      return isQuizRoundInPlay(state)
        ? showScores(state, "scores", "question", now)
        : afterQuestion(state, now);
    case "scores":
      return afterQuestion(state, now);
    case "leaderboard":
      return roundIndex === null
        ? null
        : openRoundIntro(state, roundIndex + 1, now);
    case "podium":
      return finishSession(state, now);
    default:
      return null;
  }
}

function hostNext(
  context: QuizshowEngineContext,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  const { state } = context;
  const earlyAnswer = movingRefusal(state, payload, now);
  if (earlyAnswer !== null) return earlyAnswer;
  if (state.cursor.status !== "running") {
    return refuse("quizshow_command_not_allowed", state);
  }
  const effects = nextEffects(context, now);
  if (effects === null) return refuse("quizshow_command_not_allowed", state);
  return hostActed(state, now, effects, false);
}

function hostPause(
  { state }: QuizshowEngineContext,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  const { cursor } = state;
  if (payloadAs<"host:pause">(payload).phaseId !== cursor.phaseId) {
    return refuse("quizshow_stale_phase", state);
  }
  if (cursor.status === "paused") return hostActed(state, now, [], true);
  if (
    cursor.status !== "running" ||
    cursor.phase === "lobby" ||
    cursor.phase === "ended"
  ) {
    return refuse("quizshow_command_not_allowed", state);
  }
  state.pausedAt = now;
  if (isTimedPhase(cursor.phase) && cursor.deadline !== null) {
    // Signed: a pause past the deadline keeps the overrun, so no fresh grace after resume.
    cursor.pausedRemainingMs = cursor.deadline - now;
    cursor.pausedExtraTimeRemainingMs =
      cursor.extraTimeDeadline === null ? null : cursor.extraTimeDeadline - now;
    cursor.deadline = null;
    cursor.extraTimeDeadline = null;
  }
  setSessionStatus(state, "paused");
  return hostActed(state, now, [{ kind: "phase_changed" }], false);
}

/** Restores the frozen time; `phaseStartedAt` moves forward by the paused span so speed points count unpaused time. */
function hostResume(
  { state }: QuizshowEngineContext,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  const { cursor } = state;
  if (payloadAs<"host:resume">(payload).phaseId !== cursor.phaseId) {
    return refuse("quizshow_stale_phase", state);
  }
  if (cursor.status === "running") return hostActed(state, now, [], true);
  if (cursor.status !== "paused") {
    return refuse("quizshow_command_not_allowed", state);
  }
  const pausedAt = state.pausedAt ?? now;
  if (cursor.phaseStartedAt !== null) cursor.phaseStartedAt += now - pausedAt;
  if (cursor.pausedRemainingMs !== null) {
    cursor.deadline = now + cursor.pausedRemainingMs;
    cursor.extraTimeDeadline =
      cursor.pausedExtraTimeRemainingMs === null
        ? null
        : now + cursor.pausedExtraTimeRemainingMs;
  }
  cursor.pausedRemainingMs = null;
  cursor.pausedExtraTimeRemainingMs = null;
  cursor.isRestartRecovery = false;
  state.pausedAt = null;
  setSessionStatus(state, "running");
  return hostActed(state, now, [{ kind: "phase_changed" }], false);
}

/** Adds time once: only a command naming the current deadline acts, so a double tap or a second remote is a no-op. */
function hostAddTime(
  { state }: QuizshowEngineContext,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  const { cursor } = state;
  const input = payloadAs<"host:addTime">(payload);
  if (input.phaseId !== cursor.phaseId) {
    return refuse("quizshow_stale_phase", state);
  }
  const { seconds } = input;
  const isSecondsAllowed =
    typeof seconds === "number" &&
    Number.isInteger(seconds) &&
    seconds >= QUIZSHOW_LIMITS.addTimeSecondsMin &&
    seconds <= QUIZSHOW_LIMITS.addTimeSecondsMax;
  if (
    cursor.status !== "running" ||
    !isTimedPhase(cursor.phase) ||
    !isSecondsAllowed
  ) {
    return refuse("quizshow_command_not_allowed", state);
  }
  if (cursor.deadline === null || input.expectedDeadline !== cursor.deadline) {
    return hostActed(state, now, [], true);
  }
  const addedMs = seconds * 1000;
  cursor.deadline += addedMs;
  if (cursor.extraTimeDeadline !== null) cursor.extraTimeDeadline += addedMs;
  return hostActed(state, now, [{ kind: "phase_changed" }], false);
}

function hostReveal(
  context: QuizshowEngineContext,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  const { state } = context;
  const earlyAnswer = movingRefusal(state, payload, now);
  if (earlyAnswer !== null) return earlyAnswer;
  const { phase, status } = state.cursor;
  if (status !== "running" || (phase !== "open" && phase !== "vote")) {
    return refuse("quizshow_command_not_allowed", state);
  }
  return hostActed(state, now, closeTimedPhase(context, now, false), false);
}

/** A question phase moves on with no score and no streak change; a quiz reveal skips its scores. */
function hostSkip(
  context: QuizshowEngineContext,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  const { state } = context;
  const earlyAnswer = movingRefusal(state, payload, now);
  if (earlyAnswer !== null) return earlyAnswer;
  if (state.cursor.status !== "running") {
    return refuse("quizshow_command_not_allowed", state);
  }
  const { phase } = state.cursor;
  const play = state.current;
  if (QUIZSHOW_ENGINE_QUESTION_PHASES.includes(phase) && play !== null) {
    play.wasSkipped = true;
    return hostActed(state, now, afterQuestion(state, now), false);
  }
  if (phase === "reveal" && isQuizRoundInPlay(state)) {
    return hostActed(state, now, afterQuestion(state, now), false);
  }
  return refuse("quizshow_command_not_allowed", state);
}

function hostShowAnswers(
  context: QuizshowEngineContext,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  const { state } = context;
  const earlyAnswer = movingRefusal(state, payload, now);
  if (earlyAnswer !== null) return earlyAnswer;
  if (state.cursor.status !== "running" || state.cursor.phase !== "review") {
    return refuse("quizshow_command_not_allowed", state);
  }
  return hostActed(state, now, startVote(context, now), false);
}

function isPromptQuestionInPlay(
  state: QuizshowEngineState,
  play: QuizshowEngineQuestionPlay,
): boolean {
  const round = roundAt(state, play.roundIndex);
  const question = round?.questions[play.questionIndex];
  return question !== undefined && question.type === "prompt";
}

/**
 * Hides one answer of the question in play: in `review` the hosts' list
 * changes; from `vote` on every audience drops the option, and once scored
 * its author loses what it earned.
 */
function hideAnswerInPlay(
  state: QuizshowEngineState,
  play: QuizshowEngineQuestionPlay,
  answer: QuizshowEngineAnswer,
): QuizshowEngineEffect[] {
  answer.isHidden = true;
  const hidden = {
    questionId: play.questionId,
    answerId: answer.answerId,
    optionId: null,
  };
  if (state.cursor.phase === "review") {
    return [
      { kind: "review_list_changed" },
      { kind: "answer_hidden", hidden, isForEveryAudience: false },
    ];
  }
  if (play.voteOptions === null) return [];
  const option = play.voteOptions.find(
    (voteOption) => voteOption.answerId === answer.answerId,
  );
  if (option !== undefined && play.favouriteOptionId === option.optionId) {
    play.favouriteOptionId = null;
  }
  const effects: QuizshowEngineEffect[] = [
    {
      kind: "answer_hidden",
      hidden: { ...hidden, optionId: option?.optionId ?? null },
      isForEveryAudience: true,
    },
  ];
  if (!play.isScored) return effects;
  withdrawAnswerPoints(state, play, answer);
  // The backend re-sends only `reveal` after a hide, so no `reveal:mine` goes out.
  effects.push({ kind: "reveal_updated", playerIds: [] });
  effects.push(...refreshScoresIfShown(state));
  return effects;
}

function hostHideAnswer(
  { state }: QuizshowEngineContext,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  if (!isOpenStatus(state.cursor.status)) {
    return refuse("quizshow_command_not_allowed", state);
  }
  const input = payloadAs<"host:hideAnswer">(payload);
  const play = state.current;
  const answer =
    play === null ? undefined : answerById(play, textOf(input.answerId));
  if (
    play === null ||
    answer === undefined ||
    !isPromptQuestionInPlay(state, play)
  ) {
    return refuse("quizshow_answer_not_found", state);
  }
  const isHidden = input.isHidden === true;
  const isAuthorRemoved =
    findPlayer(state, answer.playerId)?.isRemoved === true;
  if (!isHidden && (state.cursor.phase !== "review" || isAuthorRemoved)) {
    return refuse("quizshow_command_not_allowed", state);
  }
  if (answer.isHidden === isHidden) return hostActed(state, now, [], true);
  if (!isHidden) {
    answer.isHidden = false;
    return hostActed(state, now, [{ kind: "review_list_changed" }], false);
  }
  return hostActed(
    state,
    now,
    [...hideAnswerInPlay(state, play, answer), ...refreshPodiumIfShown(state)],
    false,
  );
}

/** Party `reveal` of Caption This or Drag Name: the first pick wins and pays its author. */
function hostPickFavourite(
  { state }: QuizshowEngineContext,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  const input = payloadAs<"host:pickFavourite">(payload);
  if (input.phaseId !== state.cursor.phaseId) {
    return refuse("quizshow_stale_phase", state);
  }
  const play = state.current;
  const round = play === null ? null : roundAt(state, play.roundIndex);
  if (
    state.cursor.status !== "running" ||
    state.cursor.phase !== "reveal" ||
    play === null ||
    round === null ||
    (round.kind !== "caption_this" && round.kind !== "drag_name")
  ) {
    return refuse("quizshow_command_not_allowed", state);
  }
  if (input.questionId !== play.questionId) {
    return refuse("quizshow_wrong_question", state);
  }
  if (play.favouriteOptionId !== null) return hostActed(state, now, [], true);
  const option = play.voteOptions?.find(
    (voteOption) => voteOption.optionId === input.optionId,
  );
  const answer =
    option === undefined || option.answerId === null
      ? undefined
      : answerById(play, option.answerId);
  if (
    option === undefined ||
    option.isTruth ||
    answer === undefined ||
    answer.isHidden
  ) {
    return refuse("quizshow_vote_option_not_found", state);
  }
  play.favouriteOptionId = option.optionId;
  awardFavourite(state, play, answer);
  return hostActed(
    state,
    now,
    [{ kind: "reveal_updated", playerIds: [answer.playerId] }],
    false,
  );
}

/** Removes a player for the rest of the session, hides their party answer in play and closes the phase when they were the last to submit. */
function hostRemovePlayer(
  context: QuizshowEngineContext,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  const { state } = context;
  const playerId = textOf(payloadAs<"host:removePlayer">(payload).playerId);
  const player = findPlayer(state, playerId);
  if (player === undefined) return refuse("quizshow_player_not_found", state);
  if (!isOpenStatus(state.cursor.status)) {
    return refuse("quizshow_command_not_allowed", state);
  }
  if (player.isRemoved) return hostActed(state, now, [], true);
  player.isRemoved = true;
  const effects: QuizshowEngineEffect[] = [];
  const play = state.current;
  const answer = play === null ? undefined : answerOf(play, playerId);
  if (
    play !== null &&
    answer !== undefined &&
    !answer.isHidden &&
    isPromptQuestionInPlay(state, play)
  ) {
    effects.push(...hideAnswerInPlay(state, play, answer));
  }
  effects.push(
    { kind: "player_removed", playerId },
    { kind: "lobby_changed" },
    ...refreshPodiumIfShown(state),
    ...closeIfEveryoneDone(context, now),
  );
  return hostActed(state, now, effects, false);
}

function hostRenameTeam(
  { state }: QuizshowEngineContext,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  const input = payloadAs<"host:renameTeam">(payload);
  const team = findTeam(state, textOf(input.teamId));
  if (team === undefined) return refuse("quizshow_team_not_found", state);
  if (!isOpenStatus(state.cursor.status)) {
    return refuse("quizshow_command_not_allowed", state);
  }
  const name = textOf(input.name).trim();
  if (name === "") return refuse("quizshow_text_blank", state);
  const isNameTaken = state.teams.some(
    (otherTeam) =>
      otherTeam.teamId !== team.teamId &&
      teamNameKey(otherTeam.name) === teamNameKey(name),
  );
  if (isNameTaken) return refuse("quizshow_team_name_taken", state);
  if (name === team.name) return hostActed(state, now, [], true);
  team.name = name;
  const memberIds = activePlayers(state)
    .filter((player) => player.teamId === team.teamId)
    .map((player) => player.playerId);
  return hostActed(
    state,
    now,
    [{ kind: "lobby_changed" }, { kind: "me_changed", playerIds: memberIds }],
    false,
  );
}

/** From the podium the night finishes; with no scored question it is abandoned; otherwise it jumps to the podium. */
function hostEnd(
  { state }: QuizshowEngineContext,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  const earlyAnswer = movingRefusal(state, payload, now);
  if (earlyAnswer !== null) return earlyAnswer;
  if (!isOpenStatus(state.cursor.status)) {
    return refuse("quizshow_command_not_allowed", state);
  }
  if (state.cursor.phase === "podium") {
    return hostActed(state, now, finishSession(state, now), false);
  }
  if (state.cursor.status === "lobby" || !state.hasScoredQuestion) {
    return hostActed(state, now, abandonSession(state, now), false);
  }
  return hostActed(state, now, showPodium(state, now), false);
}

/** Coordinator 2026-10-19: any open status; an unchanged value is a no-op; a change reaches the screen and the hosts. */
function hostSetScreenMuted(
  { state }: QuizshowEngineContext,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  if (!isOpenStatus(state.cursor.status)) {
    return refuse("quizshow_command_not_allowed", state);
  }
  const isMuted = payloadAs<"host:setScreenMuted">(payload).isMuted === true;
  if (state.isScreenMuted === isMuted) return hostActed(state, now, [], true);
  state.isScreenMuted = isMuted;
  return hostActed(state, now, [{ kind: "screen_muted" }], false);
}

type HostHandler = (
  context: QuizshowEngineContext,
  payload: unknown,
  now: number,
) => QuizshowCommandResult;

const HOST_HANDLERS: Record<QuizshowHostFrameName, HostHandler> = {
  "host:start": hostStart,
  "host:next": hostNext,
  "host:pause": hostPause,
  "host:resume": hostResume,
  "host:addTime": hostAddTime,
  "host:reveal": hostReveal,
  "host:skip": hostSkip,
  "host:showAnswers": hostShowAnswers,
  "host:hideAnswer": hostHideAnswer,
  "host:pickFavourite": hostPickFavourite,
  "host:removePlayer": hostRemovePlayer,
  "host:renameTeam": hostRenameTeam,
  "host:end": hostEnd,
  "host:setScreenMuted": hostSetScreenMuted,
};

export function runHostCommand(
  context: QuizshowEngineContext,
  name: QuizshowHostFrameName,
  payload: unknown,
  now: number,
): QuizshowCommandResult {
  // Every attempt, refused or not, moves `lastHostCommandAt`: kept for parity only; the demo has no idle clock.
  context.state.lastHostCommandAt = now;
  return HOST_HANDLERS[name](context, payload, now);
}
