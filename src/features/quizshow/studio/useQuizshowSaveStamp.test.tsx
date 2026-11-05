import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type {
  QuizshowQuestion,
  QuizshowQuiz,
  QuizshowQuizResponse,
} from "../../../shared/contracts/quizshow";
import type { QuizshowSaveInput } from "../api/useQuizshowMutations";
import { defaultRoundSettings, newQuestion } from "../builder/quizshowDraft";
import { useQuizshowDraft } from "../builder/useQuizshowDraft";
import { useQuizshowSave } from "../builder/useQuizshowSave";
import { gameScope } from "../quizshowScope";

const { mutateAsync } = vi.hoisted(() => ({
  mutateAsync:
    vi.fn<(body: QuizshowSaveInput) => Promise<QuizshowQuizResponse>>(),
}));

vi.mock("../api/useQuizshowMutations", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/useQuizshowMutations")>();
  return {
    ...actual,
    useSaveQuizshowQuiz: () => ({ mutateAsync, isPending: false }),
  };
});

const OUR_FIRST_SAVE = "2026-11-04T10:00:00.000Z";
const OUR_SECOND_SAVE = "2026-11-04T10:00:10.000Z";
const CO_HOST_SAVE = "2026-11-04T10:00:20.000Z";

function storedQuiz(promptText: string, updatedAt: string): QuizshowQuiz {
  const question: QuizshowQuestion = {
    ...newQuestion("true_false", "quiz"),
    id: "round-1-question-1",
    mediaUrl: null,
    prompt: { en: promptText, pt: promptText },
    answer: { isTrue: true },
  };
  return {
    title: "Pride trivia",
    languages: "en",
    screenLanguage: "en",
    sourceTemplateId: null,
    updatedAt,
    rounds: [
      {
        id: "round-1",
        kind: "quiz",
        title: { en: "History", pt: "História" },
        contentLabel: "none",
        settings: defaultRoundSettings(),
        questions: [question],
      },
    ],
  };
}

function responseOf(quiz: QuizshowQuiz): QuizshowQuizResponse {
  return {
    quiz,
    problems: [],
    isAdultsEvent: false,
    liveSession: null,
    hasResults: false,
  };
}

/** The studio's pair: the draft and its save, fed by a query the test polls. */
function renderStudioSave(initial: QuizshowQuizResponse) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders>{children}</TestProviders>
  );
  return renderHook(
    ({ data }: { data: QuizshowQuizResponse }) => {
      const controller = useQuizshowDraft(data.quiz);
      const saving = useQuizshowSave({
        scope: gameScope("game-1"),
        data,
        controller,
        refetch: () => Promise.resolve(data),
        isAdultsOnly: false,
        templateFields: null,
      });
      return { controller, saving };
    },
    { initialProps: { data: initial }, wrapper },
  );
}

function editPrompt(
  hook: ReturnType<typeof renderStudioSave>,
  promptText: string,
) {
  act(() => {
    const question =
      hook.result.current.controller.draft.rounds[0]?.questions[0];
    if (question === undefined) throw new Error("fixture has no question");
    hook.result.current.controller.updateQuestion(0, 0, {
      ...question.question,
      prompt: { en: promptText, pt: promptText },
    });
  });
}

async function studioSave(hook: ReturnType<typeof renderStudioSave>) {
  await act(async () => {
    await hook.result.current.saving.saveWithOutcome({
      isSilent: true,
      shouldKeepNewerEdits: true,
    });
  });
}

function lastSentStamp(): string | null | undefined {
  return mutateAsync.mock.lastCall?.[0].expectedUpdatedAt;
}

describe("the studio save's expected updatedAt", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
  });

  it("(a) a stale poll landing after our save never rolls the stamp back", async () => {
    const first = responseOf(
      storedQuiz("Stonewall was in 1969", OUR_FIRST_SAVE),
    );
    const hook = renderStudioSave(first);
    const ours = responseOf(
      storedQuiz("Stonewall, June 1969", OUR_SECOND_SAVE),
    );
    mutateAsync.mockResolvedValueOnce(ours);
    editPrompt(hook, "Stonewall, June 1969");
    await studioSave(hook);
    expect(lastSentStamp()).toBe(OUR_FIRST_SAVE);
    // The save's response reaches the query.
    hook.rerender({ data: ours });

    // A poll that left before our save lands after it, with the older quiz.
    hook.rerender({ data: first });
    editPrompt(hook, "Stonewall, 28 June 1969");
    mutateAsync.mockResolvedValueOnce(
      responseOf(storedQuiz("Stonewall, 28 June 1969", CO_HOST_SAVE)),
    );
    await studioSave(hook);
    expect(lastSentStamp()).toBe(OUR_SECOND_SAVE);
  });

  it("(b) a co-host's version polled under a dirty draft keeps the conflict", async () => {
    const first = responseOf(
      storedQuiz("Stonewall was in 1969", OUR_FIRST_SAVE),
    );
    const hook = renderStudioSave(first);
    editPrompt(hook, "Our edit");

    // Their save arrives by poll while our edit is unsaved.
    hook.rerender({
      data: responseOf(storedQuiz("Their edit", CO_HOST_SAVE)),
    });
    expect(
      hook.result.current.controller.draft.rounds[0]?.questions[0]?.question
        .prompt.en,
    ).toBe("Our edit");
    mutateAsync.mockResolvedValueOnce(
      responseOf(storedQuiz("Our edit", OUR_SECOND_SAVE)),
    );
    await studioSave(hook);
    // The draft is built on our first version, so the server sees the clash.
    expect(lastSentStamp()).toBe(OUR_FIRST_SAVE);
  });

  it("follows a clean draft that adopts a newer quiz", async () => {
    const first = responseOf(
      storedQuiz("Stonewall was in 1969", OUR_FIRST_SAVE),
    );
    const hook = renderStudioSave(first);
    hook.rerender({
      data: responseOf(storedQuiz("Their edit", CO_HOST_SAVE)),
    });
    editPrompt(hook, "Our edit on theirs");
    mutateAsync.mockResolvedValueOnce(
      responseOf(storedQuiz("Our edit on theirs", OUR_SECOND_SAVE)),
    );
    await studioSave(hook);
    expect(lastSentStamp()).toBe(CO_HOST_SAVE);
  });
});
