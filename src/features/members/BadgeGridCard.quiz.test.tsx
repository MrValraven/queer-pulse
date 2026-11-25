import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { awaitCatalog } from "../../test/awaitCatalog";
import { TestProviders } from "../../test/TestProviders";
import type { QuizBadgeWinDTO } from "../../shared/contracts/quizWinBadges";
import type { Badge } from "./badges.data";
import { BadgeGridCard } from "./BadgeGridCard";
import { quizBadgeModelOf } from "./quizBadges";

afterEach(() => {
  window.localStorage.clear();
});

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

function quizBadgeWithWins(
  winCount: number,
  wins: QuizBadgeWinDTO[] = [],
): Badge {
  const model = quizBadgeModelOf({
    name: { en: "Quiz night champion", pt: "Campeã da noite de quiz" },
    description: {
      en: "Win a Pulse Live quiz night",
      pt: "Ganha uma noite de quiz do Pulse Live",
    },
    iconKey: "award",
    tint: "accent",
    rarity: "rare",
  });
  return {
    ...model,
    quiz: { ...model.quiz!, winCount, wins },
  };
}

const platformBadge: Badge = {
  key: "local-scout",
  category: "Local",
  name: "Server English name",
  when: "Server earned line",
  rarity: "common",
  tint: "jade",
  icon: null,
};

async function renderCard(badge: Badge) {
  render(
    <TestProviders>
      <BadgeGridCard badge={badge} earned onOpen={() => {}} />
    </TestProviders>,
  );
  await awaitCatalog("members");
}

describe("BadgeGridCard with a quiz badge", () => {
  it("names a quiz badge in Portuguese on its card", async () => {
    window.localStorage.setItem("qp.lang", "pt");
    await renderCard(quizBadgeWithWins(1));
    expect(
      screen.getByRole("heading", { name: "Campeã da noite de quiz" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Ganha uma noite de quiz do Pulse Live"),
    ).toBeInTheDocument();
  });

  it("shows ×2 once on the card at two wins", async () => {
    await renderCard(quizBadgeWithWins(2));
    expect(screen.getAllByText("×2")).toHaveLength(1);
  });

  it("hides the ×2 glyph from screen readers and spells the count out", async () => {
    await renderCard(quizBadgeWithWins(2));
    expect(screen.getByText("×2")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Won 2 times")).toBeInTheDocument();
  });

  it("shows no count at a single win", async () => {
    await renderCard(quizBadgeWithWins(1));
    expect(screen.queryByText(/×/)).not.toBeInTheDocument();
    expect(screen.queryByText("Won once")).not.toBeInTheDocument();
  });

  it("names the latest win under an earned quiz badge", async () => {
    await renderCard(quizBadgeWithWins(2, [prideBrunchWin, membersSocialWin]));
    expect(
      screen.getByText(/^Pride Brunch: June Edition · /),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^Members' Quiz Social/)).not.toBeInTheDocument();
    // The description reads once, as the criteria line.
    expect(screen.getAllByText("Win a Pulse Live quiz night")).toHaveLength(1);
  });

  it("reads a masked latest win as a QueerPulse quiz night", async () => {
    await renderCard(
      quizBadgeWithWins(1, [
        { ...prideBrunchWin, eventName: null, eventSlug: null },
      ]),
    );
    expect(screen.getByText(/^QueerPulse quiz night · /)).toBeInTheDocument();
  });

  it("files a quiz badge under Quiz nights", async () => {
    await renderCard(quizBadgeWithWins(1));
    expect(screen.getByText("Quiz nights")).toBeInTheDocument();
  });

  it("keeps a platform badge's catalogue name", async () => {
    await renderCard(platformBadge);
    expect(
      screen.getByRole("heading", { name: "Local Scout" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Save 3 places in the Local directory"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/×/)).not.toBeInTheDocument();
  });
});
