import { render, screen, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { ApiError } from "../../../shared/api/client";
import type { QuizshowGameResponse } from "../../../shared/contracts/quizshow";
import { resetQuizshowDemoGames } from "../api/quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "../api/quizshowDemoGames.data";
import {
  QUIZSHOW_GAME_SCREEN_ROUTE,
  quizshowGamePath,
  quizshowGameScreenPath,
} from "../quizshowPaths";
import type { QuizshowScope } from "../quizshowScope";
import { QuizshowGameScreenPage } from "./QuizshowGameScreenPage";

const LIVE_GAME_ID = "game-live-1";

interface LiveQuizMock {
  isLive: boolean;
  response: QuizshowGameResponse | null;
  /** The quiz read's error: an ApiError for a refused read, null for a successful one. */
  error: Error | null;
  readScopes: QuizshowScope[];
}

const liveMock = vi.hoisted((): LiveQuizMock => ({
  isLive: false,
  response: null,
  error: null,
  readScopes: [],
}));

vi.mock("../../../shared/components/ui/RollingNumber", () => ({
  RollingNumber: (props: { value: string }) => <span>{props.value}</span>,
}));
vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../app/providers/DemoModeProvider")
    >();
  return {
    ...actual,
    useDemoMode: () => {
      const value = actual.useDemoMode();
      return liveMock.isLive ? { ...value, demoMode: false } : value;
    },
  };
});
vi.mock("../api/useQuizshowQuiz", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/useQuizshowQuiz")>();
  return {
    ...actual,
    useQuizshowQuiz: (
      scope: QuizshowScope,
      options: Parameters<typeof actual.useQuizshowQuiz>[1],
    ) => {
      const result = actual.useQuizshowQuiz(scope, options);
      if (!liveMock.isLive) return result;
      liveMock.readScopes.push(scope);
      if (liveMock.error !== null) {
        return {
          data: undefined,
          error: liveMock.error,
          isError: true,
          isSuccess: false,
          isLoading: false,
        };
      }
      return {
        data: liveMock.response,
        error: null,
        isError: false,
        isSuccess: true,
        isLoading: false,
      };
    },
  };
});

function gameWithoutLobby(): QuizshowGameResponse {
  return {
    gameId: LIVE_GAME_ID,
    quiz: null,
    problems: [],
    isAdultsEvent: false,
    isAdultsOnly: false,
    liveSession: null,
    hasResults: false,
  };
}

function renderGameScreen(gameId: string) {
  return render(
    <TestProviders initialEntries={[quizshowGameScreenPath(gameId)]}>
      <Routes>
        <Route
          path={QUIZSHOW_GAME_SCREEN_ROUTE}
          element={<QuizshowGameScreenPage />}
        />
      </Routes>
    </TestProviders>,
  );
}

function expectNoEventLinks() {
  for (const link of screen.queryAllByRole("link")) {
    expect(link.getAttribute("href") ?? "").not.toMatch(/^\/gatherings/);
  }
}

beforeEach(() => {
  window.localStorage.clear();
  resetQuizshowDemoGames();
  liveMock.isLive = false;
  liveMock.response = null;
  liveMock.error = null;
  liveMock.readScopes = [];
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("QuizshowGameScreenPage in demo", () => {
  it("plays the game's quiz on the big screen in demo", async () => {
    renderGameScreen(QUIZSHOW_DEMO_GAME_IDS.afterDark);

    expect(await screen.findByText("Queens and legends")).toBeInTheDocument();
    expect(screen.getByText("Names and dates")).toBeInTheDocument();
    expect(screen.getByText("Drag Name Generator")).toBeInTheDocument();
    expect(screen.getAllByText("Adults only (18+)").length).toBeGreaterThan(0);
    expect(
      screen.queryByText(/No lobby is open for this game/),
    ).not.toBeInTheDocument();
  });

  it("shows the game's own code in its demo lobby", async () => {
    renderGameScreen(QUIZSHOW_DEMO_GAME_IDS.afterDark);

    expect(await screen.findByText("QG4MW8")).toBeInTheDocument();
    expect(screen.queryByText("QZ7KP4")).not.toBeInTheDocument();
  });

  it("says no lobby is open for a demo game without one", async () => {
    renderGameScreen(QUIZSHOW_DEMO_GAME_IDS.flatQuiz);

    expect(
      await screen.findByText(
        "No lobby is open for this game. Open one from the game page",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("QZ7KP4")).not.toBeInTheDocument();
  });

  it("links Back to the game page", async () => {
    renderGameScreen(QUIZSHOW_DEMO_GAME_IDS.afterDark);

    const backLink = await screen.findByRole("link", {
      name: "Back to the game",
    });
    expect(backLink).toHaveAttribute(
      "href",
      quizshowGamePath(QUIZSHOW_DEMO_GAME_IDS.afterDark),
    );
    expect(backLink).toHaveAttribute(
      "href",
      `/play/games/${QUIZSHOW_DEMO_GAME_IDS.afterDark}`,
    );
    expect(
      screen.queryByRole("link", { name: "Back to the event" }),
    ).not.toBeInTheDocument();
    expectNoEventLinks();
  });
});

describe("QuizshowGameScreenPage live", () => {
  it("says no lobby is open for this game", async () => {
    liveMock.isLive = true;
    liveMock.response = gameWithoutLobby();
    renderGameScreen(LIVE_GAME_ID);

    const main = await screen.findByRole("main");
    expect(
      await within(main).findByText(
        "No lobby is open for this game. Open one from the game page",
      ),
    ).toBeInTheDocument();
    expect(
      within(main).getByRole("link", { name: "Back to the game" }),
    ).toHaveAttribute("href", quizshowGamePath(LIVE_GAME_ID));
    expect(
      screen.queryByText(
        "No game is open for this event. Open the lobby from the Live game tab",
      ),
    ).not.toBeInTheDocument();
    expect(liveMock.readScopes).toContainEqual({
      kind: "game",
      gameId: LIVE_GAME_ID,
    });
    expectNoEventLinks();
  });

  it("says the game is not found for someone else's game", async () => {
    liveMock.isLive = true;
    liveMock.error = new ApiError(404, "quizshow_game_not_found", {
      code: "quizshow_game_not_found",
    });
    renderGameScreen(LIVE_GAME_ID);

    expect(
      await screen.findByText("We couldn't find this game"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Only the event's hosts can do that"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "No lobby is open for this game. Open one from the game page",
      ),
    ).not.toBeInTheDocument();
  });
});
