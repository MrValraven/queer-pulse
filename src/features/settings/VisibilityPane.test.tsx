import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { currentUser } from "../members/data/members";
import { VisibilityPane } from "./SettingsPanes";

describe("VisibilityPane", () => {
  it("checks the radio matching the member's real visibility", () => {
    render(
      <TestProviders>
        <VisibilityPane onChange={() => {}} />
      </TestProviders>,
    );
    // Demo currentUser (tiago) has a known visibility; the matching radio is
    // checked. The pane holds other radio groups too, so this reads only the
    // profile-visibility group (`name="vis"`).
    const profileVisibilityRadios = screen
      .getAllByRole("radio")
      .filter((radio) => radio.getAttribute("name") === "vis");
    const checkedRadios = profileVisibilityRadios.filter(
      (radio) => (radio as HTMLInputElement).checked,
    );
    expect(checkedRadios).toHaveLength(1);
    expect(checkedRadios[0]).toHaveAttribute("value", currentUser.visibility);
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
