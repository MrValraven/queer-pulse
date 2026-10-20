import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { QuizshowGameResponse } from "../../../shared/contracts/quizshow";
import { quizshowKeys } from "../api/quizshowKeys";
import { demoGetGame, resetQuizshowDemoGames } from "../api/quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "../api/quizshowDemoGames.data";
import { resetQuizshowDemoStore } from "../api/quizshowDemoStore";
import { QUIZSHOW_DEMO_LIVE_SLUG } from "../api/quizshowDemoStore.data";
import { eventScope, gameScope } from "../quizshowScope";
import { QuizshowImportButtons } from "./QuizshowImportButtons";

const TARGET_GAME_ID = QUIZSHOW_DEMO_GAME_IDS.flatQuiz;
const SOURCE_GAME_ID = QUIZSHOW_DEMO_GAME_IDS.afterDark;

function createClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
}

function renderGameButtons(
  queryClient: QueryClient,
  initialOpenPicker: "pack" | "sources" | null = null,
) {
  return render(
    <TestProviders queryClient={queryClient}>
      <QuizshowImportButtons
        scope={gameScope(TARGET_GAME_ID)}
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
    expect(within(dialog).getByText("Your game")).toBeTruthy();
    expect(within(dialog).getAllByText(/rounds?/).length).toBeGreaterThan(1);
    expect(
      within(dialog).getAllByRole("button", { name: "Copy this quiz" }).length,
    ).toBeGreaterThan(1);
  });

  it("copies a game with from game", async () => {
    const queryClient = createClient();
    renderGameButtons(queryClient);

    await userEvent.click(
      await screen.findByRole("button", {
        name: "Copy a game or event quiz",
      }),
    );
    const dialog = await screen.findByRole("dialog");
    const sourceGameQuizTitle = demoGetGame(SOURCE_GAME_ID).quiz?.title ?? "";
    const gameTitleElement =
      await within(dialog).findByText(sourceGameQuizTitle);
    const gameRow = gameTitleElement.closest("div")?.parentElement;
    if (!gameRow) throw new Error("no game row");
    await userEvent.click(
      within(gameRow).getByRole("button", { name: "Copy this quiz" }),
    );

    await waitFor(() =>
      expect(
        queryClient.getQueryData<QuizshowGameResponse>(
          quizshowKeys.game(TARGET_GAME_ID, true),
        )?.quiz?.title,
      ).toBe(sourceGameQuizTitle),
    );
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
    expect((await within(dialog).findAllByText("Your game")).length).toBe(2);
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
