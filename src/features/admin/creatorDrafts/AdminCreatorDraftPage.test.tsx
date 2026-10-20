import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { routes } from "../../../app/routeMap";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import { ToastProvider } from "../../../shared/components/feedback/ToastProvider";
import { API_V1 } from "../../../test/msw/handlers";
import { server } from "../../../test/msw/server";
import { TestProviders } from "../../../test/TestProviders";
import {
  ADMIN_CREATOR_DRAFTS,
  DEMO_CREATOR_DRAFT_IDS,
  DEMO_DRAFT_PERSONA,
} from "../adminCreatorDrafts.data";
import { AdminCreatorDraftPage } from "./AdminCreatorDraftPage";

/** Flipped by the live test only: every other test runs in demo mode, which
 *  TestProviders forces on. */
const mockLiveMode = vi.hoisted(() => ({ current: false }));
vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../../app/providers/DemoModeProvider")
    >();
  return {
    ...actual,
    useDemoMode: () =>
      mockLiveMode.current ? { demoMode: false } : actual.useDemoMode(),
  };
});

/** Set to drop the owner from every demo detail, for the ownerless case. */
const mockOwnerless = vi.hoisted(() => ({ current: false }));
/** Set to make the listing edit fixture's listing one that is not live. */
const mockUnlistedEdit = vi.hoisted(() => ({ current: false }));
/** Set to replace every demo detail's missing list (undefined keeps it). */
const mockMissing = vi.hoisted(() => ({
  current: undefined as string[] | null | undefined,
}));
vi.mock("../adminCreatorDraftPreviews.data", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../adminCreatorDraftPreviews.data")>();
  return {
    ...actual,
    demoAdminCreatorDraftDetail: (
      ...args: Parameters<typeof actual.demoAdminCreatorDraftDetail>
    ) => {
      const fixture = actual.demoAdminCreatorDraftDetail(...args);
      const detail =
        fixture && mockMissing.current !== undefined
          ? { ...fixture, missing: mockMissing.current }
          : fixture;
      if (detail?.kind === "listing_edit" && mockUnlistedEdit.current) {
        return { ...detail, listing: { ...detail.listing, slug: null } };
      }
      return detail && mockOwnerless.current
        ? { ...detail, owner: null }
        : detail;
    },
  };
});

// The admin chrome (theme toggle, nav-badge queries, role switcher) has
// nothing to do with this page's states.
vi.mock("../../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// Basemaps load tiles, which jsdom cannot draw.
vi.mock("../../gatherings/GatheringWhereMap", () => ({
  GatheringWhereMap: () => null,
}));
vi.mock("../../marketing/LocationMiniMap", () => ({
  LocationMiniMap: ({ ariaLabel }: { ariaLabel: string }) => (
    <div role="img" aria-label={ariaLabel} />
  ),
}));

const PREVIEW_REGION = /preview\.label|Preview of this draft/;
const STRIP_GROUP = /strip\.label|Unfinished draft details/;
const NOT_FOUND_TITLE = /notFound\.title|no longer here/;
const MISSING_LABEL = /strip\.missing$|Still missing/;
const NOTHING_MISSING = /strip\.nothingMissing|Everything needed is filled in/;

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => server.close());
beforeEach(() => {
  mockLiveMode.current = false;
  mockOwnerless.current = false;
  mockUnlistedEdit.current = false;
  mockMissing.current = undefined;
});

function pageRoutes() {
  return (
    <Routes>
      <Route
        path={routes.adminCreatorDraft}
        element={<AdminCreatorDraftPage />}
      />
      <Route path={routes.adminCreatorDrafts} element={<p>Draft list</p>} />
    </Routes>
  );
}

function renderAt(path: string) {
  return render(
    <TestProviders initialEntries={[path]}>{pageRoutes()}</TestProviders>,
  );
}

/** Live mode with only the providers the page reads, so no other provider
 *  sends its own live requests. */
function renderLiveAt(path: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <I18nProvider>
          <ToastProvider>{pageRoutes()}</ToastProvider>
        </I18nProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("AdminCreatorDraftPage", () => {
  it("renders each demo kind with no request", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    for (const row of ADMIN_CREATOR_DRAFTS) {
      const { unmount } = renderAt(
        `/admin/creator-drafts/${row.kind}/${row.id}`,
      );
      expect(
        await screen.findByRole("region", { name: PREVIEW_REGION }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/creatorDrafts\.strip\.unfinished|Unfinished/),
      ).toBeInTheDocument();
      unmount();
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows kind, owner, last saved and what is still missing above the preview", async () => {
    renderAt(`/admin/creator-drafts/event/${DEMO_CREATOR_DRAFT_IDS.event}`);
    const strip = await screen.findByRole("group", { name: STRIP_GROUP });
    expect(within(strip).getByText(/kind\.event|Event/)).toBeInTheDocument();
    // The event fixture is Joana's, still missing who it is for and care.
    // The full name matches the owner fact alone ("Message Joana" holds only
    // the first name).
    expect(within(strip).getByText("Joana Pires")).toBeInTheDocument();
    expect(within(strip).getByText(/lastSaved|Last saved/)).toBeInTheDocument();
    expect(
      within(strip).getByText(/missing\.event\.who|Who it's for/),
    ).toBeInTheDocument();
    expect(
      within(strip).getByText(/missing\.event\.care|^Care$/),
    ).toBeInTheDocument();
    // The strip comes before the preview in reading order.
    const preview = screen.getByRole("region", { name: PREVIEW_REGION });
    expect(
      strip.compareDocumentPosition(preview) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("leaves the missing fact off a kind that reports no checklist", async () => {
    for (const kind of ["listing", "studio_episode"] as const) {
      const { unmount } = renderAt(
        `/admin/creator-drafts/${kind}/${DEMO_CREATOR_DRAFT_IDS[kind]}`,
      );
      const strip = await screen.findByRole("group", { name: STRIP_GROUP });
      expect(within(strip).queryByText(MISSING_LABEL)).toBeNull();
      expect(within(strip).queryByText(NOTHING_MISSING)).toBeNull();
      unmount();
    }
  });

  it("says nothing is missing only for an empty checklist", async () => {
    mockMissing.current = [];
    const { unmount } = renderAt(
      `/admin/creator-drafts/event/${DEMO_CREATOR_DRAFT_IDS.event}`,
    );
    const strip = await screen.findByRole("group", { name: STRIP_GROUP });
    expect(within(strip).getByText(MISSING_LABEL)).toBeInTheDocument();
    expect(within(strip).getByText(NOTHING_MISSING)).toBeInTheDocument();
    unmount();

    mockMissing.current = null;
    renderAt(`/admin/creator-drafts/event/${DEMO_CREATOR_DRAFT_IDS.event}`);
    const nullStrip = await screen.findByRole("group", { name: STRIP_GROUP });
    expect(within(nullStrip).queryByText(MISSING_LABEL)).toBeNull();
    expect(within(nullStrip).queryByText(NOTHING_MISSING)).toBeNull();
  });

  it("opens the official message composer addressed to the owner", async () => {
    renderAt(
      `/admin/creator-drafts/community/${DEMO_CREATOR_DRAFT_IDS.community}`,
    );
    const strip = await screen.findByRole("group", { name: STRIP_GROUP });
    await userEvent.click(
      within(strip).getByRole("button", { name: /messageCta|Message/ }),
    );
    const dialog = await screen.findByRole("dialog");
    const composer = within(dialog).getByRole<HTMLTextAreaElement>("textbox");
    expect(composer.value).toMatch(/Trans Book Club Porto|template/);
  });

  it("hides Message the owner when the draft has no owner", async () => {
    mockOwnerless.current = true;
    renderAt(
      `/admin/creator-drafts/community/${DEMO_CREATOR_DRAFT_IDS.community}`,
    );
    const strip = await screen.findByRole("group", { name: STRIP_GROUP });
    expect(
      within(strip).queryByRole("button", { name: /messageCta|Message/ }),
    ).toBeNull();
    expect(
      within(strip).getByText(/strip\.noOwner|Someone whose account is gone/),
    ).toBeInTheDocument();
  });

  it("offers Finish as a team listing for a listing wizard draft only", async () => {
    const { unmount } = renderAt(
      `/admin/creator-drafts/listing/${DEMO_CREATOR_DRAFT_IDS.listing}`,
    );
    expect(
      await screen.findByRole("link", {
        name: /finishCta|Finish as a team listing/,
      }),
    ).toHaveAttribute(
      "href",
      "/admin/listings/new?fromDraft=listing-draft-0004",
    );
    unmount();

    renderAt(`/admin/creator-drafts/event/${DEMO_CREATOR_DRAFT_IDS.event}`);
    const strip = await screen.findByRole("group", { name: STRIP_GROUP });
    expect(
      within(strip).queryByRole("link", {
        name: /finishCta|Finish as a team listing/,
      }),
    ).toBeNull();
  });

  it("links a listing edit to its live listing", async () => {
    renderAt(
      `/admin/creator-drafts/listing_edit/${DEMO_CREATOR_DRAFT_IDS.listing_edit}`,
    );
    const strip = await screen.findByRole("group", { name: STRIP_GROUP });
    expect(
      within(strip).getByRole("link", {
        name: /openLiveListing|Open the live listing/,
      }),
    ).toHaveAttribute("href", "/local/directory/casa-lilas-cafe");
  });

  it("gives a listing edit whose listing is not live no live-listing link", async () => {
    mockUnlistedEdit.current = true;
    renderAt(
      `/admin/creator-drafts/listing_edit/${DEMO_CREATOR_DRAFT_IDS.listing_edit}`,
    );
    const strip = await screen.findByRole("group", { name: STRIP_GROUP });
    expect(
      within(strip).queryByRole("link", {
        name: /openLiveListing|Open the live listing/,
      }),
    ).toBeNull();
  });

  it("offers no edit, publish or delete action for any kind", async () => {
    for (const row of ADMIN_CREATOR_DRAFTS) {
      const { unmount } = renderAt(
        `/admin/creator-drafts/${row.kind}/${row.id}`,
      );
      await screen.findByRole("region", { name: PREVIEW_REGION });
      const actionArea = screen.getByRole("group", { name: STRIP_GROUP });
      expect(
        within(actionArea).queryByRole("button", {
          name: /edit|publish|delete|discard/i,
        }),
      ).toBeNull();
      unmount();
    }
  });

  it("explains a draft that is gone and links back to the list", async () => {
    renderAt("/admin/creator-drafts/persona/unknown-id");
    expect(await screen.findByText(NOT_FOUND_TITLE)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /backToList|Back to creator drafts/ }),
    ).toHaveAttribute("href", "/admin/creator-drafts");
  });

  it("treats an unknown kind in the URL as not found", async () => {
    renderAt("/admin/creator-drafts/poster/123");
    expect(await screen.findByText(NOT_FOUND_TITLE)).toBeInTheDocument();
  });

  it("names a made-for with no slug as plain text", async () => {
    renderAt(`/admin/creator-drafts/persona/${DEMO_CREATOR_DRAFT_IDS.persona}`);
    const strip = await screen.findByRole("group", { name: STRIP_GROUP });
    const personaName = DEMO_DRAFT_PERSONA.displayName.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
    expect(
      within(strip).getByText(new RegExp(personaName)),
    ).toBeInTheDocument();
    expect(
      within(strip).queryByRole("link", { name: new RegExp(personaName) }),
    ).toBeNull();
  });
});

describe("AdminCreatorDraftPage in live mode", () => {
  it("treats a malformed live id as not found without asking the server", async () => {
    mockLiveMode.current = true;
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    let readCount = 0;
    server.use(
      http.get(`${API_V1}/admin/creator-drafts/persona/not-a-uuid`, () => {
        readCount += 1;
        return HttpResponse.json(
          { statusCode: 400, message: "Validation failed (uuid is expected)" },
          { status: 400 },
        );
      }),
    );
    renderLiveAt("/admin/creator-drafts/persona/not-a-uuid");
    expect(await screen.findByText(NOT_FOUND_TITLE)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /retryCta|Try again/i }),
    ).toBeNull();
    expect(readCount).toBe(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("still treats a live 400 for a UUID-shaped id as not found", async () => {
    mockLiveMode.current = true;
    const draftId = "00000000-0000-0000-0000-000000000000";
    let readCount = 0;
    server.use(
      http.get(`${API_V1}/admin/creator-drafts/persona/${draftId}`, () => {
        readCount += 1;
        return HttpResponse.json(
          { statusCode: 400, message: "Validation failed (uuid is expected)" },
          { status: 400 },
        );
      }),
    );
    renderLiveAt(`/admin/creator-drafts/persona/${draftId}`);
    expect(await screen.findByText(NOT_FOUND_TITLE)).toBeInTheDocument();
    await waitFor(() => expect(readCount).toBe(1));
  });

  it("offers Retry when a live read fails on the server", async () => {
    mockLiveMode.current = true;
    const draftId = DEMO_CREATOR_DRAFT_IDS.event;
    let readCount = 0;
    let releaseRetry: () => void = () => undefined;
    const retryHeld = new Promise<void>((resolve) => {
      releaseRetry = resolve;
    });
    server.use(
      http.get(`${API_V1}/admin/creator-drafts/event/${draftId}`, async () => {
        readCount += 1;
        // The retry's answer waits until the test has looked at the page
        // while the request is in flight.
        if (readCount > 1) await retryHeld;
        return HttpResponse.json(
          { statusCode: 500, message: "Internal server error" },
          { status: 500 },
        );
      }),
    );
    const { container } = renderLiveAt(
      `/admin/creator-drafts/event/${draftId}`,
    );
    const retryButton = await screen.findByRole("button", {
      name: /retryCta|Try again/i,
    });
    expect(screen.queryByText(NOT_FOUND_TITLE)).toBeNull();
    await userEvent.click(retryButton);

    // While the retry runs, the error state stays mounted with its busy
    // button, so focus stays put, and the loading skeleton never shows.
    await waitFor(() => expect(readCount).toBe(2));
    expect(
      await screen.findByRole("button", { name: /retryingCta|Trying again/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/detail\.loadError\.title|This draft didn't load/),
    ).toBeInTheDocument();
    expect(container.querySelector('div[aria-busy="true"]')).toBeNull();

    releaseRetry();
    expect(
      await screen.findByRole("button", { name: /retryCta|Try again/i }),
    ).toBeInTheDocument();
    expect(container.querySelector('div[aria-busy="true"]')).toBeNull();
  });
});
