import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { routes } from "../../../app/routeMap";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { LEAD_ASSIGNEE_PHONE_QUERY } from "./leadAssignees.data";
import { LeadAssigneeFilter } from "./LeadAssigneeFilter";
import { useLeadListFilters } from "./useLeadListFilters";

/** Prints the current search params, so a test can read the URL. */
function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location-search">{location.search}</output>;
}

function FilterHarness() {
  return <LeadAssigneeFilter controls={useLeadListFilters()} />;
}

async function renderFilter(entry: string) {
  const user = userEvent.setup();
  render(
    <TestProviders initialEntries={[entry]}>
      <Routes>
        <Route
          path={routes.adminLeads}
          element={
            <>
              <FilterHarness />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </TestProviders>,
  );
  await awaitCatalog("admin");
  return user;
}

describe("LeadAssigneeFilter", () => {
  afterEach(() => vi.restoreAllMocks());

  it("marks Everyone on the plain list", async () => {
    await renderFilter("/admin/leads");
    expect(
      screen.getByRole("group", { name: "In charge" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Everyone" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("writes the chosen view to the URL", async () => {
    const user = await renderFilter("/admin/leads");
    await user.click(
      screen.getByRole("button", { name: "Mine and unassigned" }),
    );
    expect(screen.getByTestId("location-search")).toHaveTextContent(
      "?assignedTo=me_or_unassigned",
    );
    expect(
      screen.getByRole("button", { name: "Mine and unassigned" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("goes back to Everyone", async () => {
    const user = await renderFilter("/admin/leads?assignedTo=me");
    await user.click(screen.getByRole("button", { name: "Everyone" }));
    expect(screen.getByTestId("location-search")).toBeEmptyDOMElement();
  });

  it("folds into a select on a phone", async () => {
    // Only the phone query matches; every other query keeps the desktop answer.
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query === LEAD_ASSIGNEE_PHONE_QUERY,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList,
    );
    await renderFilter("/admin/leads?assignedTo=unassigned");
    expect(
      screen.queryByRole("button", { name: "Assigned to me" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("In charge")).toBeInTheDocument();
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });
});
