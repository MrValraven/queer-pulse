import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MotionProvider } from "../../../app/providers/MotionProvider";
import type { QuizshowQuestionInput } from "../../../shared/contracts/quizshow";
import { TestProviders } from "../../../test/TestProviders";
import { demoPutQuiz, resetQuizshowDemoStore } from "../api/quizshowDemoStore";
import {
  blankDraft,
  draftToInput,
  newQuestion,
  newRound,
} from "../builder/quizshowDraft";
import { eventScope } from "../quizshowScope";
import { QuizshowStudio } from "./QuizshowStudio";
import { typeChangeCopyOf, typeChangeLossOf } from "./quizshowTypeChange";
import { STUDIO_THUMBNAIL_ATTRIBUTE } from "./useStudioShortcuts";

vi.mock("../../../shared/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../shared/hooks")>()),
  useUnsavedChangesGuard: vi.fn(),
}));

/** Echoes the key, with its values as JSON when there are any. */
function translateStub(
  key: string,
  values?: Record<string, string | number>,
): string {
  return values ? `${key}${JSON.stringify(values)}` : key;
}

type MultipleChoiceQuestion = Extract<
  QuizshowQuestionInput,
  { type: "multiple_choice" }
>;
type OrderQuestion = Extract<QuizshowQuestionInput, { type: "order" }>;

/** A multiple choice question with these option texts ("" stays blank) and these marks. */
function multipleChoiceWith(
  texts: readonly string[],
  correctIndexes: number[],
): MultipleChoiceQuestion {
  const question = newQuestion("multiple_choice", "quiz");
  if (question.type !== "multiple_choice")
    throw new Error("not multiple choice");
  return {
    ...question,
    prompt: { en: "Which song won?", pt: "Que canção ganhou?" },
    options: question.options.map((option, index) => ({
      ...option,
      text: { en: texts[index] ?? "", pt: texts[index] ?? "" },
    })),
    answer: correctIndexes.length > 0 ? { correctIndexes } : null,
  };
}

function orderWithSixItems(): OrderQuestion {
  const question = newQuestion("order", "quiz");
  if (question.type !== "order") throw new Error("not an order question");
  const options = ["a", "b", "c", "d", "e", "f"].map((id) => ({
    id,
    text: { en: id.toUpperCase(), pt: id.toUpperCase() },
  }));
  return {
    ...question,
    options,
    answer: { orderedIds: options.map((option) => option.id) },
  };
}

describe("typeChangeLossOf", () => {
  it("counts every option with text and the marks going to Type the answer", () => {
    const question = multipleChoiceWith(
      ["Waterloo", "SOS", "Mamma Mia", "Fernando"],
      [0],
    );
    expect(typeChangeLossOf(question, "type_answer", "quiz")).toEqual({
      lostOptionCount: 4,
      isAnswerLost: true,
    });
  });

  it("leaves blank options out of the count", () => {
    const question = multipleChoiceWith(["Waterloo", "SOS", "", ""], [1]);
    expect(typeChangeLossOf(question, "closest_number", "quiz")).toEqual({
      lostOptionCount: 2,
      isAnswerLost: true,
    });
  });

  it("loses nothing between multiple choice and poll", () => {
    const question = multipleChoiceWith(
      ["Waterloo", "SOS", "Mamma Mia", "Fernando"],
      [0],
    );
    expect(typeChangeLossOf(question, "poll", "quiz")).toEqual({
      lostOptionCount: 0,
      isAnswerLost: false,
    });
  });

  it("counts the items past the four multiple choice keeps, and no answer", () => {
    expect(
      typeChangeLossOf(orderWithSixItems(), "multiple_choice", "quiz"),
    ).toEqual({ lostOptionCount: 2, isAnswerLost: false });
  });

  it("sees a true or false answer with no options to lose", () => {
    const question = newQuestion("true_false", "quiz");
    if (question.type !== "true_false") throw new Error("not true or false");
    expect(
      typeChangeLossOf(
        { ...question, answer: { isTrue: true } },
        "multiple_choice",
        "quiz",
      ),
    ).toEqual({ lostOptionCount: 0, isAnswerLost: true });
  });
});

describe("typeChangeCopyOf", () => {
  it("names the options and the answer together", () => {
    expect(
      typeChangeCopyOf(
        { lostOptionCount: 4, isAnswerLost: true },
        "Type the answer",
        translateStub,
      ),
    ).toEqual({
      body: translateStub("quizshow:studio.typeChange.bodyOptionsAndAnswer", {
        type: "Type the answer",
        count: 4,
      }),
      confirm: "quizshow:studio.typeChange.confirm",
    });
  });

  it("names the options alone when the answer stays", () => {
    expect(
      typeChangeCopyOf(
        { lostOptionCount: 2, isAnswerLost: false },
        "Multiple choice",
        translateStub,
      ).body,
    ).toBe(
      translateStub("quizshow:studio.typeChange.bodyOptions", {
        type: "Multiple choice",
        count: 2,
      }),
    );
  });

  it("names the answer alone, with its own button, when no option goes", () => {
    expect(
      typeChangeCopyOf(
        { lostOptionCount: 0, isAnswerLost: true },
        "Multiple choice",
        translateStub,
      ),
    ).toEqual({
      body: translateStub("quizshow:studio.typeChange.bodyAnswer", {
        type: "Multiple choice",
        count: 0,
      }),
      confirm: "quizshow:studio.typeChange.confirmAnswer",
    });
  });
});

const SLUG = "pride-quiz-night";
const BACK_LINK = {
  to: "/gatherings/pride-quiz-night/manage?tab=quizshow",
  labelKey: "quizshow:studio.backToManage",
};

/** Saves a quiz whose one round holds this question, as an earlier session would have. */
function seedQuestion(question: QuizshowQuestionInput): void {
  const round = newRound("quiz");
  const [firstQuestion] = round.questions;
  if (!firstQuestion) throw new Error("A new round has no question");
  demoPutQuiz(
    SLUG,
    draftToInput(
      {
        ...blankDraft(),
        title: "Type change night",
        rounds: [{ ...round, questions: [{ ...firstQuestion, question }] }],
      },
      null,
    ),
  );
}

async function findFirstThumbnail(): Promise<HTMLElement> {
  return waitFor(() => {
    const thumbnail = document.querySelector<HTMLElement>(
      `[${STUDIO_THUMBNAIL_ATTRIBUTE}][data-round-index="0"][data-question-index="0"]`,
    );
    if (!thumbnail) throw new Error("The rail shows no first question");
    return thumbnail;
  });
}

/** The toast card holding `text`; the top bar has its own Undo button too. */
async function findToastCard(text: string): Promise<HTMLElement> {
  return waitFor(() => {
    const card = Array.from(
      document.querySelectorAll<HTMLElement>("[data-toast-id]"),
    ).find((element) => element.textContent?.includes(text));
    if (!card) throw new Error(`No toast says ${text}`);
    return card;
  });
}

describe("QuizshowStudio question type change", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
  });

  it("names what a lossy change removes, then offers Undo in a toast", async () => {
    const user = userEvent.setup();
    seedQuestion(
      multipleChoiceWith(["Waterloo", "SOS", "Mamma Mia", "Fernando"], [0]),
    );
    render(
      <TestProviders>
        <MotionProvider>
          <QuizshowStudio
            scope={eventScope(SLUG)}
            backLink={BACK_LINK}
            eventStartAt={null}
          />
        </MotionProvider>
      </TestProviders>,
    );
    await user.click(await findFirstThumbnail());
    const typeGroup = await screen.findByRole("radiogroup", {
      name: "Question type",
    });
    await user.click(
      within(typeGroup).getByRole("radio", { name: "Type the answer" }),
    );

    expect(
      await screen.findByText(
        "Changing to Type the answer removes the 4 options and the right answer",
      ),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Change type and remove options" }),
    );
    await waitFor(() =>
      expect(
        within(typeGroup).getByRole("radio", { name: "Type the answer" }),
      ).toHaveAttribute("aria-checked", "true"),
    );

    const toastCard = await findToastCard("Changed to Type the answer");
    await user.click(within(toastCard).getByRole("button", { name: "Undo" }));
    await waitFor(() =>
      expect(
        within(typeGroup).getByRole("radio", { name: "Multiple choice" }),
      ).toHaveAttribute("aria-checked", "true"),
    );
  });
});
