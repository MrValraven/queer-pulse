import { fireEvent, render, screen, within } from "@testing-library/react";
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
    isFirstPlayableRow?: boolean;
    isWarmUp?: boolean;
  } = {},
) {
  const round = newRound(options.kind ?? "quiz");
  if (options.isWarmUp) {
    round.settings = {
      ...round.settings,
      isWarmUp: true,
      isJokerAllowed: false,
    };
  }
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
      isFirstPlayableRow={options.isFirstPlayableRow ?? false}
      onChange={onChange}
      onChangeKind={onChangeKind}
    />,
    { wrapper: TestProviders },
  );
  return { round, onChange, onChangeKind };
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

  it("offers exactly four round types and none named Wheel", async () => {
    renderEditor();
    await screen.findByRole("radio", { name: /Lie Detector/ });
    const kindGroup = screen.getByRole("radiogroup", { name: "Round type" });
    const kindOptions = within(kindGroup).getAllByRole("radio");
    expect(kindOptions).toHaveLength(4);
    expect(
      within(kindGroup).queryByRole("radio", { name: /Wheel/ }),
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

  it("shows the warm-up switch on the first playable row", async () => {
    renderEditor({ kind: "quiz", isFirstPlayableRow: true });
    expect(
      await screen.findByRole("switch", { name: "Warm-up round" }),
    ).toBeInTheDocument();
  });

  it("leaves the warm-up switch out of every other row", async () => {
    renderEditor({ kind: "quiz", isFirstPlayableRow: false });
    await screen.findByRole("switch", { name: "Allow jokers" });
    expect(
      screen.queryByRole("switch", { name: "Warm-up round" }),
    ).not.toBeInTheDocument();
  });

  it("keeps the switch on a later row that still holds a warm-up", async () => {
    renderEditor({ kind: "quiz", isFirstPlayableRow: false, isWarmUp: true });
    const warmUpSwitch = await screen.findByRole("switch", {
      name: "Warm-up round",
    });
    expect(warmUpSwitch).toHaveAttribute("aria-checked", "true");
  });

  it("turns jokers off with the warm-up, as the save does", async () => {
    const { round, onChange } = renderEditor({
      kind: "quiz",
      isFirstPlayableRow: true,
    });
    fireEvent.click(
      await screen.findByRole("switch", { name: "Warm-up round" }),
    );
    expect(onChange).toHaveBeenCalledWith({
      settings: { ...round.settings, isWarmUp: true, isJokerAllowed: false },
    });
  });

  it("offers Talk it over on a quiz round only", async () => {
    renderEditor({ kind: "quiz" });
    expect(
      await screen.findByRole("radiogroup", { name: "Talk it over" }),
    ).toBeInTheDocument();
  });

  it("leaves Talk it over out of a party round", async () => {
    renderEditor({ kind: "lie_detector" });
    await screen.findByLabelText("Seconds to write");
    expect(
      screen.queryByRole("radiogroup", { name: "Talk it over" }),
    ).not.toBeInTheDocument();
  });
});
