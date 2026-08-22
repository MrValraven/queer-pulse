import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { StudioFlagReviewPage } from "./StudioFlagReviewPage";

/**
 * Studio is demo-only in live, so the flag-review council page has no adapter —
 * only its interaction. Resolving a flag flips that card from its action row to
 * a "Resolved · <verb>" tag and confirms with a toast, held in the page's local
 * `resolved` map. The page reads `useSimulatedLoad`, so we stub it to `false`
 * to render the real flag cards immediately (and avoid the skeleton timer).
 * The flag cards share action labels ("Dismiss" appears on several), so we take
 * the first Dismiss in DOM order — the topmost flag ("Salt water, slowly").
 * Copy is the lazy `studio` catalog → `findBy*`.
 */

vi.mock("../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/hooks")>()),
  useSimulatedLoad: () => false,
}));

describe("StudioFlagReviewPage", () => {
  it("resolves a flag via Dismiss, showing a resolved tag and a toast", async () => {
    render(
      <TestProviders>
        <StudioFlagReviewPage />
      </TestProviders>,
    );

    // First Dismiss in DOM order belongs to the topmost (claimed) flag.
    const dismissButtons = await screen.findAllByRole("button", {
      name: /^dismiss$/i,
    });
    fireEvent.click(dismissButtons[0]!);

    // That card now shows its resolved verb, and the outcome toast fires.
    expect(
      await screen.findByText(/resolved · dismissed/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Flag dismissed. Credits confirmed correct"),
    ).toBeInTheDocument();
  });
});
