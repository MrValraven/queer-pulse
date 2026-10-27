import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { QuizshowTemplateCardField } from "../../../shared/contracts/quizshow";
import { resetQuizshowDemoStore } from "../api/quizshowDemoStore";
import { demoGetTemplate } from "../api/quizshowDemoTemplates";
import { QUIZSHOW_DEMO_TEMPLATE_IDS } from "../demo/quizshowTemplates.data";
import { QuizshowTemplateDetails } from "./QuizshowTemplateDetails";
import {
  missingCardFieldsOf,
  quizResponseOfTemplate,
  type QuizshowTemplateQuizResponse,
} from "./quizshowTemplateResponse";
import { useQuizshowTemplateDraft } from "./useQuizshowTemplateDraft";
import type { QuizshowTemplatePublishing } from "./useQuizshowTemplatePublish";

const SAVE_FIRST_KEY = "quizshow:templates.details.saveFirst";
const FIX_FIRST_KEY = "quizshow:templates.details.fixFirst";
const CARD_INCOMPLETE_KEY = "quizshow:errors.template_card_incomplete";

/**
 * The real draft hook over an adapted template, with a stub publish: it blocks
 * on unsaved edits (or on `hasQuizProblems`), and a Publish click shows the
 * card fields still blank.
 */
function DetailsHarness({
  response,
  hasQuizProblems = false,
  isPending = false,
}: {
  response: QuizshowTemplateQuizResponse;
  hasQuizProblems?: boolean;
  isPending?: boolean;
}) {
  const templateDraft = useQuizshowTemplateDraft({ data: response });
  const [shownMissingFields, setShownMissingFields] = useState<
    readonly QuizshowTemplateCardField[]
  >([]);
  const { languages } = response.quiz;
  const localMissing = missingCardFieldsOf(templateDraft.card, languages);
  let blockedReasonKey: string | null = null;
  if (templateDraft.isUnsaved) blockedReasonKey = SAVE_FIRST_KEY;
  else if (hasQuizProblems) blockedReasonKey = FIX_FIRST_KEY;
  else if (localMissing.length > 0) blockedReasonKey = CARD_INCOMPLETE_KEY;
  const publishing: QuizshowTemplatePublishing = {
    isPending,
    blockedReasonKey,
    shownMissingFields,
    rejectedProblems: [],
    errorKey: null,
    publish: () => setShownMissingFields(localMissing),
    unpublish: () => undefined,
  };
  return (
    <QuizshowTemplateDetails
      templateDraft={templateDraft}
      meta={response.template}
      languages={languages}
      publishing={publishing}
    />
  );
}

function renderDetails(
  templateId: string,
  options: { hasQuizProblems?: boolean; isPending?: boolean } = {},
) {
  const response = quizResponseOfTemplate(demoGetTemplate(templateId));
  const { unmount } = render(
    <TestProviders>
      <DetailsHarness
        response={response}
        hasQuizProblems={options.hasQuizProblems}
        isPending={options.isPending}
      />
    </TestProviders>,
  );
  return { response, unmount };
}

/** The panel's own status line; the toast regions carry the role too. */
function panelStatusLine(): HTMLElement {
  const panel = screen.getByRole("region", { name: "Template card" });
  return within(panel).getByRole("status");
}

function publishButton(): HTMLElement {
  return screen.getByRole("button", { name: "Publish template" });
}

function describedTextOf(element: HTMLElement): string {
  const describedById = element.getAttribute("aria-describedby");
  if (describedById === null) return "";
  return document.getElementById(describedById)?.textContent ?? "";
}

describe("QuizshowTemplateDetails", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("shows the card title and description in both languages and the staff notes", () => {
    const { response } = renderDetails(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory);
    const { card, staffNotes } = response.template;

    expect(
      screen.getByRole("region", { name: "Template card" }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue(card.title.en)).toBeInTheDocument();
    expect(screen.getByDisplayValue(card.title.pt)).toBeInTheDocument();
    expect(screen.getByDisplayValue(card.description.en)).toBeInTheDocument();
    expect(screen.getByDisplayValue(card.description.pt)).toBeInTheDocument();
    const notesField = screen.getByRole("textbox", { name: /Staff notes/ });
    expect((notesField as HTMLTextAreaElement).value).toBe(staffNotes);
    expect(staffNotes).toContain("Round 1, question 1:");
  });

  it("shows Draft or who published it and when", () => {
    const draftView = renderDetails(QUIZSHOW_DEMO_TEMPLATE_IDS.queerCinema);
    expect(panelStatusLine()).toHaveTextContent("Draft. Only our team sees it");
    draftView.unmount();

    renderDetails(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory);
    const statusLine = panelStatusLine();
    expect(statusLine).toHaveTextContent(/^Published .*2026 by Rui Marçal$/);
    expect(statusLine).not.toHaveTextContent("Draft");
  });

  it("keeps Publish template blocked while there are unsaved changes and says to save first", async () => {
    const user = userEvent.setup();
    renderDetails(QUIZSHOW_DEMO_TEMPLATE_IDS.queerCinema);
    const englishTitle = screen.getByDisplayValue("Queer cinema classics");

    await user.type(englishTitle, " revisited");

    const button = publishButton();
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toHaveAttribute("disabled");
    expect(describedTextOf(button)).toBe(
      "Save your changes first, then publish",
    );
  });

  it("says to fix the problems first", () => {
    renderDetails(QUIZSHOW_DEMO_TEMPLATE_IDS.queerCinema, {
      hasQuizProblems: true,
    });
    const button = publishButton();
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(describedTextOf(button)).toBe(
      "Fix the problems listed below, then publish",
    );
  });

  it("names the missing card fields after a blocked Publish", async () => {
    const user = userEvent.setup();
    renderDetails(QUIZSHOW_DEMO_TEMPLATE_IDS.queerCinema);
    expect(
      screen.queryByText("Add a description in this language"),
    ).not.toBeInTheDocument();

    const button = publishButton();
    expect(button).toHaveAttribute("aria-disabled", "true");
    await user.click(button);

    const missingLine = await screen.findByText(
      "Add a description in this language",
    );
    const descriptionGroup = screen.getByRole("group", {
      name: "Card description",
    });
    expect(descriptionGroup).toContainElement(missingLine);
    const portugueseDescription = missingLine
      .closest("div")
      ?.querySelector("textarea");
    expect(portugueseDescription).toHaveAttribute("aria-invalid", "true");
    expect(portugueseDescription).toHaveValue("");
    expect(
      screen.queryByText("Add a title in this language"),
    ).not.toBeInTheDocument();
  });

  it("moves focus to the blank Portuguese description after a blocked Publish", async () => {
    const user = userEvent.setup();
    renderDetails(QUIZSHOW_DEMO_TEMPLATE_IDS.queerCinema);

    await user.click(publishButton());

    const missingLine = await screen.findByText(
      "Add a description in this language",
    );
    const portugueseDescription = missingLine
      .closest("div")
      ?.querySelector("textarea");
    expect(portugueseDescription).toHaveValue("");
    expect(portugueseDescription).toHaveFocus();
  });

  it("marks the publish button busy with no blocked state while a write runs", () => {
    renderDetails(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory, {
      isPending: true,
    });
    const button = screen.getByRole("button", { name: "Unpublish template" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).not.toHaveAttribute("aria-disabled", "true");
    expect(button).not.toHaveAttribute("aria-describedby");
  });

  it("offers Unpublish template on a published template", () => {
    renderDetails(QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory);
    expect(
      screen.getByRole("button", { name: "Unpublish template" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Publish template" }),
    ).not.toBeInTheDocument();
  });
});
