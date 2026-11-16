import type { ReactNode } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "../../../app/routeMap";
import { TestProviders } from "../../../test/TestProviders";
import { AdminLeadsPage } from "./AdminLeadsPage";
import { demoGetLead, demoUpdateLead, resetDemoLeads } from "./leadsDemoStore";

// The list's in-place controls: the row menus, Undo, the result count and
// the page keys. TestProviders forces demo mode, so the demo store answers.

vi.mock("../../../shared/components/layout/AdminShell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const ROW_NAME = /^Open /;

const CAVE_ID = "demo-lead-cave-23";

/** How many stage changes the demo store logged for a lead. */
function stageChangesOf(leadId: string): number {
  return demoGetLead(leadId).entries.filter(
    (entry) => entry.kind === "stage_changed",
  ).length;
}

/** Opens Cave 23's stage menu and moves it to On board. */
async function moveCaveToOnBoard(user: ReturnType<typeof userEvent.setup>) {
  const link = await screen.findByRole("link", { name: "Open Cave 23" });
  await user.click(
    within(rowOf(link)).getByRole("button", { name: /^Stage of Cave 23/ }),
  );
  await user.click(screen.getByRole("menuitemradio", { name: "On board" }));
  await screen.findByText("Cave 23 moved to On board");
}

function renderPage(entry: string = routes.adminLeads) {
  return render(
    <TestProviders initialEntries={[entry]}>
      <Routes>
        <Route path={routes.adminLeads} element={<AdminLeadsPage />} />
      </Routes>
    </TestProviders>,
  );
}

/** The whole row around a row's "Open <name>" link. */
function rowOf(link: HTMLElement): HTMLElement {
  const row = link.closest("li");
  if (row === null) throw new Error("Expected the link inside a row");
  return row;
}

function rowLabels(): (string | null)[] {
  return screen
    .getAllByRole("link", { name: ROW_NAME })
    .map((row) => row.getAttribute("aria-label"));
}

describe("AdminLeadsPage quick controls", () => {
  beforeEach(() => resetDemoLeads());

  it("moves a lead to another stage from its row, with Undo", async () => {
    renderPage();
    const user = userEvent.setup();
    const link = await screen.findByRole("link", { name: "Open Cave 23" });
    await user.click(
      within(rowOf(link)).getByRole("button", {
        name: "Stage of Cave 23: In talks. Change stage",
      }),
    );
    const menu = screen.getByRole("menu", { name: "Move Cave 23 to" });
    expect(
      within(menu).getByRole("menuitemradio", { name: "In talks" }),
    ).toHaveAttribute("aria-checked", "true");
    await user.click(
      within(menu).getByRole("menuitemradio", { name: "On board" }),
    );
    expect(
      await screen.findByText("Cave 23 moved to On board"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "On board, 3 leads" }),
      ).toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "Undo" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "On board, 2 leads" }),
      ).toBeInTheDocument(),
    );
  });

  it("sets a follow-up from a row that has none", async () => {
    renderPage();
    const user = userEvent.setup();
    const link = await screen.findByRole("link", { name: "Open Afterhours" });
    await user.click(
      within(rowOf(link)).getByRole("button", {
        name: "Afterhours: Set follow-up. Change follow-up",
      }),
    );
    const menu = screen.getByRole("menu", {
      name: "Follow up with Afterhours",
    });
    expect(
      within(menu).queryByRole("menuitem", { name: /Clear follow-up/ }),
    ).toBeNull();
    await user.click(within(menu).getByRole("menuitem", { name: /In a week/ }));
    expect(
      await screen.findByText(/^Follow up with Afterhours on /),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        within(rowOf(link)).getByRole("button", {
          name: /^Afterhours: Follow up /,
        }),
      ).toBeInTheDocument(),
    );
  });

  it("closes a row menu with Escape and gives focus back", async () => {
    renderPage();
    const user = userEvent.setup();
    const link = await screen.findByRole("link", { name: "Open Cave 23" });
    const trigger = within(rowOf(link)).getByRole("button", {
      name: /^Stage of Cave 23/,
    });
    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("focuses the search with / and opens Add lead with n", async () => {
    renderPage();
    const user = userEvent.setup();
    await screen.findAllByRole("link", { name: ROW_NAME });
    await user.keyboard("/");
    expect(
      screen.getByRole("searchbox", { name: "Search leads" }),
    ).toHaveFocus();
    await user.keyboard("n");
    expect(screen.getByRole("searchbox", { name: "Search leads" })).toHaveValue(
      "n",
    );
    await user.click(document.body);
    (document.activeElement as HTMLElement | null)?.blur();
    await user.keyboard("n");
    expect(
      await screen.findByRole("dialog", { name: "Add lead" }),
    ).toBeInTheDocument();
  });

  it("counts the leads in view and toggles a stage tile off", async () => {
    renderPage();
    const user = userEvent.setup();
    await screen.findAllByRole("link", { name: ROW_NAME });
    expect(screen.getByText("12 leads")).toBeInTheDocument();
    const inTalks = screen.getByRole("button", { name: "In talks, 2 leads" });
    await user.click(inTalks);
    await waitFor(() => expect(rowLabels()).toHaveLength(2));
    expect(screen.getByText("2 leads")).toBeInTheDocument();
    await user.click(inTalks);
    await waitFor(() => expect(rowLabels()).toHaveLength(12));
  });

  it("saves a stage move at once, and Undo reverts its history line", async () => {
    renderPage();
    const user = userEvent.setup();
    const before = stageChangesOf(CAVE_ID);
    await moveCaveToOnBoard(user);
    expect(demoGetLead(CAVE_ID).stage).toBe("on_board");
    expect(stageChangesOf(CAVE_ID)).toBe(before + 1);
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(await screen.findByText("Change undone")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /^Stage of Cave 23: In talks/ }),
      ).toBeInTheDocument(),
    );
    expect(demoGetLead(CAVE_ID).stage).toBe("in_talks");
    expect(stageChangesOf(CAVE_ID)).toBe(before);
  });

  it("names why an Undo was refused after a later stage change", async () => {
    renderPage();
    const user = userEvent.setup();
    await moveCaveToOnBoard(user);
    // Another tab moves the lead again before Undo is pressed.
    demoUpdateLead(CAVE_ID, { stage: "not_now" });
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(
      await screen.findByText(
        "Someone moved this lead to another stage after you, so this move can no longer be undone",
      ),
    ).toBeInTheDocument();
    expect(demoGetLead(CAVE_ID).stage).toBe("not_now");
  });

  it("offers no Undo when the move wrote no stage change", async () => {
    renderPage();
    const user = userEvent.setup();
    await screen.findByRole("link", { name: "Open Cave 23" });
    // Another tab already took the lead to On board through Not now, so the
    // list's move changes nothing and its answer holds no line of its own.
    demoUpdateLead(CAVE_ID, { stage: "not_now" });
    demoUpdateLead(CAVE_ID, { stage: "on_board" });
    await moveCaveToOnBoard(user);
    expect(screen.queryByRole("button", { name: "Undo" })).toBeNull();
  });

  it("counts due follow-ups over the search and type", async () => {
    renderPage(`${routes.adminLeads}?type=venue`);
    const dueTile = await screen.findByRole("button", {
      name: /^Follow-up due/,
    });
    await waitFor(() =>
      expect(dueTile).toHaveAccessibleName(/^Follow-up due\s*1 waiting$/),
    );
  });
});
