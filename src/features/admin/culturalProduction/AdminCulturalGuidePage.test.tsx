import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { routes } from "../../../app/routeMap";
import { TestProviders } from "../../../test/TestProviders";
import { AdminCulturalGuidePage } from "./AdminCulturalGuidePage";
import { culturalReasonOf } from "./api/culturalProduction.types";
import {
  demoGetCulturalGuide,
  resetDemoCulturalProduction,
} from "./culturalProductionDemoStore";
import { culturalGuidePath, culturalTabHref } from "./culturalProductionPaths";

// TestProviders forces demo mode, so the page reads and writes the demo
// store, seeded with the four starter guides.

const QUIZ_GUIDE_ID = "demo-guide-quiz-en";

/** What the Cultural Production route draws: where it landed. */
function ProductionRouteProbe() {
  const location = useLocation();
  return (
    <p data-testid="production-route">
      {location.pathname}
      {location.search}
    </p>
  );
}

function renderGuidePage(guideId: string = QUIZ_GUIDE_ID) {
  const user = userEvent.setup();
  render(
    <TestProviders initialEntries={[culturalGuidePath(guideId)]}>
      <Routes>
        <Route
          path={routes.adminCulturalGuide}
          element={<AdminCulturalGuidePage />}
        />
        <Route
          path={routes.adminCulturalProduction}
          element={<ProductionRouteProbe />}
        />
      </Routes>
    </TestProviders>,
  );
  return user;
}

/** A section's panel, which the page labels by its heading. */
function sectionRegion(heading: string) {
  return screen.getByRole("region", { name: heading });
}

/** The checklist step in a section whose text is `text`. */
function stepOf(heading: string, text: string) {
  const checklist = within(sectionRegion(heading)).getByRole("list", {
    name: "Checklist",
  });
  const step = within(checklist)
    .getAllByRole("listitem")
    .find((item) => item.textContent?.includes(text));
  if (step === undefined) throw new Error(`No step reads "${text}"`);
  return step;
}

/** The reason a demo read of the guide answers with, or null while it is
 *  still there. */
function readReasonOf(guideId: string) {
  try {
    demoGetCulturalGuide(guideId);
    return null;
  } catch (cause) {
    return culturalReasonOf(cause);
  }
}

describe("AdminCulturalGuidePage (demo)", () => {
  beforeEach(() => resetDemoCulturalProduction());

  it("renders the quiz guide's sections and checklist", async () => {
    renderGuidePage();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Quiz night" }),
    ).toBeInTheDocument();
    for (const heading of [
      "The night in short",
      "Venue",
      "Questions",
      "Hosts",
      "Promotion",
      "The night itself",
      "Wrap-up",
    ]) {
      expect(
        screen.getByRole("heading", { level: 2, name: heading }),
      ).toBeInTheDocument();
    }
    const contents = screen.getByRole("navigation", { name: "Sections" });
    expect(within(contents).getAllByRole("link")).toHaveLength(7);
    expect(
      stepOf(
        "Questions",
        "Pick a quiz in Quiz templates or plan the rounds from scratch",
      ),
    ).toHaveTextContent("28 days before the event");
    expect(
      screen.getByText("Starter guide from the QueerPulse team"),
    ).toBeInTheDocument();
  });

  it("links Quiz templates inside the questions section", async () => {
    renderGuidePage();
    await screen.findByRole("heading", { level: 1, name: "Quiz night" });
    expect(
      within(sectionRegion("Questions")).getByRole("link", {
        name: "Quiz templates",
      }),
    ).toHaveAttribute("href", "/admin/quizshow/templates");
  });

  it("labels a step 3 days before the event and one 1 day after", async () => {
    renderGuidePage();
    await screen.findByRole("heading", { level: 1, name: "Quiz night" });
    expect(
      stepOf(
        "Questions",
        "Play the whole quiz once on the screen and the remote",
      ),
    ).toHaveTextContent("3 days before the event");
    expect(
      stepOf("Wrap-up", "Thank the venue and the hosts"),
    ).toHaveTextContent("1 day after the event");
    expect(stepOf("The night itself", "Pack the laptop")).toHaveTextContent(
      "On the day of the event",
    );
  });

  it("opens the editor from Edit guide", async () => {
    const user = renderGuidePage();
    await screen.findByRole("heading", { level: 1, name: "Quiz night" });

    await user.click(screen.getByRole("button", { name: "Edit guide" }));

    expect(
      await screen.findByRole("button", { name: "Save guide" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Edit guide" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("deletes the guide after confirming and returns to the guides tab", async () => {
    const user = renderGuidePage();
    await screen.findByRole("heading", { level: 1, name: "Quiz night" });

    await user.click(
      screen.getByRole("button", { name: "More guide actions" }),
    );
    await user.click(
      await screen.findByRole("menuitem", { name: "Delete guide" }),
    );
    const confirm = await screen.findByRole("dialog", {
      name: "Delete this guide?",
    });
    expect(confirm).toHaveTextContent(
      "Tasks made from it stay on the task list.",
    );
    // Nothing goes before the confirm.
    expect(readReasonOf(QUIZ_GUIDE_ID)).toBeNull();
    await user.click(
      within(confirm).getByRole("button", { name: "Delete guide" }),
    );

    await waitFor(() =>
      expect(screen.getByTestId("production-route")).toHaveTextContent(
        culturalTabHref("guides"),
      ),
    );
    expect(readReasonOf(QUIZ_GUIDE_ID)).toBe("CULTURAL_GUIDE_NOT_FOUND");
    expect(await screen.findByText("Guide deleted")).toBeInTheDocument();
  });

  it("shows not found for an unknown id", async () => {
    renderGuidePage("demo-guide-missing");
    expect(
      await screen.findByText("This guide isn't here anymore"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Someone deleted it, or the link has a typo"),
    ).toBeInTheDocument();
    const backLinks = screen.getAllByRole("link", { name: "Back to guides" });
    expect(backLinks.length).toBeGreaterThan(0);
    for (const link of backLinks) {
      expect(link).toHaveAttribute("href", culturalTabHref("guides"));
    }
    expect(
      screen.queryByRole("button", { name: "Edit guide" }),
    ).not.toBeInTheDocument();
  });
});
