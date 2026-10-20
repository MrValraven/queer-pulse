import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { demoPutGame, resetQuizshowDemoGames } from "../api/quizshowDemoGames";
import { demoPutQuiz, resetQuizshowDemoStore } from "../api/quizshowDemoStore";
import { QuizshowBuilderTab } from "./QuizshowBuilderTab";

vi.mock("../../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../shared/hooks")>()),
  useUnsavedChangesGuard: vi.fn(),
}));

vi.mock("../api/quizshowDemoStore", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoStore")>();
  return { ...actual, demoPutQuiz: vi.fn(actual.demoPutQuiz) };
});

vi.mock("../api/quizshowDemoGames", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoGames")>();
  return { ...actual, demoPutGame: vi.fn(actual.demoPutGame) };
});

const SLUG = "pride-quiz-night";
const EVENT_START = new Date("2026-11-20T19:00:00.000Z");

function renderTab() {
  return render(
    <TestProviders>
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

describe("QuizshowBuilderTab on an event scope", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
    resetQuizshowDemoGames();
    vi.mocked(demoPutQuiz).mockClear();
    vi.mocked(demoPutGame).mockClear();
  });

  it("saves an event quiz through the event endpoint without an isAdultsOnly field", async () => {
    renderTab();
    await startBlankAndType("Pride night");
    fireEvent.click(screen.getByRole("button", { name: "Save quiz" }));
    await waitFor(() => expect(demoPutQuiz).toHaveBeenCalledTimes(1));
    const [savedSlug, savedBody] = vi.mocked(demoPutQuiz).mock.calls[0] ?? [];
    expect(savedSlug).toBe(SLUG);
    expect(savedBody?.title).toBe("Pride night");
    expect(savedBody).toBeDefined();
    expect(Object.keys(savedBody ?? {})).not.toContain("isAdultsOnly");
    expect(demoPutGame).not.toHaveBeenCalled();
  });

  it("keeps the Live game heading and no 18+ switch on an event", async () => {
    renderTab();
    await startBlankAndType("Pride night");
    expect(
      screen.getByRole("heading", { name: "Live game" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Your quiz" }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Quiz title")).toHaveValue("Pride night");
    expect(screen.queryByLabelText("Game title")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("switch", { name: "This game has 18+ content" }),
    ).not.toBeInTheDocument();
  });
});
