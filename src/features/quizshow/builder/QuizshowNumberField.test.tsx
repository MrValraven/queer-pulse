import { useState } from "react";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { QuizshowQuestionInput } from "../../../shared/contracts/quizshow";
import { TestProviders } from "../../../test/TestProviders";
import { newQuestion } from "./quizshowDraft";
import { QuizshowNumberField } from "./QuizshowNumberField";

type ClosestQuestion = Extract<
  QuizshowQuestionInput,
  { type: "closest_number" }
>;

function closestWith(value: number | null): ClosestQuestion {
  return {
    ...newQuestion("closest_number", "quiz"),
    answer: value === null ? null : { value },
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
      <QuizshowNumberField
        question={question}
        onChange={(next) => setQuestion(next as ClosestQuestion)}
      />
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
    input: screen.getByRole<HTMLInputElement>("textbox"),
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

  it("leaves the text alone while the input is focused", async () => {
    const user = userEvent.setup();
    const { input, change } = renderField(closestWith(42));
    await user.click(input);
    await user.clear(input);
    await user.type(input, "7.");
    change(closestWith(99));
    expect(input.value).toBe("7.");
  });

  it("renders a number that String() writes with an exponent, without throwing", () => {
    const { input, change } = renderField(closestWith(1e-7));
    expect(input.value).toBe("0.0000001");
    change(closestWith(2.5e-9));
    expect(input.value).toBe("0.0000000025");
  });
});
