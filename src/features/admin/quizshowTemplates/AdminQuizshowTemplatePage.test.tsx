import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { adminQuizshowTemplatePath, routes } from "../../../app/routeMap";
import { TestProviders } from "../../../test/TestProviders";
import { resetQuizshowDemoStore } from "../../quizshow/api/quizshowDemoStore";
import { QUIZSHOW_DEMO_TEMPLATE_IDS } from "../../quizshow/demo/quizshowTemplates.data";
import { AdminQuizshowTemplatePage } from "./AdminQuizshowTemplatePage";

// The page renders the studio full screen; it must never mount the admin console.
vi.mock("../../../shared/components/layout/AdminShell", () => ({
  AdminShell: () => <p data-testid="admin-shell" />,
}));

const PRIDE_TITLE = "Pride and queer history";
const EUROVISION_TITLE = "Eurovision";
const UNKNOWN_TEMPLATE_ID = "a7e3b1c0-5eed-4000-8000-0000000000ff";

function renderTemplatePage(templateId: string) {
  return render(
    <TestProviders initialEntries={[adminQuizshowTemplatePath(templateId)]}>
      <Routes>
        <Route
          path={routes.adminQuizshowTemplate}
          element={<AdminQuizshowTemplatePage />}
        />
      </Routes>
      <Link
        to={adminQuizshowTemplatePath(QUIZSHOW_DEMO_TEMPLATE_IDS.eurovision)}
      >
        Go to Eurovision
      </Link>
    </TestProviders>,
  );
}

/** The English input of the template card's title. */
async function findCardTitleEnglishField(): Promise<HTMLElement> {
  const cardTitleGroup = await screen.findByRole("group", {
    name: "Card title",
  });
  return within(cardTitleGroup).getByRole("textbox", { name: /^EN/ });
}

/** Every way back (the top bar's, and a gone template's action) goes to the list. */
function expectBackToTheList(): void {
  const backLinks = screen.getAllByRole("link", {
    name: "Back to quiz templates",
  });
  expect(backLinks.length).toBeGreaterThan(0);
  for (const backLink of backLinks) {
    expect(backLink.getAttribute("href")).toBe(routes.adminQuizshowTemplates);
  }
}

describe("AdminQuizshowTemplatePage", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens a template in the full-screen studio with a link back to the list", async () => {
    renderTemplatePage(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory);

    expect(
      await screen.findByRole("heading", { level: 1, name: "Quiz editor" }),
    ).toBeTruthy();
    expect(screen.queryByTestId("admin-shell")).toBeNull();
    expectBackToTheList();
    expect(
      await screen.findByRole("heading", { name: "Template card" }),
    ).toBeTruthy();
    expect(await findCardTitleEnglishField()).toHaveValue(PRIDE_TITLE);
    expect(screen.getByRole("button", { name: "Save template" })).toBeTruthy();
  });

  it("keeps the way back while the template loads", () => {
    renderTemplatePage(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory);

    expectBackToTheList();
    expect(
      screen.getByRole("heading", { level: 1, name: "Quiz editor" }),
    ).toBeTruthy();
  });

  it("says the template is gone for an unknown id", async () => {
    renderTemplatePage(UNKNOWN_TEMPLATE_ID);

    expect(
      await screen.findByText("We couldn't find that template"),
    ).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Template card" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
    expect(
      screen.getAllByRole("link", { name: "Back to quiz templates" }),
    ).toHaveLength(2);
    expectBackToTheList();
  });

  it("keeps each template's draft apart when moving between templates", async () => {
    const user = userEvent.setup();
    // The unsaved changes guard asks before leaving; this run says leave.
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderTemplatePage(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory);

    const prideTitleField = await findCardTitleEnglishField();
    await user.type(prideTitleField, " edited");
    expect(prideTitleField).toHaveValue(`${PRIDE_TITLE} edited`);

    await user.click(screen.getByRole("link", { name: "Go to Eurovision" }));

    await waitFor(async () =>
      expect(await findCardTitleEnglishField()).toHaveValue(EUROVISION_TITLE),
    );
    expect(screen.queryByDisplayValue(`${PRIDE_TITLE} edited`)).toBeNull();
  });
});
