/**
 * Pulse Live demo engine phase machine: opening questions, closing timed
 * phases, review and vote, reveal, scores, leaderboard, podium, the end of the
 * night, abandonment and the clock. Ports of the backend's
 * quizshow-engine-phases.ts bodies; timers are ticks here.
 */
import {
  QUIZSHOW_LIMITS,
  type QuizshowPhase,
  type QuizshowPodiumEntry,
  type QuizshowScoresScope,
} from "../../../shared/contracts/quizshow";
import { competitionRanks } from "./quizshowScoring";
import {
  activePlayers,
  advanceCursor,
  currentPlayContext,
  entrantTotals,
  extraTimeMs,
  findPlayer,
  isLastQuestionOfRound,
  isLastRound,
  isOpenStatus,
  isPartyRoundKind,
  mintId,
  openLimitMs,
  ownDeadline,
  questionAt,
  roundAt,
  setSessionStatus,
  voteLimitMs,
  writeLimitMs,
  type QuizshowEngineContext,
} from "./quizshowEngineSetup";
import { scoreQuestionOnce } from "./quizshowEngineScoringStep";
import type {
  QuizshowEngineEffect,
  QuizshowEngineQuestionPlay,
  QuizshowEngineState,
  QuizshowEngineVoteOption,
} from "./quizshowEngineTypes";

/** Phases that belong to one question before its reveal. */
export const QUIZSHOW_ENGINE_QUESTION_PHASES: readonly QuizshowPhase[] = [
  "read",
  "open",
  "write",
  "review",
  "vote",
];

/** Phases that take answers or votes and close early once everyone is done. */
const SUBMISSION_PHASES: readonly QuizshowPhase[] = ["open", "write", "vote"];

/** The no-op and stale rule shared by every moving command. */
export function checkMovingCommand(
  state: QuizshowEngineState,
  phaseId: string,
): "act" | "noop" | "stale" {
  if (phaseId === state.cursor.phaseId) return "act";
  if (state.lastTransition?.fromPhaseId === phaseId) return "noop";
  return "stale";
}

export function isQuizRoundInPlay(state: QuizshowEngineState): boolean {
  const roundIndex = state.cursor.roundIndex ?? state.current?.roundIndex;
  if (roundIndex === undefined) return false;
  const round = roundAt(state, roundIndex);
  return round !== null && !isPartyRoundKind(round.kind);
}

/** Eligible, still active, and without an answer (`open`, `write`) or a vote (`vote`) for the current question. */
function isStillToSubmit(
  state: QuizshowEngineState,
  playerId: string,
): boolean {
  const play = state.current;
  if (play === null || !play.eligiblePlayerIds.includes(playerId)) return false;
  const player = findPlayer(state, playerId);
  if (player === undefined || player.isRemoved) return false;
  return state.cursor.phase === "vote"
    ? !play.votes.some((vote) => vote.voterPlayerId === playerId)
    : !play.answers.some((answer) => answer.playerId === playerId);
}

/** Still to submit and still allowed to: their own deadline plus the grace has not passed. */
function isAwaitedSubmitter(
  state: QuizshowEngineState,
  playerId: string,
  now: number,
): boolean {
  if (!isStillToSubmit(state, playerId)) return false;
  const deadline = ownDeadline(state, playerId);
  return deadline === null || now <= deadline + QUIZSHOW_LIMITS.answerGraceMs;
}

/** Opens a question at its first phase and freezes who may play it. */
export function openQuestion(
  state: QuizshowEngineState,
  roundIndex: number,
  questionIndex: number,
  now: number,
): QuizshowEngineEffect[] {
  const round = roundAt(state, roundIndex);
  const question = questionAt(state, roundIndex, questionIndex);
  if (round === null || question === null) {
    throw new Error(
      `Pulse Live demo ${state.sessionId} has no question ${roundIndex}.${questionIndex}.`,
    );
  }
  const eligiblePlayers = activePlayers(state);
  state.current = {
    questionId: question.id,
    roundIndex,
    questionIndex,
    eligiblePlayerIds: eligiblePlayers.map((player) => player.playerId),
    extraTimePlayerIds: eligiblePlayers
      .filter((player) => player.hasExtraTime)
      .map((player) => player.playerId),
    answers: [],
    votes: [],
    voteOptions: null,
    favouriteOptionId: null,
    isScored: false,
    wasSkipped: false,
    pointsByPlayer: {},
    teamPoints: {},
    tooCloseFakeCounts: {},
    myReveals: {},
  };
  const isParty = isPartyRoundKind(round.kind);
  const limitMs = isParty ? writeLimitMs(round) : QUIZSHOW_LIMITS.readPhaseMs;
  advanceCursor(state, {
    phase: isParty ? "write" : "read",
    roundIndex,
    questionIndex,
    now,
    durationMs: limitMs,
    extraTimeMs: isParty ? extraTimeMs(limitMs) : null,
  });
  return [{ kind: "phase_changed" }, { kind: "answer_count_changed" }];
}

/** `read` to `open` with the question's limit and its extra time. */
export function openAnswers(
  state: QuizshowEngineState,
  now: number,
): QuizshowEngineEffect[] {
  const { play, round, question } = currentPlayContext(state);
  const limitMs = openLimitMs(round, question);
  advanceCursor(state, {
    phase: "open",
    roundIndex: play.roundIndex,
    questionIndex: play.questionIndex,
    now,
    durationMs: limitMs,
    extraTimeMs: extraTimeMs(limitMs),
  });
  return [{ kind: "phase_changed" }];
}

export function openRoundIntro(
  state: QuizshowEngineState,
  roundIndex: number,
  now: number,
): QuizshowEngineEffect[] {
  advanceCursor(state, {
    phase: "round_intro",
    roundIndex,
    questionIndex: null,
    now,
    durationMs: null,
    extraTimeMs: null,
  });
  return [{ kind: "phase_changed" }];
}

function totalsByEntrant(state: QuizshowEngineState): Record<string, number> {
  return Object.fromEntries(
    entrantTotals(state).map((entrant) => [entrant.entrantId, entrant.score]),
  );
}

/** Remembers the frame's previous scores, then the totals it shows. */
function recordScoresFrame(
  state: QuizshowEngineState,
  scope: QuizshowScoresScope,
): void {
  state.lastScoresFrame = {
    phaseId: state.cursor.phaseId,
    scope,
    previousByEntrant: { ...state.scoresAtLastFrame },
  };
  state.scoresAtLastFrame = totalsByEntrant(state);
}

/** Phases with scores on show: `scores`, `leaderboard` and `podium`. */
const SCORES_SHOWN_PHASES: readonly QuizshowPhase[] = [
  "scores",
  "leaderboard",
  "podium",
];

/**
 * The scores on show already counted points a hide withdrew: take the new
 * totals as the frame's totals and send the scores again.
 */
export function refreshScoresIfShown(
  state: QuizshowEngineState,
): QuizshowEngineEffect[] {
  if (!SCORES_SHOWN_PHASES.includes(state.cursor.phase)) return [];
  state.scoresAtLastFrame = totalsByEntrant(state);
  return [{ kind: "scores_shown" }];
}

/** `scores` keeps the question's indices; `leaderboard` keeps the round that ended. */
export function showScores(
  state: QuizshowEngineState,
  phase: "scores" | "leaderboard",
  scope: QuizshowScoresScope,
  now: number,
): QuizshowEngineEffect[] {
  const { roundIndex, questionIndex } = state.cursor;
  advanceCursor(state, {
    phase,
    roundIndex,
    questionIndex: phase === "scores" ? questionIndex : null,
    now,
    durationMs: null,
    extraTimeMs: null,
  });
  recordScoresFrame(state, scope);
  return [{ kind: "phase_changed" }, { kind: "scores_shown" }];
}

function podiumPlaceOf(rank: number): 1 | 2 | 3 | null {
  return rank === 1 || rank === 2 || rank === 3 ? rank : null;
}

/** Every entrant ranked 3 or better, ties sharing a place. */
export function buildPodium(state: QuizshowEngineState): QuizshowPodiumEntry[] {
  return competitionRanks(entrantTotals(state)).flatMap(
    (entry): QuizshowPodiumEntry[] => {
      const place = podiumPlaceOf(entry.rank);
      if (place === null) return [];
      return [
        {
          place,
          kind: entry.kind,
          entrantId: entry.entrantId,
          name: entry.name,
          colorKey: entry.colorKey,
          score: entry.score,
        },
      ];
    },
  );
}

export function showPodium(
  state: QuizshowEngineState,
  now: number,
): QuizshowEngineEffect[] {
  setSessionStatus(state, "running");
  state.pausedAt = null;
  advanceCursor(state, {
    phase: "podium",
    roundIndex: null,
    questionIndex: null,
    now,
    durationMs: null,
    extraTimeMs: null,
  });
  recordScoresFrame(state, "final");
  state.podium = buildPodium(state);
  return [
    { kind: "phase_changed" },
    { kind: "scores_shown" },
    { kind: "podium_shown" },
  ];
}

/** On the podium a removal or a withdrawal reorders it; anywhere else nothing to do. */
export function refreshPodiumIfShown(
  state: QuizshowEngineState,
): QuizshowEngineEffect[] {
  if (state.cursor.phase !== "podium") return [];
  state.podium = buildPodium(state);
  return [{ kind: "podium_shown" }];
}

/** After a question's last phase: next question, the round's leaderboard, or the podium. */
export function afterQuestion(
  state: QuizshowEngineState,
  now: number,
): QuizshowEngineEffect[] {
  const roundIndex = state.cursor.roundIndex ?? state.current?.roundIndex;
  const questionIndex =
    state.cursor.questionIndex ?? state.current?.questionIndex;
  if (roundIndex === undefined || questionIndex === undefined) {
    throw new Error(
      `Pulse Live demo ${state.sessionId} moved on with no question in play.`,
    );
  }
  if (!isLastQuestionOfRound(state, roundIndex, questionIndex)) {
    return openQuestion(state, roundIndex, questionIndex + 1, now);
  }
  if (!isLastRound(state, roundIndex)) {
    return showScores(state, "leaderboard", "round", now);
  }
  return showPodium(state, now);
}

export function finishSession(
  state: QuizshowEngineState,
  now: number,
): QuizshowEngineEffect[] {
  state.podium = buildPodium(state);
  state.pausedAt = null;
  setSessionStatus(state, "finished");
  advanceCursor(state, {
    phase: "ended",
    roundIndex: null,
    questionIndex: null,
    now,
    durationMs: null,
    extraTimeMs: null,
  });
  return [{ kind: "phase_changed" }, { kind: "session_ended" }];
}

/** Ends the session with no results, whatever its phase and scores. */
export function abandonSession(
  state: QuizshowEngineState,
  now: number,
): QuizshowEngineEffect[] {
  state.pausedAt = null;
  setSessionStatus(state, "abandoned");
  advanceCursor(state, {
    phase: "ended",
    roundIndex: null,
    questionIndex: null,
    now,
    durationMs: null,
    extraTimeMs: null,
  });
  return [{ kind: "phase_changed" }, { kind: "session_ended" }];
}

/** Scores the question once, then shows its reveal. */
export function revealQuestion(
  state: QuizshowEngineState,
  now: number,
): QuizshowEngineEffect[] {
  const context = currentPlayContext(state);
  scoreQuestionOnce(state, context);
  state.hasScoredQuestion = true;
  advanceCursor(state, {
    phase: "reveal",
    roundIndex: context.play.roundIndex,
    questionIndex: context.play.questionIndex,
    now,
    durationMs: null,
    extraTimeMs: null,
  });
  return [{ kind: "phase_changed" }, { kind: "revealed" }];
}

function visibleAnswerCount(play: QuizshowEngineQuestionPlay): number {
  return play.answers.filter((answer) => !answer.isHidden).length;
}

/** The Lie Detector truth in the screen language, the other language when that one is blank. */
function truthText(state: QuizshowEngineState): string | null {
  const { question } = currentPlayContext(state);
  if (question.type !== "prompt" || question.answer === null) return null;
  const { truth } = question.answer;
  const screenText = truth[state.quiz.screenLanguage].trim();
  if (screenText !== "") return screenText;
  const otherText = (
    state.quiz.screenLanguage === "en" ? truth.pt : truth.en
  ).trim();
  return otherText === "" ? null : otherText;
}

/**
 * Vote options from the visible answers (the truth too on Lie Detector),
 * shuffled, then given ids in the shown order so no id tells the truth apart.
 */
export function startVote(
  context: QuizshowEngineContext,
  now: number,
): QuizshowEngineEffect[] {
  const { state, random } = context;
  const { play, round } = currentPlayContext(state);
  const unnumberedOptions: Array<Omit<QuizshowEngineVoteOption, "optionId">> = [
    ...play.answers,
  ]
    .filter((answer) => !answer.isHidden)
    .sort((first, second) => first.receivedAt - second.receivedAt)
    .map((answer) => ({
      answerId: answer.answerId,
      isTruth: false,
      text: answer.payload.type === "prompt" ? answer.payload.text : "",
    }));
  const truth = round.kind === "lie_detector" ? truthText(state) : null;
  if (truth !== null) {
    unnumberedOptions.push({ answerId: null, isTruth: true, text: truth });
  }
  play.voteOptions = random
    .shuffle(unnumberedOptions)
    .map((option) => ({ ...option, optionId: mintId(state, "option") }));
  if (play.voteOptions.length < 2) return revealQuestion(state, now);
  const limitMs = voteLimitMs(round);
  advanceCursor(state, {
    phase: "vote",
    roundIndex: play.roundIndex,
    questionIndex: play.questionIndex,
    now,
    durationMs: limitMs,
    extraTimeMs: extraTimeMs(limitMs),
  });
  return [
    { kind: "phase_changed" },
    { kind: "vote_options_shown" },
    { kind: "answer_count_changed" },
  ];
}

/** `review` when it is on and something is visible to check, else straight to the vote. */
function afterWrite(
  context: QuizshowEngineContext,
  now: number,
): QuizshowEngineEffect[] {
  const { state } = context;
  const { play } = currentPlayContext(state);
  if (state.isReviewOn && visibleAnswerCount(play) >= 1) {
    advanceCursor(state, {
      phase: "review",
      roundIndex: play.roundIndex,
      questionIndex: play.questionIndex,
      now,
      durationMs: null,
      extraTimeMs: null,
    });
    return [
      { kind: "phase_changed" },
      { kind: "review_list_changed" },
      { kind: "answer_count_changed" },
    ];
  }
  return startVote(context, now);
}

/**
 * A timed phase reached its deadline plus grace: wait for extra-time players
 * (nothing changes, the next tick looks again), or move on.
 */
export function closeTimedPhase(
  context: QuizshowEngineContext,
  now: number,
  shouldWaitForExtraTime: boolean,
): QuizshowEngineEffect[] {
  const { state } = context;
  const { extraTimeDeadline } = state.cursor;
  const extraTimePlayerIds = state.current?.extraTimePlayerIds ?? [];
  if (
    shouldWaitForExtraTime &&
    extraTimeDeadline !== null &&
    now < extraTimeDeadline + QUIZSHOW_LIMITS.answerGraceMs &&
    extraTimePlayerIds.some((playerId) =>
      isAwaitedSubmitter(state, playerId, now),
    )
  ) {
    return [];
  }
  if (state.cursor.phase === "write") return afterWrite(context, now);
  return revealQuestion(state, now);
}

/**
 * Called after every accepted answer, vote and removal: closes once nobody is
 * awaited, so a standard player whose deadline passed never holds the phase
 * open for an extra-time player.
 */
export function closeIfEveryoneDone(
  context: QuizshowEngineContext,
  now: number,
): QuizshowEngineEffect[] {
  const { state } = context;
  const play = state.current;
  if (
    state.cursor.status !== "running" ||
    play === null ||
    !SUBMISSION_PHASES.includes(state.cursor.phase)
  ) {
    return [];
  }
  const isSomeoneStillToSubmit = play.eligiblePlayerIds.some((playerId) =>
    isAwaitedSubmitter(state, playerId, now),
  );
  if (isSomeoneStillToSubmit) return [];
  return closeTimedPhase(context, now, false);
}

/**
 * The clock: `read` closes at its deadline; `open`, `write` and `vote` close
 * at the deadline plus grace, waiting for extra-time players. The demo keeps
 * no idle clock (brief Step 3): `lastHostCommandAt` is kept for parity only.
 */
export function tickEngine(
  context: QuizshowEngineContext,
  now: number,
): QuizshowEngineEffect[] {
  const { state } = context;
  const { cursor } = state;
  if (!isOpenStatus(cursor.status)) return [];
  if (cursor.status !== "running" || cursor.deadline === null) return [];
  if (cursor.phase === "read") {
    return now < cursor.deadline ? [] : openAnswers(state, now);
  }
  if (!SUBMISSION_PHASES.includes(cursor.phase)) return [];
  if (now < cursor.deadline + QUIZSHOW_LIMITS.answerGraceMs) return [];
  return closeTimedPhase(context, now, true);
}
