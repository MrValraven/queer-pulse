import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowGameSummary,
  QuizshowLiveSessionRef,
} from "../../../shared/contracts/quizshow";
import { QuizshowGameRow } from "./QuizshowGameRow";

function gameWith(
  liveSession: Partial<QuizshowLiveSessionRef> | null,
): QuizshowGameSummary {
  return {
    id: "game-1",
    title: "Friday flat quiz",
    roundCount: 3,
    questionCount: 12,
    isAdultsOnly: false,
    hasResults: false,
    updatedAt: "2026-11-20T10:00:00.000Z",
    liveSession:
      liveSession === null
        ? null
        : {
            sessionId: "session-1",
            joinCode: "QG4MW8",
            status: "lobby",
            playMode: "solo",
            playerCount: 0,
            startedAt: "2026-11-20T10:00:00.000Z",
            isPractice: false,
            isBehindQuiz: false,
            ...liveSession,
          },
  };
}

function renderRow(game: QuizshowGameSummary) {
  render(
    <TestProviders initialEntries={["/play/games"]}>
      <QuizshowGameRow game={game} />
    </TestProviders>,
  );
  return screen.getByRole("link", { name: /Friday flat quiz/ });
}

describe("QuizshowGameRow", () => {
  it("tags a practice lobby with Practice beside its code", () => {
    const card = renderRow(gameWith({ isPractice: true }));
    expect(within(card).getByText("Lobby open, code QG4MW8")).toBeTruthy();
    expect(within(card).getByText("Practice")).toBeTruthy();
  });

  it("shows no Practice tag for a real lobby or without a live game", () => {
    const realCard = renderRow(gameWith({ isPractice: false }));
    expect(within(realCard).queryByText("Practice")).toBeNull();
  });

  it("shows no Practice tag when nothing is live", () => {
    const idleCard = renderRow(gameWith(null));
    expect(within(idleCard).queryByText("Practice")).toBeNull();
  });
});
