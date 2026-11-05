import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "../../../app/routeMap";
import { LeaveConfirmProvider } from "../../../shared/components/feedback/LeaveConfirmProvider";
import { TestProviders } from "../../../test/TestProviders";
import { resetQuizshowDemoStore } from "../api/quizshowDemoStore";
import { ApiError } from "../../../shared/api/client";
import {
  demoCreateGame,
  demoDeleteGame,
  demoListGames,
  demoPutGame,
} from "../api/quizshowDemoGames";
import { demoRefusal } from "../api/quizshowDemoQuizzes";
import { QUIZSHOW_DEMO_GAME_IDS } from "../api/quizshowDemoGames.data";
import { PageKeyedByParam } from "../PageKeyedByParam";
import { QUIZSHOW_GAME_ROUTE, quizshowGamePath } from "../quizshowPaths";
import { QuizshowGamePage } from "./QuizshowGamePage";

vi.mock("../api/quizshowDemoGames", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoGames")>();
  return {
    ...actual,
    demoDeleteGame: vi.fn(actual.demoDeleteGame),
    demoPutGame: vi.fn(actual.demoPutGame),
  };
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

/** Opens the studio's More menu and picks one of its items. */
async function chooseMoreAction(
  user: ReturnType<typeof userEvent.setup>,
  itemName: string,
) {
  await user.click(await screen.findByRole("button", { name: "More actions" }));
  await user.click(await screen.findByRole("menuitem", { name: itemName }));
}

/** The studio's title fields: the one in the top bar and the one in the inspector. */
async function findGameTitleFields(): Promise<HTMLElement[]> {
  return screen.findAllByLabelText("Game title");
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

  it("opens the game in the studio, with the way back and its title", async () => {
    renderGamePage(quizshowGamePath(GAME_ID));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Quiz editor" }),
    ).toBeTruthy();
    const backLink = await screen.findByRole("link", {
      name: "Back to Pulse Live",
    });
    expect(backLink.getAttribute("href")).toBe(routes.play);
    for (const titleField of await findGameTitleFields()) {
      expect(titleField).toHaveValue(GAME_TITLE);
    }
  });

  it("shows the kept results in a panel from More", async () => {
    const user = userEvent.setup();
    renderGamePage(quizshowGamePath(GAME_ID));

    await chooseMoreAction(user, "Show results");

    // The panel's title names the results; the card inside has no heading or box of its own.
    const panel = await screen.findByRole("dialog", {
      name: "Pulse Live results",
    });
    expect(
      await within(panel).findByRole("button", { name: "Delete results" }),
    ).toBeTruthy();
    expect(within(panel).getAllByRole("heading")).toHaveLength(1);
    await user.click(
      within(panel).getByRole("button", { name: "Close the results" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("offers no Show results on a game with none kept", async () => {
    const user = userEvent.setup();
    const blankGame = demoCreateGame({ title: "Blank game", source: null });
    renderGamePage(quizshowGamePath(blankGame.gameId));

    await user.click(
      await screen.findByRole("button", { name: "More actions" }),
    );

    expect(
      await screen.findByRole("menuitem", { name: "Duplicate game" }),
    ).toBeTruthy();
    expect(screen.queryByRole("menuitem", { name: "Show results" })).toBeNull();
  });

  it("duplicates the game and opens the copy", async () => {
    const user = userEvent.setup();
    renderGamePage(quizshowGamePath(GAME_ID));

    await chooseMoreAction(user, "Duplicate game");

    expect(await screen.findByText("Game duplicated")).toBeTruthy();
    const copyId = demoListGames().games[0]?.id ?? "";
    expect(copyId).not.toBe(GAME_ID);
    await waitFor(() =>
      expect(currentLocation()).toBe(quizshowGamePath(copyId)),
    );
    for (const titleField of await findGameTitleFields()) {
      expect(titleField).toHaveValue(GAME_TITLE);
    }
  });

  it("names why the save failed and copies nothing when Duplicate's save is refused", async () => {
    const user = userEvent.setup();
    renderGamePage(quizshowGamePath(GAME_ID));
    const [titleField] = await findGameTitleFields();
    if (!titleField) throw new Error("The studio shows no title field");
    await user.type(titleField, " live");
    const gameCount = demoListGames().games.length;
    vi.mocked(demoPutGame).mockImplementationOnce(() => {
      throw demoRefusal(403, "quizshow_cohost_is_playing");
    });

    await chooseMoreAction(user, "Duplicate game");

    // The toast says the save's own reason, never the generic retry line.
    const reasons = await screen.findAllByText(
      "You're playing in this game, so the host tools wait until it ends",
    );
    expect(
      reasons.some((reason) => reason.closest('[role="alert"]') !== null),
    ).toBe(true);
    expect(
      screen.queryByText("We couldn't save the quiz. Try again"),
    ).toBeNull();
    expect(screen.queryByText("Game duplicated")).toBeNull();
    expect(demoListGames().games).toHaveLength(gameCount);
    expect(currentLocation()).toBe(quizshowGamePath(GAME_ID));
  });

  it("asks before deleting the game, then goes back to Pulse Live", async () => {
    const user = userEvent.setup();
    renderGamePage(quizshowGamePath(GAME_ID));

    await chooseMoreAction(user, "Delete game");

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

    const [titleField] = await findGameTitleFields();
    if (!titleField) throw new Error("The studio shows no title field");
    await user.type(titleField, " edited");
    await chooseMoreAction(user, "Delete game");
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
    // A gone game offers the way back (top bar and the panel's action), with no Try again.
    const backLinks = screen.getAllByRole("link", {
      name: "Back to Pulse Live",
    });
    expect(backLinks).toHaveLength(2);
    for (const backLink of backLinks) {
      expect(backLink.getAttribute("href")).toBe(routes.play);
    }
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
    expect(screen.queryByLabelText("Game title")).toBeNull();
  });

  it("opens the source picker once for ?start=copy and clears the param", async () => {
    const user = userEvent.setup();
    // My games sends a new, empty game here to copy a quiz into.
    const blankGame = demoCreateGame({ title: "Blank game", source: null });
    renderGamePage(
      quizshowGamePath(blankGame.gameId, { shouldOpenSources: true }),
    );

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(SOURCES_LEAD)).toBeTruthy();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    await waitFor(() =>
      expect(currentLocation()).toBe(quizshowGamePath(blankGame.gameId)),
    );

    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(currentLocation()).toBe(quizshowGamePath(blankGame.gameId));
    expect(
      screen.getByRole("button", { name: "Start with a blank quiz" }),
    ).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("keeps the source picker closed when a failed delete brings the studio back", async () => {
    const user = userEvent.setup();
    vi.mocked(demoDeleteGame).mockImplementationOnce(() => {
      throw new ApiError(500, "Server error");
    });
    const blankGame = demoCreateGame({ title: "Blank game", source: null });
    renderGamePage(
      quizshowGamePath(blankGame.gameId, { shouldOpenSources: true }),
    );

    expect(await screen.findByText(SOURCES_LEAD)).toBeTruthy();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await chooseMoreAction(user, "Delete game");
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Delete game" }),
    );

    expect(
      await screen.findByRole("button", { name: "Start with a blank quiz" }),
    ).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.queryByText(SOURCES_LEAD)).toBeNull();
    expect(currentLocation()).toBe(quizshowGamePath(blankGame.gameId));
  });
});
