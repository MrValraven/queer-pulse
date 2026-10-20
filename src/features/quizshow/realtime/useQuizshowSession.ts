import { useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { apiAvailable } from "../../../shared/api/config";
import { eventKeys } from "../../gatherings/api/eventKeys";
import { quizshowKeys } from "../api/quizshowKeys";
import type {
  QuizshowAnswerPayload,
  QuizshowAttachRole,
} from "../../../shared/contracts/quizshow";
import {
  useQuizshowDemoEngine,
  type QuizshowDemoEngineOptions,
} from "../engine/useQuizshowDemoEngine";
import {
  applyQuizshowFrame,
  createQuizshowClientState,
  isPlayerState,
  type QuizshowClientState,
  type QuizshowPendingAnswer,
} from "./quizshowClientStore";
import type {
  QuizshowAckFor,
  QuizshowClientFrameName,
  QuizshowClientPayload,
} from "./quizshowFrames";
import {
  QuizshowSendTimeoutError,
  QuizshowSocketClient,
} from "./quizshowSocket";

export type QuizshowSendResult<Name extends QuizshowClientFrameName> =
  QuizshowAckFor<Name> | { ok: false; code: "transport_timeout" };

export interface QuizshowSessionController {
  state: QuizshowClientState;
  clockOffsetMs: number;
  isDemo: boolean;
  send: <Name extends QuizshowClientFrameName>(
    name: Name,
    payload: QuizshowClientPayload<Name>,
  ) => Promise<QuizshowSendResult<Name>>;
  /** Locks the answer locally, sends it, and resends once after a reconnect when its ack was lost. */
  submitAnswer: (input: {
    questionId: string;
    payload: QuizshowAnswerPayload;
  }) => Promise<QuizshowSendResult<"answer:submit">>;
  /** Demo only: the screen's state of the same engine (the remote's preview); null live. */
  demoScreenState: QuizshowClientState | null;
  restartDemo: () => void;
}

const TRANSPORT_TIMEOUT = { ok: false, code: "transport_timeout" } as const;

/** An `answer:submit` whose ack never came back, and how many `session:state` replays had arrived when it went out. */
interface LostAnswerAck {
  pendingKey: string;
  questionId: string;
  replayCountAtSend: number;
}

function pendingKeyOf(pending: QuizshowPendingAnswer): string {
  return `${pending.phaseId}:${pending.questionId}`;
}

/** The pending answer stays while the answer never reached an attached socket:
 *  a lost ack, a send while down, or a send between reconnect and attach. */
function shouldKeepPending(
  result: QuizshowSendResult<"answer:submit">,
): boolean {
  return (
    !result.ok &&
    (result.code === "transport_timeout" ||
      result.code === "quizshow_not_attached")
  );
}

/** A live session that ended: an event changes its page's Pulse Live card, the quiz lock and the
 *  results; a game (owner-only) changes the game, its results and My games. */
function useRefreshAfterSessionEnd(input: {
  isEnded: boolean;
  session: QuizshowClientState["session"];
  gameId: string | null;
}): void {
  const queryClient = useQueryClient();
  const { isEnded, session, gameId } = input;
  const endedEventSlug = isEnded ? (session?.eventSlug ?? null) : null;
  const endedGameId =
    isEnded && session?.kind === "game" ? (gameId ?? session.gameId) : null;
  useEffect(() => {
    if (endedGameId !== null) {
      void queryClient.invalidateQueries({
        queryKey: quizshowKeys.game(endedGameId, false),
      });
      void queryClient.invalidateQueries({
        queryKey: quizshowKeys.gameResults(endedGameId, false),
      });
      void queryClient.invalidateQueries({
        queryKey: quizshowKeys.games(false),
      });
      return;
    }
    if (endedEventSlug === null) return;
    void queryClient.invalidateQueries({ queryKey: eventKeys.detailRoot });
    void queryClient.invalidateQueries({
      queryKey: quizshowKeys.quiz(endedEventSlug, false),
    });
    void queryClient.invalidateQueries({
      queryKey: quizshowKeys.results(endedEventSlug, false),
    });
  }, [endedEventSlug, endedGameId, queryClient]);
}

/**
 * The live `/quizshow` connection, or the in-browser demo engine, behind one
 * shape. Live opens one socket per session and role; demo opens none.
 */
export function useQuizshowSession(options: {
  sessionId: string | null;
  role: QuizshowAttachRole;
  demo: Omit<QuizshowDemoEngineOptions, "role">;
  /** A game session's id; the demo engine then plays that game's quiz. */
  gameId?: string | null;
  /** The scope's 18+ flag (the join response's, the event's or the game's), for the demo engine. */
  isAdultsOnly?: boolean;
}): QuizshowSessionController {
  const { sessionId, role, demo, gameId = null, isAdultsOnly } = options;
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const isLive = !demoMode && loggedIn && apiAvailable && sessionId !== null;
  const [state, dispatch] = useReducer(
    applyQuizshowFrame,
    role,
    createQuizshowClientState,
  );
  const [screenState, dispatchScreen] = useReducer(
    applyQuizshowFrame,
    "screen",
    createQuizshowClientState,
  );
  const [clockOffsetMs, setClockOffsetMs] = useState(0);
  const clientRef = useRef<QuizshowSocketClient | null>(null);
  /** Counts live `session:state` replays, so a lost answer resends only after a newer replay. */
  const replayCountRef = useRef(0);
  const resentKeysRef = useRef(new Set<string>());
  const [lostAck, setLostAck] = useState<LostAnswerAck | null>(null);

  // Live and demo swapped (demo toggle, sign out): nothing of the other connection carries over.
  const [isLiveSeen, setIsLiveSeen] = useState(isLive);
  if (isLiveSeen !== isLive) {
    setIsLiveSeen(isLive);
    dispatch({ event: "local:reset" });
    setLostAck(null);
    setClockOffsetMs(0);
  }

  useEffect(() => {
    if (!isLive || sessionId === null) return undefined;
    resentKeysRef.current.clear();
    const client = new QuizshowSocketClient({
      sessionId,
      role,
      onAction: (action) => {
        if (action.event === "session:state") replayCountRef.current += 1;
        dispatch(action);
      },
      onClockOffset: setClockOffsetMs,
    });
    clientRef.current = client;
    client.connect();
    return () => {
      client.dispose();
      if (clientRef.current === client) clientRef.current = null;
    };
  }, [isLive, sessionId, role]);

  const demoEngine = useQuizshowDemoEngine(
    {
      ...demo,
      role,
      ...(gameId !== null ? { gameId } : {}),
      ...(isAdultsOnly !== undefined ? { isAdultsOnly } : {}),
    },
    demoMode,
  );

  useEffect(() => {
    if (demoEngine === null) return undefined;
    dispatch({
      event: "session:state",
      payload: demoEngine.sessionStateFor(role),
    });
    return demoEngine.subscribe(dispatch);
  }, [demoEngine, role]);

  useEffect(() => {
    if (demoEngine === null || role !== "host") return undefined;
    dispatchScreen({
      event: "session:state",
      payload: demoEngine.sessionStateFor("screen"),
    });
    return demoEngine.subscribeScreen(dispatchScreen);
  }, [demoEngine, role]);

  const send = useCallback(
    async <Name extends QuizshowClientFrameName>(
      name: Name,
      payload: QuizshowClientPayload<Name>,
    ): Promise<QuizshowSendResult<Name>> => {
      if (demoEngine !== null) return demoEngine.send(name, payload);
      const client = clientRef.current;
      if (client === null) return TRANSPORT_TIMEOUT;
      try {
        return await client.send(name, payload);
      } catch (error) {
        if (error instanceof QuizshowSendTimeoutError) return TRANSPORT_TIMEOUT;
        throw error;
      }
    },
    [demoEngine],
  );

  const currentPhaseId = state.session?.cursor.phaseId ?? null;

  const submitAnswer = useCallback(
    async (input: {
      questionId: string;
      payload: QuizshowAnswerPayload;
    }): Promise<QuizshowSendResult<"answer:submit">> => {
      if (currentPhaseId === null) {
        return {
          ok: false,
          code: "quizshow_not_attached",
          message: "No session yet",
        };
      }
      const pending: QuizshowPendingAnswer = {
        phaseId: currentPhaseId,
        questionId: input.questionId,
        payload: input.payload,
      };
      const replayCountAtSend = replayCountRef.current;
      dispatch({ event: "local:pendingAnswer", payload: pending });
      const result = await send("answer:submit", pending);
      if (shouldKeepPending(result)) {
        setLostAck({
          pendingKey: pendingKeyOf(pending),
          questionId: pending.questionId,
          replayCountAtSend,
        });
      } else {
        // A newer answer may be pending by now: only this one settles.
        dispatch({ event: "local:pendingAnswerSettled", payload: pending });
      }
      return result;
    },
    [currentPhaseId, send],
  );

  const { status, pendingAnswer, session } = state;

  useRefreshAfterSessionEnd({
    isEnded: isLive && state.sessionEnd !== null,
    session,
    gameId,
  });
  // The server already holds the answer: the lost ack no longer matters.
  const isLostAnswerHeld =
    lostAck !== null &&
    isPlayerState(session) &&
    session.myAnswer?.questionId === lostAck.questionId;
  if (isLostAnswerHeld) setLostAck(null);

  // A reconnect replays `session:state`; when a replay newer than the send shows
  // no stored answer for the pending answer's phase, it goes out once more.
  useEffect(() => {
    if (lostAck === null || !isPlayerState(session)) return;
    if (status !== "attached" || pendingAnswer === null) return;
    if (session.cursor.phaseId !== pendingAnswer.phaseId) return;
    if (session.myAnswer !== null) return;
    const pendingKey = pendingKeyOf(pendingAnswer);
    if (lostAck.pendingKey !== pendingKey) return;
    if (replayCountRef.current <= lostAck.replayCountAtSend) return;
    if (resentKeysRef.current.has(pendingKey)) return;
    resentKeysRef.current.add(pendingKey);
    const resentAnswer = pendingAnswer;
    void send("answer:submit", resentAnswer).then((result) => {
      if (shouldKeepPending(result)) return;
      // A newer answer may be pending by now: only the resent one settles.
      dispatch({ event: "local:pendingAnswerSettled", payload: resentAnswer });
      setLostAck((current) =>
        current?.pendingKey === pendingKey ? null : current,
      );
    });
  }, [status, pendingAnswer, lostAck, session, send]);

  const restartDemo = useCallback(() => {
    demoEngine?.restart();
  }, [demoEngine]);

  const isDemoScreenShown = demoEngine !== null && role === "host";

  return useMemo(
    () => ({
      state,
      clockOffsetMs,
      isDemo: demoMode,
      send,
      submitAnswer,
      demoScreenState: isDemoScreenShown ? screenState : null,
      restartDemo,
    }),
    [
      state,
      clockOffsetMs,
      demoMode,
      send,
      submitAnswer,
      isDemoScreenShown,
      screenState,
      restartDemo,
    ],
  );
}
