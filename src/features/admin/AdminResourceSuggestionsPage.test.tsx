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
    createdListingId: null,
  };

  /**
   * The approval modal's confirm button, queried by its i18n KEY rather than
   * its English text.
   *
   * The `admin:adminResourceSuggestions.approve.*` keys this modal renders are
   * not in the catalogs yet (they are listed in the PRD-269 handoff for the
   * catalog owner), and `I18nProvider`'s `t` returns a missing key verbatim.
   * Querying the key is therefore what the button is actually labelled right
   * now. Swap this for the English string in the same change that adds the
   * keys, so the assertion keeps testing the real label.
   */
  const APPROVE_CONFIRM_LABEL =
    "admin:adminResourceSuggestions.approve.confirmCta";

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

  it("approving opens the review form and publishes the reviewed listing, without touching any listing endpoint", async () => {
    // PRD-269. Approving no longer fires on the first click: it opens a form
    // pre-filled from the suggestion, because the listing it is about to
    // publish carries contact details a member typed and nobody has checked.
    // The listing still never goes through `/admin/resource-listings` — it is
    // written server-side, in the same transaction as the decision, from the
    // body this request carries.
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
      .mockResolvedValue({
        ...suggestion,
        status: "approved",
        createdListingId: "listing-1",
      });
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole("button", { name: "Approve" }));
    expect(approveSpy).not.toHaveBeenCalled();

    await user.click(
      await screen.findByRole("button", { name: APPROVE_CONFIRM_LABEL }),
    );

    await waitFor(() => expect(approveSpy).toHaveBeenCalledTimes(1));
    expect(approveSpy).toHaveBeenCalledWith(
      "rs-1",
      expect.objectContaining({
        category: "sexual_health_testing",
        title: "Trans-friendly testing van (Almada)",
        // Pre-filled from the member's submission, and editable before it is
        // published. The member gave an email and no phone; the reviewer may
        // add one, and either way at least one contact has to be present.
        email: "testingvan@example.org",
        status: "active",
      }),
      undefined,
    );
    expect(toastSpy).toHaveBeenCalledWith("Suggestion approved.", "success");
  });

  it("offers no decision on a suggestion already published to the directory", async () => {
    // The organisation is live, so declining here would leave the queue and
    // the public directory contradicting each other and send the member a
    // second, opposite answer. The backend 409s all three; the console says so
    // by not offering them.
    vi.spyOn(
      adminResourceSuggestionsApi,
      "getAdminResourceSuggestions",
    ).mockResolvedValue({
      items: [
        {
          ...suggestion,
          status: "approved" as const,
          createdListingId: "listing-1",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    });
    renderPage();

    for (const label of ["Approve", "Decline", "Archive"]) {
      expect(await screen.findByRole("button", { name: label })).toBeDisabled();
    }
  });
});
