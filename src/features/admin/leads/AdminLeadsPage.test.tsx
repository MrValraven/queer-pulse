import type { ReactNode } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "../../../app/routeMap";
import { TestProviders } from "../../../test/TestProviders";
import { AdminLeadsPage } from "./AdminLeadsPage";
import { adminLeadPath } from "./leadPaths";
import { resetDemoLeads } from "./leadsDemoStore";

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

/** Stands in for the admin rail's Leads item: a link to the bare list
 *  path, which keeps the page mounted. */
const NAV_LINK_NAME = "Leads nav item";

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
              <Link to={routes.adminLeads}>{NAV_LINK_NAME}</Link>
            </>
          }
        />
      </Routes>
    </TestProviders>,
  );
  return userEvent.setup();
}

/** The element at `index`, failing the test by name when the list is
 *  shorter. */
function elementAt(elements: HTMLElement[], index: number): HTMLElement {
  const element = elements.at(index);
  if (element === undefined) {
    throw new Error(`Expected an element at index ${index}`);
  }
  return element;
}

function rowLabels(): (string | null)[] {
  return screen
    .getAllByRole("link", { name: ROW_NAME })
    .map((row) => row.getAttribute("aria-label"));
}

describe("AdminLeadsPage", () => {
  beforeEach(() => resetDemoLeads());

  it("lists due follow-ups first with the due date in the warn tone", async () => {
    renderPage();
    const rows = await screen.findAllByRole("link", { name: ROW_NAME });
    expect(
      rows.slice(0, 4).map((row) => row.getAttribute("aria-label")),
    ).toEqual([
      "Open Cave 23",
      "Open Lua Marques",
      "Open Coletivo Maré",
      "Open Kai Duarte",
    ]);
    const firstRow = elementAt(rows, 0);
    expect(
      within(firstRow)
        .getByText(/Follow-up due/)
        .closest("[data-due]"),
    ).not.toBeNull();
    const fifthRow = elementAt(rows, 4);
    expect(within(fifthRow).queryByText(/Follow-up due/)).toBeNull();
  });

  it("filters by stage with counted chips", async () => {
    const user = renderPage();
    await screen.findAllByRole("link", { name: ROW_NAME });
    expect(
      screen.getByRole("button", { name: "All, 12 leads" }),
    ).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "On board, 2 leads" }));
    await waitFor(() => expect(rowLabels()).toHaveLength(2));
    expect([...rowLabels()].sort()).toEqual([
      "Open Afterhours",
      "Open Vanda Diesel",
    ]);
    expect(
      screen.getByRole("button", { name: "On board, 2 leads" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("location-search")).toHaveTextContent(
      "stage=on_board",
    );
  });

  it("shows only due leads with Follow-up due", async () => {
    const user = renderPage();
    await screen.findAllByRole("link", { name: ROW_NAME });
    await user.click(screen.getByRole("switch", { name: "Follow-up due" }));
    await waitFor(() => expect(rowLabels()).toHaveLength(4));
    for (const row of screen.getAllByRole("link", { name: ROW_NAME })) {
      expect(within(row).getByText(/Follow-up due/)).toBeInTheDocument();
    }
    expect(screen.getByTestId("location-search")).toHaveTextContent("due=1");
  });

  it("names an empty filter and clears it", async () => {
    const user = renderPage();
    await screen.findAllByRole("link", { name: ROW_NAME });
    await user.type(
      screen.getByRole("searchbox", { name: "Search leads" }),
      "zzzz",
    );
    expect(
      await screen.findByRole("heading", {
        name: "No leads match these filters",
      }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId("location-search")).toHaveTextContent("q=zzzz"),
    );
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await waitFor(() => expect(rowLabels()).toHaveLength(12));
    expect(screen.getByRole("searchbox", { name: "Search leads" })).toHaveValue(
      "",
    );
    expect(screen.getByTestId("location-search")).toBeEmptyDOMElement();
  });

  it("empties the search when the nav link drops the filters", async () => {
    const user = renderPage(`${routes.adminLeads}?q=cave&stage=in_talks`);
    const searchField = await screen.findByRole("searchbox", {
      name: "Search leads",
    });
    expect(searchField).toHaveValue("cave");
    await waitFor(() => expect(rowLabels()).toEqual(["Open Cave 23"]));
    await user.click(screen.getByRole("link", { name: NAV_LINK_NAME }));
    await waitFor(() => expect(searchField).toHaveValue(""));
    await waitFor(() => expect(rowLabels()).toHaveLength(12));
    expect(screen.getByTestId("location-search")).toBeEmptyDOMElement();
    // Past the search pause, nothing writes the old text back.
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(screen.getByTestId("location-search")).toBeEmptyDOMElement();
    expect(searchField).toHaveValue("");
  });

  it("clears the search, stage and type together", async () => {
    const user = renderPage(
      `${routes.adminLeads}?stage=on_board&type=artist&q=zzzz`,
    );
    expect(
      await screen.findByRole("heading", {
        name: "No leads match these filters",
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await waitFor(() => expect(rowLabels()).toHaveLength(12));
    expect(screen.getByTestId("location-search")).toBeEmptyDOMElement();
    // Past the search pause, nothing brings a cleared filter back.
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(screen.getByTestId("location-search")).toBeEmptyDOMElement();
    expect(screen.getByRole("searchbox", { name: "Search leads" })).toHaveValue(
      "",
    );
    expect(
      screen.getByRole("button", { name: "All, 12 leads" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("opens a lead from its row", async () => {
    renderPage();
    const row = await screen.findByRole("link", { name: "Open Cave 23" });
    expect(row).toHaveAttribute("href", adminLeadPath("demo-lead-cave-23"));
  });

  it("says when there are no leads at all", async () => {
    resetDemoLeads({ leads: [] });
    const user = renderPage();
    expect(
      await screen.findByRole("heading", { name: "No leads yet" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("No leads match these filters")).toBeNull();
    const addButtons = screen.getAllByRole("button", { name: "Add lead" });
    expect(addButtons).toHaveLength(2);
    await user.click(elementAt(addButtons, 1));
    expect(
      await screen.findByRole("dialog", { name: "Add lead" }),
    ).toBeInTheDocument();
  });
});
