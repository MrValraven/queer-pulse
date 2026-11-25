import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import type { QuizshowResultsResponse } from "../../../shared/contracts/quizshow";
import type { QuizWinBadgeChip } from "../../../shared/contracts/quizWinBadges";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { QUIZSHOW_DEMO_GAME_IDS } from "../api/quizshowDemoGames.data";
import { resetQuizshowDemoGames } from "../api/quizshowDemoGames";
import {
  QUIZSHOW_DEMO_RESULTS,
  QUIZSHOW_DEMO_RESULTS_SLUG,
} from "../api/quizshowDemoStore.data";
import { eventScope, gameScope } from "../quizshowScope";
import { resetQuizWinBadgesDemoStore } from "../winBadges/quizWinBadgesDemoStore";
import { QuizshowResultsCard } from "./QuizshowResultsCard";

/** A results response, possibly from a backend that lacks the winBadges field. */
type OverrideResults = Partial<QuizshowResultsResponse>;

const mocks = vi.hoisted(() => ({
  /** When set, the results hook answers with this response and skips the demo store. */
  resultsOverride: { results: null as OverrideResults | null },
}));

vi.mock("../api/useQuizshowResults", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../api/useQuizshowResults")>();
  return {
    ...original,
    useQuizshowResults: (
      ...hookArguments: Parameters<typeof original.useQuizshowResults>
    ) => {
      const realQuery = original.useQuizshowResults(...hookArguments);
      return mocks.resultsOverride.results === null
        ? realQuery
        : {
            data: mocks.resultsOverride.results,
            isError: false,
            error: null,
            refetch: vi.fn(),
          };
    },
  };
});

const CHAMPION_CHIP: QuizWinBadgeChip = {
  definitionId: "badge-champion",
  badgeKey: "quiz:badge-champion",
  name: { en: "Quiz Night Champion", pt: "Campeã da noite de quiz" },
  iconKey: "star",
  tint: "plum",
  rarity: "legendary",
  isArchived: false,
};

async function renderCard(
  scope: Parameters<typeof QuizshowResultsCard>[0]["scope"],
) {
  const view = render(
    <TestProviders>
      <MotionProvider>
        <QuizshowResultsCard scope={scope} canDelete />
      </MotionProvider>
    </TestProviders>,
  );
  await awaitCatalog("quizshow");
  return view;
}

describe("QuizshowResultsCard win badges", () => {
  beforeEach(() => {
    mocks.resultsOverride.results = null;
    resetQuizWinBadgesDemoStore();
    resetQuizshowDemoGames();
  });

  it("says which badge the demo winner earned", async () => {
    await renderCard(eventScope(QUIZSHOW_DEMO_RESULTS_SLUG));
    expect(await screen.findByText("Rita earned")).toBeInTheDocument();
    expect(screen.getByText("Pride Quiz 2026")).toBeInTheDocument();
    expect(screen.queryByText("You earned")).not.toBeInTheDocument();
  });

  it("places the badge block after the player count and before the actions", async () => {
    await renderCard(eventScope(QUIZSHOW_DEMO_RESULTS_SLUG));
    const winnerLabel = await screen.findByText("Rita earned");
    const countsLine = screen.getByText("12 players");
    const deleteButton = screen.getByRole("button", { name: "Delete results" });
    expect(
      countsLine.compareDocumentPosition(winnerLabel) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      winnerLabel.compareDocumentPosition(deleteButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("says You earned when the viewer won", async () => {
    const results: QuizshowResultsResponse = {
      ...QUIZSHOW_DEMO_RESULTS,
      winBadges: {
        gameNumber: 1,
        winners: [{ kind: "player", name: "Rita", badges: [CHAMPION_CHIP] }],
        myBadges: [CHAMPION_CHIP],
      },
    };
    mocks.resultsOverride.results = results;
    await renderCard(eventScope(QUIZSHOW_DEMO_RESULTS_SLUG));
    expect(await screen.findByText("You earned")).toBeInTheDocument();
    expect(screen.getAllByText("Quiz Night Champion")).toHaveLength(2);
  });

  it("renders no badge block when the results carry no winBadges field", async () => {
    const { winBadges: omittedField, ...resultsWithoutField } =
      QUIZSHOW_DEMO_RESULTS;
    expect(omittedField).toBeNull();
    mocks.resultsOverride.results = resultsWithoutField;
    await renderCard(eventScope(QUIZSHOW_DEMO_RESULTS_SLUG));
    expect(await screen.findByText("Pulse Live results")).toBeInTheDocument();
    expect(screen.queryByText(/earned/)).not.toBeInTheDocument();
  });

  it("renders no badge block for a game's results", async () => {
    await renderCard(gameScope(QUIZSHOW_DEMO_GAME_IDS.flatQuiz));
    expect(await screen.findByText("Pulse Live results")).toBeInTheDocument();
    expect(screen.queryByText(/earned/)).not.toBeInTheDocument();
  });
});
