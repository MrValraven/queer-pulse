import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import type {
  CulturalStaffSummaryDTO,
  UpdateCulturalTaskBody,
} from "./api/culturalProduction.types";
import {
  demoGetCulturalTask,
  demoUpdateCulturalTask,
  resetDemoCulturalProduction,
} from "./culturalProductionDemoStore";
import { TaskDrawer } from "./TaskDrawer";

// TestProviders forces demo mode, so the drawer reads and writes the demo
// store. TestProviders has no MotionProvider, and the pills and views move
// through motion, so the harness adds one. The staff picker is its own
// task's component; a stand-in offers one button per person and reports
// whether that person was assigned before the press, as the picker does.

interface WriteControl {
  /** Every PATCH body, in order. */
  updates: UpdateCulturalTaskBody[];
  /** The user id of every assign, in order. */
  assigns: string[];
  /** While set, every assign waits on it before it answers. */
  hold: Promise<void> | null;
}

const writeControl: WriteControl = vi.hoisted(() => ({
  updates: [],
  assigns: [],
  hold: null,
}));

const pickablePeople: CulturalStaffSummaryDTO[] = vi.hoisted(() => [
  {
    id: "demo-cp-nuno",
    slug: "nuno-alves-demo",
    displayName: "Nuno Alves",
    avatarUrl: null,
    avatarCrop: null,
  },
  {
    id: "demo-cp-carla",
    slug: "carla-pinto-demo",
    displayName: "Carla Pinto",
    avatarUrl: null,
    avatarCrop: null,
  },
]);

// The real store, with update and assign recorded and assign able to wait.
// The mutation hooks load the store through a dynamic import, which this
// covers.
vi.mock("./culturalProductionDemoStore", async (importOriginal) => {
  const actualStore =
    await importOriginal<typeof import("./culturalProductionDemoStore")>();
  return {
    ...actualStore,
    demoUpdateCulturalTask: (
      ...updateArguments: Parameters<typeof actualStore.demoUpdateCulturalTask>
    ) => {
      writeControl.updates.push(updateArguments[1]);
      return actualStore.demoUpdateCulturalTask(...updateArguments);
    },
    demoAssignCulturalTask: async (
      ...assignArguments: Parameters<typeof actualStore.demoAssignCulturalTask>
    ) => {
      writeControl.assigns.push(assignArguments[1].userId);
      if (writeControl.hold) await writeControl.hold;
      return actualStore.demoAssignCulturalTask(...assignArguments);
    },
  };
});

vi.mock("./CulturalStaffPickerButton", () => ({
  CulturalStaffPickerButton: ({
    selectedPeople,
    onToggle,
  }: {
    selectedPeople: CulturalStaffSummaryDTO[];
    onToggle: (person: CulturalStaffSummaryDTO, isSelected: boolean) => void;
  }) => (
    <div>
      {pickablePeople.map((person) => (
        <button
          key={person.id}
          type="button"
          onClick={() =>
            onToggle(
              person,
              selectedPeople.some((picked) => picked.id === person.id),
            )
          }
        >
          {`Pick ${person.displayName}`}
        </button>
      ))}
    </div>
  ),
}));

const POSTER_ID = "demo-task-poster";
const POSTER_TITLE = "Design a poster for the next board game night";

function renderDrawer(taskId: string = POSTER_ID) {
  const onClose = vi.fn();
  render(
    <TestProviders>
      <MotionProvider>
        <TaskDrawer taskId={taskId} onClose={onClose} />
      </MotionProvider>
    </TestProviders>,
  );
  return { onClose, user: userEvent.setup() };
}

/** Waits for the catalog and the task, then answers the drawer. */
async function waitForTask(): Promise<HTMLElement> {
  await awaitCatalog("admin");
  const drawer = await screen.findByRole("dialog", { name: "Task" });
  await within(drawer).findByRole("heading", { name: POSTER_TITLE });
  return drawer;
}

const assigneeIdsOf = (taskId: string) =>
  demoGetCulturalTask(taskId).assignees.map((person) => person.id);

describe("TaskDrawer (demo)", () => {
  beforeEach(() => {
    writeControl.updates = [];
    writeControl.assigns = [];
    writeControl.hold = null;
    resetDemoCulturalProduction();
  });

  it("saves only the changed fields", async () => {
    const { user } = renderDrawer();
    const drawer = await waitForTask();
    const title = within(drawer).getByRole("textbox", { name: /^Title/ });
    expect(title).toHaveValue(POSTER_TITLE);
    await user.clear(title);
    await user.type(title, "Design a poster for the quiz night");
    await user.click(within(drawer).getByRole("button", { name: "Save task" }));

    await waitFor(() =>
      expect(writeControl.updates).toEqual([
        { title: "Design a poster for the quiz night" },
      ]),
    );
    expect(await screen.findByText("Task saved")).toBeInTheDocument();
    expect(demoGetCulturalTask(POSTER_ID).title).toBe(
      "Design a poster for the quiz night",
    );
  });

  it("keeps a teammate's change to a field nobody touched", async () => {
    const { user } = renderDrawer();
    const drawer = await waitForTask();
    const title = within(drawer).getByRole("textbox", { name: /^Title/ });
    await user.clear(title);
    await user.type(title, "Design a poster for the quiz night");
    // A teammate saves new notes; the assign answer brings them in.
    demoUpdateCulturalTask(POSTER_ID, { notes: "Use the new logo" });
    await user.click(
      within(drawer).getByRole("button", { name: "Pick Nuno Alves" }),
    );
    const notes = within(drawer).getByRole("textbox", { name: /^Notes/ });
    await waitFor(() => expect(notes).toHaveValue("Use the new logo"));
    expect(title).toHaveValue("Design a poster for the quiz night");
    writeControl.updates = [];
    await user.click(within(drawer).getByRole("button", { name: "Save task" }));

    await waitFor(() =>
      expect(writeControl.updates).toEqual([
        { title: "Design a poster for the quiz night" },
      ]),
    );
    expect(demoGetCulturalTask(POSTER_ID).notes).toBe("Use the new logo");
  });

  it("assigns and unassigns with a toast each", async () => {
    const { user } = renderDrawer();
    const drawer = await waitForTask();
    await user.click(
      within(drawer).getByRole("button", { name: "Pick Nuno Alves" }),
    );
    expect(
      await screen.findByText("Nuno Alves is on this task"),
    ).toBeInTheDocument();
    expect(assigneeIdsOf(POSTER_ID)).toEqual(["demo-cp-nuno"]);

    await user.click(
      await within(drawer).findByRole("button", {
        name: "Unassign Nuno Alves",
      }),
    );
    expect(
      await screen.findByText("Nuno Alves is off this task"),
    ).toBeInTheDocument();
    expect(assigneeIdsOf(POSTER_ID)).toEqual([]);
  });

  it("sends one write when a second person is pressed while the first is in flight", async () => {
    let release: () => void = () => undefined;
    writeControl.hold = new Promise<void>((resolve) => {
      release = resolve;
    });
    const { user } = renderDrawer();
    const drawer = await waitForTask();
    await user.click(
      within(drawer).getByRole("button", { name: "Pick Nuno Alves" }),
    );
    await user.click(
      within(drawer).getByRole("button", { name: "Pick Carla Pinto" }),
    );
    await waitFor(() => expect(writeControl.assigns).toEqual(["demo-cp-nuno"]));

    release();
    expect(
      await screen.findByText("Nuno Alves is on this task"),
    ).toBeInTheDocument();
    expect(writeControl.assigns).toEqual(["demo-cp-nuno"]);
    expect(assigneeIdsOf(POSTER_ID)).toEqual(["demo-cp-nuno"]);
  });

  it("asks before discarding unsaved changes", async () => {
    const { onClose, user } = renderDrawer();
    const drawer = await waitForTask();
    const notes = within(drawer).getByRole("textbox", { name: /^Notes/ });
    await user.type(notes, " Ask Sam for the fonts");
    await user.click(within(drawer).getByRole("button", { name: "Close" }));

    const confirm = await screen.findByRole("dialog", {
      name: "Discard your changes to this task?",
    });
    await user.click(
      within(confirm).getByRole("button", { name: "Keep editing" }),
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(notes).toHaveValue(
      `${demoGetCulturalTask(POSTER_ID).notes} Ask Sam for the fonts`,
    );

    await user.click(within(drawer).getByRole("button", { name: "Close" }));
    const secondConfirm = await screen.findByRole("dialog", {
      name: "Discard your changes to this task?",
    });
    await user.click(
      within(secondConfirm).getByRole("button", { name: "Discard changes" }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(writeControl.updates).toEqual([]);
  });

  it("deletes the task after confirming", async () => {
    const { onClose, user } = renderDrawer();
    const drawer = await waitForTask();
    await user.click(
      within(drawer).getByRole("button", { name: "Delete task" }),
    );
    const confirm = await screen.findByRole("dialog", {
      name: "Delete this task?",
    });
    expect(onClose).not.toHaveBeenCalled();
    await user.click(
      within(confirm).getByRole("button", { name: "Delete task" }),
    );

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Task deleted")).toBeInTheDocument();
    expect(() => demoGetCulturalTask(POSTER_ID)).toThrow();
  });

  it("shows not found for an unknown id", async () => {
    renderDrawer("demo-task-missing");
    await awaitCatalog("admin");
    expect(
      await screen.findByText("This task isn't here anymore"),
    ).toBeInTheDocument();
  });
});
