import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { QuizshowGameResponse } from "../../../shared/contracts/quizshow";
import { quizshowKeys } from "../api/quizshowKeys";
import {
  demoGameImportSources,
  demoGetGame,
  demoImportGame,
  resetQuizshowDemoGames,
} from "../api/quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "../api/quizshowDemoGames.data";
import { resetQuizshowDemoStore } from "../api/quizshowDemoStore";
import { QUIZSHOW_DEMO_LIVE_SLUG } from "../api/quizshowDemoStore.data";
import { eventScope, gameScope } from "../quizshowScope";
import { QuizshowImportButtons } from "./QuizshowImportButtons";

vi.mock("../api/quizshowDemoGames", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoGames")>();
  return { ...actual, demoImportGame: vi.fn(actual.demoImportGame) };
});

const TARGET_GAME_ID = QUIZSHOW_DEMO_GAME_IDS.flatQuiz;
const SOURCE_GAME_ID = QUIZSHOW_DEMO_GAME_IDS.afterDark;
const DEMO_GAME_COUNT = Object.keys(QUIZSHOW_DEMO_GAME_IDS).length;

function createClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
}

/** A source row: a group named by its title (sturdier than walking parents). */
async function findSourceRow(
  dialog: HTMLElement,
  title: string,
): Promise<HTMLElement> {
  return within(dialog).findByRole("group", { name: title });
}

/** Renders the toolbar buttons on a game with a quiz, the picker open, the quiz cached as the studio holds it. */
function renderAppendPicker(
  queryClient: QueryClient,
  initialOpenPicker: "sources" | "sourcesAppend" = "sources",
) {
  return render(
    <TestProviders queryClient={queryClient}>
      <QuizshowImportButtons
        scope={gameScope(TARGET_GAME_ID)}
        hasQuiz
        eventStartAt={null}
        isAdultsEvent
        variant="toolbar"
        initialOpenPicker={initialOpenPicker}
      />
    </TestProviders>,
  );
}

function renderGameButtons(
  queryClient: QueryClient,
  initialOpenPicker: "template" | "sources" | null = null,
  targetGameId: string = TARGET_GAME_ID,
) {
  return render(
    <TestProviders queryClient={queryClient}>
      <QuizshowImportButtons
        scope={gameScope(targetGameId)}
        hasQuiz={false}
        eventStartAt={null}
        isAdultsEvent
        variant="toolbar"
        initialOpenPicker={initialOpenPicker}
      />
    </TestProviders>,
  );
}

describe("QuizshowImportSourcePicker on a game", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
    resetQuizshowDemoGames();
    vi.mocked(demoImportGame).mockClear();
  });

  it("lists the member's other games and their events on a game", async () => {
    renderGameButtons(createClient());

    await userEvent.click(
      await screen.findByRole("button", {
        name: "Copy a game or event quiz",
      }),
    );
    const dialog = await screen.findByRole("dialog");
    const sourceGameQuizTitle = demoGetGame(SOURCE_GAME_ID).quiz?.title ?? "";

    expect(
      await within(dialog).findByText(
        "Your other games, and events you run that hold a quiz",
      ),
    ).toBeTruthy();
    expect(await within(dialog).findByText(sourceGameQuizTitle)).toBeTruthy();
    // Every demo game but the one being edited, each tagged as a game.
    expect(within(dialog).getAllByText("Your game")).toHaveLength(
      DEMO_GAME_COUNT - 1,
    );
    expect(within(dialog).getAllByText(/rounds?/).length).toBeGreaterThan(1);
    expect(
      within(dialog).getAllByRole("button", { name: "Copy this quiz" }).length,
    ).toBeGreaterThan(1);
  });

  it("copies a game with from game", async () => {
    // The 18+ game takes the flat quiz: the copy replaces its rounds and
    // template and keeps the game's own title and 18+ switch, as on the server.
    const adultsGameId = QUIZSHOW_DEMO_GAME_IDS.afterDark;
    const flatGameId = QUIZSHOW_DEMO_GAME_IDS.flatQuiz;
    const queryClient = createClient();
    renderGameButtons(queryClient, null, adultsGameId);

    await userEvent.click(
      await screen.findByRole("button", {
        name: "Copy a game or event quiz",
      }),
    );
    const dialog = await screen.findByRole("dialog");
    const flatGameQuiz = demoGetGame(flatGameId).quiz;
    const adultsGameQuizTitle = demoGetGame(adultsGameId).quiz?.title;
    const gameRow = await findSourceRow(dialog, flatGameQuiz?.title ?? "");
    await userEvent.click(
      within(gameRow).getByRole("button", { name: "Copy this quiz" }),
    );

    const copiedQuiz = () =>
      queryClient.getQueryData<QuizshowGameResponse>(
        quizshowKeys.game(adultsGameId, true),
      )?.quiz;
    await waitFor(() =>
      expect(copiedQuiz()?.sourceTemplateId).toBe(
        flatGameQuiz?.sourceTemplateId,
      ),
    );
    expect(copiedQuiz()?.title).toBe(adultsGameQuizTitle);
    expect(copiedQuiz()?.rounds.length).toBe(flatGameQuiz?.rounds.length);
    expect(await screen.findByText("Quiz copied")).toBeTruthy();
  });

  it("shows a game source in the event picker with its tag", async () => {
    render(
      <TestProviders queryClient={createClient()}>
        <QuizshowImportButtons
          scope={eventScope(QUIZSHOW_DEMO_LIVE_SLUG)}
          hasQuiz={false}
          eventStartAt={new Date("2026-10-20T18:00:00.000Z")}
          isAdultsEvent
          variant="empty"
          initialOpenPicker="sources"
        />
      </TestProviders>,
    );

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Copy from a past event")).toBeTruthy();
    // An event takes from every demo game.
    expect((await within(dialog).findAllByText("Your game")).length).toBe(
      DEMO_GAME_COUNT,
    );
  });

  it("labels the copy button Copy a game or event quiz on a game", async () => {
    renderGameButtons(createClient());

    expect(
      await screen.findByRole("button", {
        name: "Copy a game or event quiz",
      }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Copy from a past event" }),
    ).toBeNull();
  });

  it("opens the source picker on mount when asked", async () => {
    renderGameButtons(createClient(), "sources");

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Copy a game or event quiz")).toBeTruthy();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});

describe("QuizshowImportSourcePicker adding rounds (item 23)", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
    resetQuizshowDemoGames();
    vi.mocked(demoImportGame).mockClear();
  });

  it("appends the chosen rounds with the wheel's slice range filled", async () => {
    const wheelGameId = QUIZSHOW_DEMO_GAME_IDS.wheelNight;
    const queryClient = createClient();
    // The studio holds the target quiz in the cache; the append reads its stamp there.
    const targetResponse = demoGetGame(TARGET_GAME_ID);
    queryClient.setQueryData(
      quizshowKeys.game(TARGET_GAME_ID, true),
      targetResponse,
    );
    renderAppendPicker(queryClient);

    const dialog = await screen.findByRole("dialog");
    const wheelGameRow = await findSourceRow(
      dialog,
      demoGetGame(wheelGameId).quiz?.title ?? "",
    );
    expect(
      within(wheelGameRow).getByRole("button", { name: "Replace the quiz" }),
    ).toBeTruthy();
    await userEvent.click(
      within(wheelGameRow).getByRole("button", {
        name: "Add rounds from this quiz",
      }),
    );

    const sourceRounds =
      demoGameImportSources(TARGET_GAME_ID).items.find(
        (source) => source.gameId === wheelGameId,
      )?.rounds ?? [];
    const wheelPosition = sourceRounds.findIndex(
      (round) => round.kind === "wheel",
    );
    const wheelRound = sourceRounds[wheelPosition];
    if (!wheelRound) throw new Error("The wheel game lists no wheel row");
    // The rows after the wheel, up to its slice count (Auto is 8), stopping at the next wheel.
    const sliceCap = Math.min(wheelRound.sliceCount ?? 8, 8);
    const sliceRounds: typeof sourceRounds = [];
    for (const round of sourceRounds.slice(wheelPosition + 1)) {
      if (round.kind === "wheel" || sliceRounds.length === sliceCap) break;
      sliceRounds.push(round);
    }
    const wheelRangeIndexes = [wheelRound, ...sliceRounds].map(
      (round) => round.roundIndex,
    );
    expect(sliceRounds.length).toBeGreaterThan(0);

    const checkboxes = await within(wheelGameRow).findAllByRole("checkbox");
    expect(checkboxes).toHaveLength(sourceRounds.length);
    const wheelCheckbox = checkboxes[wheelPosition];
    if (!wheelCheckbox) throw new Error("no wheel checkbox");
    await userEvent.click(wheelCheckbox);
    sourceRounds.forEach((round, position) => {
      expect((checkboxes[position] as HTMLInputElement).checked).toBe(
        wheelRangeIndexes.includes(round.roundIndex),
      );
    });

    // A slice stays checked while its wheel is: locked, with the reason.
    const firstSliceCheckbox = checkboxes[wheelPosition + 1];
    if (!firstSliceCheckbox) throw new Error("no slice checkbox");
    expect(firstSliceCheckbox).toHaveAttribute("aria-disabled", "true");
    // Muted with a lock, and the reason is said once under the wheel row.
    expect(firstSliceCheckbox.closest("li")).toHaveAttribute(
      "data-locked",
      "true",
    );
    expect(
      within(wheelGameRow).getAllByText(
        "Its slices come along. Uncheck the wheel to leave them out",
      ),
    ).toHaveLength(1);
    await userEvent.click(firstSliceCheckbox);
    expect((firstSliceCheckbox as HTMLInputElement).checked).toBe(true);

    await userEvent.click(
      within(wheelGameRow).getByRole("button", { name: "Add these rounds" }),
    );

    await waitFor(() =>
      expect(vi.mocked(demoImportGame)).toHaveBeenCalledWith(TARGET_GAME_ID, {
        from: "game",
        gameId: wheelGameId,
        mode: "append",
        roundIndexes: wheelRangeIndexes,
        expectedUpdatedAt: targetResponse.quiz?.updatedAt ?? null,
      }),
    );
    const appendedQuiz = () =>
      queryClient.getQueryData<QuizshowGameResponse>(
        quizshowKeys.game(TARGET_GAME_ID, true),
      )?.quiz;
    await waitFor(() =>
      expect(appendedQuiz()?.rounds.length).toBe(
        (targetResponse.quiz?.rounds.length ?? 0) + wheelRangeIndexes.length,
      ),
    );
    // The picker closes once the rounds are added.
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("keeps the picker open and names the reason when the quiz changed", async () => {
    const queryClient = createClient();
    const targetResponse = demoGetGame(TARGET_GAME_ID);
    const staleStamp = "2020-01-01T00:00:00.000Z";
    // The cache holds an older save than the server: the append's stamp is stale.
    queryClient.setQueryData(quizshowKeys.game(TARGET_GAME_ID, true), {
      ...targetResponse,
      quiz: targetResponse.quiz && {
        ...targetResponse.quiz,
        updatedAt: staleStamp,
      },
    });
    renderAppendPicker(queryClient, "sourcesAppend");

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText("Add rounds from another quiz"),
    ).toBeTruthy();
    const sourceRow = await findSourceRow(
      dialog,
      demoGetGame(SOURCE_GAME_ID).quiz?.title ?? "",
    );
    // Append mode offers no replace.
    expect(
      within(sourceRow).queryByRole("button", { name: "Replace the quiz" }),
    ).toBeNull();
    await userEvent.click(
      within(sourceRow).getByRole("button", {
        name: "Add rounds from this quiz",
      }),
    );
    const [firstCheckbox] = await within(sourceRow).findAllByRole("checkbox");
    if (!firstCheckbox) throw new Error("no round checkbox");
    await userEvent.click(firstCheckbox);
    await userEvent.click(
      within(sourceRow).getByRole("button", { name: "Add these rounds" }),
    );

    expect(
      await screen.findByText(
        "This quiz changed since you opened it. The newer version is loaded, so add the rounds again",
      ),
    ).toBeTruthy();
    expect(vi.mocked(demoImportGame)).toHaveBeenCalledWith(
      TARGET_GAME_ID,
      expect.objectContaining({
        mode: "append",
        expectedUpdatedAt: staleStamp,
      }),
    );
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(demoGetGame(TARGET_GAME_ID).quiz?.rounds.length).toBe(
      targetResponse.quiz?.rounds.length,
    );
  });
});
