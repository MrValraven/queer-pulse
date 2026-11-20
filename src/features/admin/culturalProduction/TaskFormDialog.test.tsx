import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import type {
  CulturalRefDTO,
  CulturalStaffSummaryDTO,
  CulturalTaskDTO,
} from "./api/culturalProduction.types";
import {
  demoGetCulturalTask,
  resetDemoCulturalProduction,
} from "./culturalProductionDemoStore";
import { TaskFormDialog } from "./TaskFormDialog";

// TestProviders forces demo mode, so the dialog writes to the demo store.
// The staff picker is its own task's component; here a stand-in offers one
// button per person, the former staff member included, and hands each
// press to `onToggle` the way the picker does.

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
  {
    id: "demo-cp-dani",
    slug: "dani-serra-demo",
    displayName: "Dani Serra",
    avatarUrl: null,
    avatarCrop: null,
  },
]);

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

const DRAG_BINGO: CulturalRefDTO = {
  id: "demo-idea-drag-bingo",
  title: "Drag bingo at a bar in Anjos",
};

function renderDialog(initialIdea: CulturalRefDTO | null = null) {
  const onClose = vi.fn();
  const onCreated = vi.fn<(task: CulturalTaskDTO) => void>();
  render(
    <TestProviders>
      <MotionProvider>
        <TaskFormDialog
          onClose={onClose}
          onCreated={onCreated}
          initialIdea={initialIdea}
        />
      </MotionProvider>
    </TestProviders>,
  );
  return { onClose, onCreated, user: userEvent.setup() };
}

async function waitForDialog(): Promise<HTMLElement> {
  await awaitCatalog("admin");
  return screen.findByRole("dialog", { name: "Add a task" });
}

function submitButton(dialog: HTMLElement): HTMLElement {
  const submit = within(dialog)
    .getAllByRole("button", { name: "Add task" })
    .at(-1);
  if (submit === undefined) throw new Error("The Add task button is missing");
  return submit;
}

function createdTaskOf(
  onCreated: Mock<(task: CulturalTaskDTO) => void>,
): CulturalTaskDTO {
  const task = onCreated.mock.calls[0]?.[0];
  if (task === undefined) throw new Error("No task was created");
  return task;
}

describe("TaskFormDialog (demo)", () => {
  beforeEach(() => {
    resetDemoCulturalProduction();
  });

  it("adds a task with two assignees", async () => {
    const { onClose, onCreated, user } = renderDialog();
    const dialog = await waitForDialog();
    await user.type(
      within(dialog).getByRole("textbox", { name: /^Title/ }),
      "Print the quiz answer sheets",
    );
    await user.click(screen.getByRole("button", { name: "Pick Nuno Alves" }));
    await user.click(screen.getByRole("button", { name: "Pick Carla Pinto" }));
    expect(
      within(dialog).getByRole("button", { name: "Unassign Nuno Alves" }),
    ).toBeInTheDocument();
    await user.click(submitButton(dialog));

    await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));
    const task = createdTaskOf(onCreated);
    expect(task.title).toBe("Print the quiz answer sheets");
    expect(task.assignees.map((person) => person.id)).toEqual([
      "demo-cp-nuno",
      "demo-cp-carla",
    ]);
    expect(demoGetCulturalTask(task.id).assignees).toHaveLength(2);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Task added")).toBeInTheDocument();
  });

  it("names a former staff member who cannot be assigned", async () => {
    const { onClose, onCreated, user } = renderDialog();
    const dialog = await waitForDialog();
    await user.type(
      within(dialog).getByRole("textbox", { name: /^Title/ }),
      "Thank the bar staff",
    );
    await user.click(screen.getByRole("button", { name: "Pick Dani Serra" }));
    await user.click(submitButton(dialog));

    expect(
      await within(dialog).findByText(
        "This person doesn't have Cultural Production access, so they can't be assigned",
      ),
    ).toBeInTheDocument();
    const daniChip = within(dialog)
      .getByRole("button", { name: "Unassign Dani Serra" })
      .closest("li");
    expect(daniChip).toHaveAttribute("data-refused", "true");
    expect(onCreated).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("prefills the idea when opened from an idea", async () => {
    const { onCreated, user } = renderDialog(DRAG_BINGO);
    const dialog = await waitForDialog();
    expect(
      await within(dialog).findByText(DRAG_BINGO.title),
    ).toBeInTheDocument();
    await user.type(
      within(dialog).getByRole("textbox", { name: /^Title/ }),
      "Ask about a microphone",
    );
    await user.click(submitButton(dialog));

    await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));
    expect(createdTaskOf(onCreated).idea).toEqual(DRAG_BINGO);
  });

  it("names a blank title under its field and sends nothing", async () => {
    const { onCreated, user } = renderDialog();
    const dialog = await waitForDialog();
    await user.click(submitButton(dialog));
    expect(
      await within(dialog).findByText("Give it a title"),
    ).toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
  });
});
