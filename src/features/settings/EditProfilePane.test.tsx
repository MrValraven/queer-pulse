import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { EditProfilePane } from "./EditProfilePane";
import { currentUser } from "../members/data/members";

describe("EditProfilePane", () => {
  it("renders the logged-in member's data, not the old Sofia mock", () => {
    render(
      <TestProviders>
        <EditProfilePane onChange={() => {}} />
      </TestProviders>,
    );
    // First/last name inputs reflect the real member.
    expect(screen.getByDisplayValue(currentUser.first)).toBeInTheDocument();
    expect(screen.getByDisplayValue(currentUser.last)).toBeInTheDocument();
    // The old hardcoded bio must be gone.
    expect(
      screen.queryByDisplayValue(/Former housing rights lawyer/),
    ).not.toBeInTheDocument();
  });
});
