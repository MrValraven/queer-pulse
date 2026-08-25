import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ShowcaseSection } from "./CultureSections";

/**
 * `ShowcaseSection` is the member-work gallery tab: demo renders the prototype's
 * curated gallery grid + the "Submit your work" CTA, while LIVE mode (no work
 * pipeline yet) must fall back to an honest `EmptyState` — no leaked mock art,
 * no submit affordance. Same live-mode mock-leak regression class the project
 * has swept before, so it's worth locking down alongside the existing
 * Commissions/Club coverage. `useDemoMode` is partial-mocked (keeping the real
 * provider `TestProviders` mounts) with a module-level flag flipped per test.
 */

let demoMode = true;

vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({
    demoMode,
    available: !demoMode,
    setDemoMode: () => {},
    toggle: () => {},
  }),
}));

beforeEach(() => {
  demoMode = true;
});

describe("ShowcaseSection dual-mode gating", () => {
  it("renders the mock gallery grid and the submit-work CTA in demo mode", async () => {
    render(
      <TestProviders>
        <ShowcaseSection />
      </TestProviders>,
    );
    // Gallery titles are plain data, so they resolve synchronously.
    expect(screen.getByText("Corpo Estranho, 2024")).toBeInTheDocument();
    // The submit CTA is demo-only (no live intake endpoint yet).
    expect(
      await screen.findByRole("button", { name: /submit your work/i }),
    ).toBeInTheDocument();
  });

  it("swaps the gallery for an honest empty state (no leaked art, no CTA) in live mode", async () => {
    demoMode = false;
    render(
      <TestProviders>
        <ShowcaseSection />
      </TestProviders>,
    );
    expect(
      await screen.findByText("Featured work coming soon"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Corpo Estranho, 2024")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /submit your work/i }),
    ).not.toBeInTheDocument();
  });
});
