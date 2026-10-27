import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { TestProviders } from "../../../test/TestProviders";
import type { QuizshowTemplateCardText } from "../../../shared/contracts/quizshow";
import { quizshowKeys } from "../api/quizshowKeys";
import { resetQuizshowDemoStore } from "../api/quizshowDemoStore";
import { demoRefusal } from "../api/quizshowDemoQuizzes";
import {
  demoGetTemplate,
  demoPublishTemplate,
  demoUnpublishTemplate,
} from "../api/quizshowDemoTemplates";
import { QUIZSHOW_DEMO_TEMPLATE_IDS } from "../demo/quizshowTemplates.data";
import type { QuizshowTemplateQuizResponse } from "./quizshowTemplateResponse";
import { useQuizshowTemplatePublish } from "./useQuizshowTemplatePublish";

vi.mock("../api/quizshowDemoTemplates", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../api/quizshowDemoTemplates")>();
  return {
    ...actual,
    demoPublishTemplate: vi.fn(actual.demoPublishTemplate),
  };
});

const PRIDE_ID = QUIZSHOW_DEMO_TEMPLATE_IDS.prideHistory;

interface PublishHookProps {
  card: QuizshowTemplateCardText;
  savedUpdatedAt: string | null;
  isUnsaved: boolean;
}

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );
  return { queryClient, wrapper };
}

/** The Pride template as a saved draft, which every test publishes. */
function renderPridePublish(initialProps: Partial<PublishHookProps> = {}) {
  demoUnpublishTemplate(PRIDE_ID);
  const detail = demoGetTemplate(PRIDE_ID);
  const { queryClient, wrapper } = setup();
  const props: PublishHookProps = {
    card: detail.card,
    savedUpdatedAt: detail.quiz.updatedAt,
    isUnsaved: false,
    ...initialProps,
  };
  const hook = renderHook(
    (hookProps: PublishHookProps) =>
      useQuizshowTemplatePublish({
        templateId: PRIDE_ID,
        card: hookProps.card,
        languages: detail.quiz.languages,
        savedUpdatedAt: hookProps.savedUpdatedAt,
        isUnsaved: hookProps.isUnsaved,
        hasQuizProblems: false,
      }),
    { wrapper, initialProps: props },
  );
  return { ...hook, queryClient, detail, props };
}

describe("useQuizshowTemplatePublish in demo mode", () => {
  beforeEach(() => {
    resetQuizshowDemoStore();
    vi.mocked(demoPublishTemplate).mockClear();
  });

  it("publishes a complete saved template and caches who published it", async () => {
    const { result, queryClient } = renderPridePublish();
    expect(result.current.blockedReasonKey).toBeNull();

    act(() => result.current.publish());

    const cachedTemplate = () =>
      queryClient.getQueryData<QuizshowTemplateQuizResponse>(
        quizshowKeys.template(PRIDE_ID, true),
      )?.template;
    await waitFor(() => expect(cachedTemplate()?.status).toBe("published"));
    expect(demoPublishTemplate).toHaveBeenCalledTimes(1);
    expect(cachedTemplate()?.publishedByName).toBe("Rui Marçal");
    expect(cachedTemplate()?.publishedAt).not.toBeNull();
    expect(result.current.errorKey).toBeNull();
    expect(
      await screen.findByText("Template published. Hosts can pick it now"),
    ).toBeInTheDocument();
  });

  it("keeps the card refusal fields from the server", async () => {
    vi.mocked(demoPublishTemplate).mockImplementationOnce(() => {
      throw demoRefusal(422, "quizshow_template_card_incomplete", {
        missing: ["title.pt"],
      });
    });
    const { result, rerender, props } = renderPridePublish();

    act(() => result.current.publish());

    await waitFor(() =>
      expect(result.current.shownMissingFields).toEqual(["title.pt"]),
    );
    expect(result.current.errorKey).toBe(
      "quizshow:errors.template_card_incomplete",
    );

    // Editing the refused field retires it and its copy.
    rerender({
      ...props,
      card: {
        ...props.card,
        title: { ...props.card.title, pt: "Orgulho e história queer!" },
      },
    });
    expect(result.current.shownMissingFields).toEqual([]);
    expect(result.current.errorKey).toBeNull();
  });

  it("keeps quiz problems from a quiz_invalid refusal until the saved quiz changes", async () => {
    vi.mocked(demoPublishTemplate).mockImplementationOnce(() => {
      throw demoRefusal(422, "quizshow_quiz_invalid", {
        problems: [
          {
            code: "no_rounds",
            roundIndex: null,
            questionIndex: null,
            language: null,
          },
        ],
      });
    });
    const { result, rerender, props } = renderPridePublish();

    act(() => result.current.publish());

    await waitFor(() =>
      expect(
        result.current.rejectedProblems.map((problem) => problem.code),
      ).toEqual(["no_rounds"]),
    );
    expect(result.current.errorKey).toBe(
      "quizshow:templates.errors.quizInvalid",
    );

    // A card edit leaves the saved quiz as it was, so the problems stay.
    rerender({
      ...props,
      card: {
        ...props.card,
        description: { ...props.card.description, en: "Edited" },
      },
    });
    expect(result.current.rejectedProblems).toHaveLength(1);

    rerender({ ...props, savedUpdatedAt: "2026-10-28T09:00:00.000Z" });
    expect(result.current.rejectedProblems).toEqual([]);
    expect(result.current.errorKey).toBeNull();
  });

  it("keeps a refusal that named nothing until a save lands", async () => {
    vi.mocked(demoPublishTemplate).mockImplementationOnce(() => {
      throw new TypeError("Failed to fetch");
    });
    const { result, rerender, props } = renderPridePublish();

    act(() => result.current.publish());

    await waitFor(() =>
      expect(result.current.errorKey).toBe("quizshow:templates.errors.offline"),
    );
    expect(result.current.shownMissingFields).toEqual([]);
    expect(result.current.rejectedProblems).toEqual([]);

    // A card edit with no save leaves the refusal standing.
    rerender({
      ...props,
      card: {
        ...props.card,
        description: { ...props.card.description, en: "Edited" },
      },
    });
    expect(result.current.errorKey).toBe("quizshow:templates.errors.offline");

    // A successful save moves the saved quiz on, which retires it.
    rerender({ ...props, savedUpdatedAt: "2026-10-28T09:00:00.000Z" });
    expect(result.current.errorKey).toBeNull();
  });

  it("blocks with saveFirst while unsaved and never calls the server", () => {
    const { result } = renderPridePublish({ isUnsaved: true });

    expect(result.current.blockedReasonKey).toBe(
      "quizshow:templates.details.saveFirst",
    );

    act(() => result.current.publish());

    expect(demoPublishTemplate).not.toHaveBeenCalled();
    expect(result.current.isPending).toBe(false);
    expect(result.current.errorKey).toBeNull();
  });
});
