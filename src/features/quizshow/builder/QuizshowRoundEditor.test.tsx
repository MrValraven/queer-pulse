import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { newRound, newQuestion } from "./quizshowDraft";
import { QuizshowRoundEditor } from "./QuizshowRoundEditor";

vi.mock("./QuizshowBilingualInput", () => ({
  QuizshowBilingualInput: ({ label }: { label: string }) => (
    <input aria-label={label} />
  ),
}));

function renderEditor(
  options: {
    isAdultsEvent?: boolean;
    kind?: "quiz" | "lie_detector" | "caption_this";
    withTwoQuestions?: boolean;
  } = {},
) {
  const round = newRound(options.kind ?? "quiz");
  if (options.withTwoQuestions) {
    round.questions.push({
      draftKey: "extra-question",
      question: newQuestion("true_false", "quiz"),
      mediaUrl: null,
    });
  }
  const onChange = vi.fn();
  const onChangeKind = vi.fn();
  render(
    <QuizshowRoundEditor
      round={round}
      roundIndex={0}
      isAdultsEvent={options.isAdultsEvent ?? false}
      onChange={onChange}
      onChangeKind={onChangeKind}
    />,
    { wrapper: TestProviders },
  );
  return { onChange, onChangeKind };
}

describe("QuizshowRoundEditor", () => {
  it("keeps the adults label locked on an event without 18+", async () => {
    const { onChange } = renderEditor({ isAdultsEvent: false });
    const adultsChoice = await screen.findByRole("radio", {
      name: "Adults only (18+)",
    });
    expect(adultsChoice).toHaveAttribute("aria-disabled", "true");
    expect(
      await screen.findByText(
        "Turn on 18+ for this event in Edit details to use this label",
      ),
    ).toBeInTheDocument();
    fireEvent.click(adultsChoice);
    expect(onChange).not.toHaveBeenCalledWith({ contentLabel: "adults" });
  });

  it("offers the adults label on an 18+ event", async () => {
    const { onChange } = renderEditor({ isAdultsEvent: true });
    const adultsChoice = await screen.findByRole("radio", {
      name: "Adults only (18+)",
    });
    expect(adultsChoice).not.toHaveAttribute("aria-disabled");
    expect(
      screen.queryByText(
        "Turn on 18+ for this event in Edit details to use this label",
      ),
    ).not.toBeInTheDocument();
    fireEvent.click(adultsChoice);
    expect(onChange).toHaveBeenCalledWith({ contentLabel: "adults" });
  });

  it("asks before a kind change drops questions", async () => {
    const { onChangeKind } = renderEditor({ withTwoQuestions: true });
    fireEvent.click(await screen.findByRole("radio", { name: /Lie Detector/ }));
    expect(onChangeKind).not.toHaveBeenCalled();
    expect(
      await screen.findByText("Change the round type?"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onChangeKind).not.toHaveBeenCalled();
    expect(screen.getByRole("radio", { name: /^Quiz/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    fireEvent.click(screen.getByRole("radio", { name: /Lie Detector/ }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Change round type" }),
    );
    expect(onChangeKind).toHaveBeenCalledWith("lie_detector");
  });

  it("changes kind at once when no question would go", async () => {
    const { onChangeKind } = renderEditor({ kind: "caption_this" });
    fireEvent.click(await screen.findByRole("radio", { name: /Lie Detector/ }));
    expect(onChangeKind).toHaveBeenCalledWith("lie_detector");
    expect(
      screen.queryByText("Change the round type?"),
    ).not.toBeInTheDocument();
  });

  it("shows the seconds per question and the speed bonus on a quiz round", async () => {
    renderEditor({ kind: "quiz" });
    expect(
      await screen.findByLabelText("Seconds per question"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "Faster answers score more" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Seconds to write")).not.toBeInTheDocument();
  });

  it("shows the write and vote seconds on a party round", async () => {
    renderEditor({ kind: "lie_detector" });
    expect(
      await screen.findByLabelText("Seconds to write"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Seconds to vote")).toBeInTheDocument();
    expect(
      screen.queryByRole("switch", { name: "Faster answers score more" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: "Allow jokers" }),
    ).toBeInTheDocument();
  });
});
