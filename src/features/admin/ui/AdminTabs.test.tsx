import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { AdminTabs, type AdminTab } from "./AdminTabs";

function renderTabs(tabs: AdminTab[], active = tabs[0]?.id ?? "") {
  return render(
    <TestProviders>
      <AdminTabs tabs={tabs} active={active} onChange={vi.fn()} />
    </TestProviders>,
  );
}

describe("AdminTabs", () => {
  it("marks the active tab with aria-selected", () => {
    renderTabs(
      [
        { id: "open", label: "Open" },
        { id: "closed", label: "Closed" },
      ],
      "closed",
    );
    expect(screen.getByRole("tab", { name: "Closed" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Open" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it('renders the alert tone on a count pill when tone is "alert"', () => {
    renderTabs([
      { id: "overdue", label: "Overdue", count: 4, tone: "alert" },
      { id: "all", label: "All", count: 9 },
    ]);
    const alertPill = screen.getByText("4");
    const neutralPill = screen.getByText("9");
    // CSS modules are no-ops under Vitest, so the tone is read from the
    // data attribute that sits beside the alert class.
    expect(alertPill).toHaveAttribute("data-tone", "alert");
    expect(neutralPill).not.toHaveAttribute("data-tone");
  });

  it("shows the unavailable mark when isCountUnavailable and no count", async () => {
    renderTabs([{ id: "queue", label: "Queue", isCountUnavailable: true }]);
    await awaitCatalog("admin");
    expect(screen.getByText("count unavailable")).toBeInTheDocument();
  });

  it("renders countLabel as the pill text and hides the raw number", () => {
    renderTabs([
      { id: "queue", label: "Queue", count: 200, countLabel: "200+" },
    ]);
    expect(screen.getByText("200+")).toBeInTheDocument();
    expect(screen.queryByText("200")).not.toBeInTheDocument();
  });

  it("hides the visible pill and reads countAriaLabel when it is set", () => {
    renderTabs([
      { id: "queue", label: "Queue", count: 12, countAriaLabel: "12 pending" },
    ]);
    expect(screen.getByText("12")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("12 pending")).toHaveClass("visuallyHidden");
  });

  it("names the tablist with label", () => {
    render(
      <TestProviders>
        <AdminTabs
          tabs={[{ id: "a", label: "A" }]}
          active="a"
          onChange={vi.fn()}
          label="Queue view"
        />
      </TestProviders>,
    );
    expect(screen.getByRole("tablist", { name: "Queue view" })).toBeVisible();
  });
});
