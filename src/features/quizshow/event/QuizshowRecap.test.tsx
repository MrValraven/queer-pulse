import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import type {
  QuizshowRecap as QuizshowRecapData,
  QuizshowRecapQuestion,
} from "../../../shared/contracts/quizshow";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { demoGetGame, resetQuizshowDemoGames } from "../api/quizshowDemoGames";
import { QUIZSHOW_DEMO_GAME_IDS } from "../api/quizshowDemoGames.data";
import { quizshowStudioFocusPath } from "../quizshowPaths";
import { gameScope } from "../quizshowScope";
import { QuizshowRecap } from "./QuizshowRecap";
import { sortRecapQuestions } from "./quizshowRecapSort";

const SCOPE = gameScope(QUIZSHOW_DEMO_GAME_IDS.flatQuiz);

function recapQuestion(
  overrides: Partial<QuizshowRecapQuestion>,
): QuizshowRecapQuestion {
  return {
    roundIndex: 0,
    questionIndex: 0,
    roundKind: "quiz",
    type: "multiple_choice",
    prompt: { en: "A question", pt: "Uma pergunta" },
    answerCount: 10,
    percentCorrect: 50,
    averageAnswerMs: 4000,
    wasSkipped: false,
    isWarmUp: false,
    wasCorrected: false,
    ...overrides,
  };
}

function recapOf(
  questions: QuizshowRecapQuestion[],
  standings: QuizshowRecapData["standings"] = [],
): QuizshowRecapData {
  return {
    questionsPlayed: questions.length,
    answersGiven: questions.reduce(
      (total, question) => total + question.answerCount,
      0,
    ),
    questions,
    standings,
  };
}

function renderRecap(recap: QuizshowRecapData) {
  return render(
    <TestProviders>
      <QuizshowRecap recap={recap} language="en" scope={SCOPE} />
    </TestProviders>,
  );
}

describe("sortRecapQuestions", () => {
  const questions = [
    recapQuestion({ questionIndex: 0, percentCorrect: 80 }),
    recapQuestion({ questionIndex: 1, percentCorrect: null }),
    recapQuestion({ questionIndex: 2, percentCorrect: 40 }),
    recapQuestion({ questionIndex: 3, percentCorrect: 80 }),
    recapQuestion({ questionIndex: 4, percentCorrect: null }),
    recapQuestion({ questionIndex: 5, percentCorrect: 10 }),
  ];

  it("keeps the play order as it arrives", () => {
    expect(
      sortRecapQuestions(questions, "playOrder").map(
        (question) => question.questionIndex,
      ),
    ).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("puts the hardest first, ties in play order and no figure last", () => {
    expect(
      sortRecapQuestions(questions, "hardestFirst").map(
        (question) => question.questionIndex,
      ),
    ).toEqual([5, 2, 0, 3, 1, 4]);
  });

  it("leaves the given list untouched", () => {
    sortRecapQuestions(questions, "hardestFirst");
    expect(questions.map((question) => question.questionIndex)).toEqual([
      0, 1, 2, 3, 4, 5,
    ]);
  });
});

describe("QuizshowRecap (demo)", () => {
  beforeEach(() => {
    resetQuizshowDemoGames();
  });

  it("links a question the quiz still holds and hides the link once its prompt changed", async () => {
    const savedQuestions = demoGetGame(QUIZSHOW_DEMO_GAME_IDS.flatQuiz).quiz
      ?.rounds[0]?.questions;
    const [firstSaved, secondSaved] = savedQuestions ?? [];
    if (!firstSaved || !secondSaved) {
      throw new Error("The demo game holds fewer than two questions");
    }
    renderRecap(
      recapOf([
        recapQuestion({ questionIndex: 0, prompt: firstSaved.prompt }),
        recapQuestion({
          questionIndex: 1,
          prompt: { en: `${secondSaved.prompt.en} (old)`, pt: "" },
        }),
      ]),
    );
    await awaitCatalog("quizshow");

    await waitFor(() =>
      expect(
        screen.getAllByRole("link", { name: "Edit this question" }),
      ).toHaveLength(1),
    );
    const [editLink] = screen.getAllByRole("link", {
      name: "Edit this question",
    });
    expect(editLink?.getAttribute("href")).toBe(
      quizshowStudioFocusPath(SCOPE, 0, 0, firstSaved.prompt),
    );
    // The link names the question it edits through the row's prompt.
    expect(editLink).toHaveAccessibleDescription(firstSaved.prompt.en);
    // With no standings the line keeps its totals-only promise.
    expect(
      screen.getByText(
        "Totals for everyone who played. Nothing here names a person",
      ),
    ).toBeInTheDocument();
    const changedRow = screen
      .getByText(`${secondSaved.prompt.en} (old)`)
      .closest("li");
    if (!changedRow) throw new Error("The changed question has no row");
    expect(
      within(changedRow).queryByRole("link", { name: "Edit this question" }),
    ).toBeNull();
  });

  it("tags warm-up and corrected questions, and lists the full standings", async () => {
    const user = userEvent.setup();
    renderRecap(
      recapOf(
        [
          recapQuestion({
            questionIndex: 0,
            isWarmUp: true,
            percentCorrect: null,
          }),
          recapQuestion({ questionIndex: 1, wasCorrected: true }),
        ],
        [
          {
            rank: 1,
            kind: "team",
            name: "Glitter",
            colorKey: "circle",
            score: 900,
          },
          {
            rank: 2,
            kind: "team",
            name: "Sparkle",
            colorKey: "triangle",
            score: 700,
          },
        ],
      ),
    );
    await awaitCatalog("quizshow");

    expect(
      screen.getByText(
        "Totals for everyone who played, and the final standings",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Warm-up")).toBeInTheDocument();
    expect(screen.getByText("Corrected")).toBeInTheDocument();
    expect(screen.queryByText("Glitter")).toBeNull();

    await user.click(
      screen.getByRole("button", { name: "Show full standings" }),
    );
    // The toggle names the next action, so open and closed never read the same.
    expect(
      screen.getByRole("button", { name: "Hide full standings" }),
    ).toHaveAttribute("aria-expanded", "true");

    const standings = await screen.findByRole("list", {
      name: "Full standings",
    });
    expect(within(standings).getByText("1st of 2")).toBeInTheDocument();
    expect(within(standings).getByText("Sparkle")).toBeInTheDocument();
  });

  it("hides the link once only the PT prompt changed", async () => {
    const firstSaved = demoGetGame(QUIZSHOW_DEMO_GAME_IDS.flatQuiz).quiz
      ?.rounds[0]?.questions[0];
    if (!firstSaved) throw new Error("The demo game holds no question");
    renderRecap(
      recapOf([
        recapQuestion({
          questionIndex: 0,
          prompt: {
            en: firstSaved.prompt.en,
            pt: `${firstSaved.prompt.pt} (old)`,
          },
        }),
      ]),
    );
    await awaitCatalog("quizshow");
    await screen.findByText(firstSaved.prompt.en);
    // Give the saved quiz time to arrive, then check the link never folded in.
    await waitFor(() =>
      expect(screen.getAllByRole("listitem")).toHaveLength(1),
    );
    expect(
      screen.queryByRole("link", { name: "Edit this question" }),
    ).toBeNull();
  });

  it("names polls and party questions, leaves the party tag off a warm-up and keeps each average time", async () => {
    renderRecap(
      recapOf([
        recapQuestion({
          questionIndex: 0,
          prompt: { en: "Favourite snack", pt: "" },
          type: "poll",
          percentCorrect: null,
          averageAnswerMs: 3000,
        }),
        recapQuestion({
          questionIndex: 1,
          prompt: { en: "Warm-up question", pt: "" },
          isWarmUp: true,
          percentCorrect: null,
          averageAnswerMs: null,
        }),
        recapQuestion({
          questionIndex: 2,
          prompt: { en: "Caption this", pt: "" },
          roundKind: "caption_this",
          type: "prompt",
          percentCorrect: null,
          averageAnswerMs: null,
        }),
        recapQuestion({
          questionIndex: 3,
          prompt: { en: "Nobody could score", pt: "" },
          percentCorrect: null,
          averageAnswerMs: 5000,
        }),
      ]),
    );
    await awaitCatalog("quizshow");

    const rowOf = (prompt: string) => {
      const row = screen.getByText(prompt).closest("li");
      if (!row) throw new Error(`No row for ${prompt}`);
      return within(row);
    };
    expect(rowOf("Favourite snack").getByText("Poll")).toBeInTheDocument();
    expect(
      rowOf("Favourite snack").getByText("Average answer 3.0s"),
    ).toBeInTheDocument();
    expect(rowOf("Warm-up question").queryByText("Party question")).toBeNull();
    expect(
      rowOf("Caption this").getByText("Party question"),
    ).toBeInTheDocument();
    expect(
      rowOf("Nobody could score").queryByText("Party question"),
    ).toBeNull();
    expect(
      rowOf("Nobody could score").getByText("Average answer 5.0s"),
    ).toBeInTheDocument();
  });

  it("reorders the questions with Hardest first", async () => {
    const user = userEvent.setup();
    renderRecap(
      recapOf([
        recapQuestion({
          questionIndex: 0,
          prompt: { en: "Easy one", pt: "" },
          percentCorrect: 90,
        }),
        recapQuestion({
          questionIndex: 1,
          prompt: { en: "Hard one", pt: "" },
          percentCorrect: 20,
        }),
      ]),
    );
    await awaitCatalog("quizshow");

    await user.click(screen.getByRole("button", { name: "Hardest first" }));

    const prompts = screen
      .getAllByRole("listitem")
      .map((row) => row.textContent ?? "");
    expect(prompts[0]).toContain("Hard one");
    expect(prompts[1]).toContain("Easy one");
  });
});
