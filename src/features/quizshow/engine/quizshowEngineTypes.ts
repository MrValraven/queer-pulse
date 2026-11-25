/**
 * Pulse Live demo engine state: the server's live state as plain JSON, held in
 * arrays and records, so `structuredClone` copies it and a step can be
 * compared, stored and replayed.
 */
import type {
  QuizshowAck,
  QuizshowAnswerHiddenFrame,
  QuizshowAnswerKeyView,
  QuizshowAnswerPayload,
  QuizshowCursor,
  QuizshowGivingLink,
  QuizshowMyAnswer,
  QuizshowMyReveal,
  QuizshowOption,
  QuizshowPairedDevice,
  QuizshowPlayMode,
  QuizshowPodiumEntry,
  QuizshowQuiz,
  QuizshowReactionId,
  QuizshowScoresScope,
  QuizshowTeamColorKey,
} from "../../../shared/contracts/quizshow";
import type { QuizshowWheelProgress } from "../quizshowWheel";
import type {
  QuizshowClientFrameName,
  QuizshowServerFrame,
} from "../realtime/quizshowFrames";
import type { QuizshowEngineContext } from "./quizshowEngineSetup";

export interface QuizshowEnginePlayer {
  playerId: string;
  memberKey: string;
  screenName: string;
  teamId: string | null;
  isAvatarShown: boolean;
  hasExtraTime: boolean;
  isCohostPlayer: false;
  score: number;
  streak: number;
  hasUsedJoker: boolean;
  jokerRoundIndex: number | null;
  joinedAt: number;
  /** Removed by a host: contract 6.14's `removedAt !== null`. */
  isRemoved: boolean;
  /** Set by `lobby:leave` or a host removal with rejoin (contract 6.14); null while playing. */
  leftAt: number | null;
  /** When the last socket left (contract 6.2); the browser never sets it, so demo players never go away. */
  disconnectedAt: number | null;
}

export interface QuizshowEngineTeam {
  teamId: string;
  name: string;
  colorKey: QuizshowTeamColorKey;
  score: number;
  hasUsedJoker: boolean;
  jokerRoundIndex: number | null;
  /** Made by a host (contract 6.11): waits empty in the lobby. */
  isHostMade: boolean;
}

export interface QuizshowEngineAnswer {
  answerId: string;
  playerId: string;
  questionId: string;
  phaseId: string;
  payload: QuizshowAnswerPayload;
  receivedAt: number;
  /** receivedAt minus `phaseStartedAt` of `open`, taken at submission; null on party answers. */
  elapsedMs?: number | null;
  isHidden: boolean;
  pointsAwarded: number;
}

export interface QuizshowEngineVoteOption {
  optionId: string;
  answerId: string | null;
  isTruth: boolean;
  text: string;
}

export interface QuizshowEngineQuestionPlay {
  questionId: string;
  roundIndex: number;
  questionIndex: number;
  eligiblePlayerIds: string[];
  extraTimePlayerIds: string[];
  answers: QuizshowEngineAnswer[];
  votes: Array<{ voterPlayerId: string; optionId: string }>;
  voteOptions: QuizshowEngineVoteOption[] | null;
  favouriteOptionId: string | null;
  isScored: boolean;
  wasSkipped: boolean;
  pointsByPlayer: Record<string, number>;
  teamPoints: Record<string, number>;
  /** Lie Detector "too close" refusals per player on this question; the third locks out further fakes. */
  tooCloseFakeCounts?: Record<string, number>;
  myReveals: Record<
    string,
    Omit<
      QuizshowMyReveal,
      "phaseId" | "ownAnswerId" | "rank" | "score" | "teamScore"
    >
  >;
  /** Active players left out at the question's open because they were away (contract 6.2). */
  awayPlayerIds: string[];
  /** The `read` length from `readPhaseMsFor` (contract 6.12); 0 on party rounds. */
  readMs: number;
  /** Each player's streak before the first scoring, for a host rescore (contract 6.4); empty until scored. */
  streakBeforeByPlayer: Record<string, number>;
  /** The host's changed answer key (contract 6.4); null keeps the question's own. */
  keyOverride: QuizshowAnswerKeyView | null;
  /** Typed answers a host accepted, normalised, in insertion order (contract 6.4). */
  acceptedTexts: string[];
  /** A host changed the key or accepted an answer after the reveal. */
  wasCorrected: boolean;
}

export interface QuizshowEngineState {
  sessionId: string;
  /** Null on a game session. */
  eventSlug: string | null;
  eventTitle: string | null;
  /** Set on a game session; null on an event game. */
  gameId: string | null;
  /** The scope's 18+ flag or an adults round in the frozen quiz; a first join then needs consent. */
  isAdultsOnly: boolean;
  joinCode: string;
  /** Frozen at creation. */
  quiz: QuizshowQuiz;
  /** questionId to the shown order of an order question. */
  shuffledOrderOptions: Record<string, QuizshowOption[]>;
  playMode: QuizshowPlayMode;
  maxTeamSize: number | null;
  isReviewOn: boolean;
  phaseCounter: number;
  /** The session status lives in `cursor.status` alone, so the two never drift. */
  cursor: QuizshowCursor;
  lastTransition: { fromPhaseId: string; toPhaseId: string } | null;
  pausedAt: number | null;
  /** Every host command attempt moves it; kept for parity only; the demo has no idle clock. */
  lastHostCommandAt: number;
  players: QuizshowEnginePlayer[];
  teams: QuizshowEngineTeam[];
  current: QuizshowEngineQuestionPlay | null;
  /** Wheel progress, plain JSON, mirrored from the server's `cursor.wheelProgress`. */
  wheelProgress: QuizshowWheelProgress;
  /** Coordinator 2026-10-19, starts false. */
  isScreenMuted: boolean;
  hasScoredQuestion: boolean;
  /** entrantId to score, for previousScore. */
  scoresAtLastFrame: Record<string, number>;
  lastScoresFrame: {
    phaseId: string;
    scope: QuizshowScoresScope;
    previousByEntrant: Record<string, number>;
  } | null;
  podium: QuizshowPodiumEntry[] | null;
  idCounter: number;
  randomState: number;
  /** A practice session keeps no results (contract 6.9). */
  isPractice: boolean;
  /** New players are refused while set (contract 6.15). */
  isJoinLocked: boolean;
  /** The engine moves on by itself while set (contract 6.16). */
  isAutoAdvanceOn: boolean;
  /** When `host:notifyGuests` ran; null before it. */
  guestPushSentAt: number | null;
  /** Always [] in demo: the demo has no pairing. */
  pairedDevices: QuizshowPairedDevice[];
  /** Reactions since the last `reactions` frame (contract 6.19). */
  reactionCounts: Partial<Record<QuizshowReactionId, number>>;
  /** Reaction token buckets by playerId (contract 6.19). */
  reactionBuckets: Record<string, { tokens: number; refilledAt: number }>;
  /** The last 50 `host:adjustPoints` request ids, so a retry applies once. */
  adjustRequestIds: string[];
  /** The quiz `updatedAt` this session was built from (contract 6.10). */
  sourceUpdatedAt: string;
  /** Null in demo unless the demo event data seeds one. */
  giving: QuizshowGivingLink | null;
}

export type QuizshowEngineAudience =
  "screen" | "players" | "hosts" | { playerId: string };

export interface QuizshowEngineFrame {
  audience: QuizshowEngineAudience;
  frame: QuizshowServerFrame;
}

export type QuizshowPlayerFrameName =
  | "lobby:join"
  | "lobby:setName"
  | "lobby:pickTeam"
  | "lobby:createTeam"
  | "settings:extraTime"
  | "settings:avatar"
  | "answer:submit"
  | "vote:submit"
  | "joker:play"
  | "lobby:leave"
  | "reaction:send";

export type QuizshowHostFrameName = Extract<
  QuizshowClientFrameName,
  `host:${string}`
>;

export type QuizshowEngineAction =
  | { type: "tick"; now: number }
  | {
      type: "player";
      memberKey: string;
      name: QuizshowPlayerFrameName;
      payload: unknown;
      now: number;
    }
  | {
      type: "host";
      name: QuizshowHostFrameName;
      payload: unknown;
      now: number;
    }
  | {
      type: "refreshQuiz";
      quiz: QuizshowQuiz;
      sourceUpdatedAt: string;
      now: number;
    };

export interface QuizshowEngineStep {
  state: QuizshowEngineState;
  frames: QuizshowEngineFrame[];
  ack: QuizshowAck<object> | null;
}

export interface QuizshowEngineOptions {
  quiz: QuizshowQuiz;
  playMode: QuizshowPlayMode;
  maxTeamSize: number | null;
  isReviewOn: boolean;
  eventSlug: string | null;
  eventTitle: string | null;
  /** A game session's id; leave it out on an event game. */
  gameId?: string | null;
  /** The scope's 18+ switch; an adults round in the quiz marks the session 18+ too. */
  isAdultsOnly?: boolean;
  joinCode: string;
  sessionId: string;
  seed: number;
  now: number;
  /** Default false. */
  isPractice?: boolean;
  /** Default `quiz.updatedAt`. */
  sourceUpdatedAt?: string;
  /** Rematch: teams the new session starts with (contract 6.17), each host-made. */
  initialTeams?: Array<{ name: string; colorKey: QuizshowTeamColorKey }>;
  /** Default null. */
  giving?: QuizshowGivingLink | null;
}

/**
 * What a command or a tick changed, in order; the views turn each into the
 * frames the server would send for it.
 */
export type QuizshowEngineEffect =
  | { kind: "phase_changed" }
  | { kind: "lobby_changed" }
  | { kind: "me_changed"; playerIds: string[] }
  | { kind: "answer_accepted"; playerId: string; answer: QuizshowMyAnswer }
  | { kind: "answer_count_changed" }
  | { kind: "review_list_changed" }
  | { kind: "vote_options_shown" }
  | { kind: "revealed" }
  | {
      kind: "reveal_updated";
      playerIds: string[];
      scope: "everyone" | "favourite";
    }
  | {
      kind: "answer_hidden";
      hidden: QuizshowAnswerHiddenFrame;
      isForEveryAudience: boolean;
    }
  | { kind: "scores_shown" }
  | { kind: "podium_shown" }
  | { kind: "player_removed"; playerId: string; canRejoin: boolean }
  | { kind: "session_ended" }
  | { kind: "screen_muted" }
  | { kind: "session_state"; playerId: string }
  | { kind: "flags_changed" }
  /** A fresh `session:state` per role (contract 6.10); "hosts" after a guest push, every role when left out. */
  | { kind: "state_reset"; scope?: "everyone" | "hosts" }
  | { kind: "typed_answers_changed" }
  | { kind: "reactions_changed" }
  | { kind: "player_left"; playerId: string };

/** A command's ack and what it changed; a refusal changes nothing. */
export interface QuizshowCommandResult {
  ack: QuizshowAck<object>;
  effects: QuizshowEngineEffect[];
}

/** A player command handler, shared so the commands module and the roster modules type their maps alike. */
export type QuizshowPlayerHandler = (
  context: QuizshowEngineContext,
  player: QuizshowEnginePlayer,
  payload: unknown,
  now: number,
) => QuizshowCommandResult;

/** A host command handler, shared like `QuizshowPlayerHandler`. */
export type QuizshowHostHandler = (
  context: QuizshowEngineContext,
  payload: unknown,
  now: number,
) => QuizshowCommandResult;
