import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { loadNamespace } from "../../../../shared/i18n/catalogs";
import { TestProviders } from "../../../../test/TestProviders";
import { EVENT_LIFECYCLE_STATES } from "./communitiesLanding.data";
import { CommunitiesTryIt } from "./CommunitiesTryIt";

function renderTryIt() {
  return render(
    <TestProviders>
      <CommunitiesTryIt />
    </TestProviders>,
  );
}

afterEach(() => {
  localStorage.clear();
});

describe("CommunitiesTryIt", () => {
  it("the four states in order", async () => {
    const catalog = await loadNamespace("en", "forCommunities");
    const expectedLabels = EVENT_LIFECYCLE_STATES.map(
      (state) => catalog[`tryIt.state.${state}`],
    );
    renderTryIt();
    const tablist = await screen.findByRole("tablist", {
      name: "Moment in the event's life",
    });
    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent?.trim())).toEqual(expectedLabels);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");

    const user = userEvent.setup();
    tabs[0]!.focus();
    await user.keyboard("{End}");
    const photosTab = within(tablist).getByRole("tab", { name: "Photos" });
    expect(photosTab).toHaveAttribute("aria-selected", "true");

    const panel = await screen.findByRole("tabpanel", { name: "Photos" });
    expect(await within(panel).findByText("Event photos")).toBeInTheDocument();
    expect(panel.querySelectorAll("li img").length).toBeGreaterThanOrEqual(4);
    expect(panel.textContent ?? "").not.toMatch(/write-up|attended/i);
  });

  it("the lineup state shows the bill with each craft", async () => {
    renderTryIt();
    const tablist = await screen.findByRole("tablist", {
      name: "Moment in the event's life",
    });
    const user = userEvent.setup();
    await user.click(within(tablist).getByRole("tab", { name: "Lineup" }));
    const panel = await screen.findByRole("tabpanel", { name: "Lineup" });
    expect(await within(panel).findByText("Mara Sol")).toBeInTheDocument();
    expect(within(panel).getByText("Dona Faísca")).toBeInTheDocument();
  });
});
