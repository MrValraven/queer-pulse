import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { JoinRequestDeclineModal } from "./JoinRequestDeclineModal";

/**
 * Contract: a reviewer can't confirm a decline without picking a reason
 * (guideline audit D5): a closed-set `RadioCardGroup` stands in for
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

    // RadioCardGroup renders each reason as a role="radio" button inside a
    // role="radiogroup" labelled by the manual legend; the accessible name
    // includes both the label and the new description text, so match loosely.
    const spamOption = await screen.findByRole("radio", {
      name: /looks like spam/i,
    });
    await user.click(spamOption);

    const confirmButton = screen.getByRole("button", {
      name: "Decline request",
    });
    expect(confirmButton).toBeEnabled();
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledWith("spam_pattern");
  });
});
