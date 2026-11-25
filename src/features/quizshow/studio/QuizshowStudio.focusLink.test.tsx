import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { demoGetGame, resetQuizshowDemoGames } from "../api/quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "../api/quizshowDemoGames.data";
import { resetQuizshowDemoStore } from "../api/quizshowDemoStore";
import { quizshowStudioFocusPath } from "../quizshowPaths";
import { gameScope } from "../quizshowScope";
import { QuizshowStudio } from "./QuizshowStudio";

vi.mock("../../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../shared/hooks")>()),
  useUnsavedChangesGuard: vi.fn(),
}));

const GAME_ID = QUIZSHOW_DEMO_GAME_IDS.flatQuiz;
const BACK_LINK = { to: "/play", labelKey: "quizshow:game.back" };

function focusPathFor(prompt?: { en: string; pt: string }): string {
  return quizshowStudioFocusPath(gameScope(GAME_ID), 0, 1, prompt);
}

function renderStudioAt(path: string) {
  return render(
    <TestProviders initialEntries={[path]}>
      <QuizshowStudio scope={gameScope(GAME_ID)} backLink={BACK_LINK} />
    </TestProviders>,
  );
}

async function inspectorTitle(): Promise<HTMLElement> {
  const inspector = await screen.findByRole("complementary", {
    name: "Quiz editor settings",
  });
  return within(inspector).findByRole("heading", { level: 2 });
}

describe("the studio's focus link", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
    resetQuizshowDemoGames();
  });

  it("selects the question while its prompt still matches in both languages", async () => {
    const savedPrompt =
      demoGetGame(GAME_ID).quiz?.rounds[0]?.questions[1]?.prompt;
    if (savedPrompt === undefined) throw new Error("The seed has no question");
    renderStudioAt(focusPathFor(savedPrompt));
    expect(
      await screen.findByRole("heading", { level: 2, name: "Question 2" }),
    ).toBeInTheDocument();
  });

  it("opens the studio without a selection when the question at those indices changed", async () => {
    renderStudioAt(focusPathFor({ en: "A question nobody wrote", pt: "" }));
    expect(await inspectorTitle()).toHaveTextContent("Friday flat quiz");
  });

  it("opens the studio without a selection when only the Portuguese prompt differs", async () => {
    const savedPrompt =
      demoGetGame(GAME_ID).quiz?.rounds[0]?.questions[1]?.prompt;
    if (savedPrompt === undefined) throw new Error("The seed has no question");
    renderStudioAt(focusPathFor({ en: savedPrompt.en, pt: "Outra pergunta" }));
    expect(await inspectorTitle()).toHaveTextContent("Friday flat quiz");
  });
});
