import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AccountPane } from "./SettingsPanes";

describe("AccountPane", () => {
  it("shows the logged-in email, not the old hardcoded mock", () => {
    render(
      <TestProviders>
        <AccountPane onChange={() => {}} />
      </TestProviders>,
    );
    expect(screen.getByText("you@queerpulse.test")).toBeInTheDocument();
    expect(
      screen.queryByText("sofia.andrade@email.com"),
    ).not.toBeInTheDocument();
  });

  it("flags the unbacked security toggles as coming soon", () => {
    render(
      <TestProviders>
        <AccountPane onChange={() => {}} />
      </TestProviders>,
    );
    expect(screen.getAllByText("Coming soon").length).toBeGreaterThan(0);
  });
});
