import type {
  QuizshowAttachRole,
  QuizshowErrorCode,
  QuizshowHostLobby,
  QuizshowHostState,
  QuizshowHostVoteOptions,
  QuizshowLobby,
  QuizshowPhase,
  QuizshowPlayerState,
  QuizshowScreenState,
  QuizshowSessionEnd,
  QuizshowSessionState,
  QuizshowVoteOptions,
  QuizshowWsTransportCode,
  QuizshowAnswerPayload,
  QuizshowAnswerHiddenFrame,
  QuizshowPhaseChangeFrame,
  QuizshowHostQuestionView,
} from "../../../shared/contracts/quizshow";
import type { QuizshowServerFrame } from "./quizshowFrames";

export type QuizshowConnectionStatus =
  "connecting" | "attached" | "reconnecting" | "refused" | "ended";

export interface QuizshowPendingAnswer {
  phaseId: string;
  questionId: string;
  payload: QuizshowAnswerPayload;
}

export interface QuizshowClientState {
  role: QuizshowAttachRole;
  status: QuizshowConnectionStatus;
  refusalCode: QuizshowErrorCode | QuizshowWsTransportCode | null;
  session: QuizshowSessionState | null;
  sessionEnd: QuizshowSessionEnd | null;
  isRemoved: boolean;
  pendingAnswer: QuizshowPendingAnswer | null;
}

export type QuizshowClientAction =
  | QuizshowServerFrame
  | {
      event: "local:status";
      payload: {
        status: QuizshowConnectionStatus;
        refusalCode: QuizshowClientState["refusalCode"];
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
  lobby: QuizshowLobby | QuizshowHostLobby,
): QuizshowSessionState {
  if (session.role === "host")
    return { ...session, lobby: lobby as QuizshowHostLobby };
  return { ...session, lobby: lobby };
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
      if (session.role === "player") return session;
      return {
        ...session,
        answerCount: {
          count: action.payload.count,
          total: action.payload.total,
        },
      };
    case "review:list":
      return session.role === "host"
        ? { ...session, reviewList: action.payload }
        : session;
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
      return { ...session, podium: action.payload.entries };
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
  return {
    ...state,
    session,
    status: "attached",
    sessionEnd: null,
    pendingAnswer: isPlayerState(session)
      ? clearedPending(state.pendingAnswer, session)
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

function applyWhileAttached(
  state: QuizshowClientState,
  session: QuizshowSessionState,
  action: QuizshowClientAction,
): QuizshowClientState {
  const phaseId = phaseIdOf(action);
  if (phaseId !== null && phaseId !== session.cursor.phaseId) return state;
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

export function applyQuizshowFrame(
  state: QuizshowClientState,
  action: QuizshowClientAction,
): QuizshowClientState {
  switch (action.event) {
    case "local:status":
      return {
        ...state,
        status: action.payload.status,
        refusalCode: action.payload.refusalCode,
      };
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
      return { ...state, isRemoved: true, status: "ended" };
    default:
      return state.session
        ? applyWhileAttached(state, state.session, action)
        : state;
  }
}
