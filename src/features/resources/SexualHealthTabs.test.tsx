import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { TestingTab } from "./SexualHealthTabs";
import * as resourcesApi from "./api/resources.api";

/**
 * Dual-mode gating on the sexual-health "Testing" tab (CNT-14). In DEMO mode
 * the tab renders the full mock clinic directory (filter chips + clinic
 * cards) — unchanged by CNT-14. In LIVE mode the tab now fetches real
 * `ResourceListing` rows via `GET /resources/listings?category=
 * sexual_health_testing`: an empty result renders the honest "coming soon"
 * empty state (zero fabricated data), while a non-empty result renders a
 * real card grid instead of the mock clinics.
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
  vi.restoreAllMocks();
});

describe("SexualHealth TestingTab dual-mode", () => {
  it("renders the mock clinic directory in demo mode", async () => {
    mockDemoMode = true;
    renderTab(<TestingTab />);

    expect(await screen.findByText("CheckpointLx")).toBeInTheDocument();
    expect(
      screen.queryByText("The clinic directory is coming soon."),
    ).not.toBeInTheDocument();
  });

  it("shows the honest coming-soon empty state in live mode when no real listings exist yet", async () => {
    mockDemoMode = false;
    vi.spyOn(resourcesApi, "getResourceListings").mockResolvedValue([]);
    renderTab(<TestingTab />);

    expect(
      await screen.findByText("The clinic directory is coming soon."),
    ).toBeInTheDocument();
    expect(screen.queryByText("CheckpointLx")).not.toBeInTheDocument();
  });

  it("renders real listings in live mode once the admin has published some", async () => {
    mockDemoMode = false;
    vi.spyOn(resourcesApi, "getResourceListings").mockResolvedValue([
      {
        id: "rl-1",
        category: "sexual_health_testing",
        title: "Trans-friendly testing van (Almada)",
        description: "Free anonymous rapid testing every Thursday evening.",
        phone: null,
        email: "testing@example.org",
        website: null,
        region: "Almada",
      },
    ]);
    renderTab(<TestingTab />);

    expect(
      await screen.findByText("Trans-friendly testing van (Almada)"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByText("The clinic directory is coming soon."),
      ).not.toBeInTheDocument(),
    );
  });
});
