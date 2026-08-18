import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { JoinRequestDeclineModal } from "./JoinRequestDeclineModal";

/**
 * Contract: a reviewer can't confirm a decline without picking a reason
 * (guideline audit D5) — the closed-set `Select` stands in for
 * `ConfirmDialog`'s usual free-text `reason` textarea. Renders with
 * `TestProviders` so the lazily-loaded `admin:` i18n namespace resolves,
 * same pattern as `AdminHealthModal.test.tsx` and `Select.test.tsx`.
 */
function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: TestProviders });
}

describe("JoinRequestDeclineModal", () => {
  it("keeps Confirm disabled until a reason is chosen", async () => {
    renderWithProviders(
      <JoinRequestDeclineModal
        applicantName="Sam"
        pending={false}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const confirmButton = await screen.findByRole("button", {
      name: "Decline request",
    });
    expect(confirmButton).toBeDisabled();
  });

  it("calls onConfirm with the chosen reason key", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderWithProviders(
      <JoinRequestDeclineModal
        applicantName="Sam"
        pending={false}
        onConfirm={onConfirm}
        onClose={vi.fn()}
      />,
    );

    // The Select's trigger is labelled "Reason" via FormField's native
    // <label for>, same wiring Select.test.tsx exercises for FormField.
    const trigger = await screen.findByRole("button", { name: "Reason" });
    await user.click(trigger);
    await user.click(
      await screen.findByRole("option", { name: "Looks like spam" }),
    );

    const confirmButton = screen.getByRole("button", {
      name: "Decline request",
    });
    expect(confirmButton).toBeEnabled();
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledWith("spam_pattern");
  });
});
