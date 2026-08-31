import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AccountPane } from "./SettingsPanes";
import { GOOGLE_TWO_STEP_VERIFICATION_URL } from "./settings.data";

describe("AccountPane", () => {
  it("shows the logged-in email, not the old hardcoded mock", () => {
    render(
      <TestProviders>
        <AccountPane />
      </TestProviders>,
    );
    expect(screen.getByText("you@queerpulse.test")).toBeInTheDocument();
    expect(
      screen.queryByText("sofia.andrade@email.com"),
    ).not.toBeInTheDocument();
  });

  // PRD-12: the pane used to offer a "two-factor authentication, coming soon"
  // toggle on a platform that is Google OAuth only and has no second factor of
  // its own to build. It points at the real one instead.
  it("sends the member to their Google account for a second factor", async () => {
    render(
      <TestProviders>
        <AccountPane />
      </TestProviders>,
    );
    const link = await screen.findByRole("link", {
      name: "Set it up at Google",
    });
    expect(link).toHaveAttribute("href", GOOGLE_TWO_STEP_VERIFICATION_URL);
    expect(screen.queryByText("Coming soon")).not.toBeInTheDocument();
  });
});
