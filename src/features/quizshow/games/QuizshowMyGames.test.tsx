import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  QUIZSHOW_GAMES_PER_MEMBER_MAX,
  type QuizshowGameListResponse,
  type QuizshowGameResponse,
} from "../../../shared/contracts/quizshow";
import {
  demoCreateGame,
  demoDeleteGame,
  demoListGames,
  resetQuizshowDemoGames,
} from "../api/quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "../api/quizshowDemoGames.data";
import { demoPacks, resetQuizshowDemoStore } from "../api/quizshowDemoStore";
import { quizshowKeys } from "../api/quizshowKeys";
import { QuizshowPlayHome } from "./QuizshowPlayHome";

const mocks = vi.hoisted(() => ({ isVisible: true }));

vi.mock("../quizshowLaunch", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../quizshowLaunch")>()),
  useIsQuizshowVisible: () => mocks.isVisible,
}));

vi.mock("../api/quizshowDemoGames", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoGames")>();
  return {
    ...actual,
    demoCreateGame: vi.fn(actual.demoCreateGame),
    demoListGames: vi.fn(actual.demoListGames),
  };
});

const LIMIT_MESSAGE =
  "You have 50 games, the most you can keep. Delete one to make room";

function LocationProbe() {
  const location = useLocation();
  return (
    <output data-testid="location">
      {`${location.pathname}${location.search}`}
    </output>
  );
}

function renderHome(queryClient?: QueryClient) {
  return render(
    <TestProviders initialEntries={["/play"]} queryClient={queryClient}>
      <QuizshowPlayHome initialErrorCode={null} />
      <LocationProbe />
    </TestProviders>,
  );
}

function currentLocation(): string {
  return screen.getByTestId("location").textContent ?? "";
}

function deleteEverySeededGame() {
  demoDeleteGame(QUIZSHOW_DEMO_GAME_IDS.flatQuiz);
  demoDeleteGame(QUIZSHOW_DEMO_GAME_IDS.afterDark);
}

function lastCreatedGame(): QuizshowGameResponse {
  const results = vi.mocked(demoCreateGame).mock.results;
  const lastResult = results[results.length - 1];
  if (lastResult?.type !== "return") throw new Error("no game was created");
  return lastResult.value;
}

function seededSummary(gameId: string) {
  const summary = demoListGames().games.find((game) => game.id === gameId);
  if (!summary) throw new Error(`no demo game ${gameId}`);
  return summary;
}

function resetDemoGames() {
  mocks.isVisible = true;
  resetQuizshowDemoStore();
  resetQuizshowDemoGames();
  vi.mocked(demoCreateGame).mockClear();
  vi.mocked(demoListGames).mockClear();
}

function clearStoredLanguage() {
  window.localStorage.clear();
}

describe("QuizshowMyGames", () => {
  beforeEach(resetDemoGames);
  afterEach(clearStoredLanguage);

  it("shows only the code form to a member without Pulse Live access", async () => {
    mocks.isVisible = false;
    renderHome();

    expect(
      await screen.findByRole("heading", { name: "Join a live game" }),
    ).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "My games" })).toBeNull();
    expect(screen.queryByRole("button", { name: "New game" })).toBeNull();
    expect(vi.mocked(demoListGames)).not.toHaveBeenCalled();
  });

  it("lists the member's games with counts, 18+, Live now and Results tags", async () => {
    const afterDark = seededSummary(QUIZSHOW_DEMO_GAME_IDS.afterDark);
    const flatQuiz = seededSummary(QUIZSHOW_DEMO_GAME_IDS.flatQuiz);
    renderHome();

    const afterDarkCard = await screen.findByRole("link", {
      name: /After dark trivia/,
    });
    expect(afterDarkCard.getAttribute("href")).toBe(
      `/play/games/${QUIZSHOW_DEMO_GAME_IDS.afterDark}`,
    );
    expect(
      within(afterDarkCard).getByText("Live now, code QG4MW8"),
    ).toBeTruthy();
    expect(within(afterDarkCard).getByText("18+")).toBeTruthy();
    expect(within(afterDarkCard).queryByText("Results")).toBeNull();
    expect(
      within(afterDarkCard).getByText(
        new RegExp(
          `${afterDark.roundCount} rounds, ${afterDark.questionCount} questions`,
        ),
      ),
    ).toBeTruthy();

    const flatQuizCard = screen.getByRole("link", { name: /Friday flat quiz/ });
    expect(within(flatQuizCard).getByText("Results")).toBeTruthy();
    expect(within(flatQuizCard).queryByText("18+")).toBeNull();
    expect(within(flatQuizCard).queryByText(/Live now/)).toBeNull();
    expect(
      within(flatQuizCard).getByText(
        new RegExp(
          `${flatQuiz.roundCount} rounds, ${flatQuiz.questionCount} questions`,
        ),
      ),
    ).toBeTruthy();
    expect(within(flatQuizCard).getByText(/Edited /)).toBeTruthy();
  });

  it("creates a game and opens its page", async () => {
    renderHome();

    await userEvent.click(
      await screen.findByRole("button", { name: "New game" }),
    );
    await userEvent.type(
      await screen.findByRole("textbox", { name: /Game title/ }),
      "  Board game night  ",
    );
    await userEvent.click(screen.getByRole("button", { name: "Create game" }));

    await waitFor(() => {
      expect(vi.mocked(demoCreateGame)).toHaveBeenCalledWith({
        title: "Board game night",
        source: null,
      });
    });
    const created = lastCreatedGame();
    await waitFor(() => {
      expect(currentLocation()).toBe(`/play/games/${created.gameId}`);
    });
    expect(await screen.findByText("Game created")).toBeTruthy();
  });

  it("says when the 50-game limit is reached", async () => {
    const seededCount = demoListGames().games.length;
    for (
      let gameIndex = seededCount;
      gameIndex < QUIZSHOW_GAMES_PER_MEMBER_MAX;
      gameIndex += 1
    ) {
      demoCreateGame({ title: `Game ${gameIndex + 1}`, source: null });
    }
    vi.mocked(demoCreateGame).mockClear();
    renderHome();

    expect(await screen.findByText(LIMIT_MESSAGE)).toBeTruthy();
    const newGameButton = screen.getByRole("button", { name: "New game" });
    expect(newGameButton.getAttribute("aria-disabled")).toBe("true");

    await userEvent.click(newGameButton);

    expect(screen.queryByRole("textbox", { name: /Game title/ })).toBeNull();
    expect(vi.mocked(demoCreateGame)).not.toHaveBeenCalled();
  });
});

describe("QuizshowMyGames ways to start a game", () => {
  beforeEach(resetDemoGames);
  afterEach(clearStoredLanguage);

  it("keeps Create game blocked on a blank title with its error", async () => {
    renderHome();

    await userEvent.click(
      await screen.findByRole("button", { name: "New game" }),
    );
    await userEvent.type(
      await screen.findByRole("textbox", { name: /Game title/ }),
      "   ",
    );
    const createButton = screen.getByRole("button", { name: "Create game" });
    expect(createButton.getAttribute("aria-disabled")).toBe("true");

    await userEvent.click(createButton);

    expect(await screen.findByText("Give the game a title")).toBeTruthy();
    expect(createButton.getAttribute("aria-disabled")).toBe("true");
    expect(vi.mocked(demoCreateGame)).not.toHaveBeenCalled();
    expect(currentLocation()).toBe("/play");
  });

  it("starts a game from a pack with the pack's title", async () => {
    window.localStorage.setItem("qp.lang", "pt");
    deleteEverySeededGame();
    const firstPack = demoPacks().items[0];
    if (!firstPack) throw new Error("no demo pack");
    renderHome();

    await userEvent.click(
      await screen.findByRole("button", { name: "Começar com um pack" }),
    );
    const useButtons = await screen.findAllByRole("button", {
      name: "Usar este pack",
    });
    const firstUseButton = useButtons[0];
    if (!firstUseButton) throw new Error("no pack row");
    await userEvent.click(firstUseButton);

    await waitFor(() => {
      expect(vi.mocked(demoCreateGame)).toHaveBeenCalledWith({
        title: firstPack.title.pt,
        source: { from: "pack", packKey: firstPack.key },
      });
    });
    const created = lastCreatedGame();
    await waitFor(() => {
      expect(currentLocation()).toBe(`/play/games/${created.gameId}`);
    });
  });

  it("shows the three ways to start when there are no games", async () => {
    deleteEverySeededGame();
    renderHome();

    expect(
      await screen.findByRole("heading", { name: "No games yet" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Start from a pack" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Copy a game or event quiz" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Start blank" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /trivia|quiz/i })).toBeNull();
    expect(screen.queryByRole("button", { name: "New game" })).toBeNull();
  });

  it("keeps the New game dialog open while the empty state turns into the list", async () => {
    deleteEverySeededGame();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    renderHome(queryClient);

    await userEvent.click(
      await screen.findByRole("button", { name: "Start blank" }),
    );
    await userEvent.type(
      await screen.findByRole("textbox", { name: /Game title/ }),
      "Still typing",
    );
    act(() => {
      queryClient.setQueryData<QuizshowGameListResponse>(
        quizshowKeys.games(true),
        {
          games: [
            {
              id: "swapped-in-game",
              title: "Swapped in",
              roundCount: 1,
              questionCount: 4,
              isAdultsOnly: false,
              liveSession: null,
              hasResults: false,
              updatedAt: "2026-10-20T10:00:00.000Z",
            },
          ],
          limit: QUIZSHOW_GAMES_PER_MEMBER_MAX,
        },
      );
    });

    expect(
      await screen.findByRole("link", { name: /Swapped in/ }),
    ).toBeTruthy();
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "No games yet" }),
      ).toBeNull();
    });
    const titleInput = screen.getByRole<HTMLInputElement>("textbox", {
      name: /Game title/,
    });
    expect(titleInput.value).toBe("Still typing");
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("copy opens the new game with the source picker", async () => {
    deleteEverySeededGame();
    renderHome();

    await userEvent.click(
      await screen.findByRole("button", { name: "Copy a game or event quiz" }),
    );
    await userEvent.type(
      await screen.findByRole("textbox", { name: /Game title/ }),
      "Copied quiz",
    );
    await userEvent.click(screen.getByRole("button", { name: "Create game" }));

    await waitFor(() => {
      expect(vi.mocked(demoCreateGame)).toHaveBeenCalledWith({
        title: "Copied quiz",
        source: null,
      });
    });
    const created = lastCreatedGame();
    await waitFor(() => {
      expect(currentLocation()).toBe(
        `/play/games/${created.gameId}?start=copy`,
      );
    });
  });
});
