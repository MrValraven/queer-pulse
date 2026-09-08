import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { AdminSidebar } from "./AdminSidebar";

/** Surfaces the router's current path so a navigation is assertable. */
function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>;
}

function renderRail() {
  return render(
    <TestProviders initialEntries={["/admin"]}>
      <AdminSidebar />
      <Where />
    </TestProviders>,
  );
}

/** The desktop rail with its collapse toggle live, as AdminShell wires it. */
function CollapsibleRail() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <AdminSidebar
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed((collapsed) => !collapsed)}
    />
  );
}

/** The rail's own <nav>, so a query never picks up the probe beside it. */
function rail() {
  return screen.getByRole("navigation", { name: "Admin sections" });
}

describe("admin rail search", () => {
  it("narrows the rail to what matches", async () => {
    const user = userEvent.setup();
    renderRail();
    expect(
      await screen.findByRole("link", { name: /Moderation/ }),
    ).toBeInTheDocument();

    await user.type(
      screen.getByRole("searchbox", { name: "Search admin pages" }),
      "housing review",
    );

    expect(
      within(rail()).getByRole("link", { name: /Housing review/ }),
    ).toBeInTheDocument();
    expect(
      within(rail()).queryByRole("link", { name: /Moderation/ }),
    ).not.toBeInTheDocument();
  });

  it("surfaces a match from a section that is shut, under its heading", async () => {
    const user = userEvent.setup();
    renderRail();
    // Site content starts shut: its links are only reachable by opening it.
    const heading = await screen.findByRole("button", { name: /Site content/ });
    expect(heading).toHaveAttribute("aria-expanded", "false");

    await user.type(
      screen.getByRole("searchbox", { name: "Search admin pages" }),
      "site content",
    );

    // Results are a flat list: the heading is text now, with no toggle to shut.
    expect(
      within(rail()).queryByRole("button", { name: /Site content/ }),
    ).not.toBeInTheDocument();
    expect(within(rail()).getByText("Site content")).toBeInTheDocument();
    expect(within(rail()).getAllByRole("link").length).toBeGreaterThan(0);
  });

  it("opens the first match on Enter and clears the query", async () => {
    const user = userEvent.setup();
    renderRail();
    const field = await screen.findByRole("searchbox", {
      name: "Search admin pages",
    });

    await user.type(field, "moderation{Enter}");

    expect(screen.getByTestId("where")).toHaveTextContent("/admin/moderation");
    expect(field).toHaveValue("");
    // Query gone means the sections are back rather than a stale narrowing.
    expect(
      within(rail()).getByRole("button", { name: /Site content/ }),
    ).toBeInTheDocument();
  });

  it("says so when nothing matches, and offers no links to open", async () => {
    const user = userEvent.setup();
    renderRail();
    await user.type(
      await screen.findByRole("searchbox", { name: "Search admin pages" }),
      "zzzz",
    );

    expect(
      within(rail()).getByText("No admin page matches that."),
    ).toBeInTheDocument();
    expect(within(rail()).queryAllByRole("link")).toHaveLength(0);
  });

  it("restores the sections on Escape", async () => {
    const user = userEvent.setup();
    renderRail();
    const field = await screen.findByRole("searchbox", {
      name: "Search admin pages",
    });

    await user.type(field, "housing");
    expect(
      within(rail()).queryByRole("button", { name: /Site content/ }),
    ).not.toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(field).toHaveValue("");
    expect(
      within(rail()).getByRole("button", { name: /Site content/ }),
    ).toBeInTheDocument();
  });

  it("offers a search button instead of a field once the rail is icons", async () => {
    const user = userEvent.setup();
    render(
      <TestProviders initialEntries={["/admin"]}>
        <CollapsibleRail />
      </TestProviders>,
    );

    const trigger = await screen.findByRole("button", {
      name: "Search admin pages",
    });
    expect(
      screen.queryByRole("searchbox", { name: "Search admin pages" }),
    ).not.toBeInTheDocument();

    // Pressing it widens the rail, and the field it asked for takes focus.
    await user.click(trigger);

    const field = await screen.findByRole("searchbox", {
      name: "Search admin pages",
    });
    expect(field).toHaveFocus();
  });
});
