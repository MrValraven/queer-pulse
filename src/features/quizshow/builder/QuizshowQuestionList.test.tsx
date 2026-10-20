import { useState } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type {
  QuizshowQuestion,
  QuizshowQuiz,
} from "../../../shared/contracts/quizshow";
import { TestProviders } from "../../../test/TestProviders";
import { defaultRoundSettings, newQuestion } from "./quizshowDraft";
import { copyPicturePreview } from "./quizshowPicturePreview";
import { QuizshowQuestionList } from "./QuizshowQuestionList";
import { useQuizshowDraft } from "./useQuizshowDraft";

const FIELD_PREVIEW_URL = "blob:field-preview";
const DRAFT_COPY_URL = "blob:draft-copy";

vi.mock("../../members/api/useDiscardableUploads", () => ({
  useDiscardableUploads: () => ({
    track: () => {},
    discard: () => Promise.resolve(),
  }),
}));
vi.mock("./quizshowPicturePreview", () => ({
  copyPicturePreview: vi.fn(() => Promise.resolve("blob:draft-copy")),
}));
// Stands in for the shared picture field the way it behaves: it shows its own
// pick while the parent holds the picked key, else `value`, and revokes its
// own preview url when it unmounts.
vi.mock("../../subprofiles/ImageUploadField", async () => {
  const {
    createElement,
    useEffect,
    useState: useFieldState,
  } = await import("react");
  function PictureFieldStub(props: {
    value: string;
    onChange: (key: string) => void;
    onPreviewChange?: (previewUrl: string | null) => void;
    onUploaded?: (key: string) => void;
  }) {
    const [pick, setPick] = useFieldState<{ key: string; url: string } | null>(
      null,
    );
    useEffect(() => {
      if (pick === null) return undefined;
      return () => URL.revokeObjectURL(pick.url);
    }, [pick]);
    const shownUrl =
      pick !== null && pick.key === props.value ? pick.url : props.value;
    return createElement(
      "div",
      null,
      createElement("img", {
        alt: "Question picture",
        src: shownUrl || undefined,
      }),
      createElement(
        "button",
        {
          type: "button",
          onClick: () => {
            setPick({ key: "picked-key", url: "blob:field-preview" });
            props.onUploaded?.("picked-key");
            props.onChange("picked-key");
            props.onPreviewChange?.("blob:field-preview");
          },
        },
        "Pick picture",
      ),
    );
  }
  return { ImageUploadField: PictureFieldStub };
});

function storedQuiz(): QuizshowQuiz {
  const question: QuizshowQuestion = {
    ...newQuestion("multiple_choice", "quiz"),
    id: "question-1",
    mediaUrl: null,
    prompt: { en: "Where did it start", pt: "Onde começou" },
  };
  return {
    title: "Pride night",
    languages: "en",
    screenLanguage: "en",
    starterPackKey: null,
    updatedAt: "2026-10-20T10:00:00.000Z",
    rounds: [
      {
        id: "round-1",
        kind: "quiz",
        title: { en: "Where it started", pt: "" },
        contentLabel: "none",
        settings: defaultRoundSettings(),
        questions: [question],
      },
    ],
  };
}

/** The real draft behind the question list, with the first question open. */
function Harness() {
  const [quiz] = useState(storedQuiz);
  const controller = useQuizshowDraft(quiz);
  const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(0);
  return (
    <QuizshowQuestionList
      controller={controller}
      roundIndex={0}
      languages="en"
      problems={[]}
      openQuestionIndex={openQuestionIndex}
      onOpenQuestion={setOpenQuestionIndex}
    />
  );
}

describe("QuizshowQuestionList pictures", () => {
  it("a picked picture survives closing and reopening the question", async () => {
    const revokeSpy = vi.spyOn(URL, "revokeObjectURL");
    const user = userEvent.setup();
    render(<Harness />, { wrapper: TestProviders });

    await user.click(
      await screen.findByRole("button", { name: "Pick picture" }),
    );
    expect(copyPicturePreview).toHaveBeenCalledWith(FIELD_PREVIEW_URL);
    // The field shows its own pick while it stays mounted.
    expect(
      screen.getByRole("img", { name: "Question picture" }),
    ).toHaveAttribute("src", FIELD_PREVIEW_URL);
    // Lets the copy land in the draft.
    await act(async () => {
      await Promise.resolve();
    });

    await user.click(screen.getByRole("button", { name: "Close question 1" }));
    await waitFor(() =>
      expect(
        screen.queryByRole("img", { name: "Question picture" }),
      ).not.toBeInTheDocument(),
    );
    // The field took its own preview url with it.
    expect(revokeSpy).toHaveBeenCalledWith(FIELD_PREVIEW_URL);

    await user.click(screen.getByRole("button", { name: "Edit question 1" }));

    expect(
      await screen.findByRole("img", { name: "Question picture" }),
    ).toHaveAttribute("src", DRAFT_COPY_URL);
    expect(revokeSpy).not.toHaveBeenCalledWith(DRAFT_COPY_URL);
    revokeSpy.mockRestore();
  });
});
