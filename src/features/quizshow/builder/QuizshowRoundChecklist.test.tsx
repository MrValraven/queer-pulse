import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { QuizshowRoundChecklist } from "./QuizshowRoundChecklist";
import type { QuizshowSelectableRound } from "./quizshowRoundSelection";

const ADULTS_REASON = "Turn on 18+ to use these rounds";

function row(
  roundIndex: number,
  title: string,
  contentLabel: QuizshowSelectableRound["contentLabel"],
  kind: QuizshowSelectableRound["kind"] = "quiz",
): QuizshowSelectableRound {
  return {
    roundIndex,
    kind,
    title: { en: title, pt: title },
    questionCount: kind === "wheel" ? 0 : 5,
    sliceCount: kind === "wheel" ? 2 : null,
    contentLabel,
  };
}

/** A wheel over two slices, the second of them an adults round, between plain rows. */
const ROUNDS: QuizshowSelectableRound[] = [
  row(0, "Opener", "none"),
  row(1, "Spin", "none", "wheel"),
  row(2, "Cabaret", "adults"),
  row(3, "Movies", "none"),
  row(4, "Late night", "adults"),
];

function renderChecklist(isAdultsAllowed: boolean) {
  const onSubmit = vi.fn();
  render(
    <TestProviders>
      <QuizshowRoundChecklist
        rounds={ROUNDS}
        language="en"
        isAdultsAllowed={isAdultsAllowed}
        isPending={false}
        onSubmit={onSubmit}
      />
    </TestProviders>,
  );
  return { onSubmit };
}

function checkboxOf(title: string): HTMLInputElement {
  const label = screen.getByText(title).closest("label");
  if (!label) throw new Error(`no row for ${title}`);
  return within(label).getByRole("checkbox");
}

describe("QuizshowRoundChecklist with 18+ off", () => {
  beforeEach(async () => {
    await awaitCatalog("quizshow");
  });

  it("holds the adults rows and the wheel that would bring one, each with its reason", () => {
    renderChecklist(false);

    for (const heldTitle of ["Cabaret", "Late night", "Spin"]) {
      const checkbox = checkboxOf(heldTitle);
      expect(checkbox).toHaveAttribute("aria-disabled", "true");
      expect(checkbox.closest("li")).toHaveAttribute("data-locked", "true");
      const reasonId = checkbox.getAttribute("aria-describedby");
      expect(reasonId).not.toBeNull();
      expect(document.getElementById(reasonId ?? "")).toHaveTextContent(
        ADULTS_REASON,
      );
    }
    for (const freeTitle of ["Opener", "Movies"]) {
      expect(checkboxOf(freeTitle)).not.toHaveAttribute("aria-disabled");
    }
    expect(screen.getAllByText(ADULTS_REASON)).toHaveLength(3);
  });

  it("never checks a held row and still adds the others", async () => {
    const { onSubmit } = renderChecklist(false);

    for (const heldTitle of ["Cabaret", "Late night", "Spin"]) {
      await userEvent.click(checkboxOf(heldTitle));
      expect(checkboxOf(heldTitle).checked).toBe(false);
    }
    await userEvent.click(checkboxOf("Opener"));
    await userEvent.click(checkboxOf("Movies"));
    await userEvent.click(
      screen.getByRole("button", { name: "Add these rounds" }),
    );

    expect(onSubmit).toHaveBeenCalledWith([0, 3]);
  });

  it("holds nothing when 18+ is on", async () => {
    const { onSubmit } = renderChecklist(true);

    expect(screen.queryByText(ADULTS_REASON)).toBeNull();
    await userEvent.click(checkboxOf("Spin"));
    expect(checkboxOf("Spin").checked).toBe(true);
    expect(checkboxOf("Cabaret").checked).toBe(true);
    await userEvent.click(
      screen.getByRole("button", { name: "Add these rounds" }),
    );
    expect(onSubmit).toHaveBeenCalledWith([1, 2, 3]);
  });
});
