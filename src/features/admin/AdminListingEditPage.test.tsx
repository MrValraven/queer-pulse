import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../app/providers/I18nProvider";
import { ToastProvider } from "../../shared/components/feedback/ToastProvider";
import { ApiError } from "../../shared/api/client";
import type { ListingDTO } from "../marketing/listBusiness/api/listings.api";
import * as listingsApi from "../marketing/listBusiness/api/listings.api";
import { OWNER_PERSONAL_FIELDS } from "../marketing/listBusiness/listBusiness.data";
import { ADMIN_LISTINGS_QUEUE } from "./adminListings.data";
import { AdminListingEditPage } from "./AdminListingEditPage";
import * as adminListingEditApi from "./api/adminListingEdit.api";

// The page is live-only in what it exercises here: the edit save goes through
// `adminUpdateListing`, which demo mode never calls.
vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../app/providers/DemoModeProvider")
    >();
  return { ...actual, useDemoMode: () => ({ demoMode: false }) };
});

// The admin chrome (theme toggle, live nav-badge queries, the auth-backed
// role switcher) has nothing to do with this page's states.
vi.mock("../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// The pin picker under the address is a maplibre map, which needs WebGL and
// tiles that jsdom cannot draw. The fixture carries a pin so the save is not
// held back on one, and that pin is what mounts the map.
vi.mock("../marketing/LocationPickerMap", () => ({
  LocationPickerMap: () => null,
}));

// The live preview card reads the signed-in member through `useProfileData`,
// which throws outside a ProfileProvider, and that provider in live mode
// fetches the session member. The preview shows the draft and owns none of
// this page's states, so it renders nothing here.
vi.mock("../marketing/listBusiness/editor/ListingEditorLivePreview", () => ({
  ListingEditorLivePreview: () => null,
}));

const LISTING_REF = "QPL-2026-0007";
const LISTING_NAME = "Maison Du Tiago";
const HAS_OWNER_TITLE = "This listing has an owner now";
const NOT_FOUND_TITLE = "We couldn't find this listing";
const LOAD_ERROR_TITLE = "This listing didn't load";
const SAVE_CHANGES_LABEL = "Save changes";
const SAVE_AND_PUBLISH_LABEL = "Save and publish";
const MENU_SECTION_TITLE = "Menu";
const ACCESSIBILITY_SECTION_TITLE = "Getting in";
const TAGLINE_ADDITION = " tonight";

/** The owner editor's sections about whoever holds the listing, which the
 *  admin editor leaves out. */
const OWNER_ONLY_SECTION_TITLES = [
  "About you",
  "Who can edit",
  "Team",
  "Permissions",
  "Trading and visibility",
  "Danger zone",
  "History",
];

/** The full editor tree renders and the marketing catalog loads lazily, so
 *  the first look for editor content gets more than the default second. */
const EDITOR_WAIT = { timeout: 3000 };

/**
 * The demo queue fixture's listing, stored as `claim`. The fixture names an
 * owner for it, so this helper clears `submittedBy` to make it one the
 * platform holds unless overridden. The owner-personal fields stay filled in,
 * so the PATCH test proves the save strips them. It gets a resolved pin,
 * because a place without one cannot be saved, and both outing consents as
 * declined to make a full `ListingDTO`: the PATCH's return type, which the
 * GET's `ManagedListingDTO` also accepts (its owner arm is a `ListingDTO`
 * with an optional role).
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
    latitude: 38.7166,
    longitude: -9.1486,
    geocoded: true,
    ...overrides,
  };
}

/** Every key the admin PATCH body may not carry: the excluded keys of
 *  `adminListingCreate.api.ts`, plus the three the update type omits. */
const EXCLUDED_PATCH_KEYS = [
  ...OWNER_PERSONAL_FIELDS,
  "affirmingBaselineAccepted",
  "ownerRole",
  "isStaffAuthored",
  "adultTermsAccepted",
  "path",
  "publishState",
  "ownerOffer",
];

const LISTING_HAS_OWNER_ERROR = new ApiError(
  409,
  "This listing has an owner now, so its owner edits it.",
  {
    statusCode: 409,
    message: "This listing has an owner now, so its owner edits it.",
    code: "LISTING_HAS_OWNER",
  },
);

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

/** Make the draft dirty, which is what enables Save, then press it. The
 *  tagline is edited because a name change would start the live duplicate
 *  check. */
async function editTaglineAndSave(saveLabel = SAVE_CHANGES_LABEL) {
  const taglineInput = await screen.findByRole(
    "textbox",
    { name: "Tagline" },
    EDITOR_WAIT,
  );
  await userEvent.type(taglineInput, TAGLINE_ADDITION);
  await userEvent.click(screen.getByRole("button", { name: saveLabel }));
}

beforeEach(() => {
  vi.restoreAllMocks();
  // The attribute picker reads the live vocabulary; without an answer it
  // falls back to the local copy, which is what every test here needs.
  vi.spyOn(listingsApi, "getListingAttributeVocabulary").mockResolvedValue(
    null,
  );
});

describe("AdminListingEditPage", () => {
  it("renders the editor with the status line, the menu and accessibility sections, and no owner-only section", async () => {
    const getSpy = vi
      .spyOn(adminListingEditApi, "getAdminEditableListing")
      .mockResolvedValue(editableListing());
    renderPage();

    expect(
      await screen.findByRole(
        "region",
        { name: MENU_SECTION_TITLE },
        EDITOR_WAIT,
      ),
    ).toBeInTheDocument();
    expect(getSpy).toHaveBeenCalledWith(LISTING_REF);
    expect(
      screen.getByRole("region", { name: ACCESSIBILITY_SECTION_TITLE }),
    ).toBeInTheDocument();
    for (const ownerOnlyTitle of OWNER_ONLY_SECTION_TITLES) {
      expect(
        screen.queryByRole("region", { name: ownerOnlyTitle }),
      ).not.toBeInTheDocument();
    }
    // The status line names the edited listing and its review status.
    expect(screen.getByText(`Editing ${LISTING_REF}`)).toBeInTheDocument();
    expect(screen.getByText("In review")).toBeInTheDocument();
    expect(screen.queryByText(HAS_OWNER_TITLE)).not.toBeInTheDocument();
  });

  it("labels the save as saving changes for a listing in review, held back until something changes", async () => {
    vi.spyOn(adminListingEditApi, "getAdminEditableListing").mockResolvedValue(
      editableListing(),
    );
    renderPage();

    const saveButton = await screen.findByRole(
      "button",
      { name: SAVE_CHANGES_LABEL },
      EDITOR_WAIT,
    );
    expect(saveButton).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: SAVE_AND_PUBLISH_LABEL }),
    ).not.toBeInTheDocument();
  });

  it("labels the save as publishing when the listing is already live", async () => {
    vi.spyOn(adminListingEditApi, "getAdminEditableListing").mockResolvedValue(
      editableListing({ status: "live" }),
    );
    renderPage();

    expect(
      await screen.findByRole(
        "button",
        { name: SAVE_AND_PUBLISH_LABEL },
        EDITOR_WAIT,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: SAVE_CHANGES_LABEL }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("sends a PATCH body without any key the admin edit may not carry", async () => {
    vi.spyOn(adminListingEditApi, "getAdminEditableListing").mockResolvedValue(
      editableListing(),
    );
    const updateSpy = vi
      .spyOn(adminListingEditApi, "adminUpdateListing")
      .mockResolvedValue(editableListing());
    renderPage();

    await editTaglineAndSave();

    await vi.waitFor(() => expect(updateSpy).toHaveBeenCalledTimes(1));
    const [sentRef, sentBody] = updateSpy.mock.calls[0] ?? [];
    expect(sentRef).toBe(LISTING_REF);
    expect(sentBody).toMatchObject({
      name: LISTING_NAME,
      tagline: `${editableListing().tagline}${TAGLINE_ADDITION}`,
    });
    // The draft rides the staff path, and the listing keeps its stored one.
    expect(sentBody).not.toHaveProperty("path");
    for (const excludedKey of EXCLUDED_PATCH_KEYS) {
      expect(sentBody).not.toHaveProperty(excludedKey);
    }
  });

  it("shows the success panel and drops the status line once the save lands", async () => {
    vi.spyOn(adminListingEditApi, "getAdminEditableListing").mockResolvedValue(
      editableListing(),
    );
    vi.spyOn(adminListingEditApi, "adminUpdateListing").mockResolvedValue(
      editableListing(),
    );
    renderPage();

    expect(
      await screen.findByText(`Editing ${LISTING_REF}`, {}, EDITOR_WAIT),
    ).toBeInTheDocument();
    await editTaglineAndSave();

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: `Saved ${LISTING_NAME}`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Your changes to ${LISTING_REF} are saved.`),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Back to the listings queue" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(`Editing ${LISTING_REF}`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: MENU_SECTION_TITLE }),
    ).not.toBeInTheDocument();
  });

  it("swaps the editor for the has-owner state when the save is refused with LISTING_HAS_OWNER", async () => {
    vi.spyOn(adminListingEditApi, "getAdminEditableListing").mockResolvedValue(
      editableListing(),
    );
    vi.spyOn(adminListingEditApi, "adminUpdateListing").mockRejectedValue(
      LISTING_HAS_OWNER_ERROR,
    );
    renderPage();

    await editTaglineAndSave();

    expect(
      await screen.findByRole("heading", { level: 2, name: HAS_OWNER_TITLE }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: MENU_SECTION_TITLE }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: SAVE_CHANGES_LABEL }),
    ).not.toBeInTheDocument();
    // The save button is gone, so focus lands on the notice in its place.
    await vi.waitFor(() =>
      expect(
        screen.getByRole("region", { name: HAS_OWNER_TITLE }),
      ).toHaveFocus(),
    );
  });

  it("shows the has-owner state at once when the loaded listing already has an owner", async () => {
    vi.spyOn(adminListingEditApi, "getAdminEditableListing").mockResolvedValue(
      editableListing({
        submittedBy: { slug: "owner", firstName: "Olivia", lastName: "Owner" },
      }),
    );
    const updateSpy = vi.spyOn(adminListingEditApi, "adminUpdateListing");
    renderPage();

    expect(
      await screen.findByRole("heading", { level: 2, name: HAS_OWNER_TITLE }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: SAVE_CHANGES_LABEL }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(`Editing ${LISTING_REF}`),
    ).not.toBeInTheDocument();
    expect(updateSpy).not.toHaveBeenCalled();
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

  it.each([404, 403])(
    "shows the not-found state when the listing load answers %i",
    async (status) => {
      vi.spyOn(
        adminListingEditApi,
        "getAdminEditableListing",
      ).mockRejectedValue(new ApiError(status, "Listing not found"));
      renderPage();

      expect(await screen.findByText(NOT_FOUND_TITLE)).toBeInTheDocument();
      expect(screen.queryByText(LOAD_ERROR_TITLE)).not.toBeInTheDocument();
    },
  );

  it("keeps the retryable load error for any other failure", async () => {
    const getSpy = vi
      .spyOn(adminListingEditApi, "getAdminEditableListing")
      .mockRejectedValue(new ApiError(500, "Server error"));
    renderPage();

    expect(await screen.findByText(LOAD_ERROR_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(NOT_FOUND_TITLE)).not.toBeInTheDocument();

    await userEvent.click(
      await screen.findByRole("button", { name: "Try again" }),
    );
    await vi.waitFor(() => expect(getSpy).toHaveBeenCalledTimes(2));
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
