/**
 * Pulse Live demo engine state: the server's live state as plain JSON, held in
 * arrays and records, so `structuredClone` copies it and a step can be
 * compared, stored and replayed.
 */
import type {
  QuizshowAck,
  QuizshowAnswerHiddenFrame,
  QuizshowAnswerPayload,
  QuizshowCursor,
  QuizshowMyAnswer,
  QuizshowMyReveal,
  QuizshowOption,
  QuizshowPlayMode,
  QuizshowPodiumEntry,
  QuizshowQuiz,
  QuizshowScoresScope,
  QuizshowTeamColorKey,
} from "../../../shared/contracts/quizshow";
import type {
  QuizshowClientFrameName,
  QuizshowServerFrame,
} from "../realtime/quizshowFrames";

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
  isRemoved: boolean;
}

export interface QuizshowEngineTeam {
  teamId: string;
  name: string;
  colorKey: QuizshowTeamColorKey;
  score: number;
  hasUsedJoker: boolean;
  jokerRoundIndex: number | null;
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
}

export interface QuizshowEngineState {
  sessionId: string;
  eventSlug: string;
  eventTitle: string;
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
  | "joker:play";

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
  eventSlug: string;
  eventTitle: string;
  joinCode: string;
  sessionId: string;
  seed: number;
  now: number;
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
  | { kind: "reveal_updated"; playerIds: string[] }
  | {
      kind: "answer_hidden";
      hidden: QuizshowAnswerHiddenFrame;
      isForEveryAudience: boolean;
    }
  | { kind: "scores_shown" }
  | { kind: "podium_shown" }
  | { kind: "player_removed"; playerId: string }
  | { kind: "session_ended" }
  | { kind: "screen_muted" }
  | { kind: "session_state"; playerId: string };

/** A command's ack and what it changed; a refusal changes nothing. */
export interface QuizshowCommandResult {
  ack: QuizshowAck<object>;
  effects: QuizshowEngineEffect[];
}
