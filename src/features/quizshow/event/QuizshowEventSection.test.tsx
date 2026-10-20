import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { GatheringDetail } from "../../gatherings/data";
import type { QuizshowResultsResponse } from "../../../shared/contracts/quizshow";
import { QUIZSHOW_DEMO_RESULTS } from "../api/quizshowDemoStore.data";
import { eventScope } from "../quizshowScope";
import { QuizshowEventSection } from "./QuizshowEventSection";
import { QuizshowResultsCard } from "./QuizshowResultsCard";

const mocks = vi.hoisted(() => ({
  isVisible: true,
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
  useDemoMode: () => ({ demoMode: false }),
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
  recap: {
    questionsPlayed: 3,
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
      },
    ],
  },
};

function gatheringWith(
  quizshow: GatheringDetail["quizshow"],
  isOrganizer = false,
): GatheringDetail {
  return {
    slug: "test-event",
    quizshow,
    viewerIsOrganizer: isOrganizer,
  } as unknown as GatheringDetail;
}

function renderSection(gathering: GatheringDetail) {
  return render(
    <TestProviders>
      <QuizshowEventSection gathering={gathering} />
    </TestProviders>,
  );
}

const resultsSummary = {
  hasQuiz: true,
  liveSessionCode: null,
  hasResults: true,
};

describe("QuizshowEventSection", () => {
  beforeEach(() => {
    mocks.isVisible = true;
    mocks.results = teamResults;
    mocks.deleteResults.mockReset();
    mocks.deleteResults.mockResolvedValue(undefined);
  });

  it("shows Join the live game while a game is open", () => {
    renderSection(
      gatheringWith({
        hasQuiz: true,
        liveSessionCode: "QZ7KP4",
        hasResults: false,
      }),
    );
    const link = screen.getByRole("link", { name: "Join the live game" });
    expect(link).toHaveAttribute("href", "/play/QZ7KP4");
  });

  it("shows the results card after the game", () => {
    renderSection(gatheringWith(resultsSummary));
    expect(screen.getByText("1st")).toBeInTheDocument();
    expect(screen.getByText("2nd")).toBeInTheDocument();
    expect(screen.getByText("3rd")).toBeInTheDocument();
    expect(screen.getByText("Rita")).toBeInTheDocument();
    expect(screen.getByText("9,180 points")).toBeInTheDocument();
    expect(screen.getByText("Your place: 5 of 12")).toBeInTheDocument();
  });

  it("shows nothing while Pulse Live is hidden", () => {
    mocks.isVisible = false;
    renderSection(gatheringWith(resultsSummary));
    expect(screen.queryByText("Pulse Live results")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows nothing for an event with no game and no results", () => {
    renderSection(
      gatheringWith({
        hasQuiz: true,
        liveSessionCode: null,
        hasResults: false,
      }),
    );
    expect(screen.queryByText("Pulse Live results")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("folds the recap open for hosts", () => {
    renderSection(gatheringWith(resultsSummary, true));
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
    renderSection(gatheringWith(resultsSummary, true));
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

  it("keeps Delete results away from guests", () => {
    render(
      <TestProviders>
        <QuizshowResultsCard
          scope={eventScope("test-event")}
          canDelete={false}
        />
      </TestProviders>,
    );
    expect(screen.getByText("Pulse Live results")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete results" }),
    ).not.toBeInTheDocument();
  });
});
