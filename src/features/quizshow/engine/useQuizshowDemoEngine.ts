import { useEffect, useRef, useState } from "react";
import {
  QUIZSHOW_LIMITS,
  type QuizshowAttachRole,
  type QuizshowGivingLink,
  type QuizshowLobbyJoinInput,
  type QuizshowPlayMode,
  type QuizshowQuiz,
  type QuizshowRematch,
  type QuizshowSessionState,
  type QuizshowTeamColorKey,
} from "../../../shared/contracts/quizshow";
import {
  onDemoLobbyRefreshed,
  onDemoRematch,
  type QuizshowDemoLobbyRefreshed,
} from "../api/quizshowDemoBus";
import {
  demoGameLiveSession,
  demoGameQuizFor,
  demoGameSessionRef,
} from "../api/quizshowDemoGames";
import {
  demoEndSession,
  demoEventLiveSession,
  demoQuizFor,
} from "../api/quizshowDemoStore";
import { DEMO_QUIZSHOW_EVENT_GIVING } from "../event/quizshowEventDemo.data";
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
import { normaliseJoinCode } from "../quizshowPaths";
import { planAutoHostAction } from "./quizshowAutoHost";
import { createBotState, planBotActions } from "./quizshowBots";
import type { QuizshowBotState } from "./quizshowBots";
import { createQuizshowEngine, reduceQuizshowEngine } from "./quizshowEngine";
import { activePlayers } from "./quizshowEngineSetup";
import type {
  QuizshowEngineAction,
  QuizshowEngineFrame,
  QuizshowEngineState,
  QuizshowHostFrameName,
  QuizshowPlayerFrameName,
} from "./quizshowEngineTypes";
import {
  buildReactionsFrame,
  engineSessionStateFor,
  framesForViewer,
  playerIdOf,
} from "./quizshowEngineViews";
import { QUIZSHOW_SIMULATED_PLAYERS } from "./quizshowSimulatedPlayers.data";

export interface QuizshowDemoEngineOptions {
  role: QuizshowAttachRole;
  /** Null on a game session. */
  eventSlug: string | null;
  eventTitle: string | null;
  /** A game session's id; the engine then plays `demoGameQuizFor(gameId)`. */
  gameId?: string | null;
  /** The game's 18+ switch; an adults round in the quiz marks the session 18+ too. */
  isAdultsOnly?: boolean;
  /** Presenter and player: true. Remote and dry run on the remote: false. */
  isAutoHost: boolean;
  /** The player page joins the visitor as one more player. */
  hasSelfPlayer: boolean;
  playMode: QuizshowPlayMode;
  suggestedScreenName: string;
  /** Presenter: restarts after the thank-you screen. */
  shouldLoop: boolean;
  /** Dry run passes the draft's quiz; otherwise the game's or the event's demo quiz. */
  quiz?: QuizshowQuiz;
  /** Teams play: the simulated players spread over this many teams; left out, the four simulated teams. */
  teamCount?: number;
  /** The dry run's "You": the engine joins the visitor itself under this name, on the smallest team in teams play. */
  selfScreenName?: string;
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

/** The session a rematch opens (contract 6.17): its id and code, play mode and the old night's teams. */
interface QuizshowDemoRematchStart {
  sessionId: string;
  joinCode: string;
  playMode: QuizshowPlayMode;
  isPractice: boolean;
  initialTeams: Array<{ name: string; colorKey: QuizshowTeamColorKey }>;
}

const PLAYER_FRAME_NAMES: readonly string[] = [
  "lobby:join",
  "lobby:setName",
  "lobby:pickTeam",
  "lobby:createTeam",
  "lobby:leave",
  "settings:extraTime",
  "settings:avatar",
  "answer:submit",
  "vote:submit",
  "joker:play",
  "reaction:send",
] satisfies QuizshowPlayerFrameName[];
const CONNECTION_LIFETIME_MS = 3_600_000;
/** The old night's screens show the rematch this long before the engine opens it. */
const REMATCH_RESTART_DELAY_MS = 1_000;

/**
 * C10 row 66: the giving line a demo event's finished game ends on (C6.27),
 * from the demo event's community; null for a game and for an event without
 * one. The engine itself leaves it out of a practice and an abandoned night.
 */
export function demoEventGivingOf(
  eventSlug: string | null,
): QuizshowGivingLink | null {
  if (eventSlug === null) return null;
  return DEMO_QUIZSHOW_EVENT_GIVING[eventSlug] ?? null;
}

/**
 * The session the engine plays: a rematch's own; else the store's open
 * lobby, so its code and practice flag match what the studio opened (a game
 * under its own demo session, an event under the fixed demo session id).
 * After the night ends the store closes that lobby, so a looped restart keeps
 * the ended night's practice flag (`endedIsPractice`) while no lobby is open.
 */
function demoSessionRefOf(
  options: QuizshowDemoEngineOptions,
  rematchStart: QuizshowDemoRematchStart | null,
  endedIsPractice = false,
): { sessionId: string; joinCode: string; isPractice: boolean } {
  if (rematchStart !== null) {
    return {
      sessionId: rematchStart.sessionId,
      joinCode: rematchStart.joinCode,
      isPractice: rematchStart.isPractice,
    };
  }
  if (options.gameId) {
    const gameLobby = demoGameLiveSession(options.gameId);
    return {
      ...demoGameSessionRef(options.gameId),
      isPractice: gameLobby?.isPractice ?? endedIsPractice,
    };
  }
  const eventLobby =
    options.eventSlug === null ? null : demoEventLiveSession(options.eventSlug);
  return {
    sessionId: QUIZSHOW_DEMO_SESSION_ID,
    joinCode: eventLobby?.joinCode ?? QUIZSHOW_DEMO_JOIN_CODE,
    isPractice: eventLobby?.isPractice ?? endedIsPractice,
  };
}

function buildEngine(
  options: QuizshowDemoEngineOptions,
  seed: number,
  rematchStart: QuizshowDemoRematchStart | null,
  endedIsPractice = false,
): QuizshowEngineState {
  const { sessionId, joinCode, isPractice } = demoSessionRefOf(
    options,
    rematchStart,
    endedIsPractice,
  );
  return createQuizshowEngine({
    quiz:
      options.quiz ??
      (options.gameId
        ? demoGameQuizFor(options.gameId)
        : demoQuizFor(options.eventSlug ?? "")),
    playMode: rematchStart?.playMode ?? options.playMode,
    maxTeamSize: null,
    isReviewOn: true,
    eventSlug: options.eventSlug,
    eventTitle: options.eventTitle,
    gameId: options.gameId ?? null,
    isAdultsOnly: options.isAdultsOnly ?? false,
    joinCode,
    sessionId,
    seed,
    now: seed,
    isPractice,
    // The dry run plays a draft outside the store, so it ends on no giving line.
    giving:
      options.quiz === undefined ? demoEventGivingOf(options.eventSlug) : null,
    ...(rematchStart === null
      ? {}
      : { initialTeams: rematchStart.initialTeams }),
  });
}

/** The rematch the old engine opens: same play mode as announced, the old teams pre-made in teams play. */
function rematchStartOf(
  engine: QuizshowEngineState,
  rematch: QuizshowRematch,
): QuizshowDemoRematchStart {
  return {
    sessionId: rematch.sessionId,
    joinCode: rematch.joinCode,
    playMode: rematch.playMode,
    isPractice: engine.isPractice,
    initialTeams:
      rematch.playMode === "teams"
        ? engine.teams.map((team) => ({
            name: team.name,
            colorKey: team.colorKey,
          }))
        : [],
  };
}

/** The team with the fewest active members, in created order on a tie; null before any team exists. */
function smallestTeamId(engine: QuizshowEngineState): string | null {
  const players = activePlayers(engine);
  let smallest: { teamId: string; memberCount: number } | null = null;
  for (const team of engine.teams) {
    const memberCount = players.filter(
      (player) => player.teamId === team.teamId,
    ).length;
    if (smallest === null || memberCount < smallest.memberCount) {
      smallest = { teamId: team.teamId, memberCount };
    }
  }
  return smallest?.teamId ?? null;
}

/** The dry run's own join in the lobby: solo at once, teams once a team exists; null when there is nothing to do. */
function selfJoinAction(
  engine: QuizshowEngineState,
  selfScreenName: string | undefined,
  now: number,
): QuizshowEngineAction | null {
  if (selfScreenName === undefined || selfScreenName === "") return null;
  if (engine.cursor.phase !== "lobby") return null;
  if (playerIdOf(engine, QUIZSHOW_DEMO_SELF_MEMBER_KEY) !== null) return null;
  const teamId = engine.playMode === "teams" ? smallestTeamId(engine) : null;
  if (engine.playMode === "teams" && teamId === null) return null;
  const payload: QuizshowLobbyJoinInput = {
    screenName: selfScreenName,
    hasAcceptedAdultContent: true,
    isAvatarShown: false,
    hasExtraTime: false,
    team: teamId === null ? null : { teamId },
  };
  return {
    type: "player",
    memberKey: QUIZSHOW_DEMO_SELF_MEMBER_KEY,
    name: "lobby:join",
    payload,
    now,
  };
}

/** Fresh bots for a new engine, spread over the session's team count in teams play. */
function botStateFor(
  options: QuizshowDemoEngineOptions,
  now: number,
): QuizshowBotState {
  return createBotState(
    now,
    now,
    options.teamCount === undefined ? {} : { teamCount: options.teamCount },
  );
}

/** `session:state` for one role; the page's player is the visitor's own member key. */
function sessionStateOf(
  engine: QuizshowEngineState,
  options: QuizshowDemoEngineOptions,
  role: QuizshowAttachRole,
): QuizshowSessionState {
  if (role !== "player") return engineSessionStateFor(engine, { role });
  return engineSessionStateFor(engine, {
    role: "player",
    memberKey: QUIZSHOW_DEMO_SELF_MEMBER_KEY,
    suggestedScreenName: options.selfScreenName ?? options.suggestedScreenName,
  });
}

/** A refresh that swapped the quiz: ok and not a no-op. */
function isAppliedRefresh(ack: unknown): boolean {
  return (
    isOkAck(ack) &&
    !(
      typeof ack === "object" &&
      ack !== null &&
      "isNoop" in ack &&
      ack.isNoop === true
    )
  );
}

/** The engine's state_reset frames reach every player row; a player page with no live row of its own needs its state from the hook. */
function isPlayerPageWithoutRow(
  engine: QuizshowEngineState,
  role: QuizshowAttachRole,
): boolean {
  if (role !== "player") return false;
  const selfRow = engine.players.find(
    (player) => player.memberKey === QUIZSHOW_DEMO_SELF_MEMBER_KEY,
  );
  return selfRow === undefined || selfRow.isRemoved;
}

function isOkAck(ack: unknown): boolean {
  return (
    typeof ack === "object" && ack !== null && "ok" in ack && ack.ok === true
  );
}

function hasSelfInGame(options: QuizshowDemoEngineOptions): boolean {
  return (
    options.hasSelfPlayer ||
    (options.selfScreenName !== undefined && options.selfScreenName !== "")
  );
}

/** Acks the engine never sees: attach, reauth and the wake ping (contract 6.6), answered from the page. */
function localAckFor(
  name: QuizshowClientFrameName,
  engine: QuizshowEngineState,
  role: QuizshowAttachRole,
  now: number,
): unknown {
  switch (name) {
    case "quizshow:attach":
      return {
        ok: true,
        role,
        connectionExpiresAt: now + CONNECTION_LIFETIME_MS,
      };
    case "session:reauth":
      return {
        ok: true,
        exp: Math.floor((now + CONNECTION_LIFETIME_MS) / 1000),
      };
    case "session:ping":
      return { ok: true, serverNow: now, phaseId: engine.cursor.phaseId };
    default:
      return { ok: true };
  }
}

/** Hands each audience the engine frames meant for its viewer. */
function sendEngineFrames(
  frames: readonly QuizshowEngineFrame[],
  audiences: ReadonlyArray<{
    listeners: Set<FrameListener>;
    viewer: Parameters<typeof framesForViewer>[1];
  }>,
) {
  for (const { listeners, viewer } of audiences) {
    for (const frame of framesForViewer(frames, viewer)) {
      for (const listener of [...listeners]) listener(frame);
    }
  }
}

/** Sends each audience a `session:state` built for its own role. */
function sendSessionStates(
  audiences: ReadonlyArray<[QuizshowAttachRole, Set<FrameListener>]>,
  sessionStateFor: (role: QuizshowAttachRole) => QuizshowSessionState,
) {
  for (const [role, set] of audiences) {
    const frame: QuizshowServerFrame = {
      event: "session:state",
      payload: sessionStateFor(role),
    };
    for (const listener of [...set]) listener(frame);
  }
}

/**
 * Rematches the visitor's own phone will open: a player page keeps its end
 * screen, and its "Join the rematch" button, until the tap. The tap opens the
 * rematch's code on a fresh page, so the old controller hands its rematch
 * start (the new code, play mode and the old night's teams) over here, keyed by
 * that code, and the new page's controller reads it when it builds its engine.
 * Memory only.
 */
const handedRematchStarts = new Map<string, QuizshowDemoRematchStart>();

/** The rematch start handed over for the lobby this page is about to play, if
 *  any. It stays in the map, so a page that mounts twice (strict mode) or
 *  reopens the same code gets the same teams. */
function handedRematchStartFor(
  options: QuizshowDemoEngineOptions,
): QuizshowDemoRematchStart | null {
  const code = normaliseJoinCode(demoSessionRefOf(options, null).joinCode);
  return handedRematchStarts.get(code) ?? null;
}

export function createQuizshowDemoController(
  getOptions: () => QuizshowDemoEngineOptions,
) {
  const listeners = new Set<FrameListener>();
  const screenListeners = new Set<FrameListener>();
  let rematchStart = handedRematchStartFor(getOptions());
  let engine: QuizshowEngineState = buildEngine(
    getOptions(),
    Date.now(),
    rematchStart,
  );
  let botState: QuizshowBotState = botStateFor(getOptions(), Date.now());
  let lastSelfJoinPayload: unknown = null;
  let reactionsTimerId: ReturnType<typeof setTimeout> | null = null;
  let rematchTimerId: ReturnType<typeof setTimeout> | null = null;
  let hasNotedSessionEnd = false;

  function sessionStateFor(role: QuizshowAttachRole): QuizshowSessionState {
    return sessionStateOf(engine, getOptions(), role);
  }

  function deliver(frames: readonly QuizshowEngineFrame[]) {
    const { role } = getOptions();
    const playerId = playerIdOf(engine, QUIZSHOW_DEMO_SELF_MEMBER_KEY);
    sendEngineFrames(frames, [
      { listeners, viewer: { role, playerId } },
      {
        listeners: screenListeners,
        viewer: { role: "screen", playerId: null },
      },
    ]);
  }

  /** A fresh `session:state` for the page's role and for the screen preview. */
  function broadcastSessionState() {
    sendSessionStates(
      [
        [getOptions().role, listeners],
        ["screen", screenListeners],
      ],
      sessionStateFor,
    );
  }

  /** Trailing `reactionsFrameMs` window (contract 6.19): the first reaction opens it, the frame closes it. */
  function scheduleReactionsFrame() {
    if (reactionsTimerId !== null) return;
    if (Object.keys(engine.reactionCounts).length === 0) return;
    reactionsTimerId = setTimeout(() => {
      reactionsTimerId = null;
      const reactions = buildReactionsFrame(engine);
      if (reactions === null) return;
      const frame: QuizshowServerFrame = {
        event: "reactions",
        payload: reactions,
      };
      deliver([
        { audience: "screen", frame },
        { audience: "hosts", frame },
      ]);
    }, QUIZSHOW_LIMITS.reactionsFrameMs);
  }

  /**
   * Tells the demo store once per engine that its session ended (finished or
   * abandoned), so the store closes the lobby and times the rematch window
   * (contract 6.17). `demoEndSession` covers event and game sessions alike.
   * The dry run plays a draft outside the store and tells it nothing.
   */
  function noteSessionEnd() {
    const { status } = engine.cursor;
    if (hasNotedSessionEnd) return;
    if (status !== "finished" && status !== "abandoned") return;
    hasNotedSessionEnd = true;
    if (getOptions().quiz === undefined) demoEndSession(engine.sessionId);
  }

  function apply(action: QuizshowEngineAction) {
    const step = reduceQuizshowEngine(engine, action);
    engine = step.state;
    deliver(step.frames);
    scheduleReactionsFrame();
    noteSessionEnd();
    return step.ack;
  }

  function restart() {
    const now = Date.now();
    // A looped night keeps its practice badge after the store closed its lobby.
    engine = buildEngine(getOptions(), now, rematchStart, engine.isPractice);
    hasNotedSessionEnd = false;
    botState = botStateFor(getOptions(), now);
    broadcastSessionState();
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

  function startRematch(start: QuizshowDemoRematchStart) {
    rematchStart = start;
    // Everyone joins the rematch anew from its join code.
    lastSelfJoinPayload = null;
    restart();
  }

  function tick() {
    const options = getOptions();
    const now = Date.now();
    const selfJoin = selfJoinAction(engine, options.selfScreenName, now);
    if (selfJoin !== null) apply(selfJoin);
    const planned = planBotActions(botState, engine, now);
    botState = planned.botState;
    for (const action of planned.actions) apply(action);
    if (options.isAutoHost) {
      const hostAction = planAutoHostAction(engine, now, {
        expectedPlayerCount:
          QUIZSHOW_SIMULATED_PLAYERS.length + (hasSelfInGame(options) ? 1 : 0),
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
    let ack: unknown;
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
      // A visitor who left stays out of a looped restart.
      if (name === "lobby:leave" && isOkAck(ack)) lastSelfJoinPayload = null;
    } else {
      ack = localAckFor(name, engine, getOptions().role, now);
    }
    return Promise.resolve((ack ?? { ok: true }) as QuizshowAckFor<Name>);
  }

  /** The studio's "Use my latest edits in this lobby" (contract 6.10): the engine swaps the quiz and every viewer reloads. The dry run plays the draft and stays as it is. */
  function handleLobbyRefreshed(event: QuizshowDemoLobbyRefreshed) {
    if (getOptions().quiz !== undefined) return;
    if (event.sessionId !== engine.sessionId) return;
    const ack = apply({
      type: "refreshQuiz",
      quiz: event.quiz,
      sourceUpdatedAt: event.sourceUpdatedAt,
      now: Date.now(),
    });
    if (!isAppliedRefresh(ack)) return;
    if (!isPlayerPageWithoutRow(engine, getOptions().role)) return;
    sendSessionStates([["player", listeners]], sessionStateFor);
  }

  /** A rematch of this night (contract 6.17): every viewer hears it, then the engine opens it under the new code. */
  function handleRematch(rematch: QuizshowRematch) {
    if (rematch.fromSessionId !== engine.sessionId) return;
    // Both the page's own role and the screen preview hear it.
    for (const listener of [...listeners, ...screenListeners]) {
      listener({ event: "session:rematch", payload: rematch });
    }
    const nextStart = rematchStartOf(engine, rematch);
    if (rematchTimerId !== null) clearTimeout(rematchTimerId);
    // The visitor's own phone never restarts: its end screen stays, with the
    // "Join the rematch" button, and the tap opens a page that reads the start.
    const { role, hasSelfPlayer, quiz } = getOptions();
    if (role === "player" && hasSelfPlayer && quiz === undefined) {
      handedRematchStarts.set(normaliseJoinCode(nextStart.joinCode), nextStart);
      return;
    }
    // Every other page, the try-out included, has no such button and follows
    // after a short beat.
    rematchTimerId = setTimeout(() => {
      rematchTimerId = null;
      startRematch(nextStart);
    }, REMATCH_RESTART_DELAY_MS);
  }

  function dispose() {
    if (reactionsTimerId !== null) clearTimeout(reactionsTimerId);
    if (rematchTimerId !== null) clearTimeout(rematchTimerId);
    reactionsTimerId = null;
    rematchTimerId = null;
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
  return { engineApi, tick, handleLobbyRefreshed, handleRematch, dispose };
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
  const { role, eventSlug, gameId, playMode, teamCount, selfScreenName } =
    options;
  const dependencyKey = `${role}|${eventSlug}|${gameId ?? ""}|${playMode}|${teamCount ?? ""}|${selfScreenName ?? ""}`;
  useEffect(() => {
    if (!isEnabled) return undefined;
    const controller = createQuizshowDemoController(() => optionsRef.current);
    setStored({ key: dependencyKey, demoEngine: controller.engineApi });
    const intervalId = window.setInterval(
      controller.tick,
      QUIZSHOW_DEMO_TICK_MS,
    );
    const stopLobbyRefreshed = onDemoLobbyRefreshed(
      controller.handleLobbyRefreshed,
    );
    const stopRematch = onDemoRematch(controller.handleRematch);
    return () => {
      window.clearInterval(intervalId);
      stopLobbyRefreshed();
      stopRematch();
      controller.dispose();
      setStored(null);
    };
  }, [isEnabled, dependencyKey]);
  return isEnabled && stored?.key === dependencyKey ? stored.demoEngine : null;
}
