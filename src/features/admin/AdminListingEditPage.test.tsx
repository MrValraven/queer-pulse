import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ToastProvider } from "../../shared/components/feedback/ToastProvider";
import { ApiError } from "../../shared/api/client";
import type { ListingWizardProps } from "../marketing/listBusiness/ListingWizard";
import type { ListingDTO } from "../marketing/listBusiness/api/listings.api";
import { OWNER_PERSONAL_FIELDS } from "../marketing/listBusiness/listBusiness.data";
import { ADMIN_LISTINGS_QUEUE } from "./adminListings.data";
import { AdminListingEditPage } from "./AdminListingEditPage";
import * as adminListingEditApi from "./api/adminListingEdit.api";

const mockDemoMode = false;
vi.mock("../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mockDemoMode }),
}));

// The admin chrome (theme toggle, live nav-badge queries, the auth-backed
// role switcher) has nothing to do with this page's states.
vi.mock("../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// The real wizard needs the profile, upload and directory providers and six
// steps of valid input before it submits. What this page owns is what it
// hands the wizard and what it does with the submit result, so the stub
// renders the seeded draft and the props the page sets, and submits the draft
// untouched.
vi.mock("../marketing/listBusiness/ListingWizard", () => ({
  ListingWizard: ({
    initialDraft,
    initialStep,
    submitLabel,
    isEditSave,
    submit,
  }: ListingWizardProps) => (
    <section aria-label="Listing wizard">
      <p>{initialDraft?.name}</p>
      <p>{`path:${initialDraft?.path ?? ""}`}</p>
      <p>{`step:${initialStep ?? ""}`}</p>
      <p>{`submitLabel:${submitLabel ?? ""}`}</p>
      <p>{`isEditSave:${String(Boolean(isEditSave))}`}</p>
      <button
        type="button"
        onClick={() => {
          if (initialDraft && submit) {
            void submit(initialDraft).catch(() => undefined);
          }
        }}
      >
        Submit listing
      </button>
    </section>
  ),
}));

const LISTING_REF = "QPL-2026-0007";
const HAS_OWNER_TITLE = "This listing has an owner now";
const NOT_FOUND_TITLE = "We couldn't find this listing";
const LOAD_ERROR_TITLE = "This listing didn't load";

/**
 * The demo queue fixture's listing, stored as `claim`. The fixture names an
 * owner for it, so this helper clears `submittedBy` to make it one the
 * platform holds unless overridden. The queue serves a `ModeratedListingDTO`, which has no outing
 * consents, so both are filled in as declined to make a full `ListingDTO`:
 * the PATCH's return type, which the GET's `ManagedListingDTO` also accepts
 * (its owner arm is a `ListingDTO` with an optional role).
 */
function editableListing(overrides: Partial<ListingDTO> = {}): ListingDTO {
  const queueRow = ADMIN_LISTINGS_QUEUE.find((row) => row.ref === LISTING_REF);
  if (!queueRow) throw new Error("demo fixture missing");
  return {
    ...queueRow.detail,
    consentOuting: false,
    consentGuide: false,
    path: "claim",
    submittedBy: null,
    ...overrides,
  };
}

/** Every key the admin PATCH body may not carry. */
const EXCLUDED_PATCH_KEYS = [
  ...OWNER_PERSONAL_FIELDS,
  "affirmingBaselineAccepted",
  "ownerRole",
  "isStaffAuthored",
  "path",
  "publishState",
  "ownerOffer",
];

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ToastProvider>
          <MemoryRouter
            initialEntries={[`/admin/listings/${LISTING_REF}/edit`]}
          >
            <Routes>
              <Route
                path="/admin/listings/:ref/edit"
                element={<AdminListingEditPage />}
              />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </I18nProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("AdminListingEditPage", () => {
  it("shows the has-owner state in place of the wizard when the loaded listing has an owner", async () => {
    vi.spyOn(adminListingEditApi, "getAdminEditableListing").mockResolvedValue(
      editableListing({
        submittedBy: { slug: "owner", firstName: "Olivia", lastName: "Owner" },
      }),
    );
    renderPage();

    expect(await screen.findByText(HAS_OWNER_TITLE)).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Listing wizard" }),
    ).not.toBeInTheDocument();
  });

  it("renders the wizard over an unowned listing, seeded on the staff path", async () => {
    const getSpy = vi
      .spyOn(adminListingEditApi, "getAdminEditableListing")
      .mockResolvedValue(editableListing());
    renderPage();

    expect(
      await screen.findByRole("region", { name: "Listing wizard" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Maison Du Tiago")).toBeInTheDocument();
    // A listing stored as `claim` still opens on the one path step 0 offers
    // staff.
    expect(screen.getByText("path:suggest")).toBeInTheDocument();
    expect(getSpy).toHaveBeenCalledWith(LISTING_REF);
    expect(screen.queryByText(HAS_OWNER_TITLE)).not.toBeInTheDocument();
  });

  it("opens the wizard on the basics step with the edit save label and saving copy", async () => {
    vi.spyOn(adminListingEditApi, "getAdminEditableListing").mockResolvedValue(
      editableListing(),
    );
    renderPage();

    expect(await screen.findByText("step:1")).toBeInTheDocument();
    expect(screen.getByText("submitLabel:Save changes")).toBeInTheDocument();
    expect(screen.getByText("isEditSave:true")).toBeInTheDocument();
  });

  it("offers the directory page from the has-owner state when the listing is live", async () => {
    vi.spyOn(adminListingEditApi, "getAdminEditableListing").mockResolvedValue(
      editableListing({
        status: "live",
        submittedBy: { slug: "owner", firstName: "Olivia", lastName: "Owner" },
      }),
    );
    renderPage();

    expect(
      await screen.findByRole("heading", { level: 2, name: HAS_OWNER_TITLE }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View in the directory" }),
    ).toHaveAttribute("href", "/local/directory/maison-du-tiago");
  });

  it("shows the not-found state when the listing load answers 404", async () => {
    vi.spyOn(adminListingEditApi, "getAdminEditableListing").mockRejectedValue(
      new ApiError(404, "Listing not found"),
    );
    renderPage();

    expect(await screen.findByText(NOT_FOUND_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(LOAD_ERROR_TITLE)).not.toBeInTheDocument();
  });

  it("keeps the retryable load error for any other failure", async () => {
    vi.spyOn(adminListingEditApi, "getAdminEditableListing").mockRejectedValue(
      new ApiError(500, "Server error"),
    );
    renderPage();

    expect(await screen.findByText(LOAD_ERROR_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(NOT_FOUND_TITLE)).not.toBeInTheDocument();
  });

  it("sends a PATCH body without any key the admin edit may not carry", async () => {
    vi.spyOn(adminListingEditApi, "getAdminEditableListing").mockResolvedValue(
      editableListing(),
    );
    const updateSpy = vi
      .spyOn(adminListingEditApi, "adminUpdateListing")
      .mockResolvedValue(editableListing());
    renderPage();

    await userEvent.click(
      await screen.findByRole("button", { name: "Submit listing" }),
    );

    await vi.waitFor(() => expect(updateSpy).toHaveBeenCalledTimes(1));
    const [sentRef, sentBody] = updateSpy.mock.calls[0] ?? [];
    expect(sentRef).toBe(LISTING_REF);
    expect(sentBody).toMatchObject({ name: "Maison Du Tiago" });
    for (const excludedKey of EXCLUDED_PATCH_KEYS) {
      expect(sentBody).not.toHaveProperty(excludedKey);
    }
  });

  it("swaps the wizard for the has-owner state when the save is refused with LISTING_HAS_OWNER", async () => {
    vi.spyOn(adminListingEditApi, "getAdminEditableListing").mockResolvedValue(
      editableListing(),
    );
    vi.spyOn(adminListingEditApi, "adminUpdateListing").mockRejectedValue(
      new ApiError(
        409,
        "This listing has an owner now, so its owner edits it.",
        {
          statusCode: 409,
          message: "This listing has an owner now, so its owner edits it.",
          code: "LISTING_HAS_OWNER",
        },
      ),
    );
    renderPage();

    await userEvent.click(
      await screen.findByRole("button", { name: "Submit listing" }),
    );

    expect(await screen.findByText(HAS_OWNER_TITLE)).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Listing wizard" }),
    ).not.toBeInTheDocument();
    // The submit button is gone, so focus lands on the notice in its place.
    await vi.waitFor(() =>
      expect(
        screen.getByRole("region", { name: HAS_OWNER_TITLE }),
      ).toHaveFocus(),
    );
  });
});

describe("isListingHasOwnerError", () => {
  it("is true for a 409 carrying the LISTING_HAS_OWNER code", () => {
    const error = new ApiError(409, "owned", { code: "LISTING_HAS_OWNER" });
    expect(adminListingEditApi.isListingHasOwnerError(error)).toBe(true);
  });

  it("is false for a 409 with another code, another status, or a plain error", () => {
    expect(
      adminListingEditApi.isListingHasOwnerError(
        new ApiError(409, "conflict", { code: "SOMETHING_ELSE" }),
      ),
    ).toBe(false);
    expect(
      adminListingEditApi.isListingHasOwnerError(
        new ApiError(400, "bad", { code: "LISTING_HAS_OWNER" }),
      ),
    ).toBe(false);
    expect(
      adminListingEditApi.isListingHasOwnerError(new Error("offline")),
    ).toBe(false);
  });
});
