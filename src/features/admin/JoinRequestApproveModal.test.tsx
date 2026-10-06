import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { JoinRequestApproveModal } from "./JoinRequestApproveModal";

/**
 * Contract: a reviewer can't confirm an approval without picking a reason, the
 * twin of `JoinRequestDeclineModal.test.tsx`. Renders with `TestProviders` so
 * the lazily-loaded `admin:` i18n namespace resolves.
 */
function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: TestProviders });
}

describe("JoinRequestApproveModal", () => {
  it("names the applicant and keeps Confirm disabled until a reason is chosen", async () => {
    renderWithProviders(
      <JoinRequestApproveModal
        applicantName="Sam"
        pending={false}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(
      await screen.findByRole("heading", { name: "Welcome Sam in?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Welcome in" })).toBeDisabled();
  });

  it("calls onConfirm with the chosen reason key", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderWithProviders(
      <JoinRequestApproveModal
        applicantName="Sam"
        pending={false}
        onConfirm={onConfirm}
        onClose={vi.fn()}
      />,
    );

    // Each reason is a role="radio" card whose accessible name carries both
    // the label and its detail line, so match loosely.
    await user.click(
      await screen.findByRole("radio", { name: /a member vouched/i }),
    );

    const confirmButton = screen.getByRole("button", { name: "Welcome in" });
    expect(confirmButton).toBeEnabled();
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledWith("member_vouched");
  });

  it("closes without confirming when cancelled", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    renderWithProviders(
      <JoinRequestApproveModal
        applicantName="Sam"
        pending={false}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    await user.click(await screen.findByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
