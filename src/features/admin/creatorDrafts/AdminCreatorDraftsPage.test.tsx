import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ADMIN_NAV_SECTIONS } from "../../../shared/components/layout/adminNav.data";
import { TestProviders } from "../../../test/TestProviders";
import { ADMIN_CREATOR_DRAFTS } from "../adminCreatorDrafts.data";
import type { AdminCreatorDraftRow } from "../api/adminCreatorDrafts.api";
import { AdminCreatorDraftsPage } from "./AdminCreatorDraftsPage";

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: true }),
}));

// AdminShell pulls in the full admin chrome (theme toggle, nav-badge queries,
// the auth-backed role switcher) that this list has no reason to exercise.
vi.mock("../../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

// A copy of the fixtures the test may edit for one case and restore after.
vi.mock("../adminCreatorDrafts.data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../adminCreatorDrafts.data")>();
  return {
    ...original,
    ADMIN_CREATOR_DRAFTS: [...original.ADMIN_CREATOR_DRAFTS],
  };
});

const ORIGINAL_ROWS: AdminCreatorDraftRow[] = [...ADMIN_CREATOR_DRAFTS];
const EVENT_DRAFT_ID = "5b1c7c1e-0001-4c55-9a51-000000000001";

/** Prints where the router is, so the test reads the URL from the page. */
function LocationProbe() {
  const location = useLocation();
  return (
    <span data-testid="location-path" data-search={location.search}>
      {location.pathname}
    </span>
  );
}

function currentSearch(): string {
  return screen.getByTestId("location-path").getAttribute("data-search") ?? "";
}

function currentPath(): string {
  return screen.getByTestId("location-path").textContent ?? "";
}

function renderAt(entry: string) {
  return render(
    <TestProviders initialEntries={[entry]}>
      <Routes>
        <Route
          path="/admin/creator-drafts"
          element={
            <>
              <AdminCreatorDraftsPage />
              <LocationProbe />
            </>
          }
        />
        <Route
          path="/admin/creator-drafts/:kind/:id"
          element={<LocationProbe />}
        />
      </Routes>
    </TestProviders>,
  );
}

afterEach(() => {
  ADMIN_CREATOR_DRAFTS.splice(0, ADMIN_CREATOR_DRAFTS.length, ...ORIGINAL_ROWS);
});

describe("AdminCreatorDraftsPage", () => {
  it("lists one row per demo draft with kind, title, who it is for, owner and last saved", async () => {
    renderAt("/admin/creator-drafts");
    const rows = await screen.findAllByRole("listitem");
    expect(rows).toHaveLength(7);
    const eventRow = rows.find((row) =>
      within(row).queryByText("Sunday picnic in Monsanto"),
    );
    expect(eventRow).toBeDefined();
    expect(
      within(eventRow!).getByText(/kind\.event|Event/),
    ).toBeInTheDocument();
    expect(within(eventRow!).getByText(/Rainbow Runners/)).toBeInTheDocument();
    expect(within(eventRow!).getByText(/Marta|Started by/)).toBeInTheDocument();
    expect(within(eventRow!).getByText(/3.*5|progress/)).toBeInTheDocument();
    expect(
      within(eventRow!).getByText(/Last saved|lastSaved/),
    ).toBeInTheDocument();
  });

  it("filters by kind through the URL", async () => {
    renderAt("/admin/creator-drafts");
    await userEvent.click(
      await screen.findByRole("tab", { name: /kind\.community|Community/ }),
    );
    await waitFor(() =>
      expect(screen.getAllByRole("listitem")).toHaveLength(1),
    );
    expect(currentSearch()).toBe("?kind=community");
  });

  it("names the kind when a filtered tab is empty and other kinds hold drafts", async () => {
    const communityIndex = ADMIN_CREATOR_DRAFTS.findIndex(
      (row) => row.kind === "community",
    );
    ADMIN_CREATOR_DRAFTS.splice(communityIndex, 1);

    renderAt("/admin/creator-drafts?kind=community");
    const emptyTitle = await screen.findByRole("heading", {
      name: /creatorDrafts\.emptyKind|Nobody has a draft open under Community/,
    });
    expect(emptyTitle).toBeInTheDocument();
    // The empty state carries the announcement alone.
    expect(screen.getAllByText(emptyTitle.textContent ?? "")).toHaveLength(1);
    expect(screen.queryByText("Nobody has a draft open right now")).toBeNull();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("reads an unknown kind in the URL as every kind", async () => {
    renderAt("/admin/creator-drafts?kind=nonsense");
    expect(await screen.findAllByRole("listitem")).toHaveLength(7);
    expect(
      screen.getByRole("tab", { name: /filter\.all|All/ }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("opens a draft's detail from its row", async () => {
    renderAt("/admin/creator-drafts?kind=event");
    await userEvent.click(
      await screen.findByRole("link", { name: /Sunday picnic in Monsanto/ }),
    );
    expect(currentPath()).toBe(`/admin/creator-drafts/event/${EVENT_DRAFT_ID}`);
  });

  it("shows the count in the header and no badge in the nav", async () => {
    renderAt("/admin/creator-drafts");
    const countLine = await screen.findByText("7 drafts in progress");
    expect(countLine).toHaveAttribute("role", "status");
    const navItem = ADMIN_NAV_SECTIONS.find(
      (section) => section.id === "communities",
    )?.items.at(-1);
    expect(navItem).toMatchObject({
      to: "/admin/creator-drafts",
      isAdminOnly: true,
    });
    expect(navItem).not.toHaveProperty("badge");
  });

  it("names an untitled draft and a draft with no owner", async () => {
    const eventIndex = ADMIN_CREATOR_DRAFTS.findIndex(
      (row) => row.kind === "event",
    );
    const eventRow = ADMIN_CREATOR_DRAFTS[eventIndex]!;
    ADMIN_CREATOR_DRAFTS[eventIndex] = {
      ...eventRow,
      title: null,
      owner: null,
    };

    renderAt("/admin/creator-drafts?kind=event");
    const [row] = await screen.findAllByRole("listitem");
    expect(row).toBeDefined();
    expect(
      within(row!).getByRole("link", {
        name: /creatorDrafts\.untitled|Untitled/,
      }),
    ).toHaveAttribute("href", `/admin/creator-drafts/event/${EVENT_DRAFT_ID}`);
    // Two untitled drafts read apart through the link's description.
    expect(within(row!).getByRole("link")).toHaveAccessibleDescription(
      "Event For Rainbow Runners Started by someone whose account is gone",
    );
    expect(
      within(row!).getByText(/unknownOwner|account is gone/),
    ).toBeInTheDocument();
    expect(within(row!).queryByRole("img")).toBeNull();
  });

  it("names up to three missing parts and folds the rest", async () => {
    const eventIndex = ADMIN_CREATOR_DRAFTS.findIndex(
      (row) => row.kind === "event",
    );
    const eventRow = ADMIN_CREATOR_DRAFTS[eventIndex]!;
    ADMIN_CREATOR_DRAFTS[eventIndex] = {
      ...eventRow,
      missing: ["what", "whenWhere", "who", "access", "care"],
    };

    renderAt("/admin/creator-drafts?kind=event");
    const [row] = await screen.findAllByRole("listitem");
    expect(within(row!).getByText(/\+2|moreMissing/)).toBeInTheDocument();
    expect(within(row!).queryByText(/^Care$/)).toBeNull();
  });
});
