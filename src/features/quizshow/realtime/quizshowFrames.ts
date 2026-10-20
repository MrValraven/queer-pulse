import type {
  QuizshowAck,
  QuizshowAnswerCount,
  QuizshowAnswerHiddenFrame,
  QuizshowAnswerPayload,
  QuizshowAttachRole,
  QuizshowHostLobby,
  QuizshowHostVoteOptions,
  QuizshowLobby,
  QuizshowLobbyJoinInput,
  QuizshowMe,
  QuizshowMyAnswer,
  QuizshowMyReveal,
  QuizshowMyScores,
  QuizshowMyVote,
  QuizshowPhaseChangeFrame,
  QuizshowPodiumFrame,
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

export interface QuizshowClientFrameMap {
  "quizshow:attach": {
    payload: { sessionId: string; as: QuizshowAttachRole };
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
  "host:start": HostPhaseCommand;
  "host:next": HostPhaseCommand;
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
    payload: { playerId: string };
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
}

export type QuizshowClientFrameName = keyof QuizshowClientFrameMap;
export type QuizshowClientPayload<Name extends QuizshowClientFrameName> =
  QuizshowClientFrameMap[Name]["payload"];
export type QuizshowAckFor<Name extends QuizshowClientFrameName> = QuizshowAck<
  QuizshowClientFrameMap[Name]["success"]
>;

export type QuizshowServerFrame =
  | { event: "session:state"; payload: QuizshowSessionState }
  | { event: "lobby:update"; payload: QuizshowLobby | QuizshowHostLobby }
  | { event: "me:update"; payload: { me: QuizshowMe } }
  | { event: "phase:change"; payload: QuizshowPhaseChangeFrame }
  | { event: "answer:count"; payload: QuizshowAnswerCount }
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
  | { event: "player:removed"; payload: { sessionId: string } }
  | { event: "session:end"; payload: QuizshowSessionEnd }
  | { event: "screen:muted"; payload: { isMuted: boolean } };

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
  ];
