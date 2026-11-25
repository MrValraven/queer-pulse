import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import type { GatheringDetail } from "../../gatherings/data";
import type { QuizshowResultsResponse } from "../../../shared/contracts/quizshow";
import type {
  QuizshowWinBadgesPreview,
  QuizWinBadgeChip as QuizWinBadgeChipDTO,
} from "../../../shared/contracts/quizWinBadges";
import {
  QUIZSHOW_DEMO_LIVE_SLUG,
  QUIZSHOW_DEMO_RESULTS,
} from "../api/quizshowDemoStore.data";
import { eventScope } from "../quizshowScope";
import {
  demoQuizEventIdOf,
  QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
  QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID,
} from "../winBadges/quizWinBadgesDemo.data";
import {
  demoPutQuizEventBadgeSetup,
  resetQuizWinBadgesDemoStore,
} from "../winBadges/quizWinBadgesDemoStore";
import { QuizshowEventSection } from "./QuizshowEventSection";
import { QuizshowResultsCard } from "./QuizshowResultsCard";

const mocks = vi.hoisted(() => ({
  isVisible: true,
  isDemo: false,
  results: null as QuizshowResultsResponse | null,
  deleteResults: vi.fn(),
}));

vi.mock("../quizshowLaunch", () => ({
  useIsQuizshowVisible: () => mocks.isVisible,
}));
vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: mocks.isDemo }),
}));
vi.mock("../api/useQuizshowResults", () => ({
  useQuizshowResults: () => ({
    data: mocks.results,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));
vi.mock("../api/useQuizshowMutations", () => ({
  useDeleteQuizshowResults: () => ({
    mutateAsync: mocks.deleteResults,
    isPending: false,
  }),
}));

const teamResults: QuizshowResultsResponse = {
  ...QUIZSHOW_DEMO_RESULTS,
  winBadges: null,
  recap: {
    questionsPlayed: 3,
    standings: [],
    answersGiven: 30,
    questions: [
      {
        roundIndex: 0,
        questionIndex: 0,
        roundKind: "quiz",
        type: "true_false",
        prompt: { en: "Stonewall was in 1969", pt: "Stonewall foi em 1969" },
        answerCount: 10,
        percentCorrect: 80,
        averageAnswerMs: 4400,
        wasSkipped: false,
        isWarmUp: false,
        wasCorrected: false,
      },
      {
        roundIndex: 0,
        questionIndex: 1,
        roundKind: "quiz",
        type: "true_false",
        prompt: { en: "A skipped one", pt: "Uma saltada" },
        answerCount: 0,
        percentCorrect: null,
        averageAnswerMs: null,
        wasSkipped: true,
        isWarmUp: false,
        wasCorrected: false,
      },
      {
        roundIndex: 1,
        questionIndex: 0,
        roundKind: "caption_this",
        type: "type_answer",
        prompt: { en: "Pick a drag name", pt: "Escolhe um nome drag" },
        answerCount: 20,
        percentCorrect: null,
        averageAnswerMs: null,
        wasSkipped: false,
        isWarmUp: false,
        wasCorrected: false,
      },
    ],
  },
};

const CHAMPION_CHIP: QuizWinBadgeChipDTO = {
  definitionId: "badge-champion",
  badgeKey: "quiz:badge-champion",
  name: { en: "Quiz Night Champion", pt: null },
  iconKey: "star",
  tint: "plum",
  rarity: "legendary",
  isArchived: false,
};

const gameTwoPreview: QuizshowWinBadgesPreview = {
  gameNumber: 2,
  badges: [CHAMPION_CHIP],
};

function gatheringWith(
  quizshow: GatheringDetail["quizshow"],
  isOrganizer = false,
  slug = "test-event",
): GatheringDetail {
  return {
    slug,
    quizshow,
    viewerIsOrganizer: isOrganizer,
  } as unknown as GatheringDetail;
}

async function renderSection(gathering: GatheringDetail) {
  const view = render(
    <TestProviders>
      <QuizshowEventSection gathering={gathering} />
    </TestProviders>,
  );
  await awaitCatalog("quizshow");
  return view;
}

const resultsSummary = {
  hasQuiz: true,
  liveSessionCode: null,
  hasResults: true,
  winBadges: null,
};

describe("QuizshowEventSection", () => {
  beforeEach(() => {
    mocks.isVisible = true;
    mocks.isDemo = false;
    resetQuizWinBadgesDemoStore();
    mocks.results = teamResults;
    mocks.deleteResults.mockReset();
    mocks.deleteResults.mockResolvedValue(undefined);
  });

  it("shows Join the live game while a game is open", async () => {
    await renderSection(
      gatheringWith({
        hasQuiz: true,
        liveSessionCode: "QZ7KP4",
        hasResults: false,
        winBadges: null,
      }),
    );
    const link = screen.getByRole("link", { name: "Join the live game" });
    expect(link).toHaveAttribute("href", "/play/QZ7KP4");
  });

  it("shows the results card after the game", async () => {
    await renderSection(gatheringWith(resultsSummary));
    expect(screen.getByText("1st")).toBeInTheDocument();
    expect(screen.getByText("2nd")).toBeInTheDocument();
    expect(screen.getByText("3rd")).toBeInTheDocument();
    expect(screen.getByText("Rita")).toBeInTheDocument();
    expect(screen.getByText("9,180 points")).toBeInTheDocument();
    expect(screen.getByText("Your place: 5 of 12")).toBeInTheDocument();
  });

  it("shows nothing while Pulse Live is hidden", async () => {
    mocks.isVisible = false;
    await renderSection(gatheringWith(resultsSummary));
    expect(screen.queryByText("Pulse Live results")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows nothing for an event with no game and no results", async () => {
    await renderSection(
      gatheringWith({
        hasQuiz: true,
        liveSessionCode: null,
        hasResults: false,
        winBadges: null,
      }),
    );
    expect(screen.queryByText("Pulse Live results")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("folds the recap open for hosts", async () => {
    await renderSection(gatheringWith(resultsSummary, true));
    expect(screen.queryByText("Recap for hosts")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show recap" }));
    expect(screen.getByText("Recap for hosts")).toBeInTheDocument();
    expect(screen.getByText("Stonewall was in 1969")).toBeInTheDocument();
    expect(screen.getByText(/80% got it right/)).toBeInTheDocument();
    expect(screen.getByText(/Average answer 4.4s/)).toBeInTheDocument();
    expect(screen.getByText("Skipped")).toBeInTheDocument();
    expect(screen.getByText("Party question")).toBeInTheDocument();
  });

  it("asks before deleting the results", async () => {
    await renderSection(gatheringWith(resultsSummary, true));
    fireEvent.click(screen.getByRole("button", { name: "Delete results" }));
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText("Delete these results?"),
    ).toBeInTheDocument();
    expect(mocks.deleteResults).not.toHaveBeenCalled();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Delete results" }),
    );
    expect(await screen.findByText("Results deleted")).toBeInTheDocument();
    expect(mocks.deleteResults).toHaveBeenCalledTimes(1);
  });

  it("keeps Delete results away from guests", async () => {
    render(
      <TestProviders>
        <QuizshowResultsCard
          scope={eventScope("test-event")}
          canDelete={false}
        />
      </TestProviders>,
    );
    await awaitCatalog("quizshow");
    expect(screen.getByText("Pulse Live results")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete results" }),
    ).not.toBeInTheDocument();
  });

  it("shows Win to earn under the live banner of the demo event", async () => {
    mocks.isDemo = true;
    await renderSection(gatheringWith(null, false, QUIZSHOW_DEMO_LIVE_SLUG));
    expect(
      screen.getByRole("link", { name: "Join the live game" }),
    ).toBeInTheDocument();
    const section = screen.getByRole("region", { name: "Win to earn" });
    expect(within(section).getByText("Game 2")).toBeInTheDocument();
  });

  it("opens for an event with badges and nothing played yet", async () => {
    await renderSection(
      gatheringWith({
        hasQuiz: true,
        liveSessionCode: null,
        hasResults: false,
        winBadges: gameTwoPreview,
      }),
    );
    const section = screen.getByRole("region", { name: "Win to earn" });
    expect(within(section).getByText("Game 2")).toBeInTheDocument();
    expect(
      within(section).getByText("Quiz Night Champion"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Pulse Live results")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows the section as before when the event detail carries no winBadges field", async () => {
    const summaryWithoutField = {
      hasQuiz: true,
      liveSessionCode: "QZ7KP4",
      hasResults: false,
    } as unknown as GatheringDetail["quizshow"];
    const { unmount } = await renderSection(gatheringWith(summaryWithoutField));
    expect(
      screen.getByRole("link", { name: "Join the live game" }),
    ).toHaveAttribute("href", "/play/QZ7KP4");
    expect(
      screen.queryByRole("region", { name: "Win to earn" }),
    ).not.toBeInTheDocument();
    unmount();

    const resultsWithoutField = {
      hasQuiz: true,
      liveSessionCode: null,
      hasResults: true,
    } as unknown as GatheringDetail["quizshow"];
    await renderSection(gatheringWith(resultsWithoutField));
    expect(screen.getByText("Your place: 5 of 12")).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Win to earn" }),
    ).not.toBeInTheDocument();
  });

  it("follows an admin edit in demo", async () => {
    mocks.isDemo = true;
    render(
      <TestProviders>
        <MotionProvider>
          <QuizshowEventSection
            gathering={gatheringWith(null, false, QUIZSHOW_DEMO_LIVE_SLUG)}
          />
        </MotionProvider>
      </TestProviders>,
    );
    await awaitCatalog("quizshow");
    expect(
      screen.getByRole("region", { name: "Win to earn" }),
    ).toBeInTheDocument();

    act(() => {
      demoPutQuizEventBadgeSetup(demoQuizEventIdOf(QUIZSHOW_DEMO_LIVE_SLUG), {
        games: [
          {
            gameNumber: 1,
            badgeDefinitionIds: [
              QUIZ_WIN_BADGES_DEMO_CHAMPION_ID,
              QUIZ_WIN_BADGES_DEMO_SHARPSHOOTER_ID,
            ],
          },
          { gameNumber: 2, badgeDefinitionIds: [] },
        ],
      });
    });

    await waitFor(
      () =>
        expect(
          screen.queryByRole("region", { name: "Win to earn" }),
        ).not.toBeInTheDocument(),
      { timeout: 3000 },
    );
    expect(
      screen.getByRole("link", { name: "Join the live game" }),
    ).toBeInTheDocument();
  });
});
