import type { ReactNode } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "../../../app/routeMap";
import { TestProviders } from "../../../test/TestProviders";
import { AdminLeadsPage } from "./AdminLeadsPage";
import {
  demoAssignLeadStaff,
  demoLeadDueCount,
  demoUnassignLeadStaff,
  resetDemoLeads,
} from "./leadsDemoStore";
import { DEMO_LEAD_VIEWER_ID } from "./leadsDemoViewer";

// TestProviders forces demo mode, so the list reads the demo leads store.

// AdminShell pulls in the full admin chrome (theme toggle, nav-badge queries,
// the auth-backed role switcher) that this list has no reason to exercise.
vi.mock("../../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const ROW_NAME = /^Open /;

/** Prints the current search params, so a test can read the URL. */
function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
}

function renderPage(entry: string = routes.adminLeads) {
  render(
    <TestProviders initialEntries={[entry]}>
      <Routes>
        <Route
          path={routes.adminLeads}
          element={
            <>
              <AdminLeadsPage />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </TestProviders>,
  );
  return userEvent.setup();
}

/** The whole row around a row's "Open <name>" link. */
function rowOf(link: HTMLElement): HTMLElement {
  const row = link.closest("li");
  if (row === null) throw new Error("Expected the link inside a row");
  return row;
}

function rowLabels(): (string | null)[] {
  return screen
    .getAllByRole("link", { name: ROW_NAME })
    .map((row) => row.getAttribute("aria-label"));
}

describe("AdminLeadsPage In charge", () => {
  beforeEach(() => resetDemoLeads());

  it("lists only the viewer's leads on Assigned to me", async () => {
    renderPage(`${routes.adminLeads}?assignedTo=me`);
    await waitFor(() =>
      expect([...rowLabels()].sort()).toEqual([
        "Open Afterhours",
        "Open Coletivo Maré",
        "Open Livraria Pó",
        "Open Lua Marques",
      ]),
    );
  });

  it("matches the badge on the mine and unassigned view", async () => {
    renderPage(`${routes.adminLeads}?assignedTo=me_or_unassigned`);
    // The tile's count is aria-hidden; "3 waiting" is its AdminStat delta.
    const dueTile = await screen.findByRole("button", {
      name: /^Follow-up due/,
    });
    await waitFor(() =>
      expect(dueTile).toHaveAccessibleName(/^Follow-up due\s*3 waiting$/),
    );
    expect(demoLeadDueCount().count).toBe(3);
  });

  it("stacks three avatars with +2 and names them on Afterhours", async () => {
    renderPage();
    const row = rowOf(
      await screen.findByRole("link", { name: "Open Afterhours" }),
    );
    expect(within(row).getByText("+2")).toBeInTheDocument();
    expect(
      within(row).getByText(
        "In charge: Marta Lobo, Rafa Quintas, Joana Vidal and 2 more",
      ),
    ).toBeInTheDocument();
  });

  it("names You on the viewer's leads and draws nothing on an unassigned one", async () => {
    renderPage();
    expect(
      within(
        rowOf(await screen.findByRole("link", { name: "Open Lua Marques" })),
      ).getByText("In charge: You and Marta Lobo"),
    ).toBeInTheDocument();
    expect(
      within(
        rowOf(screen.getByRole("link", { name: "Open Cave 23" })),
      ).queryByText(/^In charge:/),
    ).not.toBeInTheDocument();
  });

  it("names an empty Assigned to me view and shows everyone", async () => {
    for (const leadId of [
      "demo-lead-lua-marques",
      "demo-lead-afterhours",
      "demo-lead-livraria-po",
      "demo-lead-coletivo-mare",
    ]) {
      demoUnassignLeadStaff(leadId, DEMO_LEAD_VIEWER_ID);
    }
    const user = renderPage(`${routes.adminLeads}?assignedTo=me`);
    expect(
      await screen.findByText("No leads are assigned to you"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Show everyone" }));
    await waitFor(() => expect(rowLabels()).toHaveLength(12));
    expect(screen.getByTestId("location-search")).toBeEmptyDOMElement();
  });

  it("names an empty Unassigned view", async () => {
    for (const leadId of [
      "demo-lead-cave-23",
      "demo-lead-zine-tinta",
      "demo-lead-mc-aurora",
    ]) {
      demoAssignLeadStaff(leadId, { userId: DEMO_LEAD_VIEWER_ID });
    }
    renderPage(`${routes.adminLeads}?assignedTo=unassigned`);
    expect(
      await screen.findByText("Every lead has someone in charge"),
    ).toBeInTheDocument();
  });

  it("falls back to the filtered state when another filter is set", async () => {
    renderPage(`${routes.adminLeads}?assignedTo=me&type=venue`);
    expect(
      await screen.findByText("No leads match these filters"),
    ).toBeInTheDocument();
  });
});
