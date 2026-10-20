import { useEffect, useRef, useState } from "react";
import type {
  QuizshowAttachRole,
  QuizshowPlayMode,
  QuizshowQuiz,
  QuizshowSessionState,
} from "../../../shared/contracts/quizshow";
import { demoQuizFor } from "../api/quizshowDemoStore";
import {
  QUIZSHOW_DEMO_JOIN_CODE,
  QUIZSHOW_DEMO_SELF_MEMBER_KEY,
  QUIZSHOW_DEMO_SESSION_ID,
  QUIZSHOW_DEMO_TICK_MS,
} from "../quizshow.constants";
import type {
  QuizshowAckFor,
  QuizshowClientFrameName,
  QuizshowClientPayload,
  QuizshowServerFrame,
} from "../realtime/quizshowFrames";
import { planAutoHostAction } from "./quizshowAutoHost";
import { createBotState, planBotActions } from "./quizshowBots";
import type { QuizshowBotState } from "./quizshowBots";
import { createQuizshowEngine, reduceQuizshowEngine } from "./quizshowEngine";
import type {
  QuizshowEngineAction,
  QuizshowEngineState,
  QuizshowHostFrameName,
  QuizshowPlayerFrameName,
} from "./quizshowEngineTypes";
import {
  engineSessionStateFor,
  framesForViewer,
  playerIdOf,
} from "./quizshowEngineViews";
import { QUIZSHOW_SIMULATED_PLAYERS } from "./quizshowSimulatedPlayers.data";

export interface QuizshowDemoEngineOptions {
  role: QuizshowAttachRole;
  eventSlug: string;
  eventTitle: string;
  /** Presenter and player: true. Remote and dry run on the remote: false. */
  isAutoHost: boolean;
  /** The player page joins the visitor as one more player. */
  hasSelfPlayer: boolean;
  playMode: QuizshowPlayMode;
  suggestedScreenName: string;
  /** Presenter: restarts after the thank-you screen. */
  shouldLoop: boolean;
  /** Dry run passes the draft's quiz; otherwise `demoQuizFor(eventSlug)`. */
  quiz?: QuizshowQuiz;
}

export interface QuizshowDemoEngine {
  /** Frames for this page's role, the visitor's own player room included. */
  subscribe: (listener: (frame: QuizshowServerFrame) => void) => () => void;
  /** Frames the big screen would get, for the remote's preview. */
  subscribeScreen: (
    listener: (frame: QuizshowServerFrame) => void,
  ) => () => void;
  send: <Name extends QuizshowClientFrameName>(
    name: Name,
    payload: QuizshowClientPayload<Name>,
  ) => Promise<QuizshowAckFor<Name>>;
  sessionStateFor: (role: QuizshowAttachRole) => QuizshowSessionState;
  restart: () => void;
}

type FrameListener = (frame: QuizshowServerFrame) => void;

const PLAYER_FRAME_NAMES: readonly string[] = [
  "lobby:join",
  "lobby:setName",
  "lobby:pickTeam",
  "lobby:createTeam",
  "settings:extraTime",
  "settings:avatar",
  "answer:submit",
  "vote:submit",
  "joker:play",
] satisfies QuizshowPlayerFrameName[];
const CONNECTION_LIFETIME_MS = 3_600_000;

function buildEngine(options: QuizshowDemoEngineOptions, seed: number) {
  return createQuizshowEngine({
    quiz: options.quiz ?? demoQuizFor(options.eventSlug),
    playMode: options.playMode,
    maxTeamSize: null,
    isReviewOn: true,
    eventSlug: options.eventSlug,
    eventTitle: options.eventTitle,
    joinCode: QUIZSHOW_DEMO_JOIN_CODE,
    sessionId: QUIZSHOW_DEMO_SESSION_ID,
    seed,
    now: seed,
  });
}

export function createQuizshowDemoController(
  getOptions: () => QuizshowDemoEngineOptions,
) {
  const listeners = new Set<FrameListener>();
  const screenListeners = new Set<FrameListener>();
  let engine: QuizshowEngineState = buildEngine(getOptions(), Date.now());
  let botState: QuizshowBotState = createBotState(Date.now(), Date.now());
  let lastSelfJoinPayload: unknown = null;

  function sessionStateFor(role: QuizshowAttachRole): QuizshowSessionState {
    if (role === "player") {
      return engineSessionStateFor(engine, {
        role: "player",
        memberKey: QUIZSHOW_DEMO_SELF_MEMBER_KEY,
        suggestedScreenName: getOptions().suggestedScreenName,
      });
    }
    return engineSessionStateFor(engine, { role });
  }

  function deliver(
    frames: readonly Parameters<typeof framesForViewer>[0][number][],
  ) {
    const playerId = playerIdOf(engine, QUIZSHOW_DEMO_SELF_MEMBER_KEY);
    const { role } = getOptions();
    for (const frame of framesForViewer(frames, { role, playerId })) {
      for (const listener of [...listeners]) listener(frame);
    }
    for (const frame of framesForViewer(frames, {
      role: "screen",
      playerId: null,
    })) {
      for (const listener of [...screenListeners]) listener(frame);
    }
  }

  function apply(action: QuizshowEngineAction) {
    const step = reduceQuizshowEngine(engine, action);
    engine = step.state;
    deliver(step.frames);
    return step.ack;
  }

  function restart() {
    const now = Date.now();
    engine = buildEngine(getOptions(), now);
    botState = createBotState(now, now);
    const { role } = getOptions();
    const stateListeners: Array<[QuizshowAttachRole, Set<FrameListener>]> = [
      [role, listeners],
      ["screen", screenListeners],
    ];
    for (const [stateRole, set] of stateListeners) {
      const frame: QuizshowServerFrame = {
        event: "session:state",
        payload: sessionStateFor(stateRole),
      };
      for (const listener of [...set]) listener(frame);
    }
    if (lastSelfJoinPayload !== null) {
      apply({
        type: "player",
        memberKey: QUIZSHOW_DEMO_SELF_MEMBER_KEY,
        name: "lobby:join",
        payload: lastSelfJoinPayload,
        now,
      });
    }
  }

  function tick() {
    const options = getOptions();
    const now = Date.now();
    const planned = planBotActions(botState, engine, now);
    botState = planned.botState;
    for (const action of planned.actions) apply(action);
    if (options.isAutoHost) {
      const hostAction = planAutoHostAction(engine, now, {
        expectedPlayerCount:
          QUIZSHOW_SIMULATED_PLAYERS.length + (options.hasSelfPlayer ? 1 : 0),
      });
      if (hostAction === "restart") {
        if (options.shouldLoop) {
          restart();
          return;
        }
      } else if (hostAction) {
        apply(hostAction);
      }
    }
    apply({ type: "tick", now });
  }

  function send<Name extends QuizshowClientFrameName>(
    name: Name,
    payload: QuizshowClientPayload<Name>,
  ): Promise<QuizshowAckFor<Name>> {
    const now = Date.now();
    let ack: unknown = { ok: true };
    if (name.startsWith("host:")) {
      ack = apply({
        type: "host",
        name: name as QuizshowHostFrameName,
        payload,
        now,
      });
    } else if (PLAYER_FRAME_NAMES.includes(name)) {
      if (name === "lobby:join") lastSelfJoinPayload = payload;
      ack = apply({
        type: "player",
        memberKey: QUIZSHOW_DEMO_SELF_MEMBER_KEY,
        name: name as QuizshowPlayerFrameName,
        payload,
        now,
      });
    } else if (name === "quizshow:attach") {
      ack = {
        ok: true,
        role: getOptions().role,
        connectionExpiresAt: now + CONNECTION_LIFETIME_MS,
      };
    } else if (name === "session:reauth") {
      ack = {
        ok: true,
        exp: Math.floor((now + CONNECTION_LIFETIME_MS) / 1000),
      };
    }
    return Promise.resolve((ack ?? { ok: true }) as QuizshowAckFor<Name>);
  }

  const engineApi: QuizshowDemoEngine = {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    subscribeScreen: (listener) => {
      screenListeners.add(listener);
      return () => {
        screenListeners.delete(listener);
      };
    },
    send,
    sessionStateFor,
    restart,
  };
  return { engineApi, tick };
}

/** Runs a whole demo game in the browser, opening no socket and making no request. */
export function useQuizshowDemoEngine(
  options: QuizshowDemoEngineOptions,
  isEnabled: boolean,
): QuizshowDemoEngine | null {
  const optionsRef = useRef(options);
  const [stored, setStored] = useState<{
    key: string;
    demoEngine: QuizshowDemoEngine;
  } | null>(null);
  useEffect(() => {
    optionsRef.current = options;
  });
  const { role, eventSlug, playMode } = options;
  const dependencyKey = `${role}|${eventSlug}|${playMode}`;
  useEffect(() => {
    if (!isEnabled) return undefined;
    const controller = createQuizshowDemoController(() => optionsRef.current);
    setStored({ key: dependencyKey, demoEngine: controller.engineApi });
    const intervalId = window.setInterval(
      controller.tick,
      QUIZSHOW_DEMO_TICK_MS,
    );
    return () => {
      window.clearInterval(intervalId);
      setStored(null);
    };
  }, [isEnabled, dependencyKey]);
  return isEnabled && stored?.key === dependencyKey ? stored.demoEngine : null;
}
