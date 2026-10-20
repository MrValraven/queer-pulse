import { render, screen, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowCursor,
  QuizshowHostState,
  QuizshowRoundCard,
} from "../../../shared/contracts/quizshow";
import type { QuizshowHostSession } from "../screen/quizshowHostSession";
import type { QuizshowClientState } from "../realtime/quizshowClientStore";
import type { QuizshowSessionController } from "../realtime/useQuizshowSession";
import { QUIZSHOW_GAME_REMOTE_ROUTE, quizshowGamePath } from "../quizshowPaths";
import { QUIZSHOW_DEMO_GAME_SESSION_PREFIX } from "../quizshow.constants";
import { QuizshowGameRemotePage } from "./QuizshowGameRemotePage";

const GAME_ID = "game-after-dark";
const DEMO_GAME_SESSION_ID = QUIZSHOW_DEMO_GAME_SESSION_PREFIX + GAME_ID;

const gameSessionMock = vi.hoisted(() => ({
  controller: null as QuizshowSessionController | null,
  sessionId: null as string | null,
  lastOptions: null as { gameId?: string | null } | null,
}));

vi.mock("../screen/useQuizshowGameSession", () => ({
  useQuizshowGameSession: (): QuizshowHostSession => ({
    scope: { kind: "game", gameId: "game-after-dark" },
    slug: "",
    eventTitle: "",
    gameTitle: "After dark",
    isAdultsOnly: false,
    backPath: "/play/games/game-after-dark",
    backLabelKey: "quizshow:screen.backToGame",
    noGameKeys: {
      screen: "quizshow:screen.noGameForGame",
      remote: "quizshow:remote.noGameForGame",
    },
    isOrganizer: true,
    isLoading: false,
    sessionId: gameSessionMock.sessionId,
    errorCode: null,
    hasLoadFailed: false,
    playMode: "solo",
  }),
}));
vi.mock("../screen/QuizshowScreenStage", () => ({
  QuizshowScreenStage: (props: { state: QuizshowClientState }) => (
    <div
      data-testid="screen-stage"
      data-phase={props.state.session?.cursor.phase ?? "none"}
    />
  ),
}));
vi.mock("../sound/useQuizshowCues", () => ({ useQuizshowCues: vi.fn() }));
vi.mock("../realtime/useQuizshowSession", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../realtime/useQuizshowSession")>();
  function useSessionForTest(
    options: Parameters<typeof actual.useQuizshowSession>[0],
  ): QuizshowSessionController {
    gameSessionMock.lastOptions = options;
    const demoController = actual.useQuizshowSession(options);
    return gameSessionMock.controller ?? demoController;
  }
  return { ...actual, useQuizshowSession: useSessionForTest };
});

function renderPage() {
  return render(
    <TestProviders initialEntries={[`/play/games/${GAME_ID}/remote`]}>
      <ReducedMotionContext.Provider value>
        <Routes>
          <Route
            path={QUIZSHOW_GAME_REMOTE_ROUTE}
            element={<QuizshowGameRemotePage />}
          />
        </Routes>
      </ReducedMotionContext.Provider>
    </TestProviders>,
  );
}

const ROUND: QuizshowRoundCard = {
  roundIndex: 0,
  kind: "quiz",
  title: { en: "Warm up", pt: "Aquecimento" },
  contentLabel: "none",
  questionCount: 5,
  isJokerAllowed: true,
  isSpeedBonusOn: true,
};

function endedGameState(): QuizshowHostState {
  const cursor: QuizshowCursor = {
    phaseId: "40",
    status: "running",
    phase: "ended",
    roundIndex: 0,
    questionIndex: 0,
    roundCount: 1,
    phaseStartedAt: 1_000,
    deadline: null,
    extraTimeDeadline: null,
    pausedRemainingMs: null,
    pausedExtraTimeRemainingMs: null,
    isRestartRecovery: false,
  };
  return {
    role: "host",
    sessionId: "session-1",
    eventSlug: null,
    eventTitle: null,
    kind: "game",
    gameId: GAME_ID,
    isAdultsOnly: false,
    joinCode: "QG4MW8",
    quizTitle: "After dark",
    languages: "both",
    screenLanguage: "en",
    playMode: "solo",
    maxTeamSize: null,
    isReviewOn: true,
    isScreenMuted: false,
    cursor,
    rounds: [ROUND],
    round: ROUND,
    reveal: null,
    scores: null,
    podium: null,
    nextEvent: null,
    lobby: { players: [], teams: [], playerCount: 0 },
    question: null,
    answerCount: null,
    voteOptions: null,
    reviewList: null,
  };
}

function stubLiveController(
  status: QuizshowClientState["status"],
  session: QuizshowHostState | null = null,
): QuizshowSessionController {
  return {
    state: {
      role: "host",
      status,
      refusalCode: null,
      session,
      sessionEnd: null,
      isRemoved: false,
      pendingAnswer: null,
    },
    clockOffsetMs: 0,
    isDemo: false,
    send: vi.fn(),
    submitAnswer: vi.fn(),
    demoScreenState: null,
    restartDemo: vi.fn(),
  };
}

describe("QuizshowGameRemotePage", () => {
  afterEach(() => {
    gameSessionMock.controller = null;
    gameSessionMock.sessionId = null;
    gameSessionMock.lastOptions = null;
  });

  it("passes the game id to the live session", async () => {
    gameSessionMock.sessionId = DEMO_GAME_SESSION_ID;
    renderPage();

    await screen.findByRole("button", { name: "Start game" });
    expect(gameSessionMock.lastOptions?.gameId).toBe(GAME_ID);
  });

  it("drives the game's session from the remote in demo", async () => {
    gameSessionMock.sessionId = DEMO_GAME_SESSION_ID;
    renderPage();

    const preview = await screen.findByRole("region", {
      name: "Big screen preview",
    });
    expect(
      within(preview).getByTestId("screen-stage").getAttribute("data-phase"),
    ).toBe("lobby");
    expect(screen.getByRole("button", { name: "Start game" })).toBeTruthy();
  });

  it("links Back to the game page after the game ends", async () => {
    gameSessionMock.controller = stubLiveController(
      "attached",
      endedGameState(),
    );
    gameSessionMock.sessionId = "session-1";

    renderPage();

    const backLink = await screen.findByRole("link", {
      name: "Back to the game",
    });
    expect(backLink.getAttribute("href")).toBe(quizshowGamePath(GAME_ID));
  });

  it("says no lobby is open for a demo game without one", async () => {
    renderPage();

    expect(
      await screen.findByText("No lobby is open for this game"),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Start game" }),
    ).not.toBeInTheDocument();
  });

  it("says no lobby is open for this game", async () => {
    gameSessionMock.controller = stubLiveController("attached");

    renderPage();

    expect(
      await screen.findByText("No lobby is open for this game"),
    ).toBeTruthy();
    const backLink = screen.getByRole("link", { name: "Back to the game" });
    expect(backLink.getAttribute("href")).toBe(quizshowGamePath(GAME_ID));
  });
});
