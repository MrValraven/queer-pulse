import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import { resetQuizshowDemoStore } from "../api/quizshowDemoStore";
import { QUIZSHOW_DEMO_LIVE_SLUG } from "../api/quizshowDemoStore.data";
import { eventScope } from "../quizshowScope";
import {
  QuizshowImportButtons,
  type QuizshowImportPicker,
} from "./QuizshowImportButtons";

// Our team has published no template yet, so the picker shows its empty state.
vi.mock("../api/useQuizshowTemplates", () => ({
  useQuizshowTemplateCards: () => ({
    data: { items: [] },
    error: null,
    isError: false,
    isFetching: false,
    refetch: () => Promise.resolve(),
  }),
}));

// The source picker stands in as a marked element while open.
vi.mock("./QuizshowImportSourcePicker", () => ({
  QuizshowImportSourcePicker: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="copy-sources-picker" /> : null,
}));

const EMPTY_TITLE = "No templates yet";

/** The buttons with the template picker open on arrival; every picker change and Start blank logged in order. */
async function renderWithTemplatePicker(options: { hasStartBlank: boolean }) {
  const steps: string[] = [];
  const onStartBlank = vi.fn(() => {
    steps.push("startBlank");
  });
  render(
    <TestProviders>
      <QuizshowImportButtons
        scope={eventScope(QUIZSHOW_DEMO_LIVE_SLUG)}
        hasQuiz={false}
        eventStartAt={null}
        isAdultsEvent={false}
        variant="empty"
        initialOpenPicker="template"
        onOpenPickerChange={(picker: QuizshowImportPicker | null) => {
          steps.push(`picker:${picker ?? "none"}`);
        }}
        onStartBlank={options.hasStartBlank ? onStartBlank : undefined}
      />
    </TestProviders>,
  );
  await awaitCatalog("quizshow");
  const templateDialog = await screen.findByRole("dialog");
  await within(templateDialog).findByRole("heading", { name: EMPTY_TITLE });
  return { steps, onStartBlank, templateDialog };
}

describe("QuizshowImportButtons with no published template", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("opens the copy sources picker from the empty template picker", async () => {
    const { steps, templateDialog } = await renderWithTemplatePicker({
      hasStartBlank: true,
    });

    await userEvent.click(
      within(templateDialog).getByRole("button", {
        name: "Copy from another event",
      }),
    );

    expect(steps).toEqual(["picker:sources"]);
    expect(
      await screen.findByTestId("copy-sources-picker"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: EMPTY_TITLE }),
      ).not.toBeInTheDocument(),
    );
  });

  it("closes the template picker before it starts a blank quiz", async () => {
    const { steps, onStartBlank, templateDialog } =
      await renderWithTemplatePicker({ hasStartBlank: true });

    await userEvent.click(
      within(templateDialog).getByRole("button", {
        name: "Start from a blank quiz",
      }),
    );

    expect(onStartBlank).toHaveBeenCalledTimes(1);
    expect(steps).toEqual(["picker:none", "startBlank"]);
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: EMPTY_TITLE }),
      ).not.toBeInTheDocument(),
    );
  });

  it("offers only the copy when the caller gives no blank start", async () => {
    const { templateDialog } = await renderWithTemplatePicker({
      hasStartBlank: false,
    });

    expect(
      within(templateDialog).queryByRole("button", {
        name: "Start from a blank quiz",
      }),
    ).not.toBeInTheDocument();
    expect(
      within(templateDialog).getByRole("button", {
        name: "Copy from another event",
      }),
    ).toBeInTheDocument();
  });
});
