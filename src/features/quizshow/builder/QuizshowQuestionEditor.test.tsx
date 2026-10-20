import { useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type {
  QuizshowLanguageMode,
  QuizshowQuestionInput,
  QuizshowRoundKind,
} from "../../../shared/contracts/quizshow";
import { TestProviders } from "../../../test/TestProviders";
import { newQuestion } from "./quizshowDraft";
import type { QuizshowLocalProblem } from "./quizshowValidation";
import { QuizshowQuestionEditor } from "./QuizshowQuestionEditor";

const uploads = vi.hoisted(() => {
  const trackedKeys = new Set<string>();
  const deletedKeys: string[] = [];
  return {
    trackedKeys,
    deletedKeys,
    track: (key: string) => {
      trackedKeys.add(key);
    },
    discard: (keptKeys: readonly string[] = []) => {
      for (const key of trackedKeys) {
        if (!keptKeys.includes(key)) deletedKeys.push(key);
      }
      return Promise.resolve();
    },
  };
});
vi.mock("../../members/api/useDiscardableUploads", () => ({
  useDiscardableUploads: () => ({
    track: uploads.track,
    discard: uploads.discard,
  }),
}));
// A picker stub: one button that uploads "next-key" and picks it.
vi.mock("../../subprofiles/ImageUploadField", async () => {
  const { createElement } = await import("react");
  return {
    ImageUploadField: (props: {
      onChange: (key: string) => void;
      onUploaded?: (key: string) => void;
    }) =>
      createElement(
        "button",
        {
          type: "button",
          onClick: () => {
            props.onUploaded?.("next-key");
            props.onChange("next-key");
          },
        },
        "Pick picture",
      ),
  };
});

interface HarnessProps {
  otherReferencedMediaRefs?: readonly string[];
  initial: QuizshowQuestionInput;
  roundKind?: QuizshowRoundKind;
  languages?: QuizshowLanguageMode;
  problems?: readonly QuizshowLocalProblem[];
  onChange?: (question: QuizshowQuestionInput) => void;
}

/** Holds the question the way the draft does, so a click's result shows on screen. */
function Harness({
  initial,
  roundKind = "quiz",
  languages = "both",
  problems = [],
  otherReferencedMediaRefs,
  onChange,
}: HarnessProps) {
  const [question, setQuestion] = useState(initial);
  return (
    <TestProviders>
      <QuizshowQuestionEditor
        roundKind={roundKind}
        languages={languages}
        roundTimeLimitSeconds={20}
        questionNumber={1}
        question={question}
        mediaUrl={null}
        problems={problems}
        otherReferencedMediaRefs={otherReferencedMediaRefs}
        onChange={(next) => {
          setQuestion(next);
          onChange?.(next);
        }}
      />
    </TestProviders>
  );
}

function multipleChoiceWithOptionCount(optionCount: number) {
  const question = newQuestion("multiple_choice", "quiz");
  return { ...question, options: question.options.slice(0, optionCount) };
}

describe("QuizshowQuestionEditor", () => {
  it("shows one input per language the quiz uses", async () => {
    const initial = newQuestion("true_false", "quiz");
    const { unmount } = render(<Harness initial={initial} languages="both" />);
    const bothGroup = await screen.findByRole("group", { name: "Question" });
    expect(
      within(bothGroup).getByRole("textbox", { name: /^EN/ }),
    ).toBeInTheDocument();
    expect(
      within(bothGroup).getByRole("textbox", { name: /^PT/ }),
    ).toBeInTheDocument();
    unmount();

    render(<Harness initial={initial} languages="pt" />);
    const portugueseGroup = await screen.findByRole("group", {
      name: "Question",
    });
    expect(
      within(portugueseGroup).getByRole("textbox", { name: /^PT/ }),
    ).toBeInTheDocument();
    expect(
      within(portugueseGroup).queryByRole("textbox", { name: /^EN/ }),
    ).toBeNull();
  });

  it("marks the correct answer and keeps two to four answers", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { unmount } = render(
      <Harness
        initial={multipleChoiceWithOptionCount(4)}
        onChange={onChange}
      />,
    );
    await screen.findByRole("group", { name: "Question" });
    expect(screen.queryByRole("button", { name: "Add answer" })).toBeNull();

    await user.click(
      screen.getByRole("radio", { name: "Mark answer 2 as correct" }),
    );
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ answer: { correctIndex: 1 } }),
    );

    await user.click(screen.getByRole("button", { name: "Remove answer 4" }));
    expect(
      await screen.findByRole("button", { name: "Add answer" }),
    ).toBeInTheDocument();
    unmount();

    render(<Harness initial={multipleChoiceWithOptionCount(2)} />);
    await screen.findByRole("group", { name: "Question" });
    expect(screen.queryByRole("button", { name: /^Remove answer/ })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Add answer" }),
    ).toBeInTheDocument();
  });

  it("adds and removes accepted answers up to ten", async () => {
    const user = userEvent.setup();
    render(<Harness initial={newQuestion("type_answer", "quiz")} />);
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

  it("reorders order items with the up and down buttons", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const initial = newQuestion("order", "quiz");
    render(
      <Harness
        initial={{
          ...initial,
          options: initial.options.map((option) => ({
            ...option,
            text: { en: option.id.toUpperCase(), pt: option.id.toUpperCase() },
          })),
        }}
        onChange={onChange}
      />,
    );

    await user.click(
      await screen.findByRole("button", { name: "Move item 1 down" }),
    );

    const lastQuestion = onChange.mock.lastCall?.[0] as QuizshowQuestionInput;
    expect(lastQuestion.options.map((option) => option.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
    expect(lastQuestion.answer).toEqual({ orderedIds: ["b", "a", "c"] });
  });
});

describe("QuizshowQuestionEditor pictures and problems", () => {
  it("asks Caption This for a picture and Lie Detector for the truth", async () => {
    const mediaProblem: QuizshowLocalProblem = {
      code: "media_missing",
      roundIndex: 0,
      questionIndex: 0,
      language: null,
    };
    const { unmount } = render(
      <Harness
        roundKind="caption_this"
        initial={newQuestion("prompt", "caption_this")}
        problems={[mediaProblem]}
      />,
    );
    expect(await screen.findByText("Picture")).toBeInTheDocument();
    expect(
      screen.getByText("Round 1, question 1 needs a picture"),
    ).toBeInTheDocument();
    unmount();

    render(
      <Harness
        roundKind="lie_detector"
        initial={newQuestion("prompt", "lie_detector")}
      />,
    );
    expect(await screen.findByText("The true answer")).toBeInTheDocument();
    expect(screen.queryByText("Picture")).toBeNull();
  });

  it("keeps the prompt when the question type changes", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const initial = newQuestion("multiple_choice", "quiz");
    render(
      <Harness
        initial={{ ...initial, prompt: { en: "Who?", pt: "Quem?" } }}
        onChange={onChange}
      />,
    );

    await user.click(
      await screen.findByRole("button", { name: "Question type" }),
    );
    await user.click(
      await screen.findByRole("option", { name: "True or false" }),
    );

    const lastQuestion = onChange.mock.lastCall?.[0] as QuizshowQuestionInput;
    expect(lastQuestion.type).toBe("true_false");
    expect(lastQuestion.prompt).toEqual({ en: "Who?", pt: "Quem?" });
  });

  it("names a field's problem beside it", async () => {
    const promptProblem: QuizshowLocalProblem = {
      code: "prompt_missing",
      roundIndex: 0,
      questionIndex: 0,
      language: "pt",
    };
    render(
      <Harness
        initial={newQuestion("true_false", "quiz")}
        problems={[promptProblem]}
      />,
    );

    const portugueseInput = await screen.findByRole("textbox", { name: /^PT/ });
    const problemLine = screen.getByText(
      "Round 1, question 1 needs its question text (PT)",
    );
    expect(portugueseInput.getAttribute("aria-describedby")).toContain(
      problemLine.id,
    );
    expect(screen.getByRole("textbox", { name: /^EN/ })).not.toHaveAttribute(
      "aria-invalid",
    );
  });

  it("hides points and seconds on a party question", async () => {
    const { unmount } = render(
      <Harness initial={newQuestion("true_false", "quiz")} />,
    );
    expect(await screen.findByText("Points")).toBeInTheDocument();
    expect(screen.getByText("Seconds for this question")).toBeInTheDocument();
    unmount();

    render(
      <Harness
        roundKind="drag_name"
        initial={newQuestion("prompt", "drag_name")}
      />,
    );
    expect(await screen.findByText("Prompt")).toBeInTheDocument();
    expect(screen.queryByText("Points")).toBeNull();
    expect(screen.queryByText("Seconds for this question")).toBeNull();
  });

  it("keeps an image the duplicate still uses when the original's image is replaced", async () => {
    const user = userEvent.setup();
    const captionQuestion = {
      ...newQuestion("prompt", "caption_this"),
      mediaRef: "shared-key",
    };

    // The duplicate still uses "shared-key": replacing it deletes nothing.
    uploads.trackedKeys.clear();
    uploads.deletedKeys.length = 0;
    uploads.track("shared-key");
    const guarded = render(
      <Harness
        roundKind="caption_this"
        initial={captionQuestion}
        otherReferencedMediaRefs={["shared-key"]}
      />,
    );
    await user.click(
      await screen.findByRole("button", { name: "Pick picture" }),
    );
    guarded.unmount();
    expect(uploads.deletedKeys).toEqual([]);

    // Nothing else uses it: the replaced upload is taken back.
    uploads.trackedKeys.clear();
    uploads.track("shared-key");
    const unguarded = render(
      <Harness roundKind="caption_this" initial={captionQuestion} />,
    );
    await user.click(
      await screen.findByRole("button", { name: "Pick picture" }),
    );
    unguarded.unmount();
    expect(uploads.deletedKeys).toEqual(["shared-key"]);
  });
});
