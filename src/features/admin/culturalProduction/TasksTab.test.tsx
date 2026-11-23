import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { routes } from "../../../app/routeMap";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { DEMO_CULTURAL_GUIDES } from "./culturalGuidesDemo.data";
import {
  DEMO_CULTURAL_IDEAS,
  DEMO_CULTURAL_TASKS,
} from "./culturalProductionDemo.data";
import {
  demoGetCulturalTask,
  demoListCulturalTasks,
  resetDemoCulturalProduction,
} from "./culturalProductionDemoStore";
import { DEMO_CULTURAL_VIEWER_ID } from "./culturalProductionDemoViewer";
import { TasksTab } from "./TasksTab";

// TestProviders forces demo mode, so the tab reads and writes the demo
// store. TestProviders has no MotionProvider, and rows enter and leave
// through motion, so the harness adds one.

const OPEN_ROW = /^Open the task /;
const BINGO_TITLE = "Ask three bars in Anjos about a Tuesday night";
const PERMIT_TITLE = "Check if the park needs a permit for a group picnic";
const QUIZ_TEMPLATE_TITLE =
  "Pick a quiz in Quiz templates or plan the rounds from scratch";
const POSTER_TITLE = "Design a poster for the next board game night";
const THANK_VENUE_TITLE = "Thank the venue for the last quiz night";

function renderTab(search = "?tab=tasks") {
  const onOpenTask = vi.fn<(taskId: string) => void>();
  const view = render(
    <TestProviders
      initialEntries={[`${routes.adminCulturalProduction}${search}`]}
    >
      <MotionProvider>
        <TasksTab onOpenTask={onOpenTask} />
      </MotionProvider>
    </TestProviders>,
  );
  return { onOpenTask, unmount: view.unmount, user: userEvent.setup() };
}

/** The titles of the rows on screen, in order. */
function shownTitles(): string[] {
  return screen
    .queryAllByRole("button", { name: OPEN_ROW })
    .map((button) => button.textContent ?? "");
}

/** Waits for the copy and the first rows, then reads their titles. */
async function rowTitles(): Promise<string[]> {
  await awaitCatalog("admin", "shared");
  await screen.findAllByRole("button", { name: OPEN_ROW });
  return shownTitles();
}

/** The whole row around a task's open button. */
function rowOf(title: string): HTMLElement {
  const row = screen
    .getByRole("button", { name: `Open the task ${title}` })
    .closest("li");
  if (row === null) throw new Error(`Expected the row of ${title}`);
  return row;
}

describe("TasksTab (demo)", () => {
  beforeEach(() => {
    resetDemoCulturalProduction();
  });

  it("groups open tasks by status, doing first, each group by due day", async () => {
    renderTab();
    const titles = await rowTitles();
    expect(titles).toHaveLength(7);
    expect(titles.slice(0, 3)).toEqual([
      PERMIT_TITLE,
      BINGO_TITLE,
      QUIZ_TEMPLATE_TITLE,
    ]);
    expect(titles.at(-1)).toBe(POSTER_TITLE);
    expect(titles).not.toContain(THANK_VENUE_TITLE);
    expect(
      screen.getByRole("button", { name: "Doing, 1 task" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: "To do, 6 tasks" }),
    ).toBeInTheDocument();
  });

  it("folds a status group away and brings it back", async () => {
    const { user } = renderTab();
    await rowTitles();
    const toDoGroup = screen.getByRole("button", { name: "To do, 6 tasks" });
    await user.click(toDoGroup);
    expect(toDoGroup).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(shownTitles()).toEqual([PERMIT_TITLE]));
    await user.click(toDoGroup);
    await waitFor(() => expect(shownTitles()).toHaveLength(7));
  });

  it("shows no group headings in a single-status view", async () => {
    renderTab("?tab=tasks&status=todo");
    expect(await rowTitles()).toHaveLength(6);
    expect(
      screen.queryByRole("button", { name: /^To do, / }),
    ).not.toBeInTheDocument();
  });

  it("marks overdue and due today rows", async () => {
    renderTab();
    await rowTitles();
    expect(
      within(rowOf(BINGO_TITLE)).getByText(/^Overdue since /),
    ).toBeInTheDocument();
    expect(
      within(rowOf(PERMIT_TITLE)).getByText("Due today"),
    ).toBeInTheDocument();
    expect(
      within(rowOf(POSTER_TITLE)).getByText("No due date"),
    ).toBeInTheDocument();
  });

  it("narrows to my tasks and shows my empty state when none match", async () => {
    const { user, unmount } = renderTab();
    await rowTitles();
    await user.click(screen.getByRole("button", { name: "Assigned to me" }));
    await waitFor(() =>
      expect([...shownTitles()].sort()).toEqual(
        demoListCulturalTasks({ assignedTo: "me", status: "open" })
          .items.map((task) => task.title)
          .sort(),
      ),
    );
    expect(await rowTitles()).toHaveLength(3);
    unmount();

    resetDemoCulturalProduction({
      ideas: DEMO_CULTURAL_IDEAS,
      tasks: DEMO_CULTURAL_TASKS.map((task) => ({
        ...task,
        assigneeIds: task.assigneeIds.filter(
          (assigneeId) => assigneeId !== DEMO_CULTURAL_VIEWER_ID,
        ),
      })),
      guides: DEMO_CULTURAL_GUIDES,
    });
    const second = renderTab("?tab=tasks&assignedTo=me");
    await awaitCatalog("admin", "shared");
    expect(
      await screen.findByRole("heading", {
        name: "Nothing is assigned to you",
      }),
    ).toBeInTheDocument();
    await second.user.click(
      screen.getByRole("button", { name: "Show everyone" }),
    );
    expect(await rowTitles()).toHaveLength(7);
  });

  it("counts each status on its chip", async () => {
    const { user } = renderTab();
    await rowTitles();
    expect(
      await screen.findByRole("button", { name: "To do (6)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Doing (1)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Done (1)" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Assigned to me" }));
    expect(
      await screen.findByRole("button", { name: "To do (2)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Doing (1)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Done (1)" }),
    ).toBeInTheDocument();
  });

  it("changes a status from the row and moves it to done", async () => {
    const { user } = renderTab();
    await rowTitles();
    await user.click(
      within(rowOf(BINGO_TITLE)).getByRole("button", {
        name: (accessibleName) =>
          accessibleName.startsWith(`Status of ${BINGO_TITLE},`),
      }),
    );
    await user.click(
      await screen.findByRole("menuitemradio", { name: "Done" }),
    );

    expect(await screen.findByText("Moved to Done")).toBeInTheDocument();
    expect(demoGetCulturalTask("demo-task-bingo-venue").status).toBe("done");
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: `Open the task ${BINGO_TITLE}` }),
      ).not.toBeInTheDocument(),
    );
    await user.click(await screen.findByRole("button", { name: "Done (2)" }));
    await waitFor(() =>
      expect([...shownTitles()].sort()).toEqual(
        [BINGO_TITLE, THANK_VENUE_TITLE].sort(),
      ),
    );
  });

  it("opens a task from its title", async () => {
    const { onOpenTask, user } = renderTab();
    await rowTitles();
    await user.click(
      screen.getByRole("button", { name: `Open the task ${PERMIT_TITLE}` }),
    );
    expect(onOpenTask).toHaveBeenCalledWith("demo-task-picnic-permit");
  });

  it("adds a task from the toolbar", async () => {
    const { user } = renderTab();
    await rowTitles();
    await user.click(screen.getByRole("button", { name: "Add task" }));
    const dialog = await screen.findByRole("dialog", { name: "Add a task" });
    await user.type(
      within(dialog).getByRole("textbox", { name: /^Title/ }),
      "Print the quiz answer sheets",
    );
    const submit = within(dialog)
      .getAllByRole("button", { name: "Add task" })
      .at(-1);
    if (submit === undefined) throw new Error("The Add task button is missing");
    await user.click(submit);

    expect(
      await screen.findByRole("button", {
        name: "Open the task Print the quiz answer sheets",
      }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Add a task" }),
      ).not.toBeInTheDocument(),
    );
  });
});
