import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ToastProvider } from "../../shared/components/feedback/ToastProvider";
import { AdminCommunitySpaceRequestsPage } from "./AdminCommunitySpaceRequestsPage";

const mockDemoMode = true;
vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mockDemoMode }),
}));

// AdminShell pulls in the full admin chrome (theme toggle, live nav-badge
// queries, the auth-backed role switcher) that this test has no reason to
// exercise. See AdminResourceSuggestionsPage.test.tsx for the same mock.
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
            <AdminCommunitySpaceRequestsPage />
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

describe("AdminCommunitySpaceRequestsPage", () => {
  it("lists open requests by default and approves one", async () => {
    renderPage();
    expect(await screen.findByText("Coletivo Gula")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /approve/i }));

    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(
        expect.stringMatching(/spaces turned on for coletivo gula/i),
        "success",
      ),
    );
  });

  it("declines with an optional reason from the modal", async () => {
    renderPage();
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: /^decline$/i }));
    await user.type(screen.getByLabelText(/reason/i), "Not yet");
    await user.click(screen.getByRole("button", { name: /decline request/i }));

    await waitFor(() =>
      expect(toastSpy).toHaveBeenCalledWith(
        expect.stringMatching(/request declined/i),
        "success",
      ),
    );
  });
});
