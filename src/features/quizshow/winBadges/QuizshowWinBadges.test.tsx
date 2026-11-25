import { act, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { ApiError } from "../../../shared/api/client";
import type {
  QuizshowResultsWinBadges as QuizshowResultsWinBadgesDTO,
  QuizWinBadgeChip as QuizWinBadgeChipDTO,
} from "../../../shared/contracts/quizWinBadges";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { QUIZSHOW_DEMO_LIVE_SLUG } from "../api/quizshowDemoStore.data";
import { eventScope } from "../quizshowScope";
import { QuizWinBadgeChip } from "./QuizWinBadgeChip";
import { QuizshowLobbyWinToEarn } from "./QuizshowLobbyWinToEarn";
import { QuizshowPracticeNoBadgesLine } from "./QuizshowPracticeNoBadgesLine";
import { QuizshowResultsWinBadges } from "./QuizshowResultsWinBadges";
import { QuizshowWinToEarn } from "./QuizshowWinToEarn";
import { resetQuizWinBadgesDemoStore } from "./quizWinBadgesDemoStore";

const mocks = vi.hoisted(() => ({
  /** When set, every `useDemoMode` reader sees this mode. */
  demoOverride: { demoMode: null as boolean | null },
  /** Every argument list the preview hook was called with. */
  hookCalls: [] as unknown[][],
  /** The live preview read, replaced by each live test. */
  getPreview: vi.fn(),
}));

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("../../../app/providers/DemoModeProvider")
    >();
  return {
    ...original,
    useDemoMode: () => {
      const value = original.useDemoMode();
      const overrideMode = mocks.demoOverride.demoMode;
      return overrideMode === null
        ? value
        : { ...value, demoMode: overrideMode };
    },
  };
});

vi.mock("./useQuizshowWinBadgesPreview", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./useQuizshowWinBadgesPreview")>();
  return {
    ...original,
    useQuizshowWinBadgesPreview: (
      ...hookArguments: Parameters<typeof original.useQuizshowWinBadgesPreview>
    ) => {
      mocks.hookCalls.push(hookArguments);
      return original.useQuizshowWinBadgesPreview(...hookArguments);
    },
  };
});

vi.mock("./quizWinBadges.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./quizWinBadges.api")>()),
  getQuizshowWinBadgesPreview: mocks.getPreview,
}));

const SHARPSHOOTER_CHIP: QuizWinBadgeChipDTO = {
  definitionId: "badge-sharpshooter",
  badgeKey: "quiz:badge-sharpshooter",
  name: { en: "Trivia Sharpshooter", pt: null },
  iconKey: "zap",
  tint: "accent",
  rarity: "rare",
  isArchived: false,
};

const CHAMPION_CHIP: QuizWinBadgeChipDTO = {
  definitionId: "badge-champion",
  badgeKey: "quiz:badge-champion",
  name: { en: "Quiz Night Champion", pt: "Campeã da noite de quiz" },
  iconKey: "star",
  tint: "plum",
  rarity: "legendary",
  isArchived: false,
};

/** One client for a whole test, so a rerender keeps the cache. */
let testQueryClient = new QueryClient();

function withProviders(element: React.ReactElement) {
  return (
    <TestProviders queryClient={testQueryClient}>
      <MotionProvider>{element}</MotionProvider>
    </TestProviders>
  );
}

async function renderPieces(element: React.ReactElement) {
  const view = render(withProviders(element));
  await awaitCatalog("quizshow");
  return view;
}

beforeEach(() => {
  testQueryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  resetQuizWinBadgesDemoStore();
  mocks.demoOverride.demoMode = null;
  mocks.hookCalls.length = 0;
  mocks.getPreview.mockReset();
});

afterEach(() => {
  mocks.demoOverride.demoMode = null;
  window.localStorage.removeItem("qp.lang");
});

describe("QuizWinBadgeChip", () => {
  it("shows the English name to a Portuguese viewer when pt is null", async () => {
    window.localStorage.setItem("qp.lang", "pt");
    await renderPieces(<QuizWinBadgeChip badge={SHARPSHOOTER_CHIP} />);
    expect(screen.getByText("Trivia Sharpshooter")).toBeInTheDocument();
  });

  it("shows the Portuguese name when it is set", async () => {
    window.localStorage.setItem("qp.lang", "pt");
    await renderPieces(<QuizWinBadgeChip badge={CHAMPION_CHIP} />);
    expect(screen.getByText("Campeã da noite de quiz")).toBeInTheDocument();
    expect(screen.queryByText("Quiz Night Champion")).not.toBeInTheDocument();
  });
});

describe("QuizshowWinToEarn", () => {
  it("lists the next game's badges under Win to earn", async () => {
    await renderPieces(
      <QuizshowWinToEarn
        preview={{ gameNumber: 2, badges: [CHAMPION_CHIP] }}
        tone="page"
      />,
    );
    const section = screen.getByRole("region", { name: "Win to earn" });
    expect(within(section).getByText("Game 2")).toBeInTheDocument();
    expect(within(section).getAllByRole("listitem")).toHaveLength(1);
    expect(
      within(section).getByText("Quiz Night Champion"),
    ).toBeInTheDocument();
  });
});

describe("QuizshowResultsWinBadges", () => {
  const winnerRita = {
    kind: "player" as const,
    name: "Rita",
    badges: [CHAMPION_CHIP],
  };

  function winBadgesFor(
    myBadges: QuizWinBadgeChipDTO[],
  ): QuizshowResultsWinBadgesDTO {
    return { gameNumber: 1, winners: [winnerRita], myBadges };
  }

  it("says You earned only when the viewer won", async () => {
    const { rerender } = await renderPieces(
      <QuizshowResultsWinBadges winBadges={winBadgesFor([])} />,
    );
    expect(screen.queryByText("You earned")).not.toBeInTheDocument();

    rerender(
      withProviders(
        <QuizshowResultsWinBadges
          winBadges={winBadgesFor([SHARPSHOOTER_CHIP])}
        />,
      ),
    );
    expect(await screen.findByText("You earned")).toBeInTheDocument();
    expect(screen.getByText("Trivia Sharpshooter")).toBeInTheDocument();
  });

  it("names each winner by screen name", async () => {
    await renderPieces(
      <QuizshowResultsWinBadges winBadges={winBadgesFor([])} />,
    );
    expect(await screen.findByText("Rita earned")).toBeInTheDocument();
    expect(screen.getByText("Quiz Night Champion")).toBeInTheDocument();
  });
});

describe("QuizshowLobbyWinToEarn", () => {
  it("shows Win to earn in an event lobby", async () => {
    await renderPieces(
      <QuizshowLobbyWinToEarn
        session={{
          kind: "event",
          eventSlug: QUIZSHOW_DEMO_LIVE_SLUG,
          isPractice: false,
        }}
      />,
    );
    expect(await screen.findByText("Win to earn")).toBeInTheDocument();
    expect(screen.getByText("Game 2")).toBeInTheDocument();
  });

  it("skips the read in a practice game and outside an event", async () => {
    mocks.demoOverride.demoMode = false;
    const { rerender } = await renderPieces(
      <QuizshowLobbyWinToEarn
        session={{
          kind: "event",
          eventSlug: QUIZSHOW_DEMO_LIVE_SLUG,
          isPractice: true,
        }}
      />,
    );
    rerender(
      withProviders(
        <QuizshowLobbyWinToEarn
          session={{ kind: "game", eventSlug: null, isPractice: false }}
        />,
      ),
    );
    await act(async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    });
    expect(mocks.hookCalls.length).toBeGreaterThan(0);
    for (const [slug, options] of mocks.hookCalls) {
      expect(slug).toBeNull();
      expect((options as { isEnabled?: boolean }).isEnabled).toBe(false);
    }
    expect(screen.queryByText("Win to earn")).not.toBeInTheDocument();
    expect(mocks.getPreview).not.toHaveBeenCalled();
  });

  it("renders nothing when the preview read fails", async () => {
    mocks.demoOverride.demoMode = false;
    mocks.getPreview.mockRejectedValue(
      new ApiError(404, "This feature is not available yet."),
    );
    await renderPieces(
      <QuizshowLobbyWinToEarn
        session={{
          kind: "event",
          eventSlug: QUIZSHOW_DEMO_LIVE_SLUG,
          isPractice: false,
        }}
      />,
    );
    await waitFor(() =>
      expect(mocks.getPreview).toHaveBeenCalledWith(QUIZSHOW_DEMO_LIVE_SLUG),
    );
    await act(async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    });
    expect(screen.queryByText("Win to earn")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")?.textContent ?? "").toBe("");
  });
});

describe("QuizshowPracticeNoBadgesLine", () => {
  const practiceLine = "Practice games give no badges";

  it("says practice games give no badges only while practice is on", async () => {
    const scope = eventScope(QUIZSHOW_DEMO_LIVE_SLUG);
    const { rerender } = await renderPieces(
      <QuizshowPracticeNoBadgesLine scope={scope} isPractice={false} />,
    );
    await act(async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    });
    expect(screen.queryByText(practiceLine)).not.toBeInTheDocument();

    rerender(
      withProviders(<QuizshowPracticeNoBadgesLine scope={scope} isPractice />),
    );
    expect(await screen.findByText(practiceLine)).toBeInTheDocument();

    rerender(
      withProviders(
        <QuizshowPracticeNoBadgesLine scope={scope} isPractice={false} />,
      ),
    );
    await waitFor(
      () => expect(screen.queryByText(practiceLine)).not.toBeInTheDocument(),
      { timeout: 2000 },
    );
  });
});
