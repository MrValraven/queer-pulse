import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { TestingTab } from "./SexualHealthTabs";

/**
 * Dual-mode gating on the sexual-health "Testing" tab (X-2 — resources had zero
 * tests). In DEMO mode the tab renders the full mock clinic directory (filter
 * chips + clinic cards). In LIVE mode there is no verified clinic dataset yet,
 * so the directory is deliberately replaced by a "coming soon" empty state —
 * the honest live fallback the dual-mode convention requires.
 *
 * We drive that branch by mocking `useDemoMode` at the module boundary (the
 * DemoModeProvider itself is env-forced ON in the test build and can't be
 * toggled through the real provider — precedent: authGate.test.tsx). A mutable
 * `mockDemoMode` lets one file exercise both modes. The static TESTING_INFO
 * cards render in both modes, so we assert on what actually diverges: the demo
 * clinic list vs. the live coming-soon copy.
 *
 * i18n note: `resources` is a lazy namespace → `findBy*` for translated copy.
 */
let mockDemoMode = true;
vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mockDemoMode }),
}));

function renderTab(node: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <MemoryRouter>{node}</MemoryRouter>
      </I18nProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mockDemoMode = true;
});

describe("SexualHealth TestingTab dual-mode", () => {
  it("renders the mock clinic directory in demo mode", async () => {
    mockDemoMode = true;
    renderTab(<TestingTab />);

    // A concrete mock clinic (from sexualHealth.data) proves the demo
    // directory rendered, not the live placeholder.
    expect(await screen.findByText("CheckpointLx")).toBeInTheDocument();
    // The live "coming soon" copy must NOT appear in demo mode.
    expect(
      screen.queryByText("The clinic directory is coming soon."),
    ).not.toBeInTheDocument();
  });

  it("replaces the directory with a coming-soon empty state in live mode", async () => {
    mockDemoMode = false;
    renderTab(<TestingTab />);

    // Live mode surfaces the honest placeholder…
    expect(
      await screen.findByText("The clinic directory is coming soon."),
    ).toBeInTheDocument();
    // …and none of the mock clinics leak into live mode.
    expect(screen.queryByText("CheckpointLx")).not.toBeInTheDocument();
  });
});
