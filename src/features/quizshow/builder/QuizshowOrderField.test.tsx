import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { QuizshowQuestionInput } from "../../../shared/contracts/quizshow";
import { TestProviders } from "../../../test/TestProviders";
import { REORDER_DURATION } from "../../subprofiles/reorderMotion";
import { newQuestion } from "./quizshowDraft";
import { QuizshowOrderField } from "./QuizshowOrderField";

// Records the layout props an order row hands to motion. A div given a
// `layout` prop (only the order rows) renders as a plain div carrying them as
// data attributes; every other motion div (the shared Collapse) stays real.
vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  const { createElement } = await import("react");
  interface RecordedProps {
    layout?: boolean | string;
    transition?: { layout?: { duration?: number } };
    className?: string;
    children?: unknown;
  }
  function RecordingDiv(props: RecordedProps) {
    if (props.layout === undefined) {
      return createElement(actual.m.div, props as never);
    }
    return createElement(
      "div",
      {
        className: props.className,
        "data-order-row": "true",
        "data-layout": String(props.layout),
        "data-layout-duration": String(props.transition?.layout?.duration),
      },
      props.children as never,
    );
  }
  return {
    ...actual,
    m: new Proxy(actual.m, {
      get(target, property, receiver) {
        if (property === "div") return RecordingDiv;
        return Reflect.get(target, property, receiver) as unknown;
      },
    }),
  };
});

type OrderQuestion = Extract<QuizshowQuestionInput, { type: "order" }>;

function orderQuestion(): OrderQuestion {
  const initial = newQuestion("order", "quiz");
  return {
    ...initial,
    options: initial.options.map((option) => ({
      ...option,
      text: { en: option.id.toUpperCase(), pt: option.id.toUpperCase() },
    })),
  };
}

/** Holds the question the way the editor does, so a move shows on screen. */
function Harness() {
  const [question, setQuestion] = useState<OrderQuestion>(orderQuestion);
  return (
    <TestProviders>
      <QuizshowOrderField
        question={question}
        languages="en"
        missingLanguages={[]}
        errorText={() => ""}
        onChange={(next) => setQuestion(next as OrderQuestion)}
      />
    </TestProviders>
  );
}

function orderRows(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>('[data-order-row="true"]'),
  );
}

function firstTextOf(row: HTMLElement): string {
  const [firstInput] = within(row).getAllByRole("textbox");
  return (firstInput as HTMLInputElement).value;
}

describe("QuizshowOrderField", () => {
  it("order rows glide when moved with the arrows", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const rowsBefore = orderRows();
    expect(rowsBefore).toHaveLength(3);
    for (const row of rowsBefore) {
      expect(row).toHaveAttribute("data-layout", "position");
      expect(row).toHaveAttribute(
        "data-layout-duration",
        String(REORDER_DURATION),
      );
    }
    expect(rowsBefore.map(firstTextOf)).toEqual(["A", "B", "C"]);

    await user.click(
      await screen.findByRole("button", { name: "Move item 1 down" }),
    );

    const rowsAfter = orderRows();
    expect(rowsAfter.map(firstTextOf)).toEqual(["B", "A", "C"]);
    for (const row of rowsAfter) {
      expect(row).toHaveAttribute("data-layout", "position");
      expect(Number(row.getAttribute("data-layout-duration"))).toBeGreaterThan(
        0,
      );
    }
  });
});
