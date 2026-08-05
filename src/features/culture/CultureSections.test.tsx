import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { ClubSection, CommissionsSection } from "./CultureSections";

/**
 * Culture is a dual-mode page: demo renders the prototype's mock picks /
 * commissions / gallery, while LIVE mode (no data pipeline yet) must render an
 * honest `EmptyState` — not leak the mock content and not fabricate rows the
 * backend can't serve. This is exactly the class of live-mode mock-leak the
 * project has swept before, so it's worth a regression test.
 *
 * `useDemoMode` is partial-mocked (keeping the real `DemoModeProvider` export
 * that `TestProviders` mounts) and its `demoMode` flag flipped per test — the
 * mutable-mock pattern from `authGate.test.tsx`. The demo-only content
 * (commission/pick titles) is plain data, so it resolves synchronously; the
 * live empty-state copy comes from the lazy `culture` catalog, so it needs
 * `findBy*`.
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

describe("CommissionsSection dual-mode gating", () => {
  it("renders the mock commission board and the post-project action in demo mode", async () => {
    render(
      <TestProviders>
        <CommissionsSection />
      </TestProviders>,
    );
    expect(
      screen.getByText("Portraits of Queer Elders in Mouraria"),
    ).toBeInTheDocument();
    // The "post a project" CTA is demo-only (no live intake endpoint yet).
    expect(
      await screen.findByRole("button", { name: /post a project/i }),
    ).toBeInTheDocument();
  });

  it("shows an honest empty state (no leaked mock rows, no CTA) in live mode", async () => {
    demoMode = false;
    render(
      <TestProviders>
        <CommissionsSection />
      </TestProviders>,
    );
    expect(
      await screen.findByText("Open commissions coming soon"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Portraits of Queer Elders in Mouraria"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /post a project/i }),
    ).not.toBeInTheDocument();
  });
});

describe("ClubSection dual-mode gating", () => {
  it("renders the mock book-club picks in demo mode", () => {
    render(
      <TestProviders>
        <ClubSection />
      </TestProviders>,
    );
    expect(screen.getByText("Giovanni's Room")).toBeInTheDocument();
  });

  it("swaps the picks for a coming-soon empty state in live mode", async () => {
    demoMode = false;
    render(
      <TestProviders>
        <ClubSection />
      </TestProviders>,
    );
    expect(
      await screen.findByText("Picks and discussions coming soon"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Giovanni's Room")).not.toBeInTheDocument();
  });
});
