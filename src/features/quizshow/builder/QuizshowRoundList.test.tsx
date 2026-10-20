import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  moveItem,
  newQuestion,
  newRound,
  removeAt,
  type QuizshowDraft,
} from "./quizshowDraft";
import {
  QuizshowRoundList,
  type QuizshowOpenTarget,
} from "./QuizshowRoundList";
import type { QuizshowDraftController } from "./useQuizshowDraft";

vi.mock("./QuizshowQuestionEditor", () => ({
  QuizshowQuestionEditor: ({
    questionNumber,
    question,
    otherReferencedMediaRefs,
  }: {
    questionNumber: number;
    question: { prompt: { en: string } };
    otherReferencedMediaRefs?: readonly string[];
  }) => (
    <div
      data-testid="question-editor"
      data-other-refs={(otherReferencedMediaRefs ?? []).join(",")}
    >
      {questionNumber}:{question.prompt.en}
    </div>
  ),
}));
vi.mock("./QuizshowBilingualInput", () => ({
  QuizshowBilingualInput: ({ label }: { label: string }) => (
    <input aria-label={label} />
  ),
}));

const ROUND_TITLES = "ABCDEFGHIJ";

function makeDraft(roundCount: number): QuizshowDraft {
  const rounds = Array.from({ length: roundCount }, (_unused, roundIndex) => {
    const round = newRound("quiz");
    round.title = { en: `Quiz ${ROUND_TITLES[roundIndex]}`, pt: "" };
    if (roundIndex === 0) {
      round.questions.push({
        draftKey: "second-question",
        question: newQuestion("true_false", "quiz"),
        mediaUrl: null,
      });
    }
    round.questions.forEach((draftQuestion, questionIndex) => {
      draftQuestion.question.mediaRef = `media-key-${roundIndex}-${questionIndex}`;
      draftQuestion.question.prompt.en = `Prompt ${roundIndex}-${questionIndex}`;
    });
    return round;
  });
  return {
    title: "Pride night",
    languages: "en",
    screenLanguage: "en",
    rounds,
  };
}

function Harness({
  roundCount,
  initialTarget = null,
}: {
  roundCount: number;
  initialTarget?: QuizshowOpenTarget | null;
}) {
  const [draft, setDraft] = useState(() => makeDraft(roundCount));
  const [openTarget, setOpenTarget] = useState(initialTarget);
  const controller = {
    draft,
    isDirty: false,
    setQuizField: vi.fn(),
    addRound: () =>
      setDraft((current) => ({
        ...current,
        rounds: [...current.rounds, newRound("quiz")],
      })),
    updateRound: vi.fn(),
    changeRoundKind: vi.fn(),
    moveRound: (fromIndex: number, toIndex: number) =>
      setDraft((current) => ({
        ...current,
        rounds: moveItem(current.rounds, fromIndex, toIndex),
      })),
    removeRound: (roundIndex: number) =>
      setDraft((current) => ({
        ...current,
        rounds: removeAt(current.rounds, roundIndex),
      })),
    addQuestion: vi.fn(),
    updateQuestion: vi.fn(),
    moveQuestion: (roundIndex: number, fromIndex: number, toIndex: number) =>
      setDraft((current) => ({
        ...current,
        rounds: current.rounds.map((round, index) =>
          index === roundIndex
            ? {
                ...round,
                questions: moveItem(round.questions, fromIndex, toIndex),
              }
            : round,
        ),
      })),
    duplicateQuestion: vi.fn(),
    removeQuestion: (roundIndex: number, questionIndex: number) =>
      setDraft((current) => ({
        ...current,
        rounds: current.rounds.map((round, index) =>
          index === roundIndex
            ? { ...round, questions: removeAt(round.questions, questionIndex) }
            : round,
        ),
      })),
    resetTo: vi.fn(),
    startBlank: vi.fn(),
    pickedPreviewUrls: new Map(),
    rememberPickedPreview: vi.fn(),
  } satisfies QuizshowDraftController;
  return (
    <QuizshowRoundList
      controller={controller}
      isAdultsEvent={false}
      problems={[]}
      openTarget={openTarget}
      onOpen={setOpenTarget}
    />
  );
}

function renderList(roundCount: number, initialTarget?: QuizshowOpenTarget) {
  render(<Harness roundCount={roundCount} initialTarget={initialTarget} />, {
    wrapper: TestProviders,
  });
}

describe("QuizshowRoundList", () => {
  it("adds rounds up to ten", async () => {
    renderList(9);
    const addButton = await screen.findByRole("button", { name: "Add round" });
    expect(await screen.findByText("9 of 10 rounds")).toBeInTheDocument();
    fireEvent.click(addButton);
    expect(await screen.findByText("10 of 10 rounds")).toBeInTheDocument();
    expect(addButton).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(addButton);
    expect(screen.getByText("10 of 10 rounds")).toBeInTheDocument();
  });

  it("moves a round with the up and down buttons", async () => {
    renderList(2);
    fireEvent.click(
      await screen.findByRole("button", { name: "Move Quiz A down" }),
    );
    const titles = await screen.findAllByText(/^Quiz [A-J]$/);
    expect(titles.map((node) => node.textContent)).toEqual([
      "Quiz B",
      "Quiz A",
    ]);
  });

  it("asks before deleting a round with its questions", async () => {
    renderList(2);
    const deleteButtons = await screen.findAllByRole("button", {
      name: "Delete round",
    });
    fireEvent.click(deleteButtons[0]!);
    expect(await screen.findByText("Delete Quiz A?")).toBeInTheDocument();
    expect(screen.getByText("Its 2 questions go with it")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getAllByText(/^Quiz [A-J]$/)).toHaveLength(2);
  });

  it("opens one round at a time with an animated panel", async () => {
    renderList(2);
    const [firstEdit, secondEdit] = await screen.findAllByRole("button", {
      name: "Edit round",
    });
    expect(firstEdit).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(firstEdit!);
    expect(firstEdit).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByLabelText("Round title")).toBeInTheDocument();
    fireEvent.click(secondEdit!);
    expect(secondEdit).toHaveAttribute("aria-expanded", "true");
    expect(firstEdit).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the round and question a problem points at", async () => {
    renderList(2, { roundIndex: 1, questionIndex: 0 });
    expect(await screen.findByTestId("question-editor")).toHaveTextContent("1");
    expect(screen.getAllByTestId("question-editor")).toHaveLength(1);
  });

  it("keeps the same question open when it moves", async () => {
    renderList(1, { roundIndex: 0, questionIndex: 0 });
    expect(await screen.findByTestId("question-editor")).toHaveTextContent(
      "1:Prompt 0-0",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Move question 1 down" }),
    );
    expect(await screen.findByText("2:Prompt 0-0")).toBeInTheDocument();
  });

  it("keeps the same question open when an earlier one is deleted", async () => {
    renderList(1, { roundIndex: 0, questionIndex: 1 });
    expect(await screen.findByTestId("question-editor")).toHaveTextContent(
      "2:Prompt 0-1",
    );
    const deleteButtons = screen.getAllByRole("button", {
      name: "Delete question",
    });
    fireEvent.click(deleteButtons[0]!);
    expect(await screen.findByText("1:Prompt 0-1")).toBeInTheDocument();
  });

  it("passes another question's media key to the question editor", async () => {
    renderList(2, { roundIndex: 1, questionIndex: 0 });
    expect(await screen.findByTestId("question-editor")).toHaveAttribute(
      "data-other-refs",
      "media-key-0-0,media-key-0-1",
    );
  });
});
