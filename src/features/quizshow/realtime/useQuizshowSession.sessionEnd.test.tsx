import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  QuizshowSessionEnd,
  QuizshowSessionState,
} from "../../../shared/contracts/quizshow";
import type { QuizshowClientAction } from "./quizshowClientStore";
import { useQuizshowSession } from "./useQuizshowSession";

interface CapturedClientOptions {
  onAction: (action: QuizshowClientAction) => void;
}

const socketMock = vi.hoisted(() => ({
  constructedOptions: [] as CapturedClientOptions[],
}));
const demoModeMock = vi.hoisted(() => ({ isDemo: false }));
const demoEngineMock = vi.hoisted(() => ({
  capturedOptions: [] as unknown[],
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
    connect() {}
    send() {}
    dispose() {}
  }
  return { ...actual, QuizshowSocketClient: FakeQuizshowSocketClient };
});
vi.mock("../engine/useQuizshowDemoEngine", () => ({
  useQuizshowDemoEngine: (options: unknown, isEnabled: boolean) => {
    demoEngineMock.capturedOptions.push(options);
    return isEnabled ? demoEngineMock : null;
  },
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

const DEMO_OPTIONS = {
  eventSlug: null,
  eventTitle: null,
  isAutoHost: false,
  hasSelfPlayer: false,
  playMode: "solo",
  suggestedScreenName: "Ana",
  shouldLoop: false,
} as const;

/** Only the fields the session hook and the client store read. */
function hostStateWith(
  overrides: Partial<QuizshowSessionState>,
): QuizshowSessionState {
  return {
    sessionId: "session-1",
    eventSlug: null,
    eventTitle: null,
    kind: "game",
    gameId: "game-1",
    isAdultsOnly: false,
    role: "host",
    cursor: { status: "running", phase: "open" },
    podium: null,
    nextEvent: null,
    ...overrides,
  } as unknown as QuizshowSessionState;
}

function renderSession(
  queryClient: QueryClient,
  extra: { gameId?: string | null; isAdultsOnly?: boolean } = {},
) {
  function QueryWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return renderHook(
    () =>
      useQuizshowSession({
        sessionId: "session-1",
        role: "host",
        demo: DEMO_OPTIONS,
        ...extra,
      }),
    { wrapper: QueryWrapper },
  );
}

function pushAction(action: QuizshowClientAction) {
  const options = socketMock.constructedOptions.at(-1);
  if (!options) throw new Error("no socket client was created");
  act(() => options.onAction(action));
}

const SESSION_END: QuizshowSessionEnd = {
  sessionId: "session-1",
  status: "finished",
  podium: [],
  nextEvent: null,
  hasResults: true,
};

beforeEach(() => {
  socketMock.constructedOptions.length = 0;
  demoEngineMock.capturedOptions.length = 0;
  demoEngineMock.sessionStateFor.mockReset();
  demoModeMock.isDemo = false;
});

describe("useQuizshowSession session end", () => {
  it("refreshes the game, its results and My games when a game session ends", () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined);
    renderSession(queryClient, { gameId: "game-1" });
    pushAction({ event: "session:state", payload: hostStateWith({}) });
    expect(invalidateSpy).not.toHaveBeenCalled();

    pushAction({ event: "session:end", payload: SESSION_END });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["quizshow", "game", "game-1", false],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["quizshow", "game-results", "game-1", false],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["quizshow", "games", false],
    });
    expect(invalidateSpy).toHaveBeenCalledTimes(3);
  });

  it("refreshes the event as before when an event session ends", () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockResolvedValue(undefined);
    renderSession(queryClient);
    pushAction({
      event: "session:state",
      payload: hostStateWith({
        kind: "event",
        gameId: null,
        eventSlug: "quiz-night",
      }),
    });
    pushAction({ event: "session:end", payload: SESSION_END });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["event"] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["quizshow", "quiz", "quiz-night", false],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["quizshow", "results", "quiz-night", false],
    });
    expect(invalidateSpy).toHaveBeenCalledTimes(3);
  });

  it("passes the 18+ flag and game id to the demo engine", () => {
    demoModeMock.isDemo = true;
    demoEngineMock.sessionStateFor.mockReturnValue(hostStateWith({}));
    renderSession(new QueryClient(), { gameId: "game-1", isAdultsOnly: true });
    expect(demoEngineMock.capturedOptions.at(-1)).toMatchObject({
      role: "host",
      gameId: "game-1",
      isAdultsOnly: true,
    });
  });
});
