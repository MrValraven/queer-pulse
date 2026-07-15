import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { EditProfilePane } from "./EditProfilePane";
import { currentUser, fullName } from "../members/data/members";

describe("EditProfilePane", () => {
  it("renders the logged-in member's data, not the old Sofia mock", () => {
    render(
      <TestProviders>
        <EditProfilePane onChange={() => {}} />
      </TestProviders>,
    );
    // Display name input reflects the real member.
    expect(
      screen.getByDisplayValue(fullName(currentUser)),
    ).toBeInTheDocument();
    // The old hardcoded bio must be gone.
    expect(
      screen.queryByDisplayValue(/Former housing rights lawyer/),
    ).not.toBeInTheDocument();
  });

  it("flags coming-soon sub-fields", () => {
    render(
      <TestProviders>
        <EditProfilePane onChange={() => {}} />
      </TestProviders>,
    );
    expect(screen.getAllByText("Coming soon").length).toBeGreaterThan(0);
  });
});
