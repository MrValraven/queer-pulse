import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  QuizshowAnswerPayload,
  QuizshowCursor,
  QuizshowMyAnswer,
  QuizshowPlayerState,
} from "../../../shared/contracts/quizshow";
import type { QuizshowClientAction } from "./quizshowClientStore";
import { QuizshowSendTimeoutError } from "./quizshowSocket";
import { useQuizshowSession } from "./useQuizshowSession";

interface CapturedClientOptions {
  sessionId: string;
  role: string;
  onAction: (action: QuizshowClientAction) => void;
}

const socketMock = vi.hoisted(() => ({
  constructedOptions: [] as CapturedClientOptions[],
  connect: vi.fn(),
  send: vi.fn(),
  dispose: vi.fn(),
}));
const demoModeMock = vi.hoisted(() => ({ isDemo: false }));
const demoEngineMock = vi.hoisted(() => ({
  sessionStateFor: vi.fn(),
  subscribe: vi.fn(() => () => undefined),
  subscribeScreen: vi.fn(() => () => undefined),
  send: vi.fn(),
  restart: vi.fn(),
}));

vi.mock("./quizshowSocket", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./quizshowSocket")>();
  class FakeQuizshowSocketClient {
    constructor(options: CapturedClientOptions) {
      socketMock.constructedOptions.push(options);
    }
    connect() {
      socketMock.connect();
    }
    send(name: string, payload: unknown): unknown {
      return socketMock.send(name, payload);
    }
    dispose() {
      socketMock.dispose();
    }
  }
  return { ...actual, QuizshowSocketClient: FakeQuizshowSocketClient };
});
vi.mock("../engine/useQuizshowDemoEngine", () => ({
  useQuizshowDemoEngine: (_options: unknown, isEnabled: boolean) =>
    isEnabled ? demoEngineMock : null,
}));
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: demoModeMock.isDemo }),
}));
vi.mock("../../../app/providers/authContext", () => ({
  useAuth: () => ({ loggedIn: true }),
}));
vi.mock("../../../shared/api/config", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../shared/api/config")>()),
  API_BASE_URL: "https://api.example.test",
  apiAvailable: true,
}));

const ANSWER: QuizshowAnswerPayload = {
  type: "multiple_choice",
  optionIndex: 2,
};

function cursorWith(overrides: Partial<QuizshowCursor> = {}): QuizshowCursor {
  return {
    phaseId: "5",
    status: "running",
    phase: "open",
    roundIndex: 0,
    questionIndex: 0,
    roundCount: 2,
    phaseStartedAt: 1_000,
    deadline: 21_000,
    extraTimeDeadline: null,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
    ...overrides,
  };
}

function storedAnswer(): QuizshowMyAnswer {
  return {
    questionId: "q1",
    phaseId: "5",
    payload: ANSWER,
    receivedAt: 5_000,
  };
}

function playerState(
  overrides: Partial<QuizshowPlayerState> = {},
): QuizshowPlayerState {
  return {
    sessionId: "session-1",
    eventSlug: "quiz-night",
    eventTitle: "Quiz night",
    kind: "event",
    gameId: null,
    isAdultsOnly: false,
    joinCode: "QZ7KP4",
    quizTitle: "Pride quiz",
    languages: "both",
    screenLanguage: "en",
    playMode: "solo",
    maxTeamSize: null,
    isReviewOn: false,
    isScreenMuted: false,
    rounds: [],
    round: null,
    reveal: null,
    scores: null,
    podium: null,
    nextEvent: null,
    role: "player",
    cursor: cursorWith(),
    lobby: { players: [], teams: [], playerCount: 0 },
    question: {
      questionId: "q1",
      roundIndex: 0,
      questionIndex: 0,
      roundKind: "quiz",
      type: "multiple_choice",
      prompt: { en: "Which one", pt: "Qual" },
      mediaUrl: null,
      points: 1000,
      timeLimitSeconds: 20,
      options: null,
    },
    voteOptions: null,
    me: null,
    suggestedScreenName: "Ana",
    isEligibleForQuestion: true,
    myAnswer: null,
    myVote: null,
    myReveal: null,
    myScores: null,
    ...overrides,
  };
}

const DEMO_OPTIONS = {
  eventSlug: "quiz-night",
  eventTitle: "Quiz night",
  isAutoHost: true,
  hasSelfPlayer: true,
  playMode: "solo",
  suggestedScreenName: "Ana",
  shouldLoop: false,
} as const;

function renderSession(queryClient = new QueryClient()) {
  function QueryWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return renderHook(
    () =>
      useQuizshowSession({
        sessionId: "session-1",
        role: "player",
        demo: DEMO_OPTIONS,
      }),
    { wrapper: QueryWrapper },
  );
}

function pushAction(action: QuizshowClientAction) {
  const options = socketMock.constructedOptions.at(-1);
  if (!options) throw new Error("no socket client was created");
  act(() => options.onAction(action));
}

function answerSubmitCalls() {
  return socketMock.send.mock.calls.filter(
    ([name]) => name === "answer:submit",
  );
}

beforeEach(() => {
  socketMock.constructedOptions.length = 0;
  socketMock.connect.mockReset();
  socketMock.send.mockReset();
  socketMock.dispose.mockReset();
  demoModeMock.isDemo = false;
  demoEngineMock.sessionStateFor.mockReset();
  demoEngineMock.subscribe.mockClear();
});

describe("useQuizshowSession answers", () => {
  it("resends an answer whose ack was lost to a drop", async () => {
    socketMock.send
      .mockRejectedValueOnce(new QuizshowSendTimeoutError("answer:submit"))
      .mockResolvedValueOnce({
        ok: true,
        answer: storedAnswer(),
        isDuplicate: false,
      });
    const { result } = renderSession();
    pushAction({ event: "session:state", payload: playerState() });

    let submitResult: unknown;
    await act(async () => {
      submitResult = await result.current.submitAnswer({
        questionId: "q1",
        payload: ANSWER,
      });
    });
    expect(submitResult).toEqual({ ok: false, code: "transport_timeout" });
    expect(result.current.state.pendingAnswer).toEqual({
      phaseId: "5",
      questionId: "q1",
      payload: ANSWER,
    });
    expect(answerSubmitCalls()).toHaveLength(1);

    pushAction({
      event: "local:status",
      payload: { status: "reconnecting", refusalCode: null },
    });
    pushAction({ event: "session:state", payload: playerState() });

    await waitFor(() => expect(answerSubmitCalls()).toHaveLength(2));
    expect(answerSubmitCalls()[1]).toEqual([
      "answer:submit",
      { phaseId: "5", questionId: "q1", payload: ANSWER },
    ]);
    await waitFor(() => expect(result.current.state.pendingAnswer).toBeNull());

    pushAction({ event: "session:state", payload: playerState() });
    expect(answerSubmitCalls()).toHaveLength(2);
  });

  it("resends an answer submitted while the socket was down", async () => {
    socketMock.send
      .mockRejectedValueOnce(new QuizshowSendTimeoutError("answer:submit"))
      .mockResolvedValueOnce({
        ok: true,
        answer: storedAnswer(),
        isDuplicate: false,
      });
    const { result } = renderSession();
    pushAction({ event: "session:state", payload: playerState() });
    pushAction({
      event: "local:status",
      payload: { status: "reconnecting", refusalCode: null },
    });

    await act(async () => {
      await result.current.submitAnswer({ questionId: "q1", payload: ANSWER });
    });
    expect(result.current.state.pendingAnswer).not.toBeNull();
    expect(answerSubmitCalls()).toHaveLength(1);

    pushAction({ event: "session:state", payload: playerState() });

    await waitFor(() => expect(answerSubmitCalls()).toHaveLength(2));
    expect(answerSubmitCalls()[1]).toEqual([
      "answer:submit",
      { phaseId: "5", questionId: "q1", payload: ANSWER },
    ]);
    await waitFor(() => expect(result.current.state.pendingAnswer).toBeNull());
    pushAction({ event: "session:state", payload: playerState() });
    expect(answerSubmitCalls()).toHaveLength(2);
  });

  it("keeps an answer refused before attach and resends it after the replay", async () => {
    socketMock.send
      .mockResolvedValueOnce({
        ok: false,
        code: "quizshow_not_attached",
        message: "not attached",
      })
      .mockResolvedValueOnce({
        ok: true,
        answer: storedAnswer(),
        isDuplicate: false,
      });
    const { result } = renderSession();
    pushAction({ event: "session:state", payload: playerState() });

    await act(async () => {
      await result.current.submitAnswer({ questionId: "q1", payload: ANSWER });
    });
    expect(result.current.state.pendingAnswer).not.toBeNull();

    pushAction({ event: "session:state", payload: playerState() });

    await waitFor(() => expect(answerSubmitCalls()).toHaveLength(2));
    await waitFor(() => expect(result.current.state.pendingAnswer).toBeNull());
  });

  it("keeps the stored answer when the server already holds it", async () => {
    socketMock.send.mockRejectedValueOnce(
      new QuizshowSendTimeoutError("answer:submit"),
    );
    const { result } = renderSession();
    pushAction({ event: "session:state", payload: playerState() });

    await act(async () => {
      await result.current.submitAnswer({ questionId: "q1", payload: ANSWER });
    });
    expect(result.current.state.pendingAnswer).not.toBeNull();

    pushAction({
      event: "local:status",
      payload: { status: "reconnecting", refusalCode: null },
    });
    pushAction({
      event: "session:state",
      payload: playerState({ myAnswer: storedAnswer() }),
    });

    expect(result.current.state.pendingAnswer).toBeNull();
    expect(answerSubmitCalls()).toHaveLength(1);
    const session = result.current.state.session;
    expect(session?.role === "player" ? session.myAnswer : null).toEqual(
      storedAnswer(),
    );
  });

  it("drops the pending answer when the phase closed", async () => {
    socketMock.send.mockResolvedValueOnce({
      ok: false,
      code: "quizshow_phase_closed",
      message: "closed",
    });
    const { result } = renderSession();
    pushAction({ event: "session:state", payload: playerState() });

    let submitResult: unknown;
    await act(async () => {
      submitResult = await result.current.submitAnswer({
        questionId: "q1",
        payload: ANSWER,
      });
    });

    expect(submitResult).toEqual({
      ok: false,
      code: "quizshow_phase_closed",
      message: "closed",
    });
    expect(result.current.state.pendingAnswer).toBeNull();
    expect(answerSubmitCalls()).toHaveLength(1);
  });
});

describe("useQuizshowSession newer pending answers", () => {
  it("keeps a newer pending answer when the ack of an older resend arrives", async () => {
    let resolveResend: (ack: unknown) => void = () => undefined;
    const resendAck = new Promise((resolve) => {
      resolveResend = resolve;
    });
    socketMock.send
      .mockRejectedValueOnce(new QuizshowSendTimeoutError("answer:submit"))
      .mockReturnValueOnce(resendAck)
      .mockRejectedValueOnce(new QuizshowSendTimeoutError("answer:submit"));
    const { result } = renderSession();
    pushAction({ event: "session:state", payload: playerState() });

    await act(async () => {
      await result.current.submitAnswer({ questionId: "q1", payload: ANSWER });
    });
    pushAction({
      event: "local:status",
      payload: { status: "reconnecting", refusalCode: null },
    });
    pushAction({ event: "session:state", payload: playerState() });
    await waitFor(() => expect(answerSubmitCalls()).toHaveLength(2));

    const secondQuestion = playerState().question;
    if (secondQuestion === null) throw new Error("expected a question");
    pushAction({
      event: "phase:change",
      payload: {
        cursor: cursorWith({ phaseId: "6" }),
        round: null,
        question: { ...secondQuestion, questionId: "q2", questionIndex: 1 },
      },
    });
    const secondAnswer: QuizshowAnswerPayload = {
      type: "multiple_choice",
      optionIndex: 0,
    };
    await act(async () => {
      await result.current.submitAnswer({
        questionId: "q2",
        payload: secondAnswer,
      });
    });
    const newerPending = {
      phaseId: "6",
      questionId: "q2",
      payload: secondAnswer,
    };
    expect(result.current.state.pendingAnswer).toEqual(newerPending);

    await act(async () => {
      resolveResend({ ok: true, answer: storedAnswer(), isDuplicate: false });
      // A macrotask lets the hook's ack handler run before the assertions.
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.state.pendingAnswer).toEqual(newerPending);
    expect(answerSubmitCalls()).toHaveLength(3);
  });

  it("keeps a newer pending answer when a slow first ack arrives", async () => {
    let resolveFirstAck: (ack: unknown) => void = () => undefined;
    const firstAck = new Promise((resolve) => {
      resolveFirstAck = resolve;
    });
    socketMock.send
      .mockReturnValueOnce(firstAck)
      .mockRejectedValueOnce(new QuizshowSendTimeoutError("answer:submit"));
    const { result } = renderSession();
    pushAction({ event: "session:state", payload: playerState() });

    let firstSubmit: Promise<unknown> = Promise.resolve();
    act(() => {
      firstSubmit = result.current.submitAnswer({
        questionId: "q1",
        payload: ANSWER,
      });
    });
    const secondQuestion = playerState().question;
    if (secondQuestion === null) throw new Error("expected a question");
    pushAction({
      event: "phase:change",
      payload: {
        cursor: cursorWith({ phaseId: "6" }),
        round: null,
        question: { ...secondQuestion, questionId: "q2", questionIndex: 1 },
      },
    });
    const secondAnswer: QuizshowAnswerPayload = {
      type: "multiple_choice",
      optionIndex: 1,
    };
    await act(async () => {
      await result.current.submitAnswer({
        questionId: "q2",
        payload: secondAnswer,
      });
    });
    const newerPending = {
      phaseId: "6",
      questionId: "q2",
      payload: secondAnswer,
    };
    expect(result.current.state.pendingAnswer).toEqual(newerPending);

    await act(async () => {
      resolveFirstAck({ ok: true, answer: storedAnswer(), isDuplicate: false });
      await firstSubmit;
    });

    expect(result.current.state.pendingAnswer).toEqual(newerPending);
  });
});

describe("useQuizshowSession endings and mode swaps", () => {
  it("refreshes the event, the quiz and the results once a live night ends", () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined);
    renderSession(queryClient);
    pushAction({ event: "session:state", payload: playerState() });
    expect(invalidateSpy).not.toHaveBeenCalled();

    pushAction({
      event: "session:end",
      payload: {
        sessionId: "session-1",
        status: "finished",
        podium: [],
        nextEvent: null,
        hasResults: true,
      },
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["event"] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["quizshow", "quiz", "quiz-night", false],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["quizshow", "results", "quiz-night", false],
    });
    expect(invalidateSpy).toHaveBeenCalledTimes(3);
  });

  it("drops the session, the pending answer and the lost ack when live and demo swap", async () => {
    socketMock.send.mockRejectedValue(
      new QuizshowSendTimeoutError("answer:submit"),
    );
    const { result, rerender } = renderSession();
    pushAction({ event: "session:state", payload: playerState() });
    await act(async () => {
      await result.current.submitAnswer({ questionId: "q1", payload: ANSWER });
    });
    expect(result.current.state.pendingAnswer).not.toBeNull();
    expect(answerSubmitCalls()).toHaveLength(1);

    const demoState = playerState({ sessionId: "demo-quizshow-session" });
    demoEngineMock.sessionStateFor.mockReturnValue(demoState);
    demoModeMock.isDemo = true;
    rerender();
    expect(socketMock.dispose).toHaveBeenCalledTimes(1);
    expect(result.current.state.session).toEqual(demoState);
    expect(result.current.state.pendingAnswer).toBeNull();

    demoModeMock.isDemo = false;
    rerender();
    expect(socketMock.constructedOptions).toHaveLength(2);
    expect(result.current.state.session).toBeNull();
    expect(result.current.state.pendingAnswer).toBeNull();
    pushAction({ event: "session:state", payload: playerState() });
    expect(result.current.state.status).toBe("attached");
    expect(answerSubmitCalls()).toHaveLength(1);
  });
});

describe("useQuizshowSession modes", () => {
  it("opens one socket client for the live session and disposes it on unmount", () => {
    const { unmount } = renderSession();
    expect(socketMock.constructedOptions).toHaveLength(1);
    expect(socketMock.constructedOptions[0]).toMatchObject({
      sessionId: "session-1",
      role: "player",
    });
    expect(socketMock.connect).toHaveBeenCalledTimes(1);

    unmount();
    expect(socketMock.dispose).toHaveBeenCalledTimes(1);
  });

  it("runs the demo engine in demo mode and opens no socket", () => {
    demoModeMock.isDemo = true;
    const demoState = playerState({ sessionId: "demo-quizshow-session" });
    demoEngineMock.sessionStateFor.mockReturnValue(demoState);

    const { result } = renderSession();

    expect(socketMock.constructedOptions).toHaveLength(0);
    expect(socketMock.connect).not.toHaveBeenCalled();
    expect(demoEngineMock.sessionStateFor).toHaveBeenCalledWith("player");
    expect(demoEngineMock.subscribe).toHaveBeenCalledTimes(1);
    expect(result.current.isDemo).toBe(true);
    expect(result.current.state.session).toEqual(demoState);
    expect(result.current.state.status).toBe("attached");
    expect(result.current.demoScreenState).toBeNull();
  });
});
