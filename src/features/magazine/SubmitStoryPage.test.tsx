import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { SubmitStoryPage } from "./SubmitStoryPage";

describe("SubmitStoryPage", () => {
  it("renders the pitch form for a member who already holds magazine_writer", async () => {
    // Demo mode grants every staff role (see useMyStaffRoles), so the gate
    // passes and the editor renders.
    render(
      <TestProviders initialEntries={["/magazine/submit-story"]}>
        <SubmitStoryPage />
      </TestProviders>,
    );
    // Anchored: SubmitStoryMeta also renders a "Byline note" label in the
    // same row, and an unanchored /byline/i would match both.
    expect(
      await screen.findByLabelText(/^byline$/i),
    ).toBeInTheDocument();
  });

  // This repo's TestProviders has no documented way to force demoMode: false
  // with a mocked empty staffRoles list for a component test (useMyStaffRoles
  // always grants every role in demo mode) — so the non-writer redirect
  // branch isn't exercised by an automated test here. It's verified by
  // reading SubmitStoryPage.tsx: `if (!isWriter) return <Navigate to={routes.magazineApplyToWrite} replace />;`.
});
