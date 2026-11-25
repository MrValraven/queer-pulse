import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Fragment, createElement, useState, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import type {
  QuizshowQuestionInput,
  QuizshowText,
} from "../../../shared/contracts/quizshow";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { QuizshowBilingualInput } from "./QuizshowBilingualInput";
import {
  blankDraft,
  newQuestion,
  newRound,
  type QuizshowDraft,
  type QuizshowDraftRound,
} from "./quizshowDraft";
import {
  QuizshowReviewMarksProvider,
  hasEmptyPortuguese,
  useQuizshowReviewMarks,
  withEmptyPortugueseFilled,
} from "./quizshowReviewMarks";

function withProvider({ children }: { children: ReactNode }) {
  return createElement(QuizshowReviewMarksProvider, null, children);
}

function roundWith(
  title: { en: string; pt: string },
  questions: QuizshowQuestionInput[],
): QuizshowDraftRound {
  const round = newRound("quiz");
  return {
    ...round,
    title,
    questions: questions.map((question, questionIndex) => ({
      draftKey: `${round.draftKey}-${questionIndex}`,
      question,
      mediaUrl: null,
    })),
  };
}

function bilingualDraftOf(rounds: QuizshowDraftRound[]): QuizshowDraft {
  return { ...blankDraft(), languages: "both", rounds };
}

describe("useQuizshowReviewMarks", () => {
  it("marks a filled PT text unreviewed while it still equals its EN", () => {
    const { result } = renderHook(() => useQuizshowReviewMarks(), {
      wrapper: withProvider,
    });
    act(() => result.current.markFilled(["Paris"]));
    expect(result.current.isUnreviewed({ en: "Paris", pt: "Paris" })).toBe(
      true,
    );
    // A text that was never filled carries no mark.
    expect(result.current.isUnreviewed({ en: "Lisbon", pt: "Lisbon" })).toBe(
      false,
    );
  });

  it("clears the mark by itself once the PT is edited so it differs", () => {
    const { result } = renderHook(() => useQuizshowReviewMarks(), {
      wrapper: withProvider,
    });
    act(() => result.current.markFilled(["Paris"]));
    expect(result.current.isUnreviewed({ en: "Paris", pt: "Pariz" })).toBe(
      false,
    );
  });

  it("clears the mark when the translation is marked reviewed", () => {
    const { result } = renderHook(() => useQuizshowReviewMarks(), {
      wrapper: withProvider,
    });
    act(() => result.current.markFilled(["Paris"]));
    act(() => result.current.markReviewed({ en: "Paris", pt: "Paris" }));
    expect(result.current.isUnreviewed({ en: "Paris", pt: "Paris" })).toBe(
      false,
    );
  });

  it("never marks anything without a provider", () => {
    const { result } = renderHook(() => useQuizshowReviewMarks());
    act(() => result.current.markFilled(["Paris"]));
    expect(result.current.isUnreviewed({ en: "Paris", pt: "Paris" })).toBe(
      false,
    );
  });
});

describe("withEmptyPortugueseFilled", () => {
  it("copies EN into every blank PT and leaves a written PT alone", () => {
    const question = {
      ...newQuestion("multiple_choice", "quiz"),
      prompt: { en: "Capital of France?", pt: "" },
      revealNote: { en: "Since 508", pt: "Desde 508" },
    };
    const options = question.options.map((option, optionIndex) => ({
      ...option,
      text:
        optionIndex === 0
          ? { en: "Paris", pt: "" }
          : { en: `Wrong ${optionIndex}`, pt: `Errada ${optionIndex}` },
    }));
    const typed = {
      ...newQuestion("type_answer", "quiz"),
      prompt: { en: "Say it", pt: "Diz" },
      answer: { text: { en: "Rome", pt: "" } },
    };
    const draft = bilingualDraftOf([
      roundWith({ en: "Cities", pt: "" }, [{ ...question, options }, typed]),
    ]);

    const { draft: filled, copiedTexts } = withEmptyPortugueseFilled(draft);

    const round = filled.rounds[0];
    const filledQuestion = round?.questions[0]?.question;
    const filledTyped = round?.questions[1]?.question;
    if (filledQuestion?.type !== "multiple_choice") {
      throw new Error("The first question should stay multiple choice");
    }
    expect(round?.title).toEqual({ en: "Cities", pt: "Cities" });
    expect(filledQuestion.prompt).toEqual({
      en: "Capital of France?",
      pt: "Capital of France?",
    });
    expect(filledQuestion.revealNote).toEqual({
      en: "Since 508",
      pt: "Desde 508",
    });
    expect(filledQuestion.options[0]?.text).toEqual({
      en: "Paris",
      pt: "Paris",
    });
    expect(filledQuestion.options[1]?.text).toEqual({
      en: "Wrong 1",
      pt: "Errada 1",
    });
    expect(filledTyped?.prompt).toEqual({ en: "Say it", pt: "Diz" });
    expect(filledTyped?.answer).toEqual({ text: { en: "Rome", pt: "Rome" } });
    // A blank EN has nothing to copy, so its blank PT stays blank.
    expect(filledQuestion.mediaAlt).toEqual({ en: "", pt: "" });
    expect(copiedTexts).toEqual([
      "Cities",
      "Capital of France?",
      "Paris",
      "Rome",
    ]);
  });

  it("returns the same draft and copies nothing when no PT is blank", () => {
    const question = {
      ...newQuestion("true_false", "quiz"),
      prompt: { en: "Is it?", pt: "É?" },
    };
    const draft = bilingualDraftOf([
      roundWith({ en: "Round", pt: "Ronda" }, [question]),
    ]);

    const result = withEmptyPortugueseFilled(draft);

    expect(result.draft).toBe(draft);
    expect(result.copiedTexts).toEqual([]);
    expect(hasEmptyPortuguese(draft)).toBe(false);
  });
});

describe("withEmptyPortugueseFilled on order, poll and Lie Detector", () => {
  it("fills order and poll options and the Lie Detector truth", () => {
    const order = newQuestion("order", "quiz");
    const orderOptions = order.options.map((option, optionIndex) => ({
      ...option,
      text: { en: `Step ${optionIndex + 1}`, pt: "" },
    }));
    const poll = newQuestion("poll", "quiz");
    const pollOptions = poll.options.map((option, optionIndex) => ({
      ...option,
      text:
        optionIndex === 0 ? { en: "Cats", pt: "" } : { en: "Dogs", pt: "Cães" },
    }));
    const lie = {
      ...newQuestion("prompt", "lie_detector"),
      prompt: { en: "How tall?", pt: "" },
      answer: { truth: { en: "324 m", pt: "" } },
    };
    const draft = bilingualDraftOf([
      roundWith({ en: "", pt: "" }, [
        { ...order, options: orderOptions },
        { ...poll, options: pollOptions },
        lie,
      ]),
    ]);

    const { draft: filled, copiedTexts } = withEmptyPortugueseFilled(draft);

    const questions =
      filled.rounds[0]?.questions.map(
        (draftQuestion) => draftQuestion.question,
      ) ?? [];
    const [filledOrder, filledPoll, filledLie] = questions;
    if (
      filledOrder?.type !== "order" ||
      filledPoll?.type !== "poll" ||
      filledLie?.type !== "prompt"
    ) {
      throw new Error("The question types should stay as they were");
    }
    expect(filledOrder.options.map((option) => option.text.pt)).toEqual([
      "Step 1",
      "Step 2",
      "Step 3",
    ]);
    expect(filledPoll.options.map((option) => option.text.pt)).toEqual([
      "Cats",
      "Cães",
    ]);
    expect(filledLie.prompt).toEqual({ en: "How tall?", pt: "How tall?" });
    expect(filledLie.answer).toEqual({ truth: { en: "324 m", pt: "324 m" } });
    // A blank EN round title copies nothing.
    expect(filled.rounds[0]?.title).toEqual({ en: "", pt: "" });
    expect(copiedTexts).toEqual([
      "Step 1",
      "Step 2",
      "Step 3",
      "Cats",
      "How tall?",
      "324 m",
    ]);
  });
});

/** Holds the field's value like the studio does, with a test button that fills PT from EN and marks it. */
function FieldWithFill({ initial }: { initial: QuizshowText }) {
  const [value, setValue] = useState(initial);
  const { markFilled } = useQuizshowReviewMarks();
  return createElement(
    Fragment,
    null,
    createElement(
      "button",
      {
        type: "button",
        onClick: () => {
          setValue({ en: value.en, pt: value.en });
          markFilled([value.en]);
        },
      },
      "Fill for the test",
    ),
    createElement(QuizshowBilingualInput, {
      label: "Prompt",
      value,
      languages: "both",
      maxLength: 200,
      onChange: setValue,
    }),
  );
}

function renderField(
  field: ReactNode,
  { hasProvider = true }: { hasProvider?: boolean } = {},
) {
  const content = hasProvider
    ? createElement(QuizshowReviewMarksProvider, null, field)
    : field;
  return render(
    createElement(
      TestProviders,
      null,
      createElement(MotionProvider, null, content),
    ),
  );
}

function bilingualField(value: QuizshowText, onChange = vi.fn()) {
  return createElement(QuizshowBilingualInput, {
    label: "Prompt",
    value,
    languages: "both",
    maxLength: 200,
    onChange,
  });
}

describe("QuizshowBilingualInput in the studio", () => {
  it("starts Same in both on when the texts match, and off when they differ", async () => {
    const matching = renderField(bilingualField({ en: "Paris", pt: "Paris" }));
    await awaitCatalog("quizshow");
    expect(
      screen.getByRole("switch", { name: "Same in both" }),
    ).toHaveAttribute("aria-checked", "true");
    matching.unmount();

    renderField(bilingualField({ en: "Paris", pt: "Pariz" }));
    await awaitCatalog("quizshow");
    expect(
      screen.getByRole("switch", { name: "Same in both" }),
    ).toHaveAttribute("aria-checked", "false");
  });

  it("writes every EN change to PT too while Same in both is on", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    renderField(bilingualField({ en: "Paris", pt: "Paris" }, handleChange));
    await awaitCatalog("quizshow");

    await user.type(screen.getByRole("textbox", { name: /^EN/ }), "!");

    expect(handleChange).toHaveBeenLastCalledWith({
      en: "Paris!",
      pt: "Paris!",
    });
    // The PT input is folded away; only the EN one is on the page.
    expect(screen.queryByRole("textbox", { name: /^PT/ })).toBeNull();
  });

  it("renders as before without a provider: no switch, an EN and a PT input", async () => {
    renderField(bilingualField({ en: "Paris", pt: "Paris" }), {
      hasProvider: false,
    });
    await awaitCatalog("quizshow");

    expect(screen.queryByRole("switch")).toBeNull();
    expect(screen.getByRole("textbox", { name: /^EN/ })).toHaveValue("Paris");
    expect(screen.getByRole("textbox", { name: /^PT/ })).toHaveValue("Paris");
  });

  it("shows the review mark after a fill and clears it on Mark as checked", async () => {
    const user = userEvent.setup();
    renderField(
      createElement(FieldWithFill, { initial: { en: "Paris", pt: "" } }),
    );
    await awaitCatalog("quizshow");
    expect(screen.queryByText("Check this translation")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Fill for the test" }));

    expect(screen.getByText("Check this translation")).toBeInTheDocument();
    const portugueseInput = screen.getByRole("textbox", { name: /^PT/ });
    expect(portugueseInput).toHaveValue("Paris");

    await user.click(screen.getByRole("button", { name: "Mark as checked" }));

    await waitFor(() =>
      expect(screen.queryByText("Check this translation")).toBeNull(),
    );
    expect(portugueseInput).toHaveFocus();
  });
});
