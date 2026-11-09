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
import { QuizshowStudio } from "./QuizshowStudio";
import { STUDIO_ROUND_HEADER_ATTRIBUTE } from "./quizshowStudioDom";

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
const LISBON_ID = QUIZSHOW_DEMO_TEMPLATE_IDS.lisbonQueerIcons;
const UNKNOWN_ID = "a7e3b1c0-5eed-4000-8000-0000000000ff";
const STORED_PICTURE = "/files/k.jpg";
const BACK_LINK = {
  to: "/admin/quizshow/templates",
  labelKey: "quizshow:templates.page.back",
};

function renderTemplate(templateId: string) {
  return render(
    <TestProviders>
      <QuizshowStudio scope={templateScope(templateId)} backLink={BACK_LINK} />
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

describe("QuizshowStudio on a template", () => {
  beforeEach(resetDemoTemplates);

  it("shows the template card, Try it and Save template, with no Open lobby, 18+ switch or start buttons", async () => {
    renderTemplate(PRIDE_ID);
    expect(
      await screen.findByRole("heading", { name: "Template card" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try it" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save template" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Open lobby" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Start from a template" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Copy from a past event" }),
    ).not.toBeInTheDocument();
    // The 18+ switch belongs to a game; a template's rounds carry their own labels.
    expect(
      screen.queryByRole("switch", { name: "This game has 18+ content" }),
    ).not.toBeInTheDocument();
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
    await waitFor(() => expect(demoPutTemplate).toHaveBeenCalledTimes(1));
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
    expect(
      screen.getByRole("button", { name: "Save template" }),
    ).not.toHaveAttribute("aria-disabled", "true");
  });

  it("keeps an edit typed while the save is out", async () => {
    renderTemplate(PRIDE_ID);
    const cardTitle = await findBilingualField("Card title", "EN");
    fireEvent.change(cardTitle, { target: { value: "Pride history night" } });
    // vi.fn(implementation) reports no mock implementation, so the real save
    // comes from the actual module, the same store the mock forwards to.
    const { demoPutTemplate: actualPut } = await vi.importActual<
      typeof import("../api/quizshowDemoTemplates")
    >("../api/quizshowDemoTemplates");
    // The host keeps typing after the request body went out.
    vi.mocked(demoPutTemplate).mockImplementationOnce((templateId, body) => {
      fireEvent.change(cardTitle, {
        target: { value: "Pride history night live" },
      });
      return actualPut(templateId, body);
    });
    fireEvent.click(
      await screen.findByRole("button", { name: "Save template" }),
    );
    await waitFor(() => expect(demoPutTemplate).toHaveBeenCalledTimes(1));
    expect(vi.mocked(demoPutTemplate).mock.calls[0]?.[1].card.title.en).toBe(
      "Pride history night",
    );
    expect(await screen.findByText("Unsaved changes")).toBeInTheDocument();
    expect(await findBilingualField("Card title", "EN")).toHaveValue(
      "Pride history night live",
    );
    expect(demoGetTemplate(PRIDE_ID).card.title.en).toBe("Pride history night");

    // The next save sends the kept edit against the version just saved.
    fireEvent.click(screen.getByRole("button", { name: "Save template" }));
    await waitFor(() => expect(demoPutTemplate).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument(),
    );
    expect(demoGetTemplate(PRIDE_ID).card.title.en).toBe(
      "Pride history night live",
    );
  });

  it("discards a card edit back to the saved template", async () => {
    renderTemplate(PRIDE_ID);
    const cardTitle = await findBilingualField("Card title", "EN");
    // Nothing to discard on a saved template.
    expect(
      screen.queryByRole("button", { name: "Discard changes" }),
    ).not.toBeInTheDocument();
    fireEvent.change(cardTitle, { target: { value: "Pride history night" } });
    fireEvent.click(
      await screen.findByRole("button", { name: "Discard changes" }),
    );
    await waitFor(() =>
      expect(screen.queryByText("Unsaved changes")).not.toBeInTheDocument(),
    );
    expect(await findBilingualField("Card title", "EN")).toHaveValue(
      "Pride and queer history",
    );
    expect(demoPutTemplate).not.toHaveBeenCalled();
    // Discard leaves with the changes, so focus moves on to Save template.
    expect(screen.getByRole("button", { name: "Save template" })).toHaveFocus();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Discard changes" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("lets a template round take the adults label", async () => {
    renderTemplate(PRIDE_ID);
    const header = await waitFor(() => {
      const element = document.querySelector<HTMLElement>(
        `[${STUDIO_ROUND_HEADER_ATTRIBUTE}][data-round-index="0"]`,
      );
      if (!element) throw new Error("The rail shows no first round");
      return element;
    });
    fireEvent.click(header);
    const adultsLabel = await screen.findByRole("radio", {
      name: "Adults only (18+)",
    });
    expect(adultsLabel).not.toHaveAttribute("aria-disabled");
    fireEvent.click(adultsLabel);
    expect(adultsLabel).toHaveAttribute("aria-checked", "true");
  });

  it("blocks Save on a blank quiz title", async () => {
    renderTemplate(PRIDE_ID);
    const [titleField] = await screen.findAllByLabelText("Quiz title");
    if (!titleField) throw new Error("The studio shows no title field");
    fireEvent.change(titleField, { target: { value: "   " } });
    const saveButton = await screen.findByRole("button", {
      name: "Save template",
    });
    await waitFor(() =>
      expect(saveButton).toHaveAttribute("aria-disabled", "true"),
    );
    fireEvent.click(saveButton);
    expect(demoPutTemplate).not.toHaveBeenCalled();
    expect(
      (await screen.findAllByText("Give the quiz a title")).length,
    ).toBeGreaterThan(0);
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
    await waitFor(() => expect(demoPutTemplate).toHaveBeenCalledTimes(1));
    const [, savedBody] = vi.mocked(demoPutTemplate).mock.calls[0] ?? [];
    expect(savedBody?.quiz.rounds[0]?.questions[0]?.mediaRef).toBe(
      STORED_PICTURE,
    );
  });
});

describe("QuizshowStudio publishing a template", () => {
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
    fireEvent.click(publishButton);
    expect(demoPublishTemplate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Save template" }));
    await waitFor(() => expect(demoPutTemplate).toHaveBeenCalledTimes(1));
    const savedPublishButton = await screen.findByRole("button", {
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

  it("lists the server's publish refusal with the quiz's problems", async () => {
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
    expect(
      (
        await screen.findAllByText(
          "Round 1, question 1 needs its question text (EN)",
        )
      ).length,
    ).toBeGreaterThan(0);
    expect(demoTemplateCards().items.map((card) => card.id)).not.toContain(
      PRIDE_ID,
    );
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
      screen.queryByRole("heading", { name: "Template card" }),
    ).not.toBeInTheDocument();
  });
});

describe("QuizshowStudio on the Lisbon template with a wheel", () => {
  beforeEach(resetDemoTemplates);

  it("opens with the wheel card first and shows the Wheel bonus on Icons", async () => {
    renderTemplate(LISBON_ID);
    const wheelCard = await waitFor(() => {
      const header = document.querySelector<HTMLElement>(
        `[${STUDIO_ROUND_HEADER_ATTRIBUTE}][data-round-index="0"]`,
      );
      if (!header) throw new Error("The rail shows no first row");
      return header;
    });
    expect(
      await within(wheelCard).findByText(
        "Wheel · picks the next round · 4 slices",
      ),
    ).toBeInTheDocument();

    // Row 2 is the Icons round, the first with a +500 bonus.
    const iconsHeader = document.querySelector<HTMLElement>(
      `[${STUDIO_ROUND_HEADER_ATTRIBUTE}][data-round-index="2"]`,
    );
    if (!iconsHeader) throw new Error("The rail shows no Icons round");
    fireEvent.click(iconsHeader);
    const bonusGroup = await screen.findByRole("radiogroup", {
      name: "Wheel bonus",
    });
    expect(
      within(bonusGroup).getByRole("radio", { name: "+500" }),
    ).toHaveAttribute("aria-checked", "true");
  });
});
