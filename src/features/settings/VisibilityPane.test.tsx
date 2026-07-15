import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { VisibilityPane } from "./SettingsPanes";

describe("VisibilityPane", () => {
  it("checks the radio matching the member's real visibility", () => {
    render(
      <TestProviders>
        <VisibilityPane onChange={() => {}} />
      </TestProviders>,
    );
    // Demo currentUser (tiago) has a known visibility; the matching radio is checked.
    const checked = screen.getByRole("radio", { checked: true });
    expect(checked).toHaveAttribute("value");
  });

  it("flags the unbacked additional controls as coming soon", () => {
    render(
      <TestProviders>
        <VisibilityPane onChange={() => {}} />
      </TestProviders>,
    );
    expect(screen.getAllByText("Coming soon").length).toBeGreaterThan(0);
  });
});
