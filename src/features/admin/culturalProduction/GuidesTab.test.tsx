import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { routes } from "../../../app/routeMap";
import { TestProviders } from "../../../test/TestProviders";
import {
  demoListCulturalGuides,
  resetDemoCulturalProduction,
} from "./culturalProductionDemoStore";
import { culturalGuidePath, culturalTabHref } from "./culturalProductionPaths";
import { GuidesTab } from "./GuidesTab";
import { isEditingFromRouterState } from "./guidesTab.data";

// TestProviders forces demo mode, so the tab reads and writes the demo
// store, seeded with the four starter guides.

/** What the guide route draws: the path it landed on and whether the
 *  router state asked for the editor. */
function GuideRouteProbe() {
  const location = useLocation();
  return (
    <p data-testid="guide-route">
      {location.pathname}{" "}
      {isEditingFromRouterState(location.state) ? "editing" : "reading"}
    </p>
  );
}

function renderGuidesTab() {
  const user = userEvent.setup();
  render(
    <TestProviders initialEntries={[culturalTabHref("guides")]}>
      <Routes>
        <Route path={routes.adminCulturalProduction} element={<GuidesTab />} />
        <Route path={routes.adminCulturalGuide} element={<GuideRouteProbe />} />
      </Routes>
    </TestProviders>,
  );
  return user;
}

/** The guide cards' link names, in the order they show. */
async function cardNames(prefix: RegExp) {
  const links = await screen.findAllByRole("link", { name: prefix });
  return links.map((link) => link.getAttribute("aria-label"));
}

describe("GuidesTab (demo)", () => {
  beforeEach(() => resetDemoCulturalProduction());
  afterEach(() => window.localStorage.clear());

  it("lists four demo guides with the English ones first", async () => {
    renderGuidesTab();
    expect(await cardNames(/^Open the guide /)).toEqual([
      "Open the guide Board game night",
      "Open the guide Quiz night",
      "Open the guide Noite de jogos de tabuleiro",
      "Open the guide Noite de quiz",
    ]);
    expect(
      screen.getByRole("link", { name: "Open the guide Quiz night" }),
    ).toHaveAttribute("href", culturalGuidePath("demo-guide-quiz-en"));
    expect(
      screen.getAllByText("Starter guide from the QueerPulse team"),
    ).toHaveLength(4);
  });

  it("lists the Portuguese ones first in PT", async () => {
    window.localStorage.setItem("qp.lang", "pt");
    renderGuidesTab();
    expect(await cardNames(/^Abrir o guia /)).toEqual([
      "Abrir o guia Noite de jogos de tabuleiro",
      "Abrir o guia Noite de quiz",
      "Abrir o guia Board game night",
      "Abrir o guia Quiz night",
    ]);
  });

  it("adds a guide and opens it in edit mode", async () => {
    const user = renderGuidesTab();
    await screen.findByRole("link", { name: "Open the guide Quiz night" });

    await user.click(screen.getByRole("button", { name: "Add guide" }));
    const dialog = await screen.findByRole("dialog", { name: "Add a guide" });
    // The language starts on the app language.
    expect(
      within(dialog).getByRole("button", { name: "Language" }),
    ).toHaveTextContent("English");

    await user.type(within(dialog).getByLabelText(/^Title/), "Film night");
    await user.click(
      within(dialog).getByRole("button", { name: "Event type" }),
    );
    await user.click(await screen.findByRole("option", { name: "Film night" }));
    await user.type(
      within(dialog).getByLabelText(/^Summary/),
      "How we run a film night",
    );
    await user.click(within(dialog).getByRole("button", { name: "Add guide" }));

    const added = demoListCulturalGuides().items.find(
      (guide) => guide.title === "Film night",
    );
    expect(added).toMatchObject({
      eventType: "film_night",
      locale: "en",
      summary: "How we run a film night",
    });
    await waitFor(() =>
      expect(screen.getByTestId("guide-route")).toHaveTextContent(
        `${culturalGuidePath(added?.id ?? "")} editing`,
      ),
    );
    expect(
      await screen.findByText("Guide added. Add its sections next"),
    ).toBeInTheDocument();
  });

  it("names the missing title and sends nothing", async () => {
    const user = renderGuidesTab();
    await screen.findByRole("link", { name: "Open the guide Quiz night" });

    await user.click(screen.getByRole("button", { name: "Add guide" }));
    const dialog = await screen.findByRole("dialog", { name: "Add a guide" });
    await user.click(within(dialog).getByRole("button", { name: "Add guide" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Give it a title",
    );
    expect(demoListCulturalGuides().items).toHaveLength(4);
  });
});
