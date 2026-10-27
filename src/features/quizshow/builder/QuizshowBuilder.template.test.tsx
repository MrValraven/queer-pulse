import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { demoRefusal } from "../api/quizshowDemoQuizzes";
import { resetQuizshowDemoStore } from "../api/quizshowDemoStore";
import {
  demoGetTemplate,
  demoPublishTemplate,
  demoPutTemplate,
  demoTemplateCards,
  demoUnpublishTemplate,
} from "../api/quizshowDemoTemplates";
import { QUIZSHOW_DEMO_TEMPLATE_IDS } from "../demo/quizshowTemplates.data";
import { templateScope } from "../quizshowScope";
import { QuizshowBuilder } from "./QuizshowBuilder";

vi.mock("../../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../shared/hooks")>()),
  useUnsavedChangesGuard: vi.fn(),
}));

vi.mock("../api/quizshowDemoTemplates", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoTemplates")>();
  return {
    ...actual,
    demoPutTemplate: vi.fn(actual.demoPutTemplate),
    demoPublishTemplate: vi.fn(actual.demoPublishTemplate),
  };
});

const PRIDE_ID = QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory;
const CINEMA_ID = QUIZSHOW_DEMO_TEMPLATE_IDS.queerCinema;
const UNKNOWN_ID = "a7e3b1c0-5eed-4000-8000-0000000000ff";
const STORED_PICTURE = "/files/k.jpg";

function renderTemplate(templateId: string) {
  return render(
    <TestProviders>
      <QuizshowBuilder scope={templateScope(templateId)} eventStartAt={null} />
    </TestProviders>,
  );
}

/** A field of a bilingual input: the group carries the label, each field its language tag and counter. */
async function findBilingualField(
  groupName: string,
  languageTag: "EN" | "PT",
): Promise<HTMLElement> {
  const group = await screen.findByRole("group", { name: groupName });
  return within(group).getByRole("textbox", {
    name: new RegExp(`^${languageTag}`),
  });
}

async function findStaffNotes(): Promise<HTMLElement> {
  return screen.findByRole("textbox", { name: /^Staff notes/ });
}

/** Stores a picture on the template's first question, as an earlier save would have. */
function seedStoredPicture(templateId: string): void {
  const detail = demoGetTemplate(templateId);
  const { quiz } = detail;
  const [firstRound, ...otherRounds] = quiz.rounds;
  if (!firstRound) throw new Error("The demo template has no rounds");
  const [firstQuestion, ...otherQuestions] = firstRound.questions;
  if (!firstQuestion) throw new Error("The demo round has no questions");
  demoPutTemplate(templateId, {
    card: detail.card,
    staffNotes: detail.staffNotes,
    quiz: {
      expectedUpdatedAt: quiz.updatedAt,
      title: quiz.title,
      languages: quiz.languages,
      screenLanguage: quiz.screenLanguage,
      rounds: [
        {
          ...firstRound,
          questions: [
            { ...firstQuestion, mediaRef: STORED_PICTURE },
            ...otherQuestions,
          ],
        },
        ...otherRounds,
      ],
    },
  });
}

function resetDemoTemplates(): void {
  resetQuizshowDemoStore();
  vi.mocked(demoPutTemplate).mockClear();
  vi.mocked(demoPublishTemplate).mockClear();
}

describe("QuizshowBuilder on a template", () => {
  beforeEach(resetDemoTemplates);

  it("shows the template card and Try it, with no Open lobby, live panel or copy buttons", async () => {
    renderTemplate(PRIDE_ID);
    const heading = await screen.findByRole("heading", {
      name: "Template quiz",
    });
    expect(heading.className).toMatch(/headingGame/);
    expect(
      screen.getByRole("heading", { name: "Template card" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try it" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Open lobby" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Start from a template" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Copy from a past event" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Live game" }),
    ).not.toBeInTheDocument();
    // The live panel's own title (quizshow:live.title).
    expect(screen.queryByText("Game in progress")).not.toBeInTheDocument();
  });

  it("puts the template card first, then the quiz heading, then the rounds", async () => {
    renderTemplate(PRIDE_ID);
    const quizHeading = await screen.findByRole("heading", {
      name: "Template quiz",
    });
    const cardHeading = screen.getByRole("heading", { name: "Template card" });
    const [firstEditButton] = await screen.findAllByRole("button", {
      name: "Edit round",
    });
    if (!firstEditButton) throw new Error("The demo template has no rounds");
    expect(
      cardHeading.compareDocumentPosition(quizHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      quizHeading.compareDocumentPosition(firstEditButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("lets a template round take the adults label", async () => {
    renderTemplate(PRIDE_ID);
    const [firstEditButton] = await screen.findAllByRole("button", {
      name: "Edit round",
    });
    if (!firstEditButton) throw new Error("The demo template has no rounds");
    fireEvent.click(firstEditButton);
    const adultsLabel = await screen.findByRole("radio", {
      name: "Adults only (18+)",
    });
    expect(adultsLabel).not.toHaveAttribute("aria-disabled");
    fireEvent.click(adultsLabel);
    expect(adultsLabel).toHaveAttribute("aria-checked", "true");
  });

  it("saves the card, staff notes and quiz in one save", async () => {
    renderTemplate(PRIDE_ID);
    fireEvent.change(await findBilingualField("Card title", "EN"), {
      target: { value: "Pride history night" },
    });
    fireEvent.change(await findStaffNotes(), {
      target: { value: "Checked every date against the archive" },
    });
    fireEvent.click(
      await screen.findByRole("button", { name: "Save template" }),
    );
    expect(await screen.findByText("Template saved")).toBeInTheDocument();
    expect(demoPutTemplate).toHaveBeenCalledTimes(1);
    const [savedTemplateId, savedBody] =
      vi.mocked(demoPutTemplate).mock.calls[0] ?? [];
    expect(savedTemplateId).toBe(PRIDE_ID);
    expect(savedBody?.card.title.en).toBe("Pride history night");
    expect(savedBody?.staffNotes).toBe(
      "Checked every date against the archive",
    );
    expect(savedBody?.quiz.title).toBe(demoGetTemplate(PRIDE_ID).quiz.title);
    expect(savedBody?.quiz.rounds.length).toBeGreaterThan(0);
    expect(demoGetTemplate(PRIDE_ID).card.title.en).toBe("Pride history night");
    await waitFor(() =>
      expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument(),
    );
  });

  it("counts a card edit as unsaved", async () => {
    renderTemplate(PRIDE_ID);
    const cardTitle = await findBilingualField("Card title", "EN");
    expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument();
    fireEvent.change(cardTitle, { target: { value: "Pride history night" } });
    expect(await screen.findByText("Unsaved changes")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));
    await waitFor(() =>
      expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument(),
    );
    expect(await findBilingualField("Card title", "EN")).toHaveValue(
      "Pride and queer history",
    );
  });

  it("blocks Save on a blank quiz title and says why", async () => {
    renderTemplate(PRIDE_ID);
    const titleField = await screen.findByLabelText("Quiz title");
    fireEvent.change(titleField, { target: { value: "   " } });
    await waitFor(() =>
      expect(titleField).toHaveAccessibleDescription("Give the quiz a title"),
    );
    expect(titleField).toHaveAttribute("aria-invalid", "true");
    const saveButton = await screen.findByRole("button", {
      name: "Save template",
    });
    expect(saveButton).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(saveButton);
    expect(demoPutTemplate).not.toHaveBeenCalled();
  });

  it("sends a stored picture back unchanged", async () => {
    seedStoredPicture(PRIDE_ID);
    vi.mocked(demoPutTemplate).mockClear();
    renderTemplate(PRIDE_ID);
    fireEvent.change(await findBilingualField("Card title", "EN"), {
      target: { value: "Pride history night" },
    });
    fireEvent.click(
      await screen.findByRole("button", { name: "Save template" }),
    );
    expect(await screen.findByText("Template saved")).toBeInTheDocument();
    expect(demoPutTemplate).toHaveBeenCalledTimes(1);
    const [, savedBody] = vi.mocked(demoPutTemplate).mock.calls[0] ?? [];
    expect(savedBody?.quiz.rounds[0]?.questions[0]?.mediaRef).toBe(
      STORED_PICTURE,
    );
  });
});

describe("QuizshowBuilder publishing a template", () => {
  beforeEach(resetDemoTemplates);

  it("publishes only after the card edit is saved", async () => {
    renderTemplate(CINEMA_ID);
    fireEvent.change(await findBilingualField("Card description", "PT"), {
      target: {
        value: "Realizadores, prémios e os filmes que toda a gente cita",
      },
    });
    const publishButton = await screen.findByRole("button", {
      name: "Publish template",
    });
    await waitFor(() =>
      expect(publishButton).toHaveAttribute("aria-disabled", "true"),
    );
    expect(publishButton).toHaveAccessibleDescription(
      "Save your changes first, then publish",
    );
    fireEvent.click(publishButton);
    expect(demoPublishTemplate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Save template" }));
    expect(await screen.findByText("Template saved")).toBeInTheDocument();
    const savedPublishButton = screen.getByRole("button", {
      name: "Publish template",
    });
    await waitFor(() =>
      expect(savedPublishButton).not.toHaveAttribute("aria-disabled", "true"),
    );
    fireEvent.click(savedPublishButton);
    expect(
      await screen.findByText(/^Published .+ by Rui Marçal$/),
    ).toBeInTheDocument();
    expect(demoPublishTemplate).toHaveBeenCalledTimes(1);
    expect(
      demoTemplateCards().items.map((templateCard) => templateCard.id),
    ).toContain(CINEMA_ID);
  });

  it("shows the server's publish refusal in the problem list", async () => {
    demoUnpublishTemplate(PRIDE_ID);
    vi.mocked(demoPublishTemplate).mockImplementationOnce(() => {
      throw demoRefusal(422, "quizshow_quiz_invalid", {
        problems: [
          {
            code: "prompt_missing",
            roundIndex: 0,
            questionIndex: 0,
            language: "en",
          },
        ],
      });
    });
    renderTemplate(PRIDE_ID);
    fireEvent.click(
      await screen.findByRole("button", { name: "Publish template" }),
    );
    const alert = await screen.findByText(
      "The quiz has problems to fix before you publish",
    );
    expect(alert.closest("[role='alert']")).not.toBeNull();
    const problemsHeading = await screen.findByRole("heading", {
      name: "Before you publish",
    });
    const problemsSection = problemsHeading.closest("section");
    if (!problemsSection) throw new Error("The problem list has no section");
    expect(
      within(problemsSection).getByText(
        "Round 1, question 1 needs its question text (EN)",
      ),
    ).toBeInTheDocument();
    expect(
      within(problemsSection).getByRole("button", { name: "Go to it" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Before you open the lobby" }),
    ).not.toBeInTheDocument();
  });

  it("unpublishes a published template", async () => {
    renderTemplate(PRIDE_ID);
    expect(
      await screen.findByText(/^Published .+ by Rui Marçal$/),
    ).toBeInTheDocument();
    fireEvent.click(
      await screen.findByRole("button", { name: "Unpublish template" }),
    );
    expect(
      await screen.findByText("Draft. Only our team sees it"),
    ).toBeInTheDocument();
    expect(
      demoTemplateCards().items.map((templateCard) => templateCard.id),
    ).not.toContain(PRIDE_ID);
    expect(
      await screen.findByRole("button", { name: "Publish template" }),
    ).toBeInTheDocument();
  });

  it("says the template is gone for an unknown id", async () => {
    renderTemplate(UNKNOWN_ID);
    expect(
      await screen.findByText("We couldn't find that template"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Template quiz" }),
    ).not.toBeInTheDocument();
  });
});
