import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ToastProvider } from "../../shared/components/feedback/ToastProvider";
import { AdminResourceSuggestionsPage } from "./AdminResourceSuggestionsPage";
import * as adminResourceSuggestionsApi from "./api/adminResourceSuggestions.api";

const mockDemoMode = false;
vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mockDemoMode }),
}));

// See AdminResourceListingsPage.test.tsx for why AdminShell is mocked to a
// thin passthrough here: it pulls in the full admin chrome (theme toggle,
// live nav-badge queries, the auth-backed role switcher) that this test has
// no reason to exercise.
vi.mock("../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const toastSpy = vi.fn();
vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: toastSpy }),
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
            <AdminResourceSuggestionsPage />
          </MemoryRouter>
        </ToastProvider>
      </I18nProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  toastSpy.mockClear();
  vi.restoreAllMocks();
});

describe("AdminResourceSuggestionsPage", () => {
  const suggestion = {
    id: "rs-1",
    member: { slug: "beatriz", name: "Beatriz Nunes" },
    category: "sexual_health_testing" as const,
    name: "Trans-friendly testing van (Almada)",
    description: "Free anonymous rapid testing every Thursday evening.",
    phone: null,
    email: "testingvan@example.org",
    website: null,
    createdAt: "2026-08-15T18:30:00.000Z",
    status: "pending" as const,
    decidedAt: null,
    decisionNote: null,
  };

  it("lists suggestions with the suggesting member's name", async () => {
    vi.spyOn(
      adminResourceSuggestionsApi,
      "getAdminResourceSuggestions",
    ).mockResolvedValue({
      items: [suggestion],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    renderPage();

    expect(
      await screen.findByText("Trans-friendly testing van (Almada)"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Suggested by Beatriz Nunes"),
    ).toBeInTheDocument();
  });

  it("approving calls the approve endpoint and toasts success — without touching any listing endpoint", async () => {
    vi.spyOn(
      adminResourceSuggestionsApi,
      "getAdminResourceSuggestions",
    ).mockResolvedValue({
      items: [suggestion],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    const approveSpy = vi
      .spyOn(adminResourceSuggestionsApi, "approveResourceSuggestion")
      .mockResolvedValue({ ...suggestion, status: "approved" });
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole("button", { name: "Approve" }));

    await waitFor(() =>
      expect(approveSpy).toHaveBeenCalledWith("rs-1", undefined),
    );
    expect(toastSpy).toHaveBeenCalledWith("Suggestion approved.", "success");
  });
});
