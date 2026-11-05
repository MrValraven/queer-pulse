import { QueryClient } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { QuizshowQuizResponse } from "../../../shared/contracts/quizshow";
import { TestProviders } from "../../../test/TestProviders";
import {
  demoGetQuiz,
  demoQuizFor,
  resetQuizshowDemoStore,
} from "../api/quizshowDemoStore";
import { QUIZSHOW_DEMO_RESULTS_SLUG } from "../api/quizshowDemoStore.data";
import { quizshowKeys } from "../api/quizshowKeys";
import { quizshowEditPath } from "../quizshowPaths";
import { QuizshowBuilderTab } from "./QuizshowBuilderTab";

vi.mock("../api/quizshowDemoStore", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoStore")>();
  return { ...actual, demoGetQuiz: vi.fn(actual.demoGetQuiz) };
});

const SLUG = "pride-quiz-night";
const EVENT_START = new Date("2026-11-20T19:00:00.000Z");

function renderTab(options: { slug?: string; queryClient?: QueryClient } = {}) {
  return render(
    <TestProviders queryClient={options.queryClient}>
      <QuizshowBuilderTab
        slug={options.slug ?? SLUG}
        eventStartAt={EVENT_START}
      />
    </TestProviders>,
  );
}

/** A client whose cache already holds `response` for the tab's event and stays fresh. */
function seededClient(response: QuizshowQuizResponse): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  queryClient.setQueryData(quizshowKeys.quiz(SLUG, true), response);
  return queryClient;
}

function savedQuizResponse(
  overrides: Partial<QuizshowQuizResponse> = {},
): QuizshowQuizResponse {
  return {
    quiz: demoQuizFor(SLUG),
    problems: [],
    isAdultsEvent: false,
    liveSession: null,
    hasResults: false,
    ...overrides,
  };
}

describe("QuizshowBuilderTab", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
    vi.mocked(demoGetQuiz).mockClear();
  });

  it("offers the editor on an event with no quiz", async () => {
    renderTab();
    const openEditor = await screen.findByRole("link", {
      name: "Open the editor",
    });
    expect(openEditor).toHaveAttribute("href", quizshowEditPath(SLUG));
    expect(
      screen.getByRole("heading", { level: 2, name: "No quiz yet" }),
    ).toBeInTheDocument();
    // The heading says it; no status line repeats it.
    const card = screen.getByRole("region", { name: "No quiz yet" });
    expect(within(card).queryByRole("status")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Try it" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Open lobby" }),
    ).not.toBeInTheDocument();
  });

  it("sums up a saved quiz: its title slide, counts, Try it and Open lobby", async () => {
    const response = savedQuizResponse();
    renderTab({ queryClient: seededClient(response) });
    const quiz = response.quiz;
    if (!quiz) throw new Error("The demo event has no quiz");
    const questionCount = quiz.rounds.reduce(
      (total, round) => total + round.questions.length,
      0,
    );
    expect(await screen.findByText(quiz.title)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`^${quiz.rounds.length} rounds?`)),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${questionCount} questions?$`)),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "This event's quiz" }),
    ).toBeInTheDocument();
    const card = screen.getByRole("region", { name: "This event's quiz" });
    expect(within(card).getByRole("status")).toHaveTextContent("Ready to play");
    expect(screen.getByRole("button", { name: "Try it" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open lobby" }),
    ).not.toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByRole("link", { name: "Open the editor" }),
    ).toHaveAttribute("href", quizshowEditPath(SLUG));
  });

  it("holds the lobby while the saved quiz has problems and says how many", async () => {
    renderTab({
      queryClient: seededClient(
        savedQuizResponse({
          problems: [
            {
              code: "prompt_missing",
              roundIndex: 0,
              questionIndex: 0,
              language: "en",
            },
          ],
        }),
      ),
    });
    const card = await screen.findByRole("region", {
      name: "This event's quiz",
    });
    expect(within(card).getByRole("status")).toHaveTextContent(
      "1 problem to fix",
    );
    const openLobby = screen.getByRole("button", { name: "Open lobby" });
    expect(openLobby).toHaveAttribute("aria-disabled", "true");
    expect(openLobby).toHaveAccessibleDescription(
      "Fix them in the editor, then open the lobby",
    );
  });

  it("shows the open lobby's code and the live game panel", async () => {
    renderTab({
      queryClient: seededClient(
        savedQuizResponse({
          liveSession: {
            sessionId: "session-1",
            joinCode: "QZ7KP4",
            status: "lobby",
            playMode: "solo",
            playerCount: 3,
            startedAt: "2026-11-20T19:05:00.000Z",
          },
        }),
      ),
    });
    expect(
      await screen.findByText("Lobby open, code QZ7KP4"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Game in progress" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open big screen" }),
    ).toBeInTheDocument();
  });

  it("shows the kept results on an event that has them", async () => {
    renderTab({ slug: QUIZSHOW_DEMO_RESULTS_SLUG });
    expect(
      await screen.findByRole("heading", { name: "Pulse Live results" }),
    ).toBeInTheDocument();
  });

  it("explains a co-host who is playing", async () => {
    vi.mocked(demoGetQuiz).mockImplementationOnce(() => {
      throw new ApiError(403, "quizshow_cohost_is_playing", {
        code: "quizshow_cohost_is_playing",
      });
    });
    renderTab();
    expect(
      await screen.findByText(
        "You're playing in this game, so the host tools wait until it ends",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Open the editor" }),
    ).not.toBeInTheDocument();
  });
});
