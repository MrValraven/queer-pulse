import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  demoGameResults,
  resetQuizshowDemoGames,
} from "../api/quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "../api/quizshowDemoGames.data";
import { gameScope } from "../quizshowScope";
import { QuizshowResultsCard } from "./QuizshowResultsCard";

function renderCard() {
  return render(
    <TestProviders>
      <QuizshowResultsCard
        scope={gameScope(QUIZSHOW_DEMO_GAME_IDS.flatQuiz)}
        canDelete
      />
    </TestProviders>,
  );
}

describe("QuizshowResultsCard on a game scope (demo)", () => {
  beforeEach(() => {
    resetQuizshowDemoGames();
  });

  it("shows a game's kept results with the recap and Delete results", async () => {
    renderCard();
    expect(await screen.findByText("Pulse Live results")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Podium" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show recap" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Delete results" }),
    ).toBeInTheDocument();
  });

  it("deletes a game's results through the game store", async () => {
    renderCard();
    fireEvent.click(
      await screen.findByRole("button", { name: "Delete results" }),
    );
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete results" }),
    );
    expect(await screen.findByText("Results deleted")).toBeInTheDocument();
    expect(() => demoGameResults(QUIZSHOW_DEMO_GAME_IDS.flatQuiz)).toThrow();
  });
});
