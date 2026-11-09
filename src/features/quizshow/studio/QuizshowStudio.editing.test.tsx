import { QueryClient } from "@tanstack/react-query";
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
import type {
  QuizshowImportSource,
  QuizshowPlayableRoundKind,
  QuizshowQuiz,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import { TestProviders } from "../../../test/TestProviders";
import {
  demoPutQuiz,
  demoQuizFor,
  resetQuizshowDemoStore,
} from "../api/quizshowDemoStore";
import { QUIZSHOW_DEMO_LIVE_SLUG } from "../api/quizshowDemoStore.data";
import { demoTemplateCards } from "../api/quizshowDemoTemplates";
import { quizshowKeys } from "../api/quizshowKeys";
import {
  blankDraft,
  draftToInput,
  newQuestion,
  newRound,
  newWheel,
  type QuizshowDraftRound,
} from "../builder/quizshowDraft";
import { eventScope } from "../quizshowScope";
import { QuizshowStudio } from "./QuizshowStudio";
import { STUDIO_ROUND_HEADER_ATTRIBUTE } from "./quizshowStudioDom";
import { STUDIO_THUMBNAIL_ATTRIBUTE } from "./useStudioShortcuts";

vi.mock("../../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../shared/hooks")>()),
  useUnsavedChangesGuard: vi.fn(),
}));

vi.mock("../api/quizshowDemoStore", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoStore")>();
  return { ...actual, demoPutQuiz: vi.fn(actual.demoPutQuiz) };
});

const SLUG = "pride-quiz-night";
const BACK_LINK = {
  to: "/gatherings/pride-quiz-night/manage?tab=quizshow",
  labelKey: "quizshow:studio.backToManage",
};

const ADULTS_SOURCE: QuizshowImportSource = {
  eventSlug: "late-night-quiz",
  eventTitle: "Late night quiz",
  startAt: "2026-09-01T21:00:00.000Z",
  quizTitle: "After dark",
  roundCount: 3,
  questionCount: 12,
  hasAdultsRounds: true,
  isSameSeries: false,
  kind: "event",
  gameId: null,
};

function createClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
}

function renderEventStudio(
  options: {
    slug?: string;
    queryClient?: QueryClient;
    eventStartAt?: string | null;
    /** Mounts the app's motion foundation, so a removed row and a closed dialog really leave the DOM. */
    hasMotion?: boolean;
  } = {},
) {
  const studio = (
    <QuizshowStudio
      scope={eventScope(options.slug ?? SLUG)}
      backLink={BACK_LINK}
      eventStartAt={options.eventStartAt ?? null}
    />
  );
  return render(
    <TestProviders queryClient={options.queryClient}>
      {options.hasMotion ? <MotionProvider>{studio}</MotionProvider> : studio}
    </TestProviders>,
  );
}

/** Saves a quiz of these rounds for the event, as an earlier session would have. */
function seedRounds(rounds: QuizshowDraftRound[]): void {
  demoPutQuiz(
    SLUG,
    draftToInput({ ...blankDraft(), title: "Editing night", rounds }, null),
  );
  vi.mocked(demoPutQuiz).mockClear();
}

/** A round of `kind` holding exactly one question of `type`. */
function roundWith(
  kind: QuizshowPlayableRoundKind,
  type: Parameters<typeof newQuestion>[0],
): QuizshowDraftRound {
  const round = newRound(kind);
  const [firstQuestion] = round.questions;
  if (!firstQuestion) throw new Error("A new round has no question");
  return {
    ...round,
    questions: [{ ...firstQuestion, question: newQuestion(type, kind) }],
  };
}

/** A client that already holds this response for the event, kept fresh. */
function seededClient(response: QuizshowQuizResponse): QueryClient {
  const queryClient = createClient();
  queryClient.setQueryData(quizshowKeys.quiz(SLUG, true), response);
  return queryClient;
}

function responseOf(
  quiz: QuizshowQuiz,
  problems: QuizshowQuizResponse["problems"] = [],
): QuizshowQuizResponse {
  return {
    quiz,
    problems,
    isAdultsEvent: false,
    liveSession: null,
    hasResults: false,
  };
}

async function findThumbnail(
  roundIndex: number,
  questionIndex: number,
): Promise<HTMLElement> {
  return waitFor(() => {
    const thumbnail = document.querySelector<HTMLElement>(
      `[${STUDIO_THUMBNAIL_ATTRIBUTE}][data-round-index="${roundIndex}"][data-question-index="${questionIndex}"]`,
    );
    if (!thumbnail) throw new Error("The rail shows no such question");
    return thumbnail;
  });
}

function pressSave() {
  fireEvent.keyDown(document, { key: "s", metaKey: true });
}

/** The save status's own label; the Open lobby tip says "Unsaved changes" too. */
const SAVE_STATUS_LABEL = { selector: "[data-status] span" };

describe("QuizshowStudio start panel", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
    vi.mocked(demoPutQuiz).mockClear();
  });

  it("starts blank with one quiz round", async () => {
    renderEventStudio();
    fireEvent.click(
      await screen.findByRole("button", { name: "Start with a blank quiz" }),
    );
    expect(
      await screen.findByText("Unsaved changes", SAVE_STATUS_LABEL),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        document.querySelectorAll(`[${STUDIO_ROUND_HEADER_ATTRIBUTE}]`),
      ).toHaveLength(1),
    );
    expect(
      screen.getByRole("button", { name: /^Round 1: .*\. Quiz, 1 question$/ }),
    ).toBeInTheDocument();
  });

  it("leads with the last event in this series", async () => {
    renderEventStudio({
      slug: QUIZSHOW_DEMO_LIVE_SLUG,
      eventStartAt: "2026-10-20T18:00:00.000Z",
    });
    const seriesButton = await screen.findByRole("button", {
      name: "Copy from the last event in this series",
    });
    expect(await screen.findByText(/Co-op info night, /)).toBeInTheDocument();
    const templateButton = screen.getByRole("button", {
      name: "Start from a template",
    });
    expect(
      seriesButton.compareDocumentPosition(templateButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("lists only the published templates", async () => {
    const user = userEvent.setup();
    renderEventStudio();
    await user.click(
      await screen.findByRole("button", { name: "Start from a template" }),
    );
    const dialog = await screen.findByRole("dialog");
    const useButtons = await within(dialog).findAllByRole("button", {
      name: /^Use this template/,
    });
    // The picker lists exactly the published cards the demo store serves.
    expect(useButtons).toHaveLength(demoTemplateCards().items.length);
    expect(within(dialog).queryByText("Queer cinema classics")).toBeNull();
  });

  it("keeps a source with adults rounds out of reach on an event without 18+", async () => {
    const user = userEvent.setup();
    const queryClient = createClient();
    queryClient.setQueryData(quizshowKeys.importSources(SLUG, true), {
      items: [ADULTS_SOURCE],
    });
    renderEventStudio({ queryClient });
    await user.click(
      await screen.findByRole("button", { name: "Copy from a past event" }),
    );
    const dialog = await screen.findByRole("dialog");
    const copyButton = within(dialog).getByRole("button", {
      name: "Copy this quiz",
    });
    expect(copyButton).toHaveAttribute("aria-disabled", "true");
    expect(within(dialog).getByText("Has adults rounds")).toBeInTheDocument();
    await user.click(copyButton);
    expect(
      queryClient.getQueryData<QuizshowQuizResponse>(
        quizshowKeys.quiz(SLUG, true),
      )?.quiz ?? null,
    ).toBeNull();
  });
});

describe("QuizshowStudio replacing a quiz", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
    seedRounds([roundWith("quiz", "multiple_choice")]);
  });

  it("asks before a template replaces the quiz, and keeps it on Cancel", async () => {
    const user = userEvent.setup();
    renderEventStudio();
    await user.click(
      await screen.findByRole("button", { name: "More actions" }),
    );
    await user.click(
      await screen.findByRole("menuitem", { name: "Replace with a template" }),
    );
    const [firstUseButton] = await screen.findAllByRole("button", {
      name: /^Use this template/,
    });
    if (!firstUseButton) throw new Error("The picker lists no template");
    await user.click(firstUseButton);
    const confirm = await screen.findByRole("dialog", {
      name: "Replace this quiz?",
    });
    await user.click(within(confirm).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByText("Quiz copied")).not.toBeInTheDocument();
    for (const titleField of screen.getAllByLabelText("Quiz title")) {
      expect(titleField).toHaveValue("Editing night");
    }
  });
});

describe("QuizshowStudio problems", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
    vi.mocked(demoPutQuiz).mockClear();
  });

  it("holds the save on a structural problem and lists it", async () => {
    const quiz = demoQuizFor(SLUG);
    const [firstRound] = quiz.rounds;
    if (!firstRound) throw new Error("The demo quiz has no rounds");
    firstRound.contentLabel = "adults";
    renderEventStudio({ queryClient: seededClient(responseOf(quiz)) });
    const [titleField] = await screen.findAllByLabelText("Quiz title");
    if (!titleField) throw new Error("The studio shows no title field");
    fireEvent.change(titleField, { target: { value: "Renamed" } });
    expect(
      (
        await screen.findAllByText(
          "Round 1 is labelled adults only, and this event is not 18+",
        )
      ).length,
    ).toBeGreaterThan(0);
    pressSave();
    await waitFor(() =>
      expect(
        screen.getByText("Unsaved changes", SAVE_STATUS_LABEL),
      ).toBeInTheDocument(),
    );
    expect(demoPutQuiz).not.toHaveBeenCalled();
  });

  it("selects the question a problem points at", async () => {
    const user = userEvent.setup();
    const quiz = demoQuizFor(SLUG);
    const firstQuestion = quiz.rounds[0]?.questions[0] as unknown as
      { prompt: { en: string; pt: string } } | undefined;
    if (!firstQuestion) throw new Error("The demo quiz has no questions");
    firstQuestion.prompt = { en: "", pt: "" };
    renderEventStudio({
      queryClient: seededClient(
        responseOf(quiz, [
          {
            code: "prompt_missing",
            roundIndex: 0,
            questionIndex: 0,
            language: "en",
          },
        ]),
      ),
    });
    await user.click(
      await screen.findByRole("button", { name: "1 problem to fix" }),
    );
    const popover = await screen.findByRole("dialog");
    await user.click(
      within(popover).getByRole("button", {
        name: /Round 1, question 1 needs its question text \(EN\)/,
      }),
    );
    await waitFor(async () =>
      expect(await findThumbnail(0, 0)).toHaveAttribute("aria-current", "true"),
    );
  });
});

describe("QuizshowStudio question fields in the inspector", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("keeps two to four multiple choice answers", async () => {
    const user = userEvent.setup();
    seedRounds([roundWith("quiz", "multiple_choice")]);
    renderEventStudio();
    await user.click(await findThumbnail(0, 0));
    await screen.findByRole("radio", { name: "Mark answer 2 as correct" });
    // A new question holds four answers, the most there can be.
    expect(screen.queryByRole("button", { name: "Add answer" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Remove answer 4" }));
    await user.click(
      await screen.findByRole("button", { name: "Remove answer 3" }),
    );
    expect(
      await screen.findByRole("button", { name: "Add answer" }),
    ).toBeInTheDocument();
    // Two answers are the fewest: neither can go.
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: /^Remove answer/ }),
      ).toBeNull(),
    );
  });

  it("adds and removes accepted answers up to ten", async () => {
    const user = userEvent.setup();
    seedRounds([roundWith("quiz", "type_answer")]);
    renderEventStudio();
    await user.click(await findThumbnail(0, 0));
    const acceptedInput = await screen.findByRole("textbox", {
      name: "Also accept",
    });
    for (let count = 1; count <= 10; count += 1) {
      await user.type(acceptedInput, `Spelling ${count}`);
      await user.click(screen.getByRole("button", { name: "Add" }));
    }
    expect(screen.getByText("Spelling 10")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("textbox", { name: "Also accept" })).toBeNull(),
    );
    await user.click(screen.getByRole("button", { name: "Remove Spelling 3" }));
    await waitFor(() => expect(screen.queryByText("Spelling 3")).toBeNull());
    expect(
      await screen.findByRole("textbox", { name: "Also accept" }),
    ).toBeInTheDocument();
  });

  it("keeps the prompt when the question type changes", async () => {
    const user = userEvent.setup();
    const round = roundWith("quiz", "multiple_choice");
    const [firstQuestion] = round.questions;
    if (!firstQuestion) throw new Error("The round has no question");
    demoPutQuiz(
      SLUG,
      draftToInput(
        {
          ...blankDraft(),
          title: "Editing night",
          languages: "both",
          rounds: [
            {
              ...round,
              questions: [
                {
                  ...firstQuestion,
                  question: {
                    ...firstQuestion.question,
                    prompt: { en: "Who?", pt: "Quem?" },
                  },
                },
              ],
            },
          ],
        },
        null,
      ),
    );
    renderEventStudio();
    await user.click(await findThumbnail(0, 0));
    const typeGroup = await screen.findByRole("radiogroup", {
      name: "Question type",
    });
    const trueOrFalse = within(typeGroup).getByRole("radio", {
      name: "True or false",
    });
    await user.click(trueOrFalse);
    await waitFor(() =>
      expect(trueOrFalse).toHaveAttribute("aria-checked", "true"),
    );
    const [promptGroup] = await screen.findAllByRole("group", {
      name: "Question",
    });
    if (!promptGroup) throw new Error("The inspector shows no prompt field");
    expect(
      within(promptGroup).getByRole("textbox", { name: /^EN/ }),
    ).toHaveValue("Who?");
    expect(
      within(promptGroup).getByRole("textbox", { name: /^PT/ }),
    ).toHaveValue("Quem?");
  });

  it("hides points and seconds on a party question", async () => {
    const user = userEvent.setup();
    seedRounds([
      roundWith("quiz", "true_false"),
      roundWith("drag_name", "prompt"),
    ]);
    renderEventStudio();
    await user.click(await findThumbnail(0, 0));
    expect(
      await screen.findByRole("heading", { name: "Time and points" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Points").length).toBeGreaterThan(0);

    await user.click(await findThumbnail(1, 0));
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Time and points" }),
      ).toBeNull(),
    );
    expect(screen.queryByText("Points")).toBeNull();
    expect(screen.queryByText("Time to answer")).toBeNull();
  });
});

/** The rail's header for row `roundIndex`: a round header or a wheel card. */
async function findRailHeader(roundIndex: number): Promise<HTMLElement> {
  return waitFor(() => {
    const header = document.querySelector<HTMLElement>(
      `[${STUDIO_ROUND_HEADER_ATTRIBUTE}][data-round-index="${roundIndex}"]`,
    );
    if (!header) throw new Error("The rail shows no such row");
    return header;
  });
}

function thumbnailCount(): number {
  return document.querySelectorAll(`[${STUDIO_THUMBNAIL_ATTRIBUTE}]`).length;
}

/** Opens the rail's Add round or wheel menu and picks the entry named `entryName`. */
async function addFromRail(
  user: ReturnType<typeof userEvent.setup>,
  entryName: RegExp,
): Promise<void> {
  const rail = await screen.findByRole("region", {
    name: "Rounds and questions",
  });
  await user.click(
    within(rail).getByRole("button", { name: "Add round or wheel" }),
  );
  await user.click(await screen.findByRole("menuitem", { name: entryName }));
}

describe("QuizshowStudio wheel rows", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("adds a wheel from the rail and fills it", async () => {
    const user = userEvent.setup();
    seedRounds([roundWith("quiz", "multiple_choice")]);
    renderEventStudio();
    await findThumbnail(0, 0);
    await addFromRail(user, /^Wheel/);
    expect(
      await screen.findByText("Wheel · picks the next round · 0 slices"),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Pick a round" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("radio", { name: /^Pick a round/ }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      (
        await screen.findAllByText(
          "Add at least 2 rounds right after the wheel to fill it",
        )
      ).length,
    ).toBeGreaterThan(0);

    await addFromRail(user, /^Quiz/);
    await addFromRail(user, /^Quiz/);
    expect(
      await screen.findByText("Wheel · picks the next round · 2 slices"),
    ).toBeInTheDocument();
  });

  it("shows the Wheel bonus only inside a range", async () => {
    seedRounds([
      roundWith("quiz", "multiple_choice"),
      newWheel(),
      roundWith("quiz", "multiple_choice"),
      roundWith("quiz", "multiple_choice"),
    ]);
    renderEventStudio({ hasMotion: true });
    fireEvent.click(await findRailHeader(2));
    expect(
      await screen.findByRole("radiogroup", { name: "Wheel bonus" }),
    ).toBeInTheDocument();

    fireEvent.click(await findRailHeader(0));
    await waitFor(() =>
      expect(screen.queryByRole("radiogroup", { name: "Wheel bonus" })).toBe(
        null,
      ),
    );
  });

  it("switches the wheel to pick a question", async () => {
    const user = userEvent.setup();
    seedRounds([
      newWheel(),
      roundWith("quiz", "multiple_choice"),
      roundWith("quiz", "multiple_choice"),
    ]);
    renderEventStudio();
    expect(
      await screen.findByText("Wheel · picks the next round · 2 slices"),
    ).toBeInTheDocument();
    fireEvent.click(await findRailHeader(0));
    await user.click(
      await screen.findByRole("radio", {
        name: /^Pick a question from a category/,
      }),
    );
    expect(
      await screen.findByText("Wheel · picks a question · 2 slices"),
    ).toBeInTheDocument();
  });

  it("Delete wheel in the card menu opens Delete this wheel?", async () => {
    const user = userEvent.setup();
    seedRounds([
      newWheel(),
      roundWith("quiz", "multiple_choice"),
      roundWith("quiz", "multiple_choice"),
    ]);
    renderEventStudio({ hasMotion: true });
    fireEvent.click(await findRailHeader(0));
    expect(
      document.querySelectorAll(`[${STUDIO_ROUND_HEADER_ATTRIBUTE}]`),
    ).toHaveLength(3);
    await user.click(
      await screen.findByRole("button", { name: "Options for wheel 1" }),
    );
    await user.click(
      await screen.findByRole("menuitem", { name: "Delete wheel" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Delete this wheel?",
    });
    expect(
      within(dialog).getByText("The rounds after it stay and play in order"),
    ).toBeInTheDocument();
    await user.click(
      within(dialog).getByRole("button", { name: "Delete wheel" }),
    );
    await waitFor(
      () =>
        expect(
          document.querySelectorAll(`[${STUDIO_ROUND_HEADER_ATTRIBUTE}]`),
        ).toHaveLength(2),
      { timeout: 3000 },
    );
    expect(screen.queryByText(/^Wheel · picks/)).toBeNull();
    expect(
      screen.getByRole("button", { name: /^Round 1: .*\. Quiz, 1 question$/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Round 2: .*\. Quiz, 1 question$/ }),
    ).toBeInTheDocument();
  });

  it("hides the question shortcuts in the hint strip while a wheel is selected", async () => {
    seedRounds([
      newWheel(),
      roundWith("quiz", "multiple_choice"),
      roundWith("quiz", "multiple_choice"),
    ]);
    renderEventStudio();
    const wheelCard = await findRailHeader(0);
    fireEvent.click(wheelCard);
    await waitFor(() =>
      expect(document.querySelector('[data-hint="new"]')).toBeNull(),
    );
    expect(document.querySelector('[data-hint="duplicate"]')).toBeNull();
    expect(document.querySelector('[data-hint="move"]')).not.toBeNull();

    fireEvent.click(await findRailHeader(1));
    await waitFor(() =>
      expect(document.querySelector('[data-hint="new"]')).not.toBeNull(),
    );
    expect(document.querySelector('[data-hint="duplicate"]')).not.toBeNull();
  });

  it("shows the wheel at rest in the Phone view of a wheel", async () => {
    const user = userEvent.setup();
    seedRounds([
      newWheel(),
      roundWith("quiz", "multiple_choice"),
      roundWith("quiz", "multiple_choice"),
    ]);
    renderEventStudio();
    fireEvent.click(await findRailHeader(0));
    await user.click(await screen.findByRole("radio", { name: "Phone" }));
    expect(
      await screen.findByText("The wheel spins when the host is ready"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Pick a question to see it on a phone"),
    ).toBeNull();
  });

  it("N on a wheel adds no question", async () => {
    seedRounds([
      newWheel(),
      roundWith("quiz", "multiple_choice"),
      roundWith("quiz", "multiple_choice"),
    ]);
    renderEventStudio();
    const wheelCard = await findRailHeader(0);
    await findThumbnail(1, 0);
    const thumbnailsBefore = thumbnailCount();
    fireEvent.click(wheelCard);
    fireEvent.keyDown(wheelCard, { key: "n" });
    expect(
      document.querySelector(
        `[${STUDIO_THUMBNAIL_ATTRIBUTE}][data-round-index="0"]`,
      ),
    ).toBeNull();
    expect(thumbnailCount()).toBe(thumbnailsBefore);

    // The same key on a quiz round still adds one, so the wheel's refusal is its own.
    const quizHeader = await findRailHeader(1);
    fireEvent.click(quizHeader);
    fireEvent.keyDown(quizHeader, { key: "n" });
    await waitFor(() => expect(thumbnailCount()).toBe(thumbnailsBefore + 1));
    expect(
      document.querySelector(
        `[${STUDIO_THUMBNAIL_ATTRIBUTE}][data-round-index="0"]`,
      ),
    ).toBeNull();
  });
});
