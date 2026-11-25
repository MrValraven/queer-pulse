import type {
  QuizshowAttachRole,
  QuizshowErrorCode,
  QuizshowHostLobby,
  QuizshowHostState,
  QuizshowHostVoteOptions,
  QuizshowLobby,
  QuizshowPhase,
  QuizshowPlayerLobby,
  QuizshowPlayerState,
  QuizshowPodiumFrame,
  QuizshowReactionsFrame,
  QuizshowRematch,
  QuizshowScreenState,
  QuizshowSessionEnd,
  QuizshowSessionState,
  QuizshowVoteOptions,
  QuizshowWsTransportCode,
  QuizshowAnswerPayload,
  QuizshowAnswerHiddenFrame,
  QuizshowPhaseChangeFrame,
  QuizshowHostQuestionView,
  QuizshowQuestionView,
} from "../../../shared/contracts/quizshow";
import type { QuizshowServerFrame } from "./quizshowFrames";
import {
  withNightEntry,
  type QuizshowNightEntry,
  type QuizshowNightEntryUpdate,
} from "./quizshowNightLog";

export type QuizshowConnectionStatus =
  "connecting" | "attached" | "reconnecting" | "refused" | "ended";

export interface QuizshowPendingAnswer {
  phaseId: string;
  questionId: string;
  payload: QuizshowAnswerPayload;
}

/** Why the socket is retrying (item 42). */
export type QuizshowRetryCause =
  "UNAUTHORIZED" | "RATE_LIMITED" | "SERVER_ERROR" | "offline";

export interface QuizshowReactionBurst {
  counts: QuizshowReactionsFrame["counts"];
  /** Grows by 1 per `reactions` frame, so a view can tell two equal windows apart. */
  sequence: number;
}

/** Own rank from the latest `reveal:mine` or `scores:mine` and the one before it (item 14). */
export interface QuizshowOwnRanks {
  previous: number | null;
  current: number | null;
}

export interface QuizshowClientState {
  role: QuizshowAttachRole;
  status: QuizshowConnectionStatus;
  refusalCode: QuizshowErrorCode | QuizshowWsTransportCode | null;
  session: QuizshowSessionState | null;
  sessionEnd: QuizshowSessionEnd | null;
  isRemoved: boolean;
  pendingAnswer: QuizshowPendingAnswer | null;
  /** True once any attach ack succeeded on this store (item 42). */
  hasAttached: boolean;
  /** Why the socket is retrying; null when unknown or attached (item 42). */
  retryCause: QuizshowRetryCause | null;
  /** The old session's rematch (item 38); null until `session:rematch`. */
  rematch: QuizshowRematch | null;
  /** The latest `reactions` window (item 46); screen and host only. */
  reactionBurst: QuizshowReactionBurst | null;
  /** `player:removed.canRejoin` (item 34); false otherwise. */
  canRejoinAfterRemoval: boolean;
  /** The player's night, memory only (item 15). Empty for screen and host. */
  nightLog: QuizshowNightEntry[];
  /** Own rank now and the one before it, memory only (item 14). */
  ownRanks: QuizshowOwnRanks;
  /** Which question (or scores phase) set `ownRanks.current`, so a correction of it replaces the rank without a shift. */
  ownRankSourceKey: string | null;
  /** The player's team name when the session ended (item 38); null in solo. */
  lastTeamName: string | null;
}

export type QuizshowClientAction =
  | QuizshowServerFrame
  | {
      event: "local:status";
      payload: {
        status: QuizshowConnectionStatus;
        refusalCode: QuizshowClientState["refusalCode"];
        /** Absent keeps the current cause. */
        retryCause?: QuizshowRetryCause | null;
      };
    }
  | { event: "local:pendingAnswer"; payload: QuizshowPendingAnswer | null }
  /** The connection behind the store changed (live and demo swapped): start again from nothing. */
  | { event: "local:reset" }
  /** An answer:submit got its ack: it clears the pending answer only when that is still the one sent, or when its question is gone. */
  | { event: "local:pendingAnswerSettled"; payload: QuizshowPendingAnswer };

export function createQuizshowClientState(
  role: QuizshowAttachRole,
): QuizshowClientState {
  return {
    role,
    status: "connecting",
    refusalCode: null,
    session: null,
    sessionEnd: null,
    isRemoved: false,
    pendingAnswer: null,
    hasAttached: false,
    retryCause: null,
    rematch: null,
    reactionBurst: null,
    canRejoinAfterRemoval: false,
    nightLog: [],
    ownRanks: { previous: null, current: null },
    ownRankSourceKey: null,
    lastTeamName: null,
  };
}

export function isScreenState(
  session: QuizshowSessionState | null,
): session is QuizshowScreenState {
  return session?.role === "screen";
}

export function isPlayerState(
  session: QuizshowSessionState | null,
): session is QuizshowPlayerState {
  return session?.role === "player";
}

export function isHostState(
  session: QuizshowSessionState | null,
): session is QuizshowHostState {
  return session?.role === "host";
}

const SCORES_PHASES: readonly QuizshowPhase[] = [
  "scores",
  "leaderboard",
  "podium",
];
const VOTE_OPTION_PHASES: readonly QuizshowPhase[] = ["vote", "reveal"];
const PODIUM_PHASES: readonly QuizshowPhase[] = ["podium", "ended"];
const QUESTION_OPENING_PHASES: readonly QuizshowPhase[] = ["read", "write"];

function withoutHiddenOption<
  Options extends QuizshowVoteOptions | QuizshowHostVoteOptions,
>(
  voteOptions: Options | null,
  hidden: QuizshowAnswerHiddenFrame,
): Options | null {
  if (voteOptions === null || hidden.optionId === null) return voteOptions;
  return {
    ...voteOptions,
    options: voteOptions.options.filter(
      (option) => option.optionId !== hidden.optionId,
    ),
  };
}

function applyHidden(
  session: QuizshowSessionState,
  hidden: QuizshowAnswerHiddenFrame,
): QuizshowSessionState {
  const reveal =
    session.reveal && session.reveal.distribution.kind === "votes"
      ? {
          ...session.reveal,
          distribution: {
            ...session.reveal.distribution,
            entries: session.reveal.distribution.entries.filter(
              (entry) => entry.answerId !== hidden.answerId,
            ),
          },
        }
      : session.reveal;
  if (session.role === "host") {
    return {
      ...session,
      reveal,
      voteOptions: withoutHiddenOption(session.voteOptions, hidden),
      reviewList: session.reviewList
        ? {
            ...session.reviewList,
            submissions: session.reviewList.submissions.map((submission) =>
              submission.answerId === hidden.answerId
                ? { ...submission, isHidden: true }
                : submission,
            ),
          }
        : null,
    };
  }
  return {
    ...session,
    reveal,
    voteOptions: withoutHiddenOption(session.voteOptions, hidden),
  };
}

/** `host:resume` after a server restart reopens the paused question from its first phase with every answer and vote dropped. */
function isRestartReplay(
  session: QuizshowSessionState,
  frame: QuizshowPhaseChangeFrame,
): boolean {
  return (
    session.cursor.isRestartRecovery &&
    frame.cursor.phaseId !== session.cursor.phaseId &&
    QUESTION_OPENING_PHASES.includes(frame.cursor.phase)
  );
}

/** Scores survive a phase change only when they belong to the phase it moves to, so a leaderboard never shows the question's scores. */
function isScoresOfPhase(
  scores: { phaseId: string } | null,
  cursor: QuizshowPhaseChangeFrame["cursor"],
): boolean {
  return (
    scores !== null &&
    SCORES_PHASES.includes(cursor.phase) &&
    scores.phaseId === cursor.phaseId
  );
}

function applyNewPhase(
  session: QuizshowSessionState,
  frame: QuizshowPhaseChangeFrame,
): QuizshowSessionState {
  const phase = frame.cursor.phase;
  const shared = {
    cursor: frame.cursor,
    round: frame.round,
    reveal: phase === "scores" ? session.reveal : null,
    scores: isScoresOfPhase(session.scores, frame.cursor)
      ? session.scores
      : null,
    podium: PODIUM_PHASES.includes(phase) ? session.podium : null,
    wheel: frame.wheel ?? null,
    wheelBonus: frame.wheelBonus ?? null,
  };
  const keptVoteOptions = VOTE_OPTION_PHASES.includes(phase);
  if (session.role === "host") {
    return {
      ...session,
      ...shared,
      question: frame.question as QuizshowHostQuestionView | null,
      answerCount: null,
      voteOptions: keptVoteOptions ? session.voteOptions : null,
      reviewList: phase === "review" ? session.reviewList : null,
      typedAnswers: phase === "scores" ? session.typedAnswers : null,
    };
  }
  const question = frame.question;
  if (session.role === "screen") {
    return {
      ...session,
      ...shared,
      question,
      answerCount: null,
      voteOptions: keptVoteOptions ? session.voteOptions : null,
    };
  }
  const isNewQuestion =
    question?.questionId !== session.question?.questionId ||
    isRestartReplay(session, frame);
  return {
    ...session,
    ...shared,
    question,
    answerCount: null,
    voteOptions: keptVoteOptions ? session.voteOptions : null,
    myScores: isScoresOfPhase(session.myScores, frame.cursor)
      ? session.myScores
      : null,
    myAnswer: isNewQuestion ? null : session.myAnswer,
    myVote: isNewQuestion ? null : session.myVote,
    myReveal: isNewQuestion ? null : session.myReveal,
    isEligibleForQuestion:
      isNewQuestion && QUESTION_OPENING_PHASES.includes(phase)
        ? true
        : session.isEligibleForQuestion,
  };
}

function applyPhaseChange(
  session: QuizshowSessionState,
  frame: QuizshowPhaseChangeFrame,
): QuizshowSessionState {
  if (frame.cursor.phaseId === session.cursor.phaseId)
    return { ...session, cursor: frame.cursor };
  return applyNewPhase(session, frame);
}

function applyLobby(
  session: QuizshowSessionState,
  lobby: QuizshowLobby | QuizshowPlayerLobby | QuizshowHostLobby,
): QuizshowSessionState {
  if (session.role === "host")
    return { ...session, lobby: lobby as QuizshowHostLobby };
  if (session.role === "screen")
    return { ...session, lobby: lobby as QuizshowLobby };
  // Players keep teams and a count only (W2), even from a server that still sends the roster.
  const playerLobby: QuizshowPlayerLobby = {
    teams: lobby.teams,
    playerCount: lobby.playerCount,
  };
  return { ...session, lobby: playerLobby };
}

/** The podium frame's places, with its count mirrored on the cursor (D16); the frame's phase id already matched. */
function applyPodium(
  session: QuizshowSessionState,
  frame: QuizshowPodiumFrame,
): QuizshowSessionState {
  return {
    ...session,
    podium: frame.entries,
    cursor: { ...session.cursor, podiumRevealedCount: frame.revealedCount },
  };
}

function applyHostOnlyFrame(
  session: QuizshowHostState,
  action: QuizshowClientAction,
): QuizshowHostState {
  switch (action.event) {
    case "review:list":
      return { ...session, reviewList: action.payload };
    case "typed:answers":
      return { ...session, typedAnswers: action.payload };
    case "devices:update":
      return { ...session, pairedDevices: action.payload.devices };
    default:
      return session;
  }
}

function applyPlayerFrame(
  session: QuizshowPlayerState,
  action: QuizshowClientAction,
): QuizshowPlayerState {
  switch (action.event) {
    case "me:update":
      return { ...session, me: action.payload.me };
    case "answer:ack":
      return { ...session, myAnswer: action.payload };
    case "reveal:mine": {
      const mine = action.payload;
      return {
        ...session,
        myReveal: mine,
        me: session.me
          ? { ...session.me, score: mine.score, streak: mine.streak }
          : session.me,
      };
    }
    case "scores:mine":
      return { ...session, myScores: action.payload };
    default:
      return session;
  }
}

/** Frames that need a session; each one carrying a phase id is dropped when that id has passed. */
function applyDataFrame(
  session: QuizshowSessionState,
  action: QuizshowClientAction,
): QuizshowSessionState {
  switch (action.event) {
    case "phase:change":
      return applyPhaseChange(session, action.payload);
    case "lobby:update":
      return applyLobby(session, action.payload);
    case "answer:count":
      return {
        ...session,
        answerCount: {
          count: action.payload.count,
          total: action.payload.total,
        },
      };
    case "review:list":
    case "typed:answers":
    case "devices:update":
      return session.role === "host"
        ? applyHostOnlyFrame(session, action)
        : session;
    case "session:flags":
      return {
        ...session,
        isJoinLocked: action.payload.isJoinLocked,
        isAutoAdvanceOn: action.payload.isAutoAdvanceOn,
      };
    case "vote:options":
      return {
        ...session,
        voteOptions: action.payload,
      } as QuizshowSessionState;
    case "reveal":
      return { ...session, reveal: action.payload };
    case "answer:hidden":
      return applyHidden(session, action.payload);
    case "scores":
      return { ...session, scores: action.payload };
    case "podium":
      return applyPodium(session, action.payload);
    case "screen:muted":
      return session.role === "player"
        ? session
        : { ...session, isScreenMuted: action.payload.isMuted };
    case "me:update":
    case "answer:ack":
    case "reveal:mine":
    case "scores:mine":
      return session.role === "player"
        ? applyPlayerFrame(session, action)
        : session;
    default:
      return session;
  }
}

function phaseIdOf(action: QuizshowClientAction): string | null {
  switch (action.event) {
    case "answer:count":
    case "answer:ack":
    case "review:list":
    case "vote:options":
    case "reveal":
    case "reveal:mine":
    case "scores":
    case "scores:mine":
    case "podium":
      return action.payload.phaseId;
    default:
      return null;
  }
}

function clearedPending(
  pending: QuizshowPendingAnswer | null,
  session: QuizshowPlayerState,
): QuizshowPendingAnswer | null {
  if (pending === null) return null;
  const isAnswered = session.myAnswer?.questionId === pending.questionId;
  const isPhasePassed = session.cursor.phaseId !== pending.phaseId;
  return isAnswered || isPhasePassed ? null : pending;
}

function applySessionState(
  state: QuizshowClientState,
  session: QuizshowSessionState,
): QuizshowClientState {
  if (session.role !== state.role) return state;
  // A server deployed before the wheel fields leaves them undefined; surfaces check `=== null`.
  // A state that already carries both keeps its identity.
  const hasWheelFields =
    session.wheel !== undefined && session.wheelBonus !== undefined;
  const normalisedSession: QuizshowSessionState = hasWheelFields
    ? session
    : {
        ...session,
        wheel: session.wheel ?? null,
        wheelBonus: session.wheelBonus ?? null,
      };
  return {
    ...state,
    session: normalisedSession,
    status: "attached",
    // The demo engine attaches through session:state alone, with no local:status.
    hasAttached: true,
    sessionEnd: null,
    pendingAnswer: isPlayerState(normalisedSession)
      ? clearedPending(state.pendingAnswer, normalisedSession)
      : state.pendingAnswer,
  };
}

function applySessionEnd(
  state: QuizshowClientState,
  end: QuizshowSessionEnd,
): QuizshowClientState {
  const session = state.session;
  return {
    ...state,
    sessionEnd: end,
    status: "ended",
    session: session
      ? {
          ...session,
          cursor: { ...session.cursor, status: end.status, phase: "ended" },
          podium: end.podium,
          nextEvent: end.nextEvent,
          // The live session:state carries null until the ended phase (item 66).
          giving: end.giving,
        }
      : null,
  };
}

/** A phase:change to a new phase that is not the pending answer's phase, or to another question, ends its wait. */
function isPendingPassedBy(
  pending: QuizshowPendingAnswer | null,
  action: QuizshowClientAction,
): boolean {
  if (pending === null || action.event !== "phase:change") return false;
  const isOtherPhase = action.payload.cursor.phaseId !== pending.phaseId;
  const isOtherQuestion =
    action.payload.question?.questionId !== pending.questionId;
  return isOtherPhase || isOtherQuestion;
}

/** A host correction in `scores` re-sends `reveal` and `reveal:mine` stamped with the reveal phase id (item 5). */
function isCorrectionInScores(
  session: QuizshowSessionState,
  action: QuizshowClientAction,
): boolean {
  if (action.event !== "reveal" && action.event !== "reveal:mine") return false;
  return (
    session.cursor.phase === "scores" &&
    action.payload.questionId === session.question?.questionId
  );
}

function applyWhileAttached(
  state: QuizshowClientState,
  session: QuizshowSessionState,
  action: QuizshowClientAction,
): QuizshowClientState {
  const phaseId = phaseIdOf(action);
  const isStalePhase = phaseId !== null && phaseId !== session.cursor.phaseId;
  if (isStalePhase && !isCorrectionInScores(session, action)) return state;
  const nextSession = applyDataFrame(session, action);
  const isAckForPending =
    action.event === "answer:ack" &&
    state.pendingAnswer?.questionId === action.payload.questionId;
  const isReplayOfQuestion =
    action.event === "phase:change" && isRestartReplay(session, action.payload);
  return {
    ...state,
    session: nextSession,
    pendingAnswer:
      isAckForPending ||
      isReplayOfQuestion ||
      isPendingPassedBy(state.pendingAnswer, action)
        ? null
        : state.pendingAnswer,
  };
}

function isSettledBy(
  state: QuizshowClientState,
  settled: QuizshowPendingAnswer,
): boolean {
  const pending = state.pendingAnswer;
  if (pending === null) return false;
  const isSamePending =
    pending.phaseId === settled.phaseId &&
    pending.questionId === settled.questionId;
  const isQuestionChanged =
    pending.questionId !== state.session?.question?.questionId;
  return isSamePending || isQuestionChanged;
}

function applyStatus(
  state: QuizshowClientState,
  payload: Extract<QuizshowClientAction, { event: "local:status" }>["payload"],
): QuizshowClientState {
  return {
    ...state,
    status: payload.status,
    refusalCode: payload.refusalCode,
    hasAttached: state.hasAttached || payload.status === "attached",
    retryCause:
      payload.retryCause === undefined ? state.retryCause : payload.retryCause,
  };
}

/** The rematch frame reaches the old session's rooms, also after `session:end`. */
function applyRematch(
  state: QuizshowClientState,
  rematch: QuizshowRematch,
): QuizshowClientState {
  const isOtherSession =
    state.session !== null && state.session.sessionId !== rematch.fromSessionId;
  return isOtherSession ? state : { ...state, rematch };
}

function applyReactions(
  state: QuizshowClientState,
  frame: QuizshowReactionsFrame,
): QuizshowClientState {
  if (state.role === "player") return state;
  const sequence = (state.reactionBurst?.sequence ?? 0) + 1;
  return { ...state, reactionBurst: { counts: frame.counts, sequence } };
}

function reduceQuizshowFrame(
  state: QuizshowClientState,
  action: QuizshowClientAction,
): QuizshowClientState {
  switch (action.event) {
    case "local:status":
      return applyStatus(state, action.payload);
    case "local:pendingAnswer":
      return { ...state, pendingAnswer: action.payload };
    case "local:reset":
      return createQuizshowClientState(state.role);
    case "local:pendingAnswerSettled":
      return isSettledBy(state, action.payload)
        ? { ...state, pendingAnswer: null }
        : state;
    case "session:state":
      return applySessionState(state, action.payload);
    case "session:end":
      return applySessionEnd(state, action.payload);
    case "player:removed":
      return {
        ...state,
        isRemoved: true,
        status: "ended",
        canRejoinAfterRemoval: action.payload.canRejoin === true,
      };
    case "device:unpaired":
      return {
        ...state,
        status: "refused",
        refusalCode: "quizshow_device_unpaired",
      };
    case "session:rematch":
      return applyRematch(state, action.payload);
    case "reactions":
      return applyReactions(state, action.payload);
    default:
      return state.session
        ? applyWhileAttached(state, state.session, action)
        : state;
  }
}

/** The round card's warm-up flag for the question's round, read when the question arrives. */
function isWarmUpQuestion(
  session: QuizshowPlayerState,
  question: QuizshowQuestionView,
): boolean {
  const card =
    session.round?.roundIndex === question.roundIndex
      ? session.round
      : session.rounds.find(
          (round) => round.roundIndex === question.roundIndex,
        );
  return card?.isWarmUp ?? false;
}

/** What the session says about its quiz-round question; party questions and wheel steps are not logged. */
function nightUpdateOf(
  session: QuizshowPlayerState,
): QuizshowNightEntryUpdate | null {
  const question = session.question;
  if (question === null || question.roundKind !== "quiz") return null;
  const questionId = question.questionId;
  const reveal =
    session.reveal?.questionId === questionId ? session.reveal : null;
  return {
    questionId,
    roundIndex: question.roundIndex,
    questionIndex: question.questionIndex,
    question,
    myAnswer:
      session.myAnswer?.questionId === questionId
        ? session.myAnswer
        : undefined,
    myReveal:
      session.myReveal?.questionId === questionId
        ? session.myReveal
        : undefined,
    // A rescored reveal overwrites the key and the note.
    correct: reveal === null ? undefined : reveal.correct,
    note: reveal === null ? undefined : reveal.note,
  };
}

function isNightEntryCurrent(
  entry: QuizshowNightEntry,
  update: QuizshowNightEntryUpdate,
): boolean {
  return (Object.keys(update) as Array<keyof QuizshowNightEntry>).every(
    (key) => update[key] === undefined || update[key] === entry[key],
  );
}

function rememberedNightLog(
  log: QuizshowNightEntry[],
  session: QuizshowPlayerState,
  isRestartReplayed: boolean,
): QuizshowNightEntry[] {
  const sessionUpdate = nightUpdateOf(session);
  if (sessionUpdate === null) return log;
  // A restart replay drops the question's answers, so the entry drops them too.
  const update: QuizshowNightEntryUpdate = isRestartReplayed
    ? { ...sessionUpdate, myAnswer: null, myReveal: null }
    : sessionUpdate;
  if (update.question === undefined) return log;
  const entry = log.find(
    (candidate) => candidate.questionId === update.questionId,
  );
  if (entry === undefined)
    return withNightEntry(log, {
      ...update,
      isWarmUp: isWarmUpQuestion(session, update.question),
    });
  return isNightEntryCurrent(entry, update) ? log : withNightEntry(log, update);
}

interface QuizshowRankMemory {
  ownRanks: QuizshowOwnRanks;
  ownRankSourceKey: string | null;
}

/**
 * A rank from the source that set `current` (a rescore or a host adjustment
 * re-sending it) replaces `current` and keeps `previous`, so "Up N places"
 * still reads the move since the last question; the same source re-sending
 * an equal rank changes nothing. Any rank from another source moves `current`
 * into `previous`, an equal one too: the move is always since the last
 * source, so an unchanged rank at a later reveal or leaderboard says no move.
 */
function rememberedRank(
  memory: QuizshowRankMemory,
  rank: number,
  sourceKey: string,
): QuizshowRankMemory {
  const { ownRanks } = memory;
  if (sourceKey === memory.ownRankSourceKey) {
    if (rank === ownRanks.current) return memory;
    return {
      ownRanks: { previous: ownRanks.previous, current: rank },
      ownRankSourceKey: sourceKey,
    };
  }
  return {
    ownRanks: { previous: ownRanks.current, current: rank },
    ownRankSourceKey: sourceKey,
  };
}

/** `scores:mine` in `scores` belongs to the question just revealed; elsewhere to its own phase. */
function scoresSourceKeyOf(
  session: QuizshowPlayerState,
  phaseId: string,
): string {
  const questionId = session.question?.questionId;
  return session.cursor.phase === "scores" && questionId !== undefined
    ? `question:${questionId}`
    : `phase:${phaseId}`;
}

/**
 * Whether the question a rank came from scores nothing: a warm-up question or
 * a poll. Its rank is everyone's starting tie, so remembering it would read
 * the first scored reveal as a fall (item 14).
 */
function isUnscoredQuestion(
  session: QuizshowPlayerState,
  questionId: string,
): boolean {
  const question = session.question;
  if (question === null || question.questionId !== questionId) return false;
  return question.type === "poll" || isWarmUpQuestion(session, question);
}

/** Ranks from a `reveal:mine` or `scores:mine` the session took in since `previous` (also through session:state). */
function rememberedRanks(
  memory: QuizshowRankMemory,
  previous: QuizshowPlayerState | null,
  session: QuizshowPlayerState,
): QuizshowRankMemory {
  let ranks = memory;
  const { myReveal, myScores } = session;
  if (
    myReveal !== null &&
    myReveal !== previous?.myReveal &&
    !isUnscoredQuestion(session, myReveal.questionId)
  )
    ranks = rememberedRank(
      ranks,
      myReveal.rank,
      `question:${myReveal.questionId}`,
    );
  const scoresSourceKey =
    myScores === null ? null : scoresSourceKeyOf(session, myScores.phaseId);
  // The scores right after a warm-up question or a poll belong to it, so they skip too.
  const isScoresOfUnscoredQuestion =
    scoresSourceKey !== null &&
    session.question !== null &&
    scoresSourceKey === `question:${session.question.questionId}` &&
    isUnscoredQuestion(session, session.question.questionId);
  if (
    myScores !== null &&
    scoresSourceKey !== null &&
    myScores !== previous?.myScores &&
    !isScoresOfUnscoredQuestion
  )
    ranks = rememberedRank(ranks, myScores.rank, scoresSourceKey);
  return ranks;
}

/** Kept in step with the player's team while the session runs; held once it ended. */
function rememberedTeamName(
  state: QuizshowClientState,
  session: QuizshowPlayerState,
): string | null {
  if (state.sessionEnd !== null) return state.lastTeamName;
  const teamId = session.me?.teamId ?? null;
  if (teamId === null) return null;
  const team = session.lobby.teams.find(
    (candidate) => candidate.teamId === teamId,
  );
  // A lobby:update can trail the me:update that moved the player.
  return team?.name ?? state.lastTeamName;
}

/** A session:state for another session starts the memory again from nothing. */
function memoryBaseOf(
  previousState: QuizshowClientState,
  state: QuizshowClientState,
  session: QuizshowPlayerState,
): QuizshowClientState {
  const isOtherSession =
    previousState.session !== null &&
    previousState.session.sessionId !== session.sessionId;
  if (!isOtherSession) return state;
  const empty = createQuizshowClientState(state.role);
  return {
    ...state,
    nightLog: empty.nightLog,
    ownRanks: empty.ownRanks,
    ownRankSourceKey: empty.ownRankSourceKey,
    lastTeamName: empty.lastTeamName,
  };
}

/** R2 (items 14, 15, 38): the player's memory of the night, read from the session after each frame. Memory only: nothing is stored or sent. */
function withPlayerMemory(
  previousState: QuizshowClientState,
  state: QuizshowClientState,
  action: QuizshowClientAction,
): QuizshowClientState {
  const session = state.session;
  if (session === previousState.session || !isPlayerState(session))
    return state;
  if (state.role !== "player") return state;
  const base = memoryBaseOf(previousState, state, session);
  const previousSession =
    base === state && isPlayerState(previousState.session)
      ? previousState.session
      : null;
  const isRestartReplayed =
    action.event === "phase:change" &&
    previousSession !== null &&
    isRestartReplay(previousSession, action.payload);
  const ranks = rememberedRanks(
    { ownRanks: base.ownRanks, ownRankSourceKey: base.ownRankSourceKey },
    previousSession,
    session,
  );
  return {
    ...base,
    nightLog: rememberedNightLog(base.nightLog, session, isRestartReplayed),
    ownRanks: ranks.ownRanks,
    ownRankSourceKey: ranks.ownRankSourceKey,
    lastTeamName: rememberedTeamName(base, session),
  };
}

export function applyQuizshowFrame(
  state: QuizshowClientState,
  action: QuizshowClientAction,
): QuizshowClientState {
  return withPlayerMemory(state, reduceQuizshowFrame(state, action), action);
}
