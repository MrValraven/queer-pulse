import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { AdminGuideFeedbackPage } from "./AdminGuideFeedbackPage";
import { ADMIN_GUIDE_FEEDBACK } from "./adminGuideFeedback.data";

/**
 * Demo-mode contract (TestProviders forces demoMode ON, mirroring
 * AdminVerificationsPage.test.tsx): the page renders the colocated fixture,
 * worst-ratio-first, exactly as the fixture is already ordered.
 */
describe("AdminGuideFeedbackPage", () => {
  it("renders every fixture row worst-ratio-first", async () => {
    render(
      <TestProviders>
        <AdminGuideFeedbackPage />
      </TestProviders>,
    );

    const rows = await screen.findAllByText(
      /^(legal|sexualHealth|mentalHealth)\./,
    );
    expect(rows.map((row) => row.textContent)).toEqual(
      ADMIN_GUIDE_FEEDBACK.map((row) => row.contentKey),
    );
  });

  it("shows the worst guide's helpful/not-helpful split", async () => {
    render(
      <TestProviders>
        <AdminGuideFeedbackPage />
      </TestProviders>,
    );

    expect(
      await screen.findByText("2 helpful · 9 not helpful"),
    ).toBeInTheDocument();
  });
});
