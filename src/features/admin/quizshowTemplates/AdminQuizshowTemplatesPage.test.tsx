import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import { routes } from "../../../app/routeMap";
import { ApiError } from "../../../shared/api/client";
import { ToastProvider } from "../../../shared/components/feedback/ToastProvider";
import { resetQuizshowDemoStore } from "../../quizshow/api/quizshowDemoStore";
import {
  demoDeleteTemplate,
  demoListTemplates,
} from "../../quizshow/api/quizshowDemoTemplates";
import { getQuizshowTemplateRows } from "../../quizshow/api/quizshowTemplates.api";
import { QUIZSHOW_DEMO_TEMPLATE_IDS } from "../../quizshow/demo/quizshowTemplates.data";
import { AdminQuizshowTemplatesPage } from "./AdminQuizshowTemplatesPage";
import { QUIZSHOW_TEMPLATES_HEADING_ID } from "./quizshowTemplateList.data";

const demoState = vi.hoisted(() => ({ isDemoMode: true }));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: demoState.isDemoMode }),
}));

// The admin chrome (theme toggle, nav-badge queries, role switcher) has
// nothing to do with this list.
vi.mock("../../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("../../quizshow/api/quizshowTemplates.api", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../../quizshow/api/quizshowTemplates.api")
    >();
  return {
    ...actual,
    getQuizshowTemplateRows: vi.fn(actual.getQuizshowTemplateRows),
  };
});

const CINEMA_TITLE = "Queer cinema classics";
const PRIDE_TITLE = "Pride and queer history";
const FIRST_NEW_TEMPLATE_PATH = "/admin/quizshow/templates/demo-template-new-1";
const CARD_INCOMPLETE_MESSAGE =
  "Add the card title and description in each language the quiz uses, then publish";
const DELETE_BODY =
  "Hosts stop seeing it. Quizzes hosts already copied from it stay exactly as they are";
const PRIDE_DELETE_TITLE = `Delete ${PRIDE_TITLE}?`;
const NO_FEATURE_ACCESS_MESSAGE =
  "Quiz templates need Pulse Live access, and this account doesn't have it yet";

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={[routes.adminQuizshowTemplates]}>
            <Routes>
              <Route
                path={routes.adminQuizshowTemplates}
                element={<AdminQuizshowTemplatesPage />}
              />
              <Route
                path={routes.adminQuizshowTemplate}
                element={<output data-testid="template-builder" />}
              />
            </Routes>
            <LocationProbe />
          </MemoryRouter>
        </ToastProvider>
      </I18nProvider>
    </QueryClientProvider>,
  );
}

function currentPath(): string {
  return screen.getByTestId("location").textContent ?? "";
}

function rowOfHeading(heading: HTMLElement, title: string): HTMLElement {
  const row = heading.closest("li");
  if (!row) throw new Error(`no row for ${title}`);
  return row;
}

/** The list item that holds the row titled `title`, once it is on screen. */
async function findRow(title: string): Promise<HTMLElement> {
  const heading = await screen.findByRole("heading", { level: 2, name: title });
  return rowOfHeading(heading, title);
}

/** The list item that holds the row titled `title`, right now. */
function getRow(title: string): HTMLElement {
  const heading = screen.getByRole("heading", { level: 2, name: title });
  return rowOfHeading(heading, title);
}

beforeEach(() => {
  demoState.isDemoMode = true;
  resetQuizshowDemoStore();
  vi.mocked(getQuizshowTemplateRows).mockClear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe("AdminQuizshowTemplatesPage", () => {
  it("lists drafts first with status, counts and who edited", async () => {
    renderPage();

    const firstRow = await findRow(CINEMA_TITLE);
    const list = firstRow.closest("ul");
    if (!list) throw new Error("no template list");
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(6);
    expect(rows[0]).toBe(firstRow);
    expect(within(firstRow).getByText("Draft")).toBeInTheDocument();
    const isPublishedByRow = rows.map(
      (row) => within(row).queryByText("Published") !== null,
    );
    const firstPublishedIndex = isPublishedByRow.indexOf(true);
    expect(firstPublishedIndex).toBeGreaterThan(0);
    // No Draft row comes after a Published one.
    expect(isPublishedByRow.slice(firstPublishedIndex)).not.toContain(false);

    const prideRow = await findRow(PRIDE_TITLE);
    expect(within(prideRow).getByText("Published")).toBeInTheDocument();
    expect(within(prideRow).getByText(/^\d+ rounds?$/)).toBeInTheDocument();
    expect(within(prideRow).getByText(/^\d+ questions?$/)).toBeInTheDocument();
    expect(
      within(prideRow).getByText(/^Edited by Rui Marçal, /),
    ).toBeInTheDocument();
    expect(screen.getByText("6 templates")).toHaveAttribute("role", "status");
  });

  it("titles a row in the viewer's language", async () => {
    window.localStorage.setItem("qp.lang", "pt");
    renderPage();

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "Clássicos do cinema queer",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: CINEMA_TITLE }),
    ).toBeNull();
  });

  it("creates a template and opens it in the builder", async () => {
    const user = userEvent.setup();
    renderPage();
    await findRow(CINEMA_TITLE);

    await user.click(screen.getByRole("button", { name: "New template" }));

    await waitFor(() => expect(currentPath()).toBe(FIRST_NEW_TEMPLATE_PATH));
    expect(await screen.findByText("Template created")).toBeInTheDocument();
  });

  it("duplicates a template and opens the copy", async () => {
    const user = userEvent.setup();
    renderPage();
    const prideRow = await findRow(PRIDE_TITLE);

    await user.click(
      within(prideRow).getByRole("button", { name: "Duplicate template" }),
    );

    await waitFor(() => expect(currentPath()).toBe(FIRST_NEW_TEMPLATE_PATH));
    const copy = demoListTemplates().items.find(
      (row) => row.id === "demo-template-new-1",
    );
    expect(copy?.title.en).toBe(`${PRIDE_TITLE} (copy)`);
    expect(copy?.status).toBe("draft");
  });

  it("publishes and unpublishes from the row", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      within(await findRow(PRIDE_TITLE)).getByRole("button", {
        name: "Unpublish template",
      }),
    );

    await waitFor(() => {
      const prideRow = getRow(PRIDE_TITLE);
      expect(within(prideRow).getByText("Draft")).toBeInTheDocument();
      expect(
        within(prideRow).getByRole("button", { name: "Publish template" }),
      ).toBeInTheDocument();
    });

    await user.click(
      within(getRow(PRIDE_TITLE)).getByRole("button", {
        name: "Publish template",
      }),
    );

    await waitFor(() => {
      const prideRow = getRow(PRIDE_TITLE);
      expect(within(prideRow).getByText("Published")).toBeInTheDocument();
      expect(
        within(prideRow).getByRole("button", { name: "Unpublish template" }),
      ).toBeInTheDocument();
    });
  });

  it("names the reason when Publish is refused from the row", async () => {
    const user = userEvent.setup();
    renderPage();
    const cinemaRow = await findRow(CINEMA_TITLE);

    await user.click(
      within(cinemaRow).getByRole("button", { name: "Publish template" }),
    );

    const alert = await within(cinemaRow).findByRole("alert");
    expect(alert).toHaveTextContent(CARD_INCOMPLETE_MESSAGE);
    expect(within(cinemaRow).getByText("Draft")).toBeInTheDocument();
  });

  it("asks before deleting and says hosts' copies stay", async () => {
    const user = userEvent.setup();
    renderPage();
    const prideRow = await findRow(PRIDE_TITLE);

    await user.click(
      within(prideRow).getByRole("button", { name: "Delete template" }),
    );

    const dialog = await screen.findByRole("dialog", {
      name: PRIDE_DELETE_TITLE,
    });
    expect(within(dialog).getByText(DELETE_BODY)).toBeInTheDocument();
    // A destructive confirm opens on the safe choice.
    await waitFor(() =>
      expect(
        within(dialog).getByRole("button", { name: "Cancel" }),
      ).toHaveFocus(),
    );

    await user.click(
      within(dialog).getByRole("button", { name: "Delete template" }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { level: 2, name: PRIDE_TITLE }),
      ).toBeNull(),
    );
    // The row took Delete template with it, so focus lands on the page heading.
    await waitFor(
      () => {
        const pageHeading = screen.getByRole("heading", { level: 1 });
        expect(pageHeading).toHaveAttribute(
          "id",
          QUIZSHOW_TEMPLATES_HEADING_ID,
        );
        expect(pageHeading).toHaveFocus();
      },
      { timeout: 2500 },
    );
    expect(
      demoListTemplates().items.some(
        (row) => row.id === QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory,
      ),
    ).toBe(false);
    expect(await screen.findByText("Template deleted")).toBeInTheDocument();
  });

  it("offers New template from the empty panel alone once every template is deleted", async () => {
    for (const row of demoListTemplates().items) {
      if (row.id !== QUIZSHOW_DEMO_TEMPLATE_IDS.queerCinema) {
        demoDeleteTemplate(row.id);
      }
    }
    const user = userEvent.setup();
    renderPage();
    const cinemaRow = await findRow(CINEMA_TITLE);
    // While rows show, the header carries the one New template.
    expect(
      screen.getAllByRole("button", { name: "New template" }),
    ).toHaveLength(1);

    await user.click(
      within(cinemaRow).getByRole("button", { name: "Delete template" }),
    );
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Delete template" }),
    );

    expect(
      await screen.findByRole("heading", {
        level: 2,
        name: "No templates yet",
      }),
    ).toBeInTheDocument();
    // The header's button folds away, so only the empty panel's stays.
    await waitFor(() =>
      expect(
        screen.getAllByRole("button", { name: "New template" }),
      ).toHaveLength(1),
    );
    const emptyPanel = screen
      .getByRole("heading", { level: 2, name: "No templates yet" })
      .closest<HTMLElement>('[role="status"]');
    if (!emptyPanel) throw new Error("no empty panel");
    const emptyPanelButton = within(emptyPanel).getByRole("button", {
      name: "New template",
    });
    await user.click(emptyPanelButton);

    await waitFor(() => expect(currentPath()).toBe(FIRST_NEW_TEMPLATE_PATH));
  });

  it("names the reason when the list fails to load", async () => {
    demoState.isDemoMode = false;
    vi.mocked(getQuizshowTemplateRows).mockRejectedValue(
      new ApiError(404, "Not Found"),
    );
    renderPage();

    expect(
      await screen.findByText(NO_FEATURE_ACCESS_MESSAGE),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "We couldn't load the templates" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });
});
