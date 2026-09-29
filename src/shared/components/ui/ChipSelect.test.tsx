import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChipSelect } from "./ChipSelect";
import { TestProviders } from "../../../test/TestProviders";

function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: TestProviders });
}

/**
 * `size="touch"` (S14) only swaps which CSS class a chip carries. Vitest
 * stubs CSS-module imports to an empty object (see vitest.config.ts), so a
 * class name carries no assertable DOM signal here; these tests target
 * behaviour instead. They cover the prop being purely additive: every
 * existing ChipSelect contract (toggling, the max-selected cap, an
 * unavailable/zero-count chip staying disabled) still holds with it set, so a
 * touch-sized picker like the questionnaire steps keeps full correctness.
 */
describe("ChipSelect size prop", () => {
  it('still toggles selection on click with size="touch"', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderWithProviders(
      <ChipSelect
        label="Interests"
        options={["hiking", "board games"]}
        selected={new Set()}
        onToggle={onToggle}
        size="touch"
      />,
    );
    await user.click(screen.getByRole("button", { name: "hiking" }));
    expect(onToggle).toHaveBeenCalledWith("hiking");
  });

  it("renders the leading tick icon only on the selected touch-sized chip", () => {
    renderWithProviders(
      <ChipSelect
        label="Interests"
        options={["hiking", "board games"]}
        selected={new Set(["hiking"])}
        onToggle={() => {}}
        size="touch"
      />,
    );
    const selectedChip = screen.getByRole("button", { name: "hiking" });
    const unselectedChip = screen.getByRole("button", { name: "board games" });
    expect(selectedChip).toHaveAttribute("aria-pressed", "true");
    expect(selectedChip.querySelector("svg")).not.toBeNull();
    expect(unselectedChip).toHaveAttribute("aria-pressed", "false");
    expect(unselectedChip.querySelector("svg")).toBeNull();
  });

  it('still disables unselected chips once maxSelected is reached with size="touch"', () => {
    renderWithProviders(
      <ChipSelect
        label="Interests"
        options={["hiking", "board games", "reading"]}
        selected={new Set(["hiking", "board games"])}
        onToggle={() => {}}
        maxSelected={2}
        size="touch"
      />,
    );
    expect(screen.getByRole("button", { name: "reading" })).toBeDisabled();
    // A selected chip must stay clickable at the cap, or the picker locks.
    expect(screen.getByRole("button", { name: "hiking" })).toBeEnabled();
  });

  it('still disables a zero-count chip with size="touch", unless it is already selected', () => {
    renderWithProviders(
      <ChipSelect
        label="Interests"
        options={[
          { value: "hiking", label: "Hiking", count: 0, ariaLabel: "Hiking" },
          {
            value: "board games",
            label: "Board games",
            count: 0,
            ariaLabel: "Board games",
          },
        ]}
        selected={new Set(["board games"])}
        onToggle={() => {}}
        size="touch"
      />,
    );
    expect(screen.getByRole("button", { name: "Hiking" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Board games" })).toBeEnabled();
  });

  it("leaves default-sized ChipSelect (no size prop) behaving exactly as before", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderWithProviders(
      <ChipSelect
        label="Interests"
        options={["hiking", "board games"]}
        selected={new Set()}
        onToggle={onToggle}
      />,
    );
    await user.click(screen.getByRole("button", { name: "board games" }));
    expect(onToggle).toHaveBeenCalledWith("board games");
  });
});
