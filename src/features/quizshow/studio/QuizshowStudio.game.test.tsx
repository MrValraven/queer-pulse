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
import { QuizshowStudio } from "./QuizshowStudio";
import { STUDIO_ROUND_HEADER_ATTRIBUTE } from "./quizshowStudioDom";

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
const BACK_LINK = { to: "/play", labelKey: "quizshow:game.back" };

function renderGame(gameId: string, queryClient?: QueryClient) {
  return render(
    <TestProviders queryClient={queryClient}>
      <QuizshowStudio scope={gameScope(gameId)} backLink={BACK_LINK} />
    </TestProviders>,
  );
}

/** Cmd+S, the studio's save shortcut; it works from a text field too. */
function pressSave() {
  fireEvent.keyDown(document, { key: "s", metaKey: true });
}

/** The 18+ switches: the top bar's compact one and the inspector's. */
async function findAdultsSwitches(): Promise<HTMLElement[]> {
  return screen.findAllByRole("switch", { name: ADULTS_SWITCH_NAME });
}

/** The inspector's 18+ switch; the top bar's comes first in the page. */
async function findInspectorAdultsSwitch(): Promise<HTMLElement> {
  const inspector = await screen.findByRole("complementary", {
    name: "Quiz editor settings",
  });
  return within(inspector).findByRole("switch", { name: ADULTS_SWITCH_NAME });
}

/** The save status's own label; the Open lobby tip says "Unsaved changes" too. */
const SAVE_STATUS_LABEL = { selector: "[data-status] span" };

/** Selects round `roundIndex` in the rail, so the inspector shows its settings. */
async function selectRound(roundIndex: number): Promise<void> {
  const header = await waitFor(() => {
    const element = document.querySelector<HTMLElement>(
      `[${STUDIO_ROUND_HEADER_ATTRIBUTE}][data-round-index="${roundIndex}"]`,
    );
    if (!element) throw new Error("The rail shows no such round");
    return element;
  });
  fireEvent.click(header);
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

describe("QuizshowStudio on a game", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
    resetQuizshowDemoGames();
    vi.mocked(demoPutGame).mockClear();
  });

  it("labels the title field Game title and shows the 18+ switch on a game", async () => {
    renderGame(FLAT_QUIZ_ID);
    for (const titleField of await screen.findAllByLabelText("Game title")) {
      expect(titleField).toHaveValue("Friday flat quiz");
    }
    expect(screen.queryByLabelText("Quiz title")).not.toBeInTheDocument();
    for (const adultsSwitch of await findAdultsSwitches()) {
      expect(adultsSwitch).toHaveAttribute("aria-checked", "false");
    }
    expect(await findInspectorAdultsSwitch()).toHaveAccessibleDescription(
      "Players confirm before they join, and the adults label unlocks for rounds",
    );
  });

  it("saves the 18+ switch with the quiz", async () => {
    renderGame(FLAT_QUIZ_ID);
    fireEvent.click(await findInspectorAdultsSwitch());
    expect(
      await screen.findByText("Unsaved changes", SAVE_STATUS_LABEL),
    ).toBeInTheDocument();
    pressSave();
    await waitFor(() => expect(demoPutGame).toHaveBeenCalledTimes(1));
    const [savedGameId, savedBody] = vi.mocked(demoPutGame).mock.calls[0] ?? [];
    expect(savedGameId).toBe(FLAT_QUIZ_ID);
    expect(savedBody?.isAdultsOnly).toBe(true);
    expect(demoGetGame(FLAT_QUIZ_ID).isAdultsOnly).toBe(true);
    await waitFor(() =>
      expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument(),
    );
    for (const adultsSwitch of await findAdultsSwitches()) {
      expect(adultsSwitch).toHaveAttribute("aria-checked", "true");
    }
  });

  it("counts a flipped switch as unsaved and holds the lobby", async () => {
    renderGame(FLAT_QUIZ_ID);
    expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();
    fireEvent.click(await findInspectorAdultsSwitch());
    expect(
      await screen.findByText("Unsaved changes", SAVE_STATUS_LABEL),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open lobby" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("keeps 18+ on while a round uses the adults label and says which", async () => {
    renderGame(AFTER_DARK_ID);
    const adultsSwitch = await findInspectorAdultsSwitch();
    expect(adultsSwitch).toHaveAttribute("aria-checked", "true");
    fireEvent.click(adultsSwitch);
    const notices = await screen.findAllByText(
      "Round 2 uses the adults label. Change its label first, then turn off 18+",
    );
    expect(
      notices.some((notice) => notice.getAttribute("role") === "alert"),
    ).toBe(true);
    expect(adultsSwitch).toHaveAttribute("aria-checked", "true");
    expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();
  });

  it("holds the save on a blank game title and names the reason", async () => {
    renderGame(FLAT_QUIZ_ID);
    const [titleField] = await screen.findAllByLabelText("Game title");
    if (!titleField) throw new Error("The studio shows no title field");
    fireEvent.change(titleField, { target: { value: "   " } });
    pressSave();
    expect(
      (await screen.findAllByText("Give the game a title")).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText("Give the quiz a title")).not.toBeInTheDocument();
    expect(demoPutGame).not.toHaveBeenCalled();
  });

  it("unlocks the adults label on a round while the switch is on", async () => {
    renderGame(FLAT_QUIZ_ID);
    await selectRound(0);
    const adultsLabel = await screen.findByRole("radio", {
      name: "Adults only (18+)",
    });
    expect(adultsLabel).toHaveAttribute("aria-disabled", "true");
    // With a round selected, the top bar's 18+ switch is the one on screen.
    const [adultsSwitch] = await findAdultsSwitches();
    if (!adultsSwitch) throw new Error("The studio shows no 18+ switch");
    fireEvent.click(adultsSwitch);
    await waitFor(() =>
      expect(adultsLabel).not.toHaveAttribute("aria-disabled"),
    );
    fireEvent.click(adultsLabel);
    expect(adultsLabel).toHaveAttribute("aria-checked", "true");
  });

  it("shows a hint under a blank game title", async () => {
    renderGame(FLAT_QUIZ_ID);
    const titleFields = await screen.findAllByLabelText("Game title");
    const [topBarTitle] = titleFields;
    if (!topBarTitle) throw new Error("The studio shows no title field");
    fireEvent.change(topBarTitle, { target: { value: "" } });
    // The inspector's field carries the hint; the top bar's is the same draft.
    const hintedField = await waitFor(() => {
      const field = screen
        .getAllByLabelText("Game title")
        .find((element) => element.getAttribute("aria-invalid") === "true");
      if (!field) throw new Error("No title field is marked invalid yet");
      return field;
    });
    expect(hintedField).toHaveAccessibleDescription("Give the game a title");
    expect(hintedField).toHaveAttribute("placeholder", "Friday night quiz");
    expect(screen.queryByText("Give the quiz a title")).not.toBeInTheDocument();
  });

  it("names the studio and offers a blank start or a copy on a game with no quiz", async () => {
    renderGame(FLAT_QUIZ_ID, emptyGameClient(FLAT_QUIZ_ID));
    expect(
      await screen.findByRole("heading", { level: 1, name: "Quiz editor" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Start with a blank quiz" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy a game or event quiz" }),
    ).toBeInTheDocument();
    // Nothing is saved before there is a quiz, so no save status shows yet.
    expect(document.querySelector("[data-status]")).not.toBeInTheDocument();
  });

  it("adopts a newer saved switch while clean", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    renderGame(FLAT_QUIZ_ID, queryClient);
    expect(await findInspectorAdultsSwitch()).toHaveAttribute(
      "aria-checked",
      "false",
    );
    // Another tab saves the switch on; this tab's refetch brings it in.
    act(() => {
      queryClient.setQueryData<QuizshowGameResponse>(
        quizshowKeys.game(FLAT_QUIZ_ID, true),
        (current) =>
          current && { ...current, isAdultsEvent: true, isAdultsOnly: true },
      );
    });
    await waitFor(async () =>
      expect(await findInspectorAdultsSwitch()).toHaveAttribute(
        "aria-checked",
        "true",
      ),
    );
    expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();
  });

  it("gates adults import sources on the saved switch", async () => {
    renderGame(FLAT_QUIZ_ID);
    // Flipped on in the draft only: the server still checks the saved switch.
    fireEvent.click(await findInspectorAdultsSwitch());
    expect(
      await screen.findByText("Unsaved changes", SAVE_STATUS_LABEL),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "More actions" }));
    fireEvent.click(
      await screen.findByRole("menuitem", {
        name: "Replace with another quiz",
      }),
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
});
