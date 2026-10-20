import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { QuizshowOption } from "../../../shared/contracts/quizshow";
import { QuizshowOrderAnswer } from "./QuizshowOrderAnswer";

const SHOWN_OPTIONS: QuizshowOption[] = [
  { id: "c", text: { en: "Third", pt: "Terceiro" } },
  { id: "a", text: { en: "First", pt: "Primeiro" } },
  { id: "b", text: { en: "Second", pt: "Segundo" } },
];

function renderOrder(onSubmit = vi.fn()) {
  render(
    <TestProviders>
      <QuizshowOrderAnswer
        options={SHOWN_OPTIONS}
        language="en"
        isLocked={false}
        onSubmit={onSubmit}
      />
    </TestProviders>,
  );
  return onSubmit;
}

describe("QuizshowOrderAnswer", () => {
  it("sorts with the up and down buttons and sends the permutation", async () => {
    const onSubmit = renderOrder();
    const user = userEvent.setup();
    await screen.findByText("Third");
    await user.click(screen.getByRole("button", { name: "Move item 1 down" }));
    const rows = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining("First"),
      expect.stringContaining("Third"),
      expect.stringContaining("Second"),
    ]);
    await user.click(screen.getByRole("button", { name: "Send this order" }));
    expect(onSubmit).toHaveBeenCalledWith(["a", "c", "b"]);
  });

  it("keeps the arrows at the ends aria-disabled", async () => {
    renderOrder();
    await screen.findByText("Third");
    expect(
      screen.getByRole("button", { name: "Move item 1 up" }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByRole("button", { name: "Move item 3 down" }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByRole("button", { name: "Move item 2 up" }),
    ).toHaveAttribute("aria-disabled", "false");
  });
});
