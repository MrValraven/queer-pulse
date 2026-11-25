import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import type { QuizshowTemplatePreview } from "../../../shared/contracts/quizshow";
import { QuizshowTemplatePreviewDialog } from "./QuizshowTemplatePreviewDialog";

const ADULTS_REASON = "Turn on 18+ to use these rounds";

const PREVIEW: QuizshowTemplatePreview = {
  templateId: "template-mixed",
  title: { en: "Mixed night", pt: "Noite mista" },
  description: { en: "Some rounds are 18+", pt: "Algumas rondas são 18+" },
  languages: "both",
  rounds: [
    {
      roundIndex: 0,
      kind: "quiz",
      title: { en: "Warm up", pt: "Aquecimento" },
      questionCount: 4,
      sliceCount: null,
      contentLabel: "none",
      prompts: [{ en: "First prompt", pt: "Primeira pergunta" }],
    },
    {
      roundIndex: 1,
      kind: "quiz",
      title: { en: "After dark", pt: "Depois do escuro" },
      questionCount: 4,
      sliceCount: null,
      contentLabel: "adults",
      prompts: [{ en: "Late prompt", pt: "Pergunta tardia" }],
    },
  ],
};

vi.mock("../api/useQuizshowTemplates", () => ({
  useQuizshowTemplatePreview: () => ({
    data: PREVIEW,
    error: null,
    isError: false,
    isFetching: false,
    refetch: vi.fn(() => Promise.resolve()),
  }),
}));

function renderPreview({ isAppendOnly }: { isAppendOnly: boolean }) {
  const onAppend = vi.fn();
  const onUse = vi.fn();
  render(
    <TestProviders>
      <QuizshowTemplatePreviewDialog
        templateId="template-mixed"
        isAdultsAllowed={false}
        canAppend
        isAppendOnly={isAppendOnly}
        isPending={false}
        onClose={vi.fn()}
        onUse={onUse}
        onAppend={onAppend}
      />
    </TestProviders>,
  );
  return { onAppend, onUse };
}

describe("QuizshowTemplatePreviewDialog adding rounds with 18+ off", () => {
  beforeEach(async () => {
    await awaitCatalog("quizshow");
  });

  it("holds only the adults row of an add-only preview and adds the rest", async () => {
    const { onAppend } = renderPreview({ isAppendOnly: true });

    const dialog = await screen.findByRole("dialog", {
      name: "Template preview",
    });
    const checkboxes = await within(dialog).findAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    const [openerBox, adultsBox] = checkboxes;
    expect(openerBox).not.toHaveAttribute("aria-disabled");
    expect(adultsBox).toHaveAttribute("aria-disabled", "true");
    expect(within(dialog).getAllByText(ADULTS_REASON)).toHaveLength(1);

    await userEvent.click(adultsBox as HTMLElement);
    expect((adultsBox as HTMLInputElement).checked).toBe(false);
    await userEvent.click(openerBox as HTMLElement);
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Add these rounds" }),
    );

    expect(onAppend).toHaveBeenCalledWith([0]);
  });

  it("opens the Add rounds checklist, holds Use this template, and holds only the adults row", async () => {
    const { onAppend, onUse } = renderPreview({ isAppendOnly: false });

    const dialog = await screen.findByRole("dialog", {
      name: "Template preview",
    });
    const useButton = await within(dialog).findByRole("button", {
      name: "Use this template",
    });
    expect(useButton).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(useButton);
    expect(onUse).not.toHaveBeenCalled();

    const addRounds = within(dialog).getByRole("button", {
      name: "Add rounds from this template",
    });
    expect(addRounds).not.toHaveAttribute("aria-disabled", "true");
    await userEvent.click(addRounds);
    const checklist = await within(dialog).findByRole("group", {
      name: "Pick the rounds to add",
    });
    const checkboxes = within(checklist).getAllByRole("checkbox");
    expect(checkboxes[0]).not.toHaveAttribute("aria-disabled");
    expect(checkboxes[1]).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(checkboxes[0] as HTMLElement);
    await userEvent.click(
      within(checklist).getByRole("button", { name: "Add these rounds" }),
    );
    expect(onAppend).toHaveBeenCalledWith([0]);
  });
});
