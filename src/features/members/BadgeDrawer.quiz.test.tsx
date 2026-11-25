import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  QuizBadgeDetailsDTO,
  QuizBadgeWinDTO,
} from "../../shared/contracts/quizWinBadges";
import { awaitCatalog } from "../../test/awaitCatalog";
import { TestProviders } from "../../test/TestProviders";
import { gatheringPath } from "../gatherings/gatheringPaths";
import { badgeFromDto } from "./api/recognition.adapters";
import { BadgeDrawer } from "./BadgeDrawer";

const prideBrunchWin: QuizBadgeWinDTO = {
  wonAt: "2026-06-21T20:00:00.000Z",
  gameNumber: 1,
  eventName: "Pride Brunch: June Edition",
  eventSlug: "pride-brunch-jun",
  isAdultsOnlyEvent: false,
};

const membersSocialWin: QuizBadgeWinDTO = {
  wonAt: "2026-03-08T19:00:00.000Z",
  gameNumber: 1,
  eventName: "Members' Quiz Social",
  eventSlug: "members-quiz-social",
  isAdultsOnlyEvent: false,
};

function quizBadgeDetails(
  wins: QuizBadgeWinDTO[],
  winCount = wins.length,
): QuizBadgeDetailsDTO {
  return {
    definitionId: "quiz-champion",
    name: { en: "Quiz champion", pt: "Campeao do quiz" },
    description: {
      en: "Win a game at a QueerPulse quiz night",
      pt: "Ganha um jogo numa noite de quiz",
    },
    iconKey: "award",
    winCount,
    wins,
  };
}

function renderDrawerFor(quiz: QuizBadgeDetailsDTO) {
  const badge = badgeFromDto({
    key: "quiz:quiz-champion",
    cat: "Quiz nights",
    name: quiz.name.en,
    context: quiz.description.en,
    rarity: "rare",
    tint: "accent",
    quiz,
  });
  return render(
    <TestProviders>
      <BadgeDrawer
        entries={[{ badge, earned: true }]}
        index={0}
        onNavigate={vi.fn()}
        onClose={vi.fn()}
      />
    </TestProviders>,
  );
}

async function renderDrawerWithWins(
  wins: QuizBadgeWinDTO[],
  winCount?: number,
) {
  renderDrawerFor(quizBadgeDetails(wins, winCount));
  await awaitCatalog("members");
}

/** The drawer's Wins section, where every win assertion reads. */
function winsSection(): HTMLElement {
  const winsHeadRow = screen.getByRole("heading", { name: "Wins" })
    .parentElement as HTMLElement;
  return winsHeadRow.parentElement as HTMLElement;
}

describe("BadgeDrawer for a quiz badge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the description once, in the hero, and skips What it takes", async () => {
    await renderDrawerWithWins([prideBrunchWin]);
    expect(
      screen.queryByRole("heading", { name: "What it takes" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByText("Win a game at a QueerPulse quiz night"),
    ).toHaveLength(1);
    expect(screen.getByText("Rarity")).toBeInTheDocument();
  });

  it("says how a quiz badge is checked", async () => {
    await renderDrawerWithWins([prideBrunchWin]);
    expect(
      screen.getByRole("heading", { name: "How it's checked" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Given to the winner of a game at an official QueerPulse quiz night",
      ),
    ).toBeInTheDocument();
  });

  it("shows no Worth or Checked by row", async () => {
    await renderDrawerWithWins([prideBrunchWin]);
    expect(screen.queryByText("Worth")).not.toBeInTheDocument();
    expect(screen.queryByText("Checked by")).not.toBeInTheDocument();
  });

  it("lists every win newest first with its game number", async () => {
    await renderDrawerWithWins([prideBrunchWin, membersSocialWin]);
    const winItems = within(winsSection()).getAllByRole("listitem");
    expect(winItems).toHaveLength(2);
    expect(winItems[0]).toHaveTextContent("Pride Brunch: June Edition, game 1");
    expect(winItems[1]).toHaveTextContent("Members' Quiz Social, game 1");
  });

  it("shows the win count once, in the Wins header, at two wins", async () => {
    await renderDrawerWithWins([prideBrunchWin, membersSocialWin]);
    expect(within(winsSection()).getByText("×2")).toBeInTheDocument();
    expect(screen.getAllByText("×2")).toHaveLength(1);
    expect(within(winsSection()).getByText("Won 2 times")).toBeInTheDocument();
  });

  it("shows no win count for a single win", async () => {
    await renderDrawerWithWins([prideBrunchWin]);
    expect(within(winsSection()).queryByText(/^×/)).not.toBeInTheDocument();
  });

  it("names a masked win as a QueerPulse quiz night", async () => {
    await renderDrawerWithWins([
      { ...prideBrunchWin, eventName: null, eventSlug: null },
    ]);
    const winItem = within(winsSection()).getByRole("listitem");
    expect(winItem).toHaveTextContent("QueerPulse quiz night, game 1");
    expect(within(winItem).queryByRole("link")).not.toBeInTheDocument();
  });

  it("links a win to its event page", async () => {
    await renderDrawerWithWins([prideBrunchWin]);
    const eventLink = screen.getByRole("link", {
      name: "Pride Brunch: June Edition",
    });
    expect(eventLink).toHaveAttribute(
      "href",
      gatheringPath("pride-brunch-jun"),
    );
  });

  it("notes the 18+ default when a win is adults-only", async () => {
    await renderDrawerWithWins([
      { ...prideBrunchWin, isAdultsOnlyEvent: true },
    ]);
    expect(
      screen.getByText("Wins at 18+ events start hidden from your profile"),
    ).toBeInTheDocument();
  });

  it("leaves out the 18+ note when no win is adults-only", async () => {
    await renderDrawerWithWins([prideBrunchWin]);
    expect(
      screen.queryByText("Wins at 18+ events start hidden from your profile"),
    ).not.toBeInTheDocument();
  });

  it("keeps the hide from profile switch", async () => {
    await renderDrawerWithWins([prideBrunchWin]);
    expect(
      screen.getByRole("switch", { name: "Visible on your profile" }),
    ).toBeInTheDocument();
  });
});
