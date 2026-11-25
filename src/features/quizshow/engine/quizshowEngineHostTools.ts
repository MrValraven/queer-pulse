/**
 * Pulse Live demo engine rescoring tools: a host accepting a typed answer,
 * changing the correct answer of a choice question, and adjusting an
 * entrant's points (contract 4.3, 6.4). Ports of the backend's
 * quizshow-engine-rescore.ts. The rescore itself is the scoring step's
 * `rescoreQuestion`. This module never imports the commands module:
 * refusals go through Setup's `ackFailure`.
 */
import {
  QUIZSHOW_LIMITS,
  type QuizshowAnswerKeyView,
  type QuizshowErrorCode,
} from "../../../shared/contracts/quizshow";
import { isQuizRoundKind } from "../quizshowWheel";
import type { QuizshowClientPayload } from "../realtime/quizshowFrames";
import { normaliseTypedAnswer } from "./quizshowScoring";
import {
  ackFailure,
  activePlayers,
  findPlayer,
  findTeam,
  isActivePlayer,
  roundAt,
  type QuizshowAckFailureExtras,
  type QuizshowEngineContext,
  type QuizshowPlayContext,
  currentPlayContext,
} from "./quizshowEngineSetup";
import {
  effectiveAnswerKey,
  rescoreQuestion,
} from "./quizshowEngineScoringStep";
import { totalsByEntrant } from "./quizshowEngineTransitions";
import type {
  QuizshowCommandResult,
  QuizshowEngineEffect,
  QuizshowEngineState,
  QuizshowHostFrameName,
  QuizshowHostHandler,
} from "./quizshowEngineTypes";

/** How many `host:adjustPoints` request ids a session remembers, so a retried tap applies once. */
const ADJUST_REQUEST_IDS_KEPT = 50;

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

function payloadAs<Name extends QuizshowHostFrameName>(
  payload: unknown,
): Partial<QuizshowClientPayload<Name>> {
  return typeof payload === "object" && payload !== null ? payload : {};
}

function textOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

type RescoreGate =
  | { context: QuizshowPlayContext; refusal: null }
  | { context: null; refusal: QuizshowCommandResult };

/**
 * A rescore names the cursor's phase id, or in `scores` the id of the reveal
 * it came from (contract 13): `typed:answers` carries the reveal's id, and
 * `scores` is entered from that question's reveal alone, so the transition
 * into the current `scores` phase names it. Backend `isRescorePhaseId` twin.
 */
function isRescorePhaseId(
  state: QuizshowEngineState,
  phaseId: unknown,
): boolean {
  if (phaseId === state.cursor.phaseId) return true;
  const lastTransition = state.lastTransition;
  return (
    state.cursor.phase === "scores" &&
    lastTransition !== null &&
    lastTransition.toPhaseId === state.cursor.phaseId &&
    lastTransition.fromPhaseId === phaseId
  );
}

/**
 * Contract 6.4 shared rule 1: the current phase id (or in `scores` the
 * reveal's), a running or paused session in `reveal` or `scores` of a quiz
 * round question; that question named; and a play scored on this night, so
 * its earlier streaks are known.
 */
function rescoreGate(
  state: QuizshowEngineState,
  phaseId: unknown,
  questionId: unknown,
): RescoreGate {
  const { cursor } = state;
  if (!isRescorePhaseId(state, phaseId)) {
    return { context: null, refusal: refuse("quizshow_stale_phase", state) };
  }
  const play = state.current;
  const round = play === null ? null : roundAt(state, play.roundIndex);
  const isRescorePhase =
    (cursor.status === "running" || cursor.status === "paused") &&
    (cursor.phase === "reveal" || cursor.phase === "scores");
  if (
    !isRescorePhase ||
    play === null ||
    round === null ||
    !isQuizRoundKind(round.kind) ||
    Object.keys(play.streakBeforeByPlayer).length === 0
  ) {
    return {
      context: null,
      refusal: refuse("quizshow_rescore_not_now", state),
    };
  }
  if (play.questionId !== questionId) {
    return {
      context: null,
      refusal: refuse("quizshow_wrong_question", state),
    };
  }
  return { context: currentPlayContext(state), refusal: null };
}

/**
 * `host:acceptAnswer` (contract 6.4 rule 2): a typed answer judged wrong
 * becomes right for everyone who wrote it, and the question is scored again.
 */
function hostAcceptAnswer(
  context: QuizshowEngineContext,
  payload: unknown,
): QuizshowCommandResult {
  const { state } = context;
  const input = payloadAs<"host:acceptAnswer">(payload);
  const gate = rescoreGate(state, input.phaseId, input.questionId);
  if (gate.context === null) return gate.refusal;
  const { play, question } = gate.context;
  if (question.type !== "type_answer") {
    return refuse("quizshow_accept_needs_typed_answer", state);
  }
  const normalisedText = textOf(input.normalisedText);
  // A repeated accept of a text already accepted (a retry or a second host tap) acks as a no-op (backend parity).
  if (normalisedText !== "" && play.acceptedTexts.includes(normalisedText)) {
    return succeed({ isNoop: true }, []);
  }
  // Coordinator ruling: the players the first scoring judged, minus host removals; one who left after it still counts.
  const matchingPlayerIds = Object.keys(play.streakBeforeByPlayer)
    .filter((playerId) => findPlayer(state, playerId)?.isRemoved === false)
    .filter((playerId) => {
      const answer = play.answers.find(
        (candidate) => candidate.playerId === playerId,
      );
      return (
        answer?.payload.type === "type_answer" &&
        normaliseTypedAnswer(answer.payload.text) === normalisedText
      );
    });
  if (normalisedText === "" || matchingPlayerIds.length === 0) {
    return refuse("quizshow_answer_text_not_found", state);
  }
  const isEveryMatchRight = matchingPlayerIds.every(
    (playerId) => play.myReveals[playerId]?.isCorrect === true,
  );
  if (isEveryMatchRight) {
    return refuse("quizshow_answer_already_correct", state);
  }
  play.acceptedTexts.push(normalisedText);
  const rescoreEffects = rescoreQuestion(context);
  // Contract 6.4 rule 6: the hosts' typed answers follow the reveal they changed.
  const revealIndex = rescoreEffects.findIndex(
    (effect) => effect.kind === "reveal_updated",
  );
  const effects: QuizshowEngineEffect[] = [
    ...rescoreEffects.slice(0, revealIndex + 1),
    { kind: "typed_answers_changed" },
    ...rescoreEffects.slice(revealIndex + 1),
  ];
  return succeed({ isNoop: false }, effects);
}

/** The key a change asks for, or the refusal (contract 6.4 rule 3); MC indexes come back unique and sorted. */
function changedKeyOf(
  questionType: string,
  optionCount: number,
  answer: unknown,
):
  | { key: QuizshowAnswerKeyView; refusal: null }
  | { key: null; refusal: QuizshowErrorCode } {
  if (questionType !== "multiple_choice" && questionType !== "true_false") {
    return { key: null, refusal: "quizshow_change_needs_choice_question" };
  }
  const change: { type?: unknown; correctIndexes?: unknown; isTrue?: unknown } =
    typeof answer === "object" && answer !== null ? answer : {};
  if (change.type !== questionType) {
    return { key: null, refusal: "quizshow_change_needs_choice_question" };
  }
  if (questionType === "true_false") {
    // The server's payload check refuses a missing value before the engine; the remote always sends one.
    return typeof change.isTrue === "boolean"
      ? { key: { type: "true_false", isTrue: change.isTrue }, refusal: null }
      : { key: null, refusal: "quizshow_correct_option_not_found" };
  }
  const indexes: unknown[] = Array.isArray(change.correctIndexes)
    ? change.correctIndexes
    : [];
  const shownIndexes = indexes.filter(
    (index): index is number =>
      typeof index === "number" &&
      Number.isInteger(index) &&
      index >= 0 &&
      index < optionCount,
  );
  if (indexes.length === 0 || shownIndexes.length !== indexes.length) {
    return { key: null, refusal: "quizshow_correct_option_not_found" };
  }
  const correctIndexes = [...new Set(shownIndexes)].sort(
    (left, right) => left - right,
  );
  if (correctIndexes.length >= optionCount) {
    return { key: null, refusal: "quizshow_every_option_correct" };
  }
  return {
    key: { type: "multiple_choice", correctIndexes },
    refusal: null,
  };
}

function isSameChoiceKey(
  left: QuizshowAnswerKeyView | null,
  right: QuizshowAnswerKeyView,
): boolean {
  if (left === null) return false;
  if (left.type === "true_false" && right.type === "true_false") {
    return left.isTrue === right.isTrue;
  }
  if (left.type === "multiple_choice" && right.type === "multiple_choice") {
    // The current key is sorted here too, so an unsorted stored key still compares equal (backend parity).
    const currentIndexes = [...left.correctIndexes].sort(
      (first, second) => first - second,
    );
    return (
      currentIndexes.length === right.correctIndexes.length &&
      currentIndexes.every(
        (index, position) => index === right.correctIndexes[position],
      )
    );
  }
  return false;
}

/**
 * `host:changeCorrectAnswer` (contract 6.4 rule 3): a multiple choice or true
 * or false question gets a new key, and the question is scored again. The key
 * it already has is a no-op.
 */
function hostChangeCorrectAnswer(
  context: QuizshowEngineContext,
  payload: unknown,
): QuizshowCommandResult {
  const { state } = context;
  const input = payloadAs<"host:changeCorrectAnswer">(payload);
  const gate = rescoreGate(state, input.phaseId, input.questionId);
  if (gate.context === null) return gate.refusal;
  const { play, question } = gate.context;
  const change = changedKeyOf(
    question.type,
    question.options.length,
    input.answer,
  );
  if (change.key === null) return refuse(change.refusal, state);
  if (isSameChoiceKey(effectiveAnswerKey(state, play), change.key)) {
    return succeed({ isNoop: true }, []);
  }
  play.keyOverride = change.key;
  return succeed({ isNoop: false }, rescoreQuestion(context));
}

/** The entrant a host adjusts: an active player in solo play, a team in teams play; null when there is none. */
function adjustTargetOf(
  state: QuizshowEngineState,
  entrantId: string,
): { score: number; memberIds: string[] } | null {
  if (state.playMode === "solo") {
    const player = findPlayer(state, entrantId);
    return player !== undefined && isActivePlayer(player)
      ? { score: player.score, memberIds: [player.playerId] }
      : null;
  }
  const team = findTeam(state, entrantId);
  if (team === undefined) return null;
  const memberIds = activePlayers(state)
    .filter((player) => player.teamId === team.teamId)
    .map((player) => player.playerId);
  return { score: team.score, memberIds };
}

/**
 * `host:adjustPoints` (contract 6.4): moves an entrant's total by `delta`
 * outside the question's own points, so a later rescore keeps it. Never below
 * 0; a request id seen among the last 50 is a no-op. On the scores or the
 * leaderboard the shown totals take the change at once.
 */
function hostAdjustPoints(
  { state }: QuizshowEngineContext,
  payload: unknown,
): QuizshowCommandResult {
  const { cursor } = state;
  const input = payloadAs<"host:adjustPoints">(payload);
  const { delta } = input;
  const requestId = textOf(input.requestId);
  // A retried tap is a no-op even after the phase moved on (coordinator ruling).
  if (requestId !== "" && state.adjustRequestIds.includes(requestId)) {
    return succeed({ isNoop: true }, []);
  }
  // The server's payload check refuses a zero, fractional or oversized delta before the engine; the remote never sends one.
  if (
    (cursor.status !== "running" && cursor.status !== "paused") ||
    cursor.phase === "podium" ||
    typeof delta !== "number" ||
    !Number.isInteger(delta) ||
    delta === 0 ||
    Math.abs(delta) > QUIZSHOW_LIMITS.adjustPointsMax
  ) {
    return refuse("quizshow_adjust_not_now", state);
  }
  const entrantId = textOf(input.entrantId);
  const target = adjustTargetOf(state, entrantId);
  if (target === null) return refuse("quizshow_entrant_not_found", state);
  const nextScore = target.score + delta;
  if (nextScore < 0) return refuse("quizshow_adjust_below_zero", state);
  if (state.playMode === "solo") {
    const player = findPlayer(state, entrantId);
    if (player !== undefined) player.score = nextScore;
  } else {
    const team = findTeam(state, entrantId);
    if (team !== undefined) team.score = nextScore;
  }
  if (requestId !== "") {
    state.adjustRequestIds = [...state.adjustRequestIds, requestId].slice(
      -ADJUST_REQUEST_IDS_KEPT,
    );
  }
  const effects: QuizshowEngineEffect[] = [];
  if (cursor.phase === "scores" || cursor.phase === "leaderboard") {
    state.scoresAtLastFrame = totalsByEntrant(state);
    effects.push({ kind: "scores_shown" });
  }
  effects.push({ kind: "lobby_changed" });
  if (target.memberIds.length > 0) {
    effects.push({ kind: "me_changed", playerIds: target.memberIds });
  }
  return succeed({ isNoop: false }, effects);
}

export const QUIZSHOW_HOST_TOOL_HANDLERS: Record<
  "host:acceptAnswer" | "host:changeCorrectAnswer" | "host:adjustPoints",
  QuizshowHostHandler
> = {
  "host:acceptAnswer": hostAcceptAnswer,
  "host:changeCorrectAnswer": hostChangeCorrectAnswer,
  "host:adjustPoints": hostAdjustPoints,
};
