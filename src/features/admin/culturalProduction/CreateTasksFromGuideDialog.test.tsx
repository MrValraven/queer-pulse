import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import type {
  CulturalGuideDTO,
  CulturalStaffSummaryDTO,
} from "./api/culturalProduction.types";
import { CreateTasksFromGuideDialog } from "./CreateTasksFromGuideDialog";
import { culturalRefusal } from "./culturalProductionDemoRules";
import {
  demoGetCulturalGuide,
  demoListCulturalTasks,
  resetDemoCulturalProduction,
} from "./culturalProductionDemoStore";
import { culturalTabHref } from "./culturalProductionPaths";

// TestProviders forces demo mode, so the dialog writes to the demo store.

const QUIZ_GUIDE_EN_ID = "demo-guide-quiz-en";
const EVENT_ON = "2027-03-20";

const SAM: CulturalStaffSummaryDTO = {
  id: "demo-cp-sam",
  slug: "sam-rocha-demo",
  displayName: "Sam Rocha",
  avatarUrl: null,
  avatarCrop: null,
};

interface TestState {
  /** Thrown by the next batch when set. */
  batchRefusal: Error | null;
  navigate: ReturnType<typeof vi.fn>;
}

const testState: TestState = vi.hoisted(() => ({
  batchRefusal: null,
  navigate: vi.fn(),
}));

// The real store, with its batch able to refuse the way the server does
// for an account the demo seed has no state for.
vi.mock("./culturalProductionDemoStore", async (importOriginal) => {
  const actualStore =
    await importOriginal<typeof import("./culturalProductionDemoStore")>();
  return {
    ...actualStore,
    demoCreateCulturalTaskBatch: (
      ...batchArguments: Parameters<
        typeof actualStore.demoCreateCulturalTaskBatch
      >
    ) => {
      if (testState.batchRefusal !== null) throw testState.batchRefusal;
      return actualStore.demoCreateCulturalTaskBatch(...batchArguments);
    },
  };
});

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => testState.navigate,
}));

// The picker's own search and popover are covered by its suite. Here one
// button stands in and toggles Sam, saying whether Sam was selected before.
vi.mock("./CulturalStaffPickerButton", () => ({
  CulturalStaffPickerButton: ({
    label,
    selectedPeople,
    onToggle,
  }: {
    label: string;
    selectedPeople: CulturalStaffSummaryDTO[];
    onToggle: (person: CulturalStaffSummaryDTO, isSelected: boolean) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onToggle(
          SAM,
          selectedPeople.some((person) => person.id === SAM.id),
        )
      }
    >
      {label}
    </button>
  ),
}));

// The date picker's own typing and popover are covered by its suite. Here a
// plain input stands in, named by the same label.
vi.mock("../../../shared/components/ui/DatePicker", () => ({
  DatePicker: ({
    label,
    value,
    onChange,
  }: {
    label?: string;
    value: string | null;
    onChange: (value: string | null) => void;
  }) => (
    <input
      aria-label={label}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value || null)}
    />
  ),
}));

beforeEach(() => {
  resetDemoCulturalProduction();
  testState.batchRefusal = null;
  testState.navigate.mockReset();
});

async function renderDialog(guide: CulturalGuideDTO) {
  const onClose = vi.fn();
  render(
    <TestProviders>
      <MotionProvider>
        <CreateTasksFromGuideDialog guide={guide} onClose={onClose} />
      </MotionProvider>
    </TestProviders>,
  );
  await awaitCatalog("admin");
  const dialog = await screen.findByRole("dialog", {
    name: "Create tasks for an event",
  });
  return { dialog, onClose, user: userEvent.setup() };
}

function setEventDate(dialog: HTMLElement, eventOn: string) {
  fireEvent.change(
    within(dialog).getByRole("textbox", { name: "Event date" }),
    {
      target: { value: eventOn },
    },
  );
}

function quizTasksFor(eventOn: string) {
  return demoListCulturalTasks({ assignedTo: null, status: null }).items.filter(
    (task) => task.guide?.id === QUIZ_GUIDE_EN_ID && task.eventOn === eventOn,
  );
}

describe("CreateTasksFromGuideDialog", () => {
  it("creates 18 tasks from the quiz guide", async () => {
    const { dialog, onClose, user } = await renderDialog(
      demoGetCulturalGuide(QUIZ_GUIDE_EN_ID),
    );
    setEventDate(dialog, EVENT_ON);

    const preview = await within(dialog).findByRole("region", {
      name: "Tasks to create",
    });
    expect(within(preview).getAllByRole("listitem")).toHaveLength(18);
    expect(within(preview).getAllByText(/^Due /)).toHaveLength(18);

    await user.click(
      within(dialog).getByRole("button", { name: "Create 18 tasks" }),
    );

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(quizTasksFor(EVENT_ON)).toHaveLength(18);
    await screen.findByText("18 tasks created");
    await user.click(screen.getByRole("button", { name: "Open the tasks" }));
    expect(testState.navigate).toHaveBeenCalledWith(culturalTabHref("tasks"));
  });

  it("keeps submit off until a date is set", async () => {
    const { dialog } = await renderDialog(
      demoGetCulturalGuide(QUIZ_GUIDE_EN_ID),
    );
    const submit = within(dialog).getByRole("button", {
      name: "Create 18 tasks",
    });
    expect(submit).toBeDisabled();
    expect(
      within(dialog).queryByRole("region", { name: "Tasks to create" }),
    ).not.toBeInTheDocument();

    setEventDate(dialog, EVENT_ON);

    expect(submit).toBeEnabled();
    expect(quizTasksFor(EVENT_ON)).toHaveLength(0);
  });

  it("names a suspended assignee", async () => {
    testState.batchRefusal = culturalRefusal(
      "CULTURAL_ASSIGNEE_NOT_STAFF",
      400,
      { reason: "suspended", userId: SAM.id },
    );
    const { dialog, onClose, user } = await renderDialog(
      demoGetCulturalGuide(QUIZ_GUIDE_EN_ID),
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Assign staff" }),
    );
    setEventDate(dialog, EVENT_ON);
    await user.click(
      within(dialog).getByRole("button", { name: "Create 18 tasks" }),
    );

    const refusal = await within(dialog).findByRole("alert");
    expect(refusal).toHaveTextContent(
      "This account is suspended, so it can't be assigned",
    );
    expect(
      within(dialog).getByRole("button", { name: "Unassign Sam Rocha" }),
    ).toHaveAccessibleDescription(
      "This account is suspended, so it can't be assigned",
    );
    expect(onClose).not.toHaveBeenCalled();
    expect(quizTasksFor(EVENT_ON)).toHaveLength(0);
  });

  it("shows the no steps line for an empty guide", async () => {
    const quizGuide = demoGetCulturalGuide(QUIZ_GUIDE_EN_ID);
    const emptyGuide: CulturalGuideDTO = {
      ...quizGuide,
      stepCount: 0,
      sections: quizGuide.sections.map((section) => ({
        ...section,
        steps: [],
      })),
    };
    const { dialog } = await renderDialog(emptyGuide);

    expect(
      within(dialog).getByText(
        "This guide has no checklist steps yet. Edit it to add some first",
      ),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("textbox", { name: "Event date" }),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", { name: /^Create / }),
    ).not.toBeInTheDocument();
  });
});
