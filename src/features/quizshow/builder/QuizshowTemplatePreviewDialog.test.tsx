import { render, screen, within } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { awaitCatalog } from "../../../test/awaitCatalog";
import { TestProviders } from "../../../test/TestProviders";
import {
  demoGetTemplate,
  resetQuizshowDemoTemplates,
} from "../api/quizshowDemoTemplates";
import { QUIZSHOW_DEMO_TEMPLATE_IDS } from "../demo/quizshowTemplates.data";
import { QuizshowTemplatePreviewDialog } from "./QuizshowTemplatePreviewDialog";

const LISBON_ID = QUIZSHOW_DEMO_TEMPLATE_IDS.lisbonQueerIcons;

function createClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
}

function renderPreview(
  templateId: string,
  changeNote: { en: string; pt: string } | null = null,
  isAppendOnly = false,
) {
  return render(
    <TestProviders queryClient={createClient()}>
      <QuizshowTemplatePreviewDialog
        templateId={templateId}
        isAdultsAllowed
        changeNote={changeNote}
        canAppend
        isAppendOnly={isAppendOnly}
        isPending={false}
        onClose={vi.fn()}
        onUse={vi.fn()}
        onAppend={vi.fn()}
      />
    </TestProviders>,
  );
}

describe("QuizshowTemplatePreviewDialog", () => {
  beforeEach(async () => {
    resetQuizshowDemoTemplates();
    await awaitCatalog("quizshow");
  });

  it("holds the actions back while the preview loads", async () => {
    renderPreview(LISBON_ID);

    // Checked in the same tick as the render: the read has not answered yet.
    expect(
      screen.queryByRole("button", { name: "Use this template" }),
    ).toBeNull();
    const dialog = await screen.findByRole("dialog", {
      name: "Template preview",
    });
    expect(
      await within(dialog).findByRole("button", { name: "Use this template" }),
    ).toBeTruthy();
  });

  it("names the cause when the template is gone", async () => {
    renderPreview("a7e3b1c0-5eed-4000-8000-0000000000ff");

    const dialog = await screen.findByRole("dialog");
    expect(
      await within(dialog).findByText("We couldn't load this template"),
    ).toBeTruthy();
    expect(
      within(dialog).queryByRole("button", { name: "Use this template" }),
    ).toBeNull();
  });

  it("lists every prompt and never an option or an answer", async () => {
    const lisbon = demoGetTemplate(LISBON_ID);
    renderPreview(LISBON_ID, { en: "Two new rounds", pt: "Duas rondas novas" });

    const dialog = await screen.findByRole("dialog");
    expect(await within(dialog).findByText("Two new rounds")).toBeTruthy();
    const dialogText = dialog.textContent ?? "";
    const prompts = lisbon.quiz.rounds.flatMap((round) =>
      round.questions.map((question) => question.prompt.en),
    );
    expect(prompts.length).toBeGreaterThan(0);
    for (const prompt of prompts) {
      expect(dialogText).toContain(prompt);
    }
    const optionTexts = lisbon.quiz.rounds.flatMap((round) =>
      round.questions.flatMap((question) =>
        question.options.map((option) => option.text.en),
      ),
    );
    const typedAnswers = lisbon.quiz.rounds.flatMap((round) =>
      round.questions.flatMap((question) =>
        question.type === "type_answer" && question.answer
          ? [question.answer.text.en]
          : [],
      ),
    );
    // The rounds list is checked; a text a prompt or a round title quotes,
    // or a short one (a number, "Yes") that copy may hold, proves nothing.
    const roundsText = dialog.querySelector("ol")?.textContent ?? "";
    const shownTexts = [
      ...prompts,
      ...lisbon.quiz.rounds.map((round) => round.title.en),
    ];
    for (const hiddenText of [...optionTexts, ...typedAnswers]) {
      if (hiddenText.trim().length < 4) continue;
      if (shownTexts.some((shown) => shown.includes(hiddenText))) continue;
      expect(roundsText).not.toContain(hiddenText);
    }
  });

  it("add-only mode pins Add these rounds in the footer and hides the toggle", async () => {
    renderPreview(LISBON_ID, null, true);

    const dialog = await screen.findByRole("dialog", {
      name: "Template preview",
    });
    await within(dialog).findAllByRole("checkbox");
    const submit = within(dialog).getByRole("button", {
      name: "Add these rounds",
    });
    // The footer sits outside the scrolling body, so it never ends the scroll.
    const body = dialog.querySelector("ol")?.closest("[class*='modalBody']");
    expect(body).not.toBeNull();
    expect(body?.contains(submit)).toBe(false);
    expect(
      within(dialog).queryByRole("button", {
        name: "Add rounds from this template",
      }),
    ).toBeNull();
    expect(submit).toHaveAttribute("aria-disabled", "true");
  });
});
