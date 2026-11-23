import type { ReactNode } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "../../../app/routeMap";
import { CULTURAL_PRODUCTION_NAV_TO } from "../../../shared/components/layout/adminNav.data";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { AdminCulturalProductionPage } from "./AdminCulturalProductionPage";
import { resetDemoCulturalProduction } from "./culturalProductionDemoStore";

// TestProviders forces demo mode, so every read comes from the demo store.

// AdminShell pulls in the full admin chrome (theme toggle, nav-badge queries,
// the auth-backed role switcher) that this page has no reason to exercise.
vi.mock("../../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const IDEA_ID = "demo-idea-drag-bingo";
const IDEA_TITLE = "Drag bingo at a bar in Anjos";
const TASK_ID = "demo-task-bingo-venue";
const TASK_TITLE = "Ask three bars in Anjos about a Tuesday night";

/** Prints the current search params, so a test can read the URL. */
function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
}

async function renderPage(entry: string = routes.adminCulturalProduction) {
  render(
    <TestProviders initialEntries={[entry]}>
      <Routes>
        <Route
          path={routes.adminCulturalProduction}
          element={
            <>
              <AdminCulturalProductionPage />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </TestProviders>,
  );
  // The tab labels and the heading read the lazily loaded admin catalog.
  await awaitCatalog("admin", "shared");
  return userEvent.setup();
}

const tabNamed = (name: RegExp) => screen.getByRole("tab", { name });

function searchParams(): URLSearchParams {
  return new URLSearchParams(
    screen.getByTestId("location-search").textContent ?? "",
  );
}

describe("AdminCulturalProductionPage", () => {
  beforeEach(() => resetDemoCulturalProduction());

  it("opens on the Ideas tab", async () => {
    await renderPage();
    expect(
      screen.getByRole("heading", { name: "Cultural Production" }),
    ).toBeTruthy();
    expect(tabNamed(/^Ideas/).getAttribute("aria-selected")).toBe("true");
    expect(tabNamed(/^Tasks/).getAttribute("aria-selected")).toBe("false");
    expect(screen.getByRole("tabpanel").id).toBe(
      "cultural-production-panel-ideas",
    );
  });

  it("renders the Tasks tab from the nav link", async () => {
    await renderPage(CULTURAL_PRODUCTION_NAV_TO);
    expect(tabNamed(/^Tasks/).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").id).toBe(
      "cultural-production-panel-tasks",
    );
    expect(searchParams().get("assignedTo")).toBe("me");
  });

  it("shows the due count on the Tasks tab", async () => {
    await renderPage();
    const tasksTab = tabNamed(/^Tasks/);
    expect(
      await within(tasksTab).findByText(
        "2 of your tasks are due today or overdue",
      ),
    ).toBeTruthy();
    const pill = within(tasksTab).getByText("2");
    expect(pill.getAttribute("data-tone")).toBe("alert");
    expect(pill.getAttribute("aria-hidden")).toBe("true");
  });

  it("opens the idea drawer from ?idea=", async () => {
    await renderPage(`${routes.adminCulturalProduction}?idea=${IDEA_ID}`);
    const drawer = await screen.findByRole("dialog");
    expect(await within(drawer).findByText(IDEA_TITLE)).toBeTruthy();
    expect(tabNamed(/^Ideas/).getAttribute("aria-selected")).toBe("true");
  });

  it("opens the task drawer from ?task= and closes it on Escape", async () => {
    const user = await renderPage(
      `${routes.adminCulturalProduction}?tab=tasks&task=${TASK_ID}`,
    );
    const drawer = await screen.findByRole("dialog");
    expect(await within(drawer).findByText(TASK_TITLE)).toBeTruthy();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(searchParams().get("task")).toBeNull();
  });

  it("keeps the tab when a drawer closes", async () => {
    const user = await renderPage(
      `${routes.adminCulturalProduction}?tab=tasks&task=${TASK_ID}`,
    );
    const drawer = await screen.findByRole("dialog");
    // The drawer's own close button comes first in its head.
    const [closeButton] = within(drawer).getAllByRole("button", {
      name: "Close",
    });
    if (closeButton === undefined) throw new Error("Expected a Close button");
    await user.click(closeButton);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(searchParams().get("tab")).toBe("tasks");
    expect(tabNamed(/^Tasks/).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").id).toBe(
      "cultural-production-panel-tasks",
    );
  });
});
