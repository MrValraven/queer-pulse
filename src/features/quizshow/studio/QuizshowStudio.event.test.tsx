import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { useUnsavedChangesGuard } from "../../../shared/hooks";
import { TestProviders } from "../../../test/TestProviders";
import { demoPutGame, resetQuizshowDemoGames } from "../api/quizshowDemoGames";
import {
  demoGetQuiz,
  demoPutQuiz,
  resetQuizshowDemoStore,
} from "../api/quizshowDemoStore";
import { blankDraft, draftToInput } from "../builder/quizshowDraft";
import { eventScope } from "../quizshowScope";
import { QuizshowStudio } from "./QuizshowStudio";

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

vi.mock("../api/quizshowDemoGames", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoGames")>();
  return { ...actual, demoPutGame: vi.fn(actual.demoPutGame) };
});

const SLUG = "pride-quiz-night";
const BACK_LINK = {
  to: "/gatherings/pride-quiz-night/manage?tab=quizshow",
  labelKey: "quizshow:studio.backToManage",
};

function renderEventStudio() {
  return render(
    <TestProviders>
      <QuizshowStudio
        scope={eventScope(SLUG)}
        backLink={BACK_LINK}
        eventStartAt="2026-11-20T19:00:00.000Z"
      />
    </TestProviders>,
  );
}

/** Cmd+S, the studio's save shortcut; it works from a text field too. */
function pressSave() {
  fireEvent.keyDown(document, { key: "s", metaKey: true });
}

/** Starts a blank quiz and types its title in the top bar's field. */
async function startBlankAndType(title: string) {
  fireEvent.click(
    await screen.findByRole("button", { name: "Start with a blank quiz" }),
  );
  const [titleField] = await screen.findAllByLabelText("Quiz title");
  if (!titleField) throw new Error("The studio shows no title field");
  fireEvent.change(titleField, { target: { value: title } });
}

describe("QuizshowStudio on an event", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
    resetQuizshowDemoGames();
    vi.mocked(demoPutQuiz).mockClear();
    vi.mocked(demoPutGame).mockClear();
    vi.mocked(useUnsavedChangesGuard).mockClear();
  });

  afterEach(() => {
    window.localStorage.removeItem("qp.lang");
  });

  it("shows the three ways to start on an event with no quiz", async () => {
    renderEventStudio();
    expect(
      await screen.findByRole("button", { name: "Start from a template" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copy from a past event" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Start with a blank quiz" }),
    ).toBeInTheDocument();
  });

  it("saves an event quiz through the event endpoint without an isAdultsOnly field", async () => {
    renderEventStudio();
    await startBlankAndType("Pride night");
    pressSave();
    await waitFor(() => expect(demoPutQuiz).toHaveBeenCalledTimes(1));
    const [savedSlug, savedBody] = vi.mocked(demoPutQuiz).mock.calls[0] ?? [];
    expect(savedSlug).toBe(SLUG);
    expect(savedBody?.title).toBe("Pride night");
    expect(Object.keys(savedBody ?? {})).not.toContain("isAdultsOnly");
    expect(demoPutGame).not.toHaveBeenCalled();
    expect(demoGetQuiz(SLUG).quiz?.title).toBe("Pride night");
    expect(await screen.findByText("Quiz saved")).toBeInTheDocument();
  });

  it("labels the title Quiz title and shows no 18+ switch on an event", async () => {
    renderEventStudio();
    await startBlankAndType("Pride night");
    for (const titleField of screen.getAllByLabelText("Quiz title")) {
      expect(titleField).toHaveValue("Pride night");
    }
    expect(screen.queryByLabelText("Game title")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("switch", { name: "This game has 18+ content" }),
    ).not.toBeInTheDocument();
  });

  it("asks before saving over a co-host's newer version", async () => {
    renderEventStudio();
    await startBlankAndType("My quiz");
    // A co-host saves first, so the store holds a newer version.
    demoPutQuiz(
      SLUG,
      draftToInput({ ...blankDraft(), title: "Their quiz" }, null),
    );
    vi.mocked(demoPutQuiz).mockClear();
    const storedUpdatedAt = demoGetQuiz(SLUG).quiz?.updatedAt;
    pressSave();
    expect(
      await screen.findByText("Someone else saved this quiz"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save mine over it" }));
    await waitFor(() => expect(demoPutQuiz).toHaveBeenCalledTimes(2));
    expect(vi.mocked(demoPutQuiz).mock.calls[1]?.[1].expectedUpdatedAt).toBe(
      storedUpdatedAt,
    );
  });

  it("replaces the draft with their version on request", async () => {
    renderEventStudio();
    await startBlankAndType("My quiz");
    demoPutQuiz(
      SLUG,
      draftToInput({ ...blankDraft(), title: "Their quiz" }, null),
    );
    pressSave();
    fireEvent.click(
      await screen.findByRole("button", { name: "Load their version" }),
    );
    await waitFor(() => {
      for (const titleField of screen.getAllByLabelText("Quiz title")) {
        expect(titleField).toHaveValue("Their quiz");
      }
    });
    await waitFor(() =>
      expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument(),
    );
  });

  it("asks before leaving with unsaved changes", async () => {
    renderEventStudio();
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
    renderEventStudio();
    expect(
      await screen.findByText(
        "You're playing in this game, so the host tools wait until it ends",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Quiz title")).not.toBeInTheDocument();
  });

  it("starts a new quiz in the app language", async () => {
    window.localStorage.setItem("qp.lang", "pt");
    renderEventStudio();
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Começar com um quiz em branco",
      }),
    );
    const [titleField] = await screen.findAllByLabelText("Título do quiz");
    if (!titleField) throw new Error("The studio shows no title field");
    fireEvent.change(titleField, { target: { value: "Noite de Pride" } });
    pressSave();
    await waitFor(() => expect(demoPutQuiz).toHaveBeenCalledTimes(1));
    const savedInput = vi.mocked(demoPutQuiz).mock.calls[0]?.[1];
    expect(savedInput?.languages).toBe("pt");
    expect(savedInput?.screenLanguage).toBe("pt");
  });
});
