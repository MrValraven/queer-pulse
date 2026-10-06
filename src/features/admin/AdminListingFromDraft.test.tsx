import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ToastProvider } from "../../shared/components/feedback/ToastProvider";
import type { ListingWizardProps } from "../marketing/listBusiness/ListingWizard";
import { AdminListingNewPage } from "./AdminListingNewPage";

vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));

vi.mock("../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// What this page owns is the draft it hands the wizard; the stub prints it.
vi.mock("../marketing/listBusiness/ListingWizard", () => ({
  ListingWizard: ({ initialDraft }: ListingWizardProps) => (
    <section aria-label="Listing wizard">
      <p>{`name:${initialDraft?.name ?? ""}`}</p>
      <p>{`path:${initialDraft?.path ?? ""}`}</p>
      <p>{`staff:${String(Boolean(initialDraft?.isStaffAuthored))}`}</p>
    </section>
  ),
}));

function renderAt(url: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={[url]}>
            <Routes>
              <Route
                path="/admin/listings/new"
                element={<AdminListingNewPage />}
              />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </I18nProvider>
    </QueryClientProvider>,
  );
}

describe("AdminListingNewPage from a member's draft", () => {
  it("opens on the draft's business details as a team listing", async () => {
    renderAt("/admin/listings/new?fromDraft=listing-draft-0004");
    expect(
      await screen.findByText("Finishing Marta's draft"),
    ).toBeInTheDocument();
    expect(screen.getByText("name:Tasca da Graça")).toBeInTheDocument();
    expect(screen.getByText("path:suggest")).toBeInTheDocument();
    expect(screen.getByText("staff:true")).toBeInTheDocument();
  });

  it("offers the listing back to the member who started it", async () => {
    renderAt("/admin/listings/new?fromDraft=listing-draft-0004");
    // The draft's member opens already picked, as the picker's clearable chip.
    expect(
      await screen.findByRole("button", {
        name: "Remove Marta Fonseca and pick someone else",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("@marta")).toBeInTheDocument();
    expect(
      screen.queryByRole("searchbox", {
        name: "Search members to offer this listing to",
      }),
    ).toBeNull();
    const note = screen.getByLabelText<HTMLTextAreaElement>("Message to them");
    expect(note.value).toContain("Tasca da Graça");
    expect(note.value).toContain("finished the listing");
  });

  it("names no one when the member has since left", async () => {
    renderAt("/admin/listings/new?fromDraft=listing-draft-0001");
    expect(
      await screen.findByText(
        "Finishing a draft from a member who has since left",
      ),
    ).toBeInTheDocument();
    // An erased member is never picked, so the picker opens on its search.
    expect(
      screen.getByRole("searchbox", {
        name: "Search members to offer this listing to",
      }),
    ).toHaveValue("");
    expect(
      screen.queryByRole("button", { name: /and pick someone else$/ }),
    ).toBeNull();
  });

  it("says so when the draft is gone", async () => {
    renderAt("/admin/listings/new?fromDraft=listing-draft-missing");
    expect(
      await screen.findByText("This draft is no longer here"),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Listing wizard")).toBeNull();
  });

  it("opens blank without a draft", async () => {
    renderAt("/admin/listings/new");
    expect(await screen.findByText("name:")).toBeInTheDocument();
    expect(screen.queryByText(/Finishing/)).toBeNull();
  });
});
