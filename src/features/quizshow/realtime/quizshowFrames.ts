import type {
  QuizshowAck,
  QuizshowAnswerCountFrame,
  QuizshowAnswerHiddenFrame,
  QuizshowAnswerPayload,
  QuizshowAttachRole,
  QuizshowHostLobby,
  QuizshowHostTypedAnswers,
  QuizshowHostVoteOptions,
  QuizshowLobby,
  QuizshowLobbyJoinInput,
  QuizshowMe,
  QuizshowMyAnswer,
  QuizshowMyReveal,
  QuizshowMyScores,
  QuizshowMyVote,
  QuizshowPairedDevice,
  QuizshowPhaseChangeFrame,
  QuizshowPlayerLobby,
  QuizshowPodiumFrame,
  QuizshowReactionId,
  QuizshowReactionsFrame,
  QuizshowRematch,
  QuizshowReveal,
  QuizshowReviewList,
  QuizshowScores,
  QuizshowSessionEnd,
  QuizshowSessionState,
  QuizshowTeamColorKey,
  QuizshowVoteOptions,
} from "../../../shared/contracts/quizshow";

interface HostPhaseCommand {
  payload: { phaseId: string };
  success: { isNoop: boolean };
}

interface HostCommand<Payload> {
  payload: Payload;
  success: { isNoop: boolean };
}

/** `host:changeCorrectAnswer`: the new key, choice questions only (contract 4.3). */
export type QuizshowCorrectAnswerChange =
  | { type: "multiple_choice"; correctIndexes: number[] }
  | { type: "true_false"; isTrue: boolean };

export interface QuizshowClientFrameMap {
  "quizshow:attach": {
    payload: {
      sessionId: string;
      as: QuizshowAttachRole;
      /** A paired helper's ticket on `as: "host"` (contract 4.4). */
      deviceTicket?: string;
    };
    success: { role: QuizshowAttachRole; connectionExpiresAt: number };
  };
  "session:reauth": { payload: { ticket: string }; success: { exp: number } };
  "lobby:join": {
    payload: QuizshowLobbyJoinInput;
    success: { me: QuizshowMe };
  };
  "lobby:setName": {
    payload: { screenName: string };
    success: { me: QuizshowMe };
  };
  "lobby:pickTeam": {
    payload: { teamId: string };
    success: { me: QuizshowMe };
  };
  "lobby:createTeam": {
    payload: { name: string; colorKey: QuizshowTeamColorKey };
    success: { me: QuizshowMe; teamId: string };
  };
  "settings:extraTime": {
    payload: { hasExtraTime: boolean };
    success: { me: QuizshowMe };
  };
  "settings:avatar": {
    payload: { isAvatarShown: boolean };
    success: { me: QuizshowMe };
  };
  "answer:submit": {
    payload: {
      phaseId: string;
      questionId: string;
      payload: QuizshowAnswerPayload;
    };
    success: { answer: QuizshowMyAnswer; isDuplicate: boolean };
  };
  "vote:submit": {
    payload: { phaseId: string; questionId: string; optionId: string };
    success: { vote: QuizshowMyVote; isDuplicate: boolean };
  };
  "joker:play": {
    payload: { roundIndex: number };
    success: { me: QuizshowMe };
  };
  "lobby:leave": {
    payload: Record<string, never>;
    success: Record<string, never>;
  };
  "reaction:send": {
    payload: { reactionId: QuizshowReactionId };
    success: Record<string, never>;
  };
  /** Any role, attached or not; an unadmitted socket gets no ack (contract 4.2). */
  "session:ping": {
    payload: Record<string, never>;
    success: { serverNow: number; phaseId: string | null };
  };
  "host:start": HostPhaseCommand;
  "host:next": HostPhaseCommand;
  "host:spin": HostPhaseCommand;
  "host:finishWheel": HostPhaseCommand;
  "host:pause": HostPhaseCommand;
  "host:resume": HostPhaseCommand;
  "host:reveal": HostPhaseCommand;
  "host:skip": HostPhaseCommand;
  "host:showAnswers": HostPhaseCommand;
  "host:addTime": {
    payload: { phaseId: string; seconds: number; expectedDeadline: number };
    success: { isNoop: boolean };
  };
  "host:hideAnswer": {
    payload: { answerId: string; isHidden: boolean };
    success: { isNoop: boolean };
  };
  "host:pickFavourite": {
    payload: { phaseId: string; questionId: string; optionId: string };
    success: { isNoop: boolean };
  };
  "host:removePlayer": {
    /** `canRejoin` missing reads false. */
    payload: { playerId: string; canRejoin?: boolean };
    success: { isNoop: boolean };
  };
  "host:renameTeam": {
    payload: { teamId: string; name: string };
    success: { isNoop: boolean };
  };
  "host:end": HostPhaseCommand;
  "host:setScreenMuted": {
    payload: { isMuted: boolean };
    success: { isNoop: boolean };
  };
  "host:acceptAnswer": HostCommand<{
    phaseId: string;
    questionId: string;
    normalisedText: string;
  }>;
  "host:changeCorrectAnswer": HostCommand<{
    phaseId: string;
    questionId: string;
    answer: QuizshowCorrectAnswerChange;
  }>;
  "host:adjustPoints": HostCommand<{
    entrantId: string;
    delta: number;
    requestId: string;
  }>;
  "host:pairDevice": {
    payload: { pairingCode: string };
    success: { isNoop: boolean; device: QuizshowPairedDevice };
  };
  "host:unpairDevice": HostCommand<{ pairingId: string }>;
  "host:notifyGuests": HostCommand<Record<string, never>>;
  "host:createTeams": {
    payload: { names: string[] };
    success: { isNoop: boolean; teamIds: string[] };
  };
  "host:renamePlayer": HostCommand<{ playerId: string; screenName: string }>;
  "host:movePlayer": HostCommand<{ playerId: string; teamId: string }>;
  "host:setJoinLock": HostCommand<{ isLocked: boolean }>;
  "host:setAutoAdvance": HostCommand<{ isOn: boolean }>;
}

export type QuizshowClientFrameName = keyof QuizshowClientFrameMap;
export type QuizshowClientPayload<Name extends QuizshowClientFrameName> =
  QuizshowClientFrameMap[Name]["payload"];
export type QuizshowAckFor<Name extends QuizshowClientFrameName> = QuizshowAck<
  QuizshowClientFrameMap[Name]["success"]
>;

export type QuizshowServerFrame =
  | { event: "session:state"; payload: QuizshowSessionState }
  | {
      event: "lobby:update";
      /** Screen: the roster. Players: teams and a count only (W2). Hosts: the host lobby. */
      payload: QuizshowLobby | QuizshowPlayerLobby | QuizshowHostLobby;
    }
  | { event: "me:update"; payload: { me: QuizshowMe } }
  | { event: "phase:change"; payload: QuizshowPhaseChangeFrame }
  | { event: "answer:count"; payload: QuizshowAnswerCountFrame }
  | { event: "answer:ack"; payload: QuizshowMyAnswer }
  | { event: "review:list"; payload: QuizshowReviewList }
  | {
      event: "vote:options";
      payload: QuizshowVoteOptions | QuizshowHostVoteOptions;
    }
  | { event: "reveal"; payload: QuizshowReveal }
  | { event: "reveal:mine"; payload: QuizshowMyReveal }
  | { event: "answer:hidden"; payload: QuizshowAnswerHiddenFrame }
  | { event: "scores"; payload: QuizshowScores }
  | { event: "scores:mine"; payload: QuizshowMyScores }
  | { event: "podium"; payload: QuizshowPodiumFrame }
  | {
      event: "player:removed";
      payload: { sessionId: string; canRejoin: boolean };
    }
  | { event: "session:end"; payload: QuizshowSessionEnd }
  | { event: "screen:muted"; payload: { isMuted: boolean } }
  | { event: "typed:answers"; payload: QuizshowHostTypedAnswers }
  | { event: "reactions"; payload: QuizshowReactionsFrame }
  | { event: "devices:update"; payload: { devices: QuizshowPairedDevice[] } }
  | { event: "device:unpaired"; payload: { pairingId: string } }
  | { event: "session:rematch"; payload: QuizshowRematch }
  | {
      event: "session:flags";
      payload: { isJoinLocked: boolean; isAutoAdvanceOn: boolean };
    };
// `time:probe` (a server emit with an ack) is answered in the socket and never reaches the store.

export const QUIZSHOW_SERVER_FRAME_NAMES: readonly QuizshowServerFrame["event"][] =
  [
    "session:state",
    "lobby:update",
    "me:update",
    "phase:change",
    "answer:count",
    "answer:ack",
    "review:list",
    "vote:options",
    "reveal",
    "reveal:mine",
    "answer:hidden",
    "scores",
    "scores:mine",
    "podium",
    "player:removed",
    "session:end",
    "screen:muted",
    "typed:answers",
    "reactions",
    "devices:update",
    "device:unpaired",
    "session:rematch",
    "session:flags",
  ];
