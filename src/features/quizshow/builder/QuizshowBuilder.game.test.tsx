import { QueryClient } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { QuizshowGameResponse } from "../../../shared/contracts/quizshow";
import {
  demoCreateGame,
  demoGetGame,
  demoPutGame,
  resetQuizshowDemoGames,
} from "../api/quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "../api/quizshowDemoGames.data";
import { resetQuizshowDemoStore } from "../api/quizshowDemoStore";
import { quizshowKeys } from "../api/quizshowKeys";
import { gameScope } from "../quizshowScope";
import { QuizshowBuilder } from "./QuizshowBuilder";

vi.mock("../../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../shared/hooks")>()),
  useUnsavedChangesGuard: vi.fn(),
}));

vi.mock("../api/quizshowDemoGames", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoGames")>();
  return {
    ...actual,
    demoPutGame: vi.fn(actual.demoPutGame),
  };
});

const FLAT_QUIZ_ID = QUIZSHOW_DEMO_GAME_IDS.flatQuiz;
const AFTER_DARK_ID = QUIZSHOW_DEMO_GAME_IDS.afterDark;
const ADULTS_SWITCH_NAME = "This game has 18+ content";

function renderGame(gameId: string, queryClient?: QueryClient) {
  return render(
    <TestProviders queryClient={queryClient}>
      <QuizshowBuilder scope={gameScope(gameId)} eventStartAt={null} />
    </TestProviders>,
  );
}

async function findAdultsSwitch(): Promise<HTMLElement> {
  return screen.findByRole("switch", { name: ADULTS_SWITCH_NAME });
}

/** A client whose cache holds a game with no quiz yet, kept fresh. */
function emptyGameClient(gameId: string): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  const response: QuizshowGameResponse = {
    gameId,
    quiz: null,
    problems: [],
    isAdultsEvent: false,
    isAdultsOnly: false,
    liveSession: null,
    hasResults: false,
  };
  queryClient.setQueryData(quizshowKeys.game(gameId, true), response);
  return queryClient;
}

describe("QuizshowBuilder on a game", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
    resetQuizshowDemoGames();
    vi.mocked(demoPutGame).mockClear();
  });

  it("labels the title field Game title and shows the 18+ switch on a game", async () => {
    renderGame(FLAT_QUIZ_ID);
    expect(await screen.findByLabelText("Game title")).toHaveValue(
      "Friday flat quiz",
    );
    expect(screen.queryByLabelText("Quiz title")).not.toBeInTheDocument();
    const adultsSwitch = await findAdultsSwitch();
    expect(adultsSwitch).toHaveAttribute("aria-checked", "false");
    expect(adultsSwitch).toHaveAccessibleDescription(
      "Players confirm before they join, and the adults label unlocks for rounds",
    );
  });

  it("saves the 18+ switch with the quiz", async () => {
    renderGame(FLAT_QUIZ_ID);
    fireEvent.click(await findAdultsSwitch());
    fireEvent.click(await screen.findByRole("button", { name: "Save quiz" }));
    expect(await screen.findByText("Quiz saved")).toBeInTheDocument();
    expect(demoPutGame).toHaveBeenCalledTimes(1);
    const [savedGameId, savedBody] = vi.mocked(demoPutGame).mock.calls[0] ?? [];
    expect(savedGameId).toBe(FLAT_QUIZ_ID);
    expect(savedBody?.isAdultsOnly).toBe(true);
    expect(demoGetGame(FLAT_QUIZ_ID).isAdultsOnly).toBe(true);
    await waitFor(() =>
      expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument(),
    );
    expect(await findAdultsSwitch()).toHaveAttribute("aria-checked", "true");
  });

  it("counts a flipped switch as unsaved", async () => {
    renderGame(FLAT_QUIZ_ID);
    const adultsSwitch = await findAdultsSwitch();
    expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();
    fireEvent.click(adultsSwitch);
    expect(await screen.findByText("Unsaved changes")).toBeInTheDocument();
    // Open lobby names the save bar's line as its reason, without a second copy of it.
    const openLobby = screen.getByRole("button", { name: "Open lobby" });
    expect(openLobby).toHaveAttribute("aria-disabled", "true");
    expect(openLobby).toHaveAccessibleDescription("Unsaved changes");
    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
    await waitFor(() =>
      expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument(),
    );
    expect(await findAdultsSwitch()).toHaveAttribute("aria-checked", "false");
  });

  it("unlocks the adults label while the switch is on", async () => {
    renderGame(FLAT_QUIZ_ID);
    const [firstEditButton] = await screen.findAllByRole("button", {
      name: "Edit round",
    });
    if (!firstEditButton) throw new Error("The demo game has no rounds");
    fireEvent.click(firstEditButton);
    const adultsLabel = await screen.findByRole("radio", {
      name: "Adults only (18+)",
    });
    expect(adultsLabel).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(await findAdultsSwitch());
    await waitFor(() =>
      expect(adultsLabel).not.toHaveAttribute("aria-disabled"),
    );
    fireEvent.click(adultsLabel);
    expect(adultsLabel).toHaveAttribute("aria-checked", "true");
  });

  it("keeps 18+ on while a round uses the adults label and says which", async () => {
    renderGame(AFTER_DARK_ID);
    const adultsSwitch = await findAdultsSwitch();
    expect(adultsSwitch).toHaveAttribute("aria-checked", "true");
    fireEvent.click(adultsSwitch);
    const notice = await screen.findByText(
      "Round 2 uses the adults label. Change its label first, then turn off 18+",
    );
    expect(notice).toHaveAttribute("role", "alert");
    expect(adultsSwitch).toHaveAttribute("aria-checked", "true");
    expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();
  });

  it("blocks Save on a blank game title", async () => {
    renderGame(FLAT_QUIZ_ID);
    fireEvent.change(await screen.findByLabelText("Game title"), {
      target: { value: "   " },
    });
    const saveButton = await screen.findByRole("button", { name: "Save quiz" });
    expect(saveButton).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(saveButton);
    expect(demoPutGame).not.toHaveBeenCalled();
  });

  it("shows the game heading and no series shortcut on a game", async () => {
    const { unmount } = renderGame(FLAT_QUIZ_ID);
    expect(
      await screen.findByRole("heading", { name: "Your quiz" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Write the rounds and questions, then run the game on a big screen while everyone plays on their phones",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Live game" }),
    ).not.toBeInTheDocument();
    unmount();
    // A game with no quiz yet shows the ways to start, without the event's series shortcut.
    renderGame(FLAT_QUIZ_ID, emptyGameClient(FLAT_QUIZ_ID));
    expect(
      await screen.findByRole("button", { name: "Start blank" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Copy from the last event in this series",
      }),
    ).not.toBeInTheDocument();
  });

  it("adopts a newer saved switch while clean", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    renderGame(FLAT_QUIZ_ID, queryClient);
    expect(await findAdultsSwitch()).toHaveAttribute("aria-checked", "false");
    // Another tab saves the switch on; this tab's refetch brings it in.
    act(() => {
      queryClient.setQueryData<QuizshowGameResponse>(
        quizshowKeys.game(FLAT_QUIZ_ID, true),
        (current) =>
          current && { ...current, isAdultsEvent: true, isAdultsOnly: true },
      );
    });
    await waitFor(() =>
      expect(
        screen.getByRole("switch", { name: ADULTS_SWITCH_NAME }),
      ).toHaveAttribute("aria-checked", "true"),
    );
    expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();
  });

  it("gates adults import sources on the saved switch", async () => {
    renderGame(FLAT_QUIZ_ID);
    // Flipped on in the draft only: the server still checks the saved switch.
    fireEvent.click(await findAdultsSwitch());
    expect(await screen.findByText("Unsaved changes")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Copy a game or event quiz" }),
    );
    const afterDarkTitle = await screen.findByRole("heading", {
      name: "After dark trivia",
    });
    const afterDarkRow = afterDarkTitle.parentElement?.parentElement;
    if (!afterDarkRow) throw new Error("The After dark row has no wrapper");
    expect(
      within(afterDarkRow).getByRole("button", { name: "Copy this quiz" }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("copies into a blank game without asking to replace it", async () => {
    const blankGame = demoCreateGame({ title: "Blank game", source: null });
    renderGame(blankGame.gameId);
    fireEvent.click(
      await screen.findByRole("button", { name: "Copy a game or event quiz" }),
    );
    const flatQuizTitle = await screen.findByRole("heading", {
      name: "Friday flat quiz",
    });
    const flatQuizRow = flatQuizTitle.parentElement?.parentElement;
    if (!flatQuizRow) throw new Error("The flat quiz row has no wrapper");
    fireEvent.click(
      within(flatQuizRow).getByRole("button", { name: "Copy this quiz" }),
    );
    expect(await screen.findByText("Quiz copied")).toBeInTheDocument();
    expect(screen.queryByText("Replace this quiz?")).not.toBeInTheDocument();
    expect(demoGetGame(blankGame.gameId).quiz?.rounds.length).toBeGreaterThan(
      0,
    );
  });

  it("shows a hint under a blank game title", async () => {
    renderGame(FLAT_QUIZ_ID);
    const titleField = await screen.findByLabelText("Game title");
    expect(screen.queryByText("Give the game a title")).not.toBeInTheDocument();
    fireEvent.change(titleField, { target: { value: "" } });
    await waitFor(() =>
      expect(titleField).toHaveAccessibleDescription("Give the game a title"),
    );
    expect(titleField).toHaveAttribute("aria-invalid", "true");
    expect(titleField).toHaveAttribute("placeholder", "Friday night quiz");
    // Once on the field, once in the list of what to finish, in the game's words.
    expect(screen.getAllByText("Give the game a title")).toHaveLength(2);
    expect(screen.queryByText("Give the quiz a title")).not.toBeInTheDocument();
    expect(screen.getAllByText("Unsaved changes")).toHaveLength(1);
  });

  it("shows the game's heading a size below the page title", async () => {
    renderGame(FLAT_QUIZ_ID);
    const heading = await screen.findByRole("heading", { name: "Your quiz" });
    expect(heading.className).toMatch(/headingGame/);
  });
});
