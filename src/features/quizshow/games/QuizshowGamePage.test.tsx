import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "../../../app/routeMap";
import { LeaveConfirmProvider } from "../../../shared/components/feedback/LeaveConfirmProvider";
import { TestProviders } from "../../../test/TestProviders";
import { resetQuizshowDemoStore } from "../api/quizshowDemoStore";
import { ApiError } from "../../../shared/api/client";
import { demoDeleteGame, demoListGames } from "../api/quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "../api/quizshowDemoGames.data";
import { PageKeyedByParam } from "../PageKeyedByParam";
import { QUIZSHOW_GAME_ROUTE, quizshowGamePath } from "../quizshowPaths";
import { QuizshowGamePage } from "./QuizshowGamePage";

vi.mock("../api/quizshowDemoGames", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoGames")>();
  return { ...actual, demoDeleteGame: vi.fn(actual.demoDeleteGame) };
});

const GAME_ID = QUIZSHOW_DEMO_GAME_IDS.flatQuiz;
const SOURCES_LEAD = "Your other games, and events you run that hold a quiz";
const GAME_TITLE = "Friday flat quiz";
const DELETE_BODY =
  "Anyone playing now is sent out of the game, then its questions and any kept results go for good";

function LocationProbe() {
  const location = useLocation();
  return (
    <output data-testid="location">
      {location.pathname}
      {location.search}
    </output>
  );
}

function currentLocation(): string {
  return screen.getByTestId("location").textContent ?? "";
}

function renderGamePage(entry: string) {
  return render(
    <TestProviders initialEntries={[entry]}>
      {/* Mirrors App.tsx, so an unsaved changes guard asks in a dialog. */}
      <LeaveConfirmProvider>
        <Routes>
          <Route
            path={QUIZSHOW_GAME_ROUTE}
            element={
              <PageKeyedByParam paramName="gameId" page={QuizshowGamePage} />
            }
          />
          <Route
            path={routes.play}
            element={<output data-testid="play-home" />}
          />
        </Routes>
      </LeaveConfirmProvider>
      <LocationProbe />
    </TestProviders>,
  );
}

describe("QuizshowGamePage", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the game's title, its builder and its results card", async () => {
    renderGamePage(quizshowGamePath(GAME_ID));

    expect(
      await screen.findByRole("heading", { level: 1, name: GAME_TITLE }),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Back to Pulse Live" }),
    ).toBeTruthy();
    expect(
      await screen.findByRole("heading", { name: "Your quiz" }),
    ).toBeTruthy();
    expect(
      await screen.findByRole("heading", { name: "Pulse Live results" }),
    ).toBeTruthy();
    // The flat quiz is not marked 18+, so its title carries no tag.
    expect(screen.queryByText("18+")).toBeNull();
  });

  it("duplicates the game and opens the copy", async () => {
    const user = userEvent.setup();
    renderGamePage(quizshowGamePath(GAME_ID));

    await user.click(
      await screen.findByRole("button", { name: "Duplicate game" }),
    );

    expect(await screen.findByText("Game duplicated")).toBeTruthy();
    const copyId = demoListGames().games[0]?.id ?? "";
    expect(copyId).not.toBe(GAME_ID);
    await waitFor(() =>
      expect(currentLocation()).toBe(quizshowGamePath(copyId)),
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: GAME_TITLE }),
    ).toBeTruthy();
  });

  it("asks before deleting the game, then goes back to Pulse Live", async () => {
    const user = userEvent.setup();
    renderGamePage(quizshowGamePath(GAME_ID));

    await user.click(
      await screen.findByRole("button", { name: "Delete game" }),
    );

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Delete this game?")).toBeTruthy();
    expect(within(dialog).getByText(DELETE_BODY)).toBeTruthy();
    // Asking deletes nothing yet.
    expect(demoListGames().games.map((game) => game.id)).toContain(GAME_ID);

    await user.click(
      within(dialog).getByRole("button", { name: "Delete game" }),
    );

    await waitFor(() => expect(currentLocation()).toBe(routes.play));
    expect(await screen.findByText("Game deleted")).toBeTruthy();
    expect(screen.getByTestId("play-home")).toBeTruthy();
    expect(demoListGames().games.map((game) => game.id)).not.toContain(GAME_ID);
    expect(screen.queryByText("We couldn't find this game")).toBeNull();
  });

  it("deletes a game with unsaved edits and leaves without a prompt", async () => {
    const user = userEvent.setup();
    const nativeConfirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderGamePage(quizshowGamePath(GAME_ID));

    const titleField = await screen.findByLabelText("Game title");
    await user.type(titleField, " edited");
    await user.click(screen.getByRole("button", { name: "Delete game" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Delete game" }),
    );

    await waitFor(() => expect(currentLocation()).toBe(routes.play));
    expect(await screen.findByText("Game deleted")).toBeTruthy();
    expect(screen.queryByText("Leave without saving?")).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(nativeConfirm).not.toHaveBeenCalled();
    expect(screen.queryByText("We couldn't find this game")).toBeNull();
  });

  it("says the game is not found for an unknown id", async () => {
    renderGamePage(quizshowGamePath("no-such-game"));

    expect(
      await screen.findByRole("heading", {
        name: "We couldn't find this game",
      }),
    ).toBeTruthy();
    const backLink = screen.getByRole("link", { name: "Back to Pulse Live" });
    expect(backLink.getAttribute("href")).toBe(routes.play);
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("opens the source picker once for ?start=copy and clears the param", async () => {
    const user = userEvent.setup();
    renderGamePage(quizshowGamePath(GAME_ID, { shouldOpenSources: true }));

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText(
        "Your other games, and events you run that hold a quiz",
      ),
    ).toBeTruthy();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    await waitFor(() =>
      expect(currentLocation()).toBe(quizshowGamePath(GAME_ID)),
    );

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(currentLocation()).toBe(quizshowGamePath(GAME_ID));
    expect(
      screen.getByRole("heading", { level: 1, name: GAME_TITLE }),
    ).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps the source picker closed when a failed delete brings the builder back", async () => {
    const user = userEvent.setup();
    vi.mocked(demoDeleteGame).mockImplementationOnce(() => {
      throw new ApiError(500, "Server error");
    });
    renderGamePage(quizshowGamePath(GAME_ID, { shouldOpenSources: true }));

    expect(await screen.findByText(SOURCES_LEAD)).toBeTruthy();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await user.click(screen.getByRole("button", { name: "Delete game" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Delete game" }),
    );

    expect(await screen.findByLabelText("Game title")).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.queryByText(SOURCES_LEAD)).toBeNull();
    expect(currentLocation()).toBe(quizshowGamePath(GAME_ID));
  });
});
