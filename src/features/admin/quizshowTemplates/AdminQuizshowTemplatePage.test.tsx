import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { adminQuizshowTemplatePath, routes } from "../../../app/routeMap";
import { TestProviders } from "../../../test/TestProviders";
import { resetQuizshowDemoStore } from "../../quizshow/api/quizshowDemoStore";
import { QUIZSHOW_DEMO_TEMPLATE_IDS } from "../../quizshow/demo/quizshowTemplates.data";
import { AdminQuizshowTemplatePage } from "./AdminQuizshowTemplatePage";

// The admin chrome (theme toggle, nav-badge queries, role switcher) has
// nothing to do with this page; the stand-in keeps its title and breadcrumb.
vi.mock("../../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({
    title,
    breadcrumb = [],
    children,
  }: {
    title: ReactNode;
    breadcrumb?: { label: string; to?: string }[];
    children: ReactNode;
  }) => (
    <>
      <nav aria-label="Breadcrumb">
        {breadcrumb.map((crumb) => (
          <a key={crumb.label} href={crumb.to}>
            {crumb.label}
          </a>
        ))}
      </nav>
      <p data-testid="shell-title">{title}</p>
      {children}
    </>
  ),
}));

const PRIDE_TITLE = "Pride and queer history";
const EUROVISION_TITLE = "Eurovision";
const UNKNOWN_TEMPLATE_ID = "a7e3b1c0-5eed-4000-8000-0000000000ff";
const LIST_NAME = "Quiz templates";

/** The page H1 before a title has loaded: named by the list, showing none of it. */
function expectHeadingLabelledOnly(): HTMLElement {
  const pageHeading = screen.getByRole("heading", {
    level: 1,
    name: LIST_NAME,
  });
  expect(within(pageHeading).getByText(LIST_NAME)).toHaveClass(
    "visuallyHidden",
  );
  return pageHeading;
}

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

describe("AdminQuizshowTemplatePage", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens a template in the builder with its card title and a link back to the list", async () => {
    renderTemplatePage(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory);

    expect(
      await screen.findByRole("heading", { level: 1, name: PRIDE_TITLE }),
    ).toBeTruthy();
    // The top bar stops at the list's name; the heading carries the title.
    expect(screen.getByTestId("shell-title").textContent).toBe(LIST_NAME);
    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });
    const crumbLinks = within(breadcrumb).getAllByRole("link");
    expect(crumbLinks.map((crumb) => crumb.textContent)).toEqual(["Admin"]);
    expect(crumbLinks[0]?.getAttribute("href")).toBe(routes.admin);
    const backLink = screen.getByRole("link", {
      name: "Back to quiz templates",
    });
    expect(backLink.getAttribute("href")).toBe(routes.adminQuizshowTemplates);
    expect(
      await screen.findByRole("heading", { name: "Template card" }),
    ).toBeTruthy();
    expect(await findCardTitleEnglishField()).toHaveValue(PRIDE_TITLE);
  });

  it("keeps the heading off the list's name while the template loads", () => {
    renderTemplatePage(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory);

    const pageHeading = expectHeadingLabelledOnly();
    const placeholderBar = pageHeading.querySelector("[aria-hidden]");
    expect(placeholderBar).not.toBeNull();
    expect(placeholderBar).not.toHaveAttribute("data-failed");
  });

  it("says the template is gone for an unknown id", async () => {
    renderTemplatePage(UNKNOWN_TEMPLATE_ID);

    expect(
      await screen.findByText("We couldn't find that template"),
    ).toBeTruthy();
    // No card title to show: the heading stays labelled by the list's name
    // and shows none of it, and its placeholder bar fades out.
    expect(screen.getByTestId("shell-title").textContent).toBe(LIST_NAME);
    const pageHeading = expectHeadingLabelledOnly();
    await waitFor(() =>
      expect(pageHeading.querySelector("[aria-hidden]")).toHaveAttribute(
        "data-failed",
      ),
    );
    expect(screen.queryByRole("heading", { name: "Template card" })).toBeNull();
    expect(
      screen
        .getByRole("link", { name: "Back to quiz templates" })
        .getAttribute("href"),
    ).toBe(routes.adminQuizshowTemplates);
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

    expect(
      await screen.findByRole("heading", { level: 1, name: EUROVISION_TITLE }),
    ).toBeTruthy();
    await waitFor(async () =>
      expect(await findCardTitleEnglishField()).toHaveValue(EUROVISION_TITLE),
    );
    expect(screen.queryByDisplayValue(`${PRIDE_TITLE} edited`)).toBeNull();
  });
});
