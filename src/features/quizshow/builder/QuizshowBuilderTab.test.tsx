import { QueryClient } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { useUnsavedChangesGuard } from "../../../shared/hooks";
import type {
  QuizshowQuiz,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import { TestProviders } from "../../../test/TestProviders";
import {
  demoGetQuiz,
  demoPutQuiz,
  demoQuizFor,
  resetQuizshowDemoStore,
} from "../api/quizshowDemoStore";
import { quizshowKeys } from "../api/quizshowKeys";
import { blankDraft, draftToInput } from "./quizshowDraft";
import { QuizshowBuilderTab } from "./QuizshowBuilderTab";

vi.mock("../../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../shared/hooks")>()),
  useUnsavedChangesGuard: vi.fn(),
}));

vi.mock("../api/quizshowDemoStore", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoStore")>();
  return {
    ...actual,
    demoGetQuiz: vi.fn(actual.demoGetQuiz),
    demoPutQuiz: vi.fn(actual.demoPutQuiz),
  };
});

const SLUG = "pride-quiz-night";
const EVENT_START = new Date("2026-11-20T19:00:00.000Z");

function renderTab(queryClient?: QueryClient) {
  return render(
    <TestProviders queryClient={queryClient}>
      <QuizshowBuilderTab slug={SLUG} eventStartAt={EVENT_START} />
    </TestProviders>,
  );
}

async function startBlankAndType(title: string) {
  fireEvent.click(await screen.findByRole("button", { name: "Start blank" }));
  fireEvent.change(await screen.findByLabelText("Quiz title"), {
    target: { value: title },
  });
}

function firstRoundOf(quiz: QuizshowQuiz): QuizshowQuiz["rounds"][number] {
  const round = quiz.rounds[0];
  if (!round) throw new Error("The demo quiz has no rounds");
  return round;
}

/** The section around the "Before you open the lobby" heading. */
function problemsPanelOf(heading: HTMLElement): HTMLElement {
  const panel = heading.closest("section");
  if (panel === null) throw new Error("The problems heading has no section");
  return panel;
}

/** A client whose cache already holds `response` and stays fresh. */
function seededClient(response: QuizshowQuizResponse): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  queryClient.setQueryData(quizshowKeys.quiz(SLUG, true), response);
  return queryClient;
}

describe("QuizshowBuilderTab", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
    vi.mocked(demoPutQuiz).mockClear();
    vi.mocked(useUnsavedChangesGuard).mockClear();
  });

  it("shows the three ways to start on an event with no quiz", async () => {
    renderTab();
    expect(
      await screen.findByRole("button", { name: "Start from a pack" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy from a past event" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Start blank" }),
    ).toBeInTheDocument();
  });

  it("starts blank with one quiz round", async () => {
    renderTab();
    fireEvent.click(await screen.findByRole("button", { name: "Start blank" }));
    expect(await screen.findByText("Unsaved changes")).toBeInTheDocument();
    expect(screen.getByLabelText("Quiz title")).toBeInTheDocument();
    expect(screen.getByText("Round 1")).toBeInTheDocument();
  });

  it("saves the quiz with one PUT and says so", async () => {
    renderTab();
    await startBlankAndType("Pride night");
    fireEvent.click(screen.getByRole("button", { name: "Save quiz" }));
    expect(await screen.findByText("Quiz saved")).toBeInTheDocument();
    expect(demoPutQuiz).toHaveBeenCalledTimes(1);
    expect(demoGetQuiz(SLUG).quiz?.title).toBe("Pride night");
    await waitFor(() =>
      expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument(),
    );
  });

  it("asks before saving over a co-host's newer version", async () => {
    renderTab();
    await startBlankAndType("My quiz");
    // A co-host saves first, so the store holds a newer version.
    demoPutQuiz(
      SLUG,
      draftToInput({ ...blankDraft(), title: "Their quiz" }, null),
    );
    vi.mocked(demoPutQuiz).mockClear();
    const storedUpdatedAt = demoGetQuiz(SLUG).quiz?.updatedAt;
    fireEvent.click(screen.getByRole("button", { name: "Save quiz" }));
    expect(
      await screen.findByText("Someone else saved this quiz"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save mine over it" }));
    await waitFor(() => expect(demoPutQuiz).toHaveBeenCalledTimes(2));
    expect(vi.mocked(demoPutQuiz).mock.calls[1]?.[1].expectedUpdatedAt).toBe(
      storedUpdatedAt,
    );
    expect(await screen.findByText("Quiz saved")).toBeInTheDocument();
  });

  it("replaces the draft with their version on request", async () => {
    renderTab();
    await startBlankAndType("My quiz");
    demoPutQuiz(
      SLUG,
      draftToInput({ ...blankDraft(), title: "Their quiz" }, null),
    );
    fireEvent.click(screen.getByRole("button", { name: "Save quiz" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Load their version" }),
    );
    await waitFor(() =>
      expect(screen.getByLabelText("Quiz title")).toHaveValue("Their quiz"),
    );
    await waitFor(() =>
      expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument(),
    );
  });

  it("blocks Save on a structural problem and lists it", async () => {
    const quiz = demoQuizFor(SLUG);
    firstRoundOf(quiz).contentLabel = "adults";
    renderTab(
      seededClient({
        quiz,
        problems: [],
        isAdultsEvent: false,
        liveSession: null,
        hasResults: false,
      }),
    );
    fireEvent.change(await screen.findByLabelText("Quiz title"), {
      target: { value: "Renamed" },
    });
    expect(
      await screen.findByText(
        "Round 1 is labelled adults only, and this event is not 18+",
      ),
    ).toBeInTheDocument();
    const saveButton = screen.getByRole("button", { name: "Save quiz" });
    expect(saveButton).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(saveButton);
    expect(demoPutQuiz).not.toHaveBeenCalled();
  });

  it("lists what to finish before the lobby opens and jumps to it", async () => {
    const quiz = demoQuizFor(SLUG);
    const firstQuestion = firstRoundOf(quiz).questions[0] as unknown as {
      prompt: { en: string; pt: string };
    };
    firstQuestion.prompt = { en: "", pt: "" };
    renderTab(
      seededClient({
        quiz,
        problems: [
          {
            code: "prompt_missing",
            roundIndex: 0,
            questionIndex: 0,
            language: "en",
          },
        ],
        isAdultsEvent: false,
        liveSession: null,
        hasResults: false,
      }),
    );
    // The "Try it" button carries the same list as its hidden description, so
    // the visible problems panel is where the host reads it.
    const problemsPanel = problemsPanelOf(
      await screen.findByText("Before you open the lobby", { selector: "h3" }),
    );
    expect(
      within(problemsPanel).getByText(
        "Round 1, question 1 needs its question text (EN)",
      ),
    ).toBeInTheDocument();
    fireEvent.click(
      within(problemsPanel).getByRole("button", { name: "Go to it" }),
    );
    expect(
      await screen.findByRole("button", { name: "Close question 1" }),
    ).toBeInTheDocument();
  });

  it("asks before leaving with unsaved changes", async () => {
    renderTab();
    await startBlankAndType("Pride night");
    await waitFor(() =>
      expect(useUnsavedChangesGuard).toHaveBeenLastCalledWith(
        expect.objectContaining({
          active: true,
          confirmMessage:
            "You have unsaved changes to this quiz. Leave anyway?",
        }),
      ),
    );
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
    expect(screen.queryByLabelText("Quiz title")).not.toBeInTheDocument();
  });
});

describe("QuizshowBuilderTab final fixes", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
    vi.mocked(demoPutQuiz).mockClear();
  });

  afterEach(() => {
    window.localStorage.removeItem("qp.lang");
  });

  it("a failed refresh keeps the unsaved draft on screen", async () => {
    const queryClient = seededClient({
      quiz: demoQuizFor(SLUG),
      problems: [],
      isAdultsEvent: false,
      liveSession: null,
      hasResults: false,
    });
    renderTab(queryClient);
    fireEvent.change(await screen.findByLabelText("Quiz title"), {
      target: { value: "Renamed" },
    });
    vi.mocked(demoGetQuiz).mockImplementationOnce(() => {
      throw new ApiError(404, "quizshow_event_not_found");
    });
    await act(async () => {
      await queryClient.refetchQueries({
        queryKey: quizshowKeys.quiz(SLUG, true),
      });
    });
    expect(
      await screen.findByText(
        "We couldn't refresh the quiz. Anything you changed is still here",
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Quiz title")).toHaveValue("Renamed");
    expect(screen.getByText("Unsaved changes")).toBeInTheDocument();
    expect(
      screen.queryByText("We couldn't load the quiz"),
    ).not.toBeInTheDocument();
  });

  it("a new quiz starts in the app language", async () => {
    window.localStorage.setItem("qp.lang", "pt");
    renderTab();
    fireEvent.click(
      await screen.findByRole("button", { name: "Começar do zero" }),
    );
    fireEvent.change(await screen.findByLabelText("Título do quiz"), {
      target: { value: "Noite de Pride" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar quiz" }));
    await waitFor(() => expect(demoPutQuiz).toHaveBeenCalledTimes(1));
    const savedInput = vi.mocked(demoPutQuiz).mock.calls[0]?.[1];
    expect(savedInput?.languages).toBe("pt");
    expect(savedInput?.screenLanguage).toBe("pt");
  });
});
