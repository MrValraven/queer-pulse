import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { VolunteerSignupModal } from "./VolunteerSignupModal";

describe("VolunteerSignupModal", () => {
  it("blocks submit until a message is entered, then submits the trimmed note", async () => {
    const onSubmit = vi.fn();
    render(
      <TestProviders>
        <VolunteerSignupModal
          applyRole="Community Outreach Volunteer"
          submitting={false}
          error={null}
          onClose={() => {}}
          onSubmit={onSubmit}
        />
      </TestProviders>,
    );

    const submitButton = await screen.findByRole("button", {
      name: /send application/i,
    });
    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "  I love organizing community events.  " },
    });
    expect(submitButton).toBeEnabled();

    fireEvent.click(submitButton);
    expect(onSubmit).toHaveBeenCalledWith(
      "I love organizing community events.",
    );
  });
});
