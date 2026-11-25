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
import {
  isInWheelRange,
  isQuizRoundKind,
  isWheelRoundKind,
} from "../quizshowWheel";
import { buildRankIndex } from "./quizshowEngineRanks";
import {
  activePlayers,
  advanceCursor,
  currentPlayContext,
  entrantTotals,
  extraTimeMs,
  findPlayer,
  isActivePlayer,
  isAwayAt,
  isOpenStatus,
  mintId,
  openLimitMs,
  ownDeadline,
  questionAt,
  readPhaseMsFor,
  roundAt,
  setSessionStatus,
  shownOptionsOf,
  voteLimitMs,
  writeLimitMs,
  type QuizshowEngineContext,
} from "./quizshowEngineSetup";
import { scoreQuestionOnce } from "./quizshowEngineScoringStep";
import type {
  QuizshowEngineEffect,
  QuizshowEnginePlayer,
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

/** The phases a returning player can still answer the question in play (contract 6.2). */
const RETURN_PHASES: readonly QuizshowPhase[] = ["read", "open", "write"];

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
  return round !== null && isQuizRoundKind(round.kind);
}

/** Eligible, still active, and without an answer (`open`, `write`) or a vote (`vote`) for the current question. */
function isStillToSubmit(
  state: QuizshowEngineState,
  playerId: string,
): boolean {
  const play = state.current;
  if (play === null || !play.eligiblePlayerIds.includes(playerId)) return false;
  const player = findPlayer(state, playerId);
  if (player === undefined || !isActivePlayer(player)) return false;
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

/**
 * Opens a question at its first phase and freezes who may play it: every
 * active player who is not away (contract 6.2). A quiz round reads for a
 * length scaled to the text (contract 6.12); in teams play a talk beat follows
 * the read inside the same phase (contract 6.20).
 */
export function openQuestion(
  state: QuizshowEngineState,
  roundIndex: number,
  questionIndex: number,
  now: number,
): QuizshowEngineEffect[] {
  const round = roundAt(state, roundIndex);
  if (round !== null && isWheelRoundKind(round.kind)) {
    throw new Error(
      `Pulse Live demo ${state.sessionId} opened a question on wheel row ${roundIndex}.`,
    );
  }
  const question = questionAt(state, roundIndex, questionIndex);
  if (round === null || question === null) {
    throw new Error(
      `Pulse Live demo ${state.sessionId} has no question ${roundIndex}.${questionIndex}.`,
    );
  }
  const presentPlayers = activePlayers(state);
  const eligiblePlayers = presentPlayers.filter(
    (player) => !isAwayAt(player, now),
  );
  const awayPlayerIds = presentPlayers
    .filter((player) => isAwayAt(player, now))
    .map((player) => player.playerId);
  const isQuiz = isQuizRoundKind(round.kind);
  const readMs = isQuiz
    ? readPhaseMsFor(
        question,
        state.quiz.languages,
        shownOptionsOf(state, question),
      )
    : 0;
  const talkMs =
    isQuiz && state.playMode === "teams"
      ? round.settings.talkSeconds * 1000
      : 0;
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
    awayPlayerIds,
    readMs,
    streakBeforeByPlayer: {},
    keyOverride: null,
    acceptedTexts: [],
    wasCorrected: false,
  };
  const limitMs = isQuiz ? readMs + talkMs : writeLimitMs(round);
  advanceCursor(state, {
    phase: isQuiz ? "read" : "write",
    roundIndex,
    questionIndex,
    now,
    durationMs: limitMs,
    extraTimeMs: isQuiz ? null : extraTimeMs(limitMs),
    talkStartsAt: talkMs > 0 ? now + readMs : null,
  });
  return [{ kind: "phase_changed" }, { kind: "answer_count_changed" }];
}

/**
 * Gives an active player a place in the question in play while it still takes
 * answers (`read`, `open`, `write`): an away player whose socket came back
 * (contract 6.2), or with `isRejoin` a player who joined again after leaving
 * and had no place at the open (contract 6.14). Anywhere else they play from
 * the next question. The browser never sets `disconnectedAt`, so in demo only
 * the rejoin path admits anyone; the away path is ported for parity.
 */
export function returnAwayPlayer(
  state: QuizshowEngineState,
  playerId: string,
  _now: number,
  isRejoin = false,
): QuizshowEngineEffect[] {
  const play = state.current;
  const player = findPlayer(state, playerId);
  if (
    state.cursor.status !== "running" ||
    !RETURN_PHASES.includes(state.cursor.phase) ||
    play === null ||
    player === undefined ||
    !isActivePlayer(player)
  ) {
    return [];
  }
  const isAway = play.awayPlayerIds.includes(playerId);
  const hasNoPlace = isRejoin && !play.eligiblePlayerIds.includes(playerId);
  if (!isAway && !hasNoPlace) return [];
  admitToPlay(play, player);
  return [{ kind: "answer_count_changed" }];
}

function admitToPlay(
  play: QuizshowEngineQuestionPlay,
  player: QuizshowEnginePlayer,
): void {
  const { playerId } = player;
  if (!play.eligiblePlayerIds.includes(playerId)) {
    play.eligiblePlayerIds.push(playerId);
  }
  if (player.hasExtraTime && !play.extraTimePlayerIds.includes(playerId)) {
    play.extraTimePlayerIds.push(playerId);
  }
  play.awayPlayerIds = play.awayPlayerIds.filter(
    (awayPlayerId) => awayPlayerId !== playerId,
  );
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
  armAutoAdvance(state, now);
  return [{ kind: "phase_changed" }];
}

/** The round row is the warm-up (contract 6.19): its questions score 0. */
export function isWarmUpRound(
  state: QuizshowEngineState,
  roundIndex: number,
): boolean {
  return roundAt(state, roundIndex)?.settings.isWarmUp ?? false;
}

/** A warm-up question or a poll scores nobody, so `host:next` from its reveal moves on with no scores frame (contract 6.19, 6.22). */
export function skipsScoresAfterReveal(state: QuizshowEngineState): boolean {
  const play = state.current;
  if (play === null) return false;
  const question = questionAt(state, play.roundIndex, play.questionIndex);
  if (question === null) return false;
  return isWarmUpRound(state, play.roundIndex) || question.type === "poll";
}

/**
 * True when the cursor's row is a quiz round marked warm-up (contract 6.19):
 * its questions scored nobody, so the round can end with no leaderboard. A
 * warm-up inside a wheel range (a stored quiz from before validation refused
 * it) keeps the leaderboard, so the wheel flow runs as it does for every
 * slice (backend `shouldSkipLeaderboard` twin).
 */
export function skipsLeaderboardAfterRound(
  state: QuizshowEngineState,
): boolean {
  const { roundIndex } = state.cursor;
  const round = roundIndex === null ? null : roundAt(state, roundIndex);
  return (
    roundIndex !== null &&
    round !== null &&
    isQuizRoundKind(round.kind) &&
    round.settings.isWarmUp &&
    !isInWheelRange(state.quiz.rounds, roundIndex)
  );
}

/** How long the phase waits before moving on by itself (contract 6.16); null where it never does. */
function autoAdvanceDelayMs(state: QuizshowEngineState): number | null {
  const { phase, roundIndex } = state.cursor;
  if (phase === "round_intro") return QUIZSHOW_LIMITS.autoAdvanceRoundIntroMs;
  if (phase === "scores") return QUIZSHOW_LIMITS.autoAdvanceScoresMs;
  if (phase !== "reveal" || roundIndex === null) return null;
  // Caption This and Drag Name reveals wait for the host to pick a favourite.
  const round = roundAt(state, roundIndex);
  const isTimedReveal =
    round !== null &&
    (isQuizRoundKind(round.kind) || round.kind === "lie_detector");
  return isTimedReveal ? QUIZSHOW_LIMITS.autoAdvanceRevealMs : null;
}

/**
 * Arms or clears `cursor.autoAdvanceAt` for the phase the cursor is in
 * (contract 6.16): set from `now` on `round_intro`, a quiz or Lie Detector
 * `reveal` and `scores` while auto-advance is on and the session runs; null
 * everywhere else. Entering a phase, turning it on mid-phase and a resume all
 * call it with the time of that change, so a resume waits the full duration.
 */
export function armAutoAdvance(state: QuizshowEngineState, now: number): void {
  const delayMs =
    state.isAutoAdvanceOn && state.cursor.status === "running"
      ? autoAdvanceDelayMs(state)
      : null;
  state.cursor.autoAdvanceAt = delayMs === null ? null : now + delayMs;
}

/** The armed auto-advance came due: the tick runs the same path as `host:next`. */
export function isAutoAdvanceDue(
  state: QuizshowEngineState,
  now: number,
): boolean {
  const { autoAdvanceAt, status } = state.cursor;
  return (
    state.isAutoAdvanceOn &&
    status === "running" &&
    autoAdvanceAt !== null &&
    autoAdvanceDelayMs(state) !== null &&
    now >= autoAdvanceAt
  );
}

/** Each entrant's current total, keyed by entrant id: the shape of `scoresAtLastFrame`. */
export function totalsByEntrant(
  state: QuizshowEngineState,
): Record<string, number> {
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

/**
 * `scores` keeps the question's indices; `leaderboard` names the round that
 * ended, which a closing wheel passes in as its own row.
 */
export function showScores(
  state: QuizshowEngineState,
  phase: "scores" | "leaderboard",
  scope: QuizshowScoresScope,
  now: number,
  roundIndex: number | null = state.cursor.roundIndex,
): QuizshowEngineEffect[] {
  const { questionIndex } = state.cursor;
  advanceCursor(state, {
    phase,
    roundIndex,
    questionIndex: phase === "scores" ? questionIndex : null,
    now,
    durationMs: null,
    extraTimeMs: null,
  });
  recordScoresFrame(state, scope);
  armAutoAdvance(state, now);
  return [{ kind: "phase_changed" }, { kind: "scores_shown" }];
}

function podiumPlaceOf(rank: number): 1 | 2 | 3 | null {
  return rank === 1 || rank === 2 || rank === 3 ? rank : null;
}

/** Every entrant ranked 3 or better, ties sharing a place. */
export function buildPodium(state: QuizshowEngineState): QuizshowPodiumEntry[] {
  return buildRankIndex(state).ranked.flatMap(
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

/** The podium opens at step 0, every place withheld until the host reveals it (contract 6.7). */
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
    podiumRevealedCount: 0,
  });
  recordScoresFrame(state, "final");
  state.podium = buildPodium(state);
  return [
    { kind: "phase_changed" },
    { kind: "scores_shown" },
    { kind: "podium_shown" },
  ];
}

/** The distinct podium places, revealed in the order 3, 2, 1 (contract 6.7); a tie shares a step. */
export function podiumStepsOf(
  state: Pick<QuizshowEngineState, "podium">,
): Array<1 | 2 | 3> {
  const places = new Set((state.podium ?? []).map((entry) => entry.place));
  return ([3, 2, 1] as const).filter((place) => places.has(place));
}

/**
 * `host:next` on the podium shows the next place, 3rd first (contract 6.7):
 * a new podium phase id, so the moving command rule and double taps work as
 * for any move. The final scores frame carries over to the new phase id, so
 * `previousScore` stays the one the podium opened with. Null once every step
 * is shown (a null count shows every place): the night ends.
 */
export function revealNextPodiumStep(
  state: QuizshowEngineState,
  now: number,
): QuizshowEngineEffect[] | null {
  const stepCount = podiumStepsOf(state).length;
  const revealedCount = state.cursor.podiumRevealedCount ?? stepCount;
  if (revealedCount >= stepCount) return null;
  advanceCursor(state, {
    phase: "podium",
    roundIndex: null,
    questionIndex: null,
    now,
    durationMs: null,
    extraTimeMs: null,
    podiumRevealedCount: revealedCount + 1,
  });
  const scoresFrame = state.lastScoresFrame;
  if (scoresFrame !== null && scoresFrame.scope === "final") {
    state.lastScoresFrame = { ...scoresFrame, phaseId: state.cursor.phaseId };
  }
  return [
    { kind: "phase_changed" },
    { kind: "podium_shown" },
    { kind: "scores_shown" },
  ];
}

/**
 * On the podium a removal, a leave or a withdrawal reorders it; anywhere else
 * nothing to do. The rebuilt podium never shows a place the host has not
 * revealed: the count becomes the longest leading run of the new steps whose
 * places were already shown. A null count (every place shown) stays null.
 */
export function refreshPodiumIfShown(
  state: QuizshowEngineState,
): QuizshowEngineEffect[] {
  if (state.cursor.phase !== "podium") return [];
  const { cursor } = state;
  const previousCount = cursor.podiumRevealedCount;
  const revealedPlaces =
    previousCount === null
      ? null
      : new Set<number>(podiumStepsOf(state).slice(0, previousCount));
  state.podium = buildPodium(state);
  if (revealedPlaces === null) return [{ kind: "podium_shown" }];
  const newSteps = podiumStepsOf(state);
  const firstHiddenStep = newSteps.findIndex(
    (place) => !revealedPlaces.has(place),
  );
  const nextCount = firstHiddenStep === -1 ? newSteps.length : firstHiddenStep;
  if (nextCount === previousCount) return [{ kind: "podium_shown" }];
  cursor.podiumRevealedCount = nextCount;
  // The count lives on the cursor, so viewers get it with a fresh phase frame.
  return [{ kind: "phase_changed" }, { kind: "podium_shown" }];
}

/** Ends the night on its podium. A practice session keeps no results: the end frame says `hasResults: false` and `isPractice: true`, which the views read from `state.isPractice` (contract 6.9). */
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
  // A warm-up question or a poll scores nobody, so ending after only those skips a podium of zeros.
  if (!skipsScoresAfterReveal(state)) state.hasScoredQuestion = true;
  advanceCursor(state, {
    phase: "reveal",
    roundIndex: context.play.roundIndex,
    questionIndex: context.play.questionIndex,
    now,
    durationMs: null,
    extraTimeMs: null,
  });
  armAutoAdvance(state, now);
  return [{ kind: "phase_changed" }, { kind: "revealed" }];
}

function visibleAnswerCount(play: QuizshowEngineQuestionPlay): number {
  return play.answers.filter((answer) => !answer.isHidden).length;
}

/** The Lie Detector truth in the screen language (EN when the screen shows both), the other language when that one is blank. */
function truthText(state: QuizshowEngineState): string | null {
  const { question } = currentPlayContext(state);
  if (question.type !== "prompt" || question.answer === null) return null;
  const { truth } = question.answer;
  const leadLanguage = state.quiz.screenLanguage === "pt" ? "pt" : "en";
  const screenText = truth[leadLanguage].trim();
  if (screenText !== "") return screenText;
  const otherText = (leadLanguage === "en" ? truth.pt : truth.en).trim();
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
