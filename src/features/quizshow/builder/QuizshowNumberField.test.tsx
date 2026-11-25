import { useState } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import type {
  QuizshowClosestTolerance,
  QuizshowQuestionInput,
} from "../../../shared/contracts/quizshow";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import {
  closestToleranceOf,
  newQuestion,
  withClosestTolerance,
} from "./quizshowDraft";
import { QuizshowNumberField } from "./QuizshowNumberField";

type ClosestQuestion = Extract<
  QuizshowQuestionInput,
  { type: "closest_number" }
>;

const EXACT: QuizshowClosestTolerance = { mode: "exact", amount: 0 };

function closestWith(
  value: number | null,
  tolerance: QuizshowClosestTolerance = EXACT,
): ClosestQuestion {
  return {
    ...newQuestion("closest_number", "quiz"),
    answer: value === null ? null : { value, tolerance },
  };
}

/** Holds the question like the studio does, so a test can change it from outside. */
function Harness({
  initial,
  onReady,
}: {
  initial: ClosestQuestion;
  onReady: (setQuestion: (question: ClosestQuestion) => void) => void;
}) {
  const [question, setQuestion] = useState(initial);
  onReady(setQuestion);
  return (
    <TestProviders>
      <MotionProvider>
        <QuizshowNumberField
          question={question}
          draftKey="question-under-test"
          tolerance={closestToleranceOf(question)}
          onToleranceChange={(tolerance) =>
            setQuestion((current) => withClosestTolerance(current, tolerance))
          }
          unit={question.numberUnit}
          onUnitChange={(numberUnit) =>
            setQuestion((current) => ({ ...current, numberUnit }))
          }
          languages="en"
          onChange={(next) => setQuestion(next as ClosestQuestion)}
        />
      </MotionProvider>
    </TestProviders>
  );
}

function renderField(initial: ClosestQuestion) {
  let setQuestion: (question: ClosestQuestion) => void = () => undefined;
  render(
    <Harness
      initial={initial}
      onReady={(setter) => {
        setQuestion = setter;
      }}
    />,
  );
  return {
    // The right number comes first; the margin and the unit follow it.
    input: screen.getAllByRole<HTMLInputElement>(
      "textbox",
    )[0] as HTMLInputElement,
    change: (question: ClosestQuestion) =>
      act(() => {
        setQuestion(question);
      }),
  };
}

describe("QuizshowNumberField follows the committed number", () => {
  it("re-seeds from an external change while the input is not focused", () => {
    const { input, change } = renderField(closestWith(42));
    expect(input.value).toBe("42");
    change(closestWith(99));
    expect(input.value).toBe("99");
    change(closestWith(null));
    expect(input.value).toBe("");
  });

  it("keeps typed text that still reads as the committed number while focused", async () => {
    const user = userEvent.setup();
    const { input, change } = renderField(closestWith(42));
    await user.click(input);
    await user.clear(input);
    await user.type(input, "7.");
    change(closestWith(7));
    expect(input.value).toBe("7.");
  });

  it("drops the typed text for a committed change it does not read as, while focused (an undo)", async () => {
    const user = userEvent.setup();
    const { input, change } = renderField(closestWith(42));
    await user.click(input);
    await user.clear(input);
    await user.type(input, "7.");
    expect(input).toHaveFocus();
    change(closestWith(99));
    expect(input.value).toBe("99");
  });

  it("renders a number that String() writes with an exponent, without throwing", () => {
    const { input, change } = renderField(closestWith(1e-7));
    expect(input.value).toBe("0.0000001");
    change(closestWith(2.5e-9));
    expect(input.value).toBe("0.0000000025");
  });
});

describe("QuizshowNumberField margin", () => {
  it("switches between Exact, Within and Within % with an amount for the last two", async () => {
    const user = userEvent.setup();
    renderField(closestWith(1969));
    await awaitCatalog("quizshow");
    expect(screen.getByRole("radio", { name: "Exact" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.queryByRole("textbox", { name: "Margin" })).toBeNull();

    await user.click(screen.getByRole("radio", { name: "Within" }));
    const amount = await screen.findByRole<HTMLInputElement>("textbox", {
      name: "Margin",
    });
    expect(amount.value).toBe("1");
    await user.clear(amount);
    await user.type(amount, "5");
    expect(amount.value).toBe("5");

    await user.click(screen.getByRole("radio", { name: "Within %" }));
    expect(
      screen.getByRole<HTMLInputElement>("textbox", { name: "Margin" }).value,
    ).toBe("10");

    await user.click(screen.getByRole("radio", { name: "Exact" }));
    await waitFor(() => {
      expect(screen.queryByRole("textbox", { name: "Margin" })).toBeNull();
    });
  });

  it("keeps a margin picked before the number and sends it with the number", async () => {
    const user = userEvent.setup();
    const { input } = renderField(closestWith(null));
    await awaitCatalog("quizshow");
    await user.click(screen.getByRole("radio", { name: "Within %" }));
    expect(screen.getByRole("radio", { name: "Within %" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await user.type(input, "40");
    expect(screen.getByRole("radio", { name: "Within %" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("keeps the margin when the number is cleared and typed again", async () => {
    const user = userEvent.setup();
    const { input } = renderField(
      closestWith(1969, { mode: "absolute", amount: 5 }),
    );
    await awaitCatalog("quizshow");
    await user.clear(input);
    await user.type(input, "1970");
    expect(screen.getByRole("radio", { name: "Within" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(
      screen.getByRole<HTMLInputElement>("textbox", { name: "Margin" }).value,
    ).toBe("5");
  });

  it("names why a typed margin cannot score", async () => {
    const user = userEvent.setup();
    renderField(closestWith(1969, { mode: "percent", amount: 10 }));
    await awaitCatalog("quizshow");
    const amount = screen.getByRole<HTMLInputElement>("textbox", {
      name: "Margin",
    });
    await user.clear(amount);
    expect(await screen.findByText("Type a margin")).toBeInTheDocument();
    await user.type(amount, "70");
    expect(
      await screen.findByText("Use a whole number from 1 to 50"),
    ).toBeInTheDocument();
    expect(amount).toHaveAttribute("aria-invalid", "true");
  });

  it("says a margin in % of 0 is 0 when the right number is 0, and ties it to the margin", async () => {
    renderField(closestWith(0, { mode: "percent", amount: 10 }));
    await awaitCatalog("quizshow");
    const hint = screen.getByText("A margin in % of 0 is 0");
    expect(hint).toBeInTheDocument();
    expect(
      screen
        .getByRole("textbox", { name: "Margin" })
        .getAttribute("aria-describedby"),
    ).toContain(hint.id);
  });

  it("shows no 0 hint for an exact margin", async () => {
    renderField(closestWith(0));
    await awaitCatalog("quizshow");
    expect(screen.queryByText("A margin in % of 0 is 0")).toBeNull();
  });
});
