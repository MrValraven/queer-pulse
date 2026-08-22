import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ToastProvider } from "../../shared/components/feedback/ToastProvider";
import { AdminResourceListingsPage } from "./AdminResourceListingsPage";
import * as adminResourceListingsApi from "./api/adminResourceListings.api";

const mockDemoMode = false;
vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mockDemoMode }),
}));

// AdminShell pulls in the full admin chrome (theme toggle, search, the admin
// sidebar with its own live nav-badge queries, the role switcher reading
// useAuth, …) — none of which this test exercises or has any repo precedent
// exercising in isolation. Replaced with a thin passthrough so the test stays
// focused on this page's own logic (the rows / empty state it owns), the same
// way a page test isn't expected to also integration-test PageShell/AppShell.
vi.mock("../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ToastProvider>
          <MemoryRouter>
            <AdminResourceListingsPage />
          </MemoryRouter>
        </ToastProvider>
      </I18nProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("AdminResourceListingsPage", () => {
  it("renders every listing, including archived ones", async () => {
    vi.spyOn(
      adminResourceListingsApi,
      "getAdminResourceListings",
    ).mockResolvedValue([
      {
        id: "rl-1",
        category: "legal_aid",
        title: "Porto Queer Legal Clinic",
        description: "Pro-bono workplace discrimination cases.",
        phone: null,
        email: "intake@portoqueerlegal.pt",
        website: null,
        region: "Porto",
        status: "active",
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: "2026-08-01T00:00:00.000Z",
      },
      {
        id: "rl-2",
        category: "sexual_health_testing",
        title: "Defunct Testing Site",
        description: "No longer operating.",
        phone: "912 000 000",
        email: null,
        website: null,
        region: null,
        status: "archived",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    renderPage();

    expect(
      await screen.findByText("Porto Queer Legal Clinic"),
    ).toBeInTheDocument();
    expect(screen.getByText("Defunct Testing Site")).toBeInTheDocument();
  });

  it("shows the empty state when there are no listings yet", async () => {
    vi.spyOn(
      adminResourceListingsApi,
      "getAdminResourceListings",
    ).mockResolvedValue([]);
    renderPage();

    expect(
      await screen.findByText(
        "No listings yet. Create the first one, or check the suggestions queue for ideas.",
      ),
    ).toBeInTheDocument();
  });
});
