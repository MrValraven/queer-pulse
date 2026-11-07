import { QueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { awaitCatalog } from "../../test/awaitCatalog";
import { TestProviders } from "../../test/TestProviders";
import { quizshowKeys } from "../quizshow/api/quizshowKeys";
import type { GatheringForm } from "./useGatheringForm";
import { usePublishGathering } from "./usePublishGathering";

const mocks = vi.hoisted(() => ({
  importQuizshowQuiz: vi.fn(),
  showToast: vi.fn(),
  isDemoMode: false,
}));

vi.mock("../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast: mocks.showToast }),
}));
vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("../../app/providers/DemoModeProvider")
  >()),
  useDemoMode: () => ({ demoMode: mocks.isDemoMode }),
}));
vi.mock("../quizshow/api/quizshow.api", () => ({
  importQuizshowQuiz: mocks.importQuizshowQuiz,
}));
vi.mock("./api/useEventMutations", () => ({
  useCreateEvent: () => ({
    isPending: false,
    mutate: (
      _payload: unknown,
      options: {
        onSuccess: (result: { slug: string }) => void;
        onSettled?: () => void;
      },
    ) => {
      options.onSuccess({ slug: "thursday-quiz-copy" });
      options.onSettled?.();
    },
  }),
}));
vi.mock("./api/events.adapters", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./api/events.adapters")>()),
  formToCreateEventDto: () => ({ startAt: "2026-11-01T19:00:00.000Z" }),
}));

/** Paints one gatherings string, as the page around this hook does, so the
 *  provider loads the catalog before the hook raises a toast. */
function GatheringsPageCopy({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <>
      <span hidden>{t("gatherings:manage.details.date")}</span>
      {children}
    </>
  );
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>
    <GatheringsPageCopy>{children}</GatheringsPageCopy>
  </TestProviders>
);

const QUIZ_COPY_FAILED_TEXT =
  "Your event is up. Its quiz didn't come with it, so copy it from the Live game tab";
const QUIZ_COPY_NEEDS_ADULTS_TEXT =
  "Your event is up. Its quiz has adults rounds, so make the event 18+ and copy the quiz from the Live game tab";

const form = {
  cohostSlugs: [],
  goTogetherEnabled: false,
  communitySlug: "",
  guestCommunities: [],
} as unknown as GatheringForm;

function renderPublish(quizshowSourceSlug?: string | null) {
  return renderHook(
    () =>
      usePublishGathering({
        form,
        onPublished: vi.fn(),
        onVenueRefused: vi.fn(),
        ...(quizshowSourceSlug !== undefined ? { quizshowSourceSlug } : {}),
      }),
    { wrapper },
  );
}

beforeEach(() => {
  mocks.isDemoMode = false;
  mocks.importQuizshowQuiz.mockResolvedValue({});
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

afterEach(() => {
  mocks.importQuizshowQuiz.mockReset();
  mocks.showToast.mockReset();
  vi.restoreAllMocks();
});

describe("usePublishGathering quizshow copy", () => {
  it("copies the source's quiz onto the new event after a duplicate publishes", () => {
    const { result } = renderPublish("thursday-quiz");
    act(() => {
      result.current.publish();
    });
    expect(mocks.importQuizshowQuiz).toHaveBeenCalledTimes(1);
    expect(mocks.importQuizshowQuiz).toHaveBeenCalledWith(
      "thursday-quiz-copy",
      { from: "event", eventSlug: "thursday-quiz" },
    );
  });

  it("keeps the event and warns when the quiz copy fails", async () => {
    mocks.importQuizshowQuiz.mockRejectedValue(new Error("refused"));
    const { result } = renderPublish("thursday-quiz");
    await awaitCatalog("gatherings");
    act(() => {
      result.current.publish();
    });
    await vi.waitFor(() =>
      expect(mocks.showToast).toHaveBeenCalledWith(
        QUIZ_COPY_FAILED_TEXT,
        "warning",
      ),
    );
    expect(result.current.isPublished).toBe(true);
  });

  it("copies nothing without a source or in demo", () => {
    const withoutSource = renderPublish(null);
    act(() => {
      withoutSource.result.current.publish();
    });
    mocks.isDemoMode = true;
    const inDemo = renderPublish("thursday-quiz");
    act(() => {
      inDemo.result.current.publish();
    });
    expect(mocks.importQuizshowQuiz).not.toHaveBeenCalled();
  });
});

describe("usePublishGathering quizshow copy outcomes", () => {
  it("says the new event needs to be 18+ when the copy is refused for its adults rounds", async () => {
    mocks.importQuizshowQuiz.mockRejectedValue(
      new ApiError(409, "quizshow_adults_round_needs_adults_event", {
        code: "quizshow_adults_round_needs_adults_event",
      }),
    );
    const { result } = renderPublish("thursday-quiz");
    await awaitCatalog("gatherings");
    act(() => {
      result.current.publish();
    });
    await vi.waitFor(() =>
      expect(mocks.showToast).toHaveBeenCalledWith(
        QUIZ_COPY_NEEDS_ADULTS_TEXT,
        "warning",
      ),
    );
    expect(mocks.showToast).not.toHaveBeenCalledWith(
      QUIZ_COPY_FAILED_TEXT,
      "warning",
    );
    expect(result.current.isPublished).toBe(true);
  });

  it("refreshes the new event's quiz once the copy settles", async () => {
    const invalidateQueries = vi.spyOn(
      QueryClient.prototype,
      "invalidateQueries",
    );
    const { result } = renderPublish("thursday-quiz");
    act(() => {
      result.current.publish();
    });
    await vi.waitFor(() =>
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: quizshowKeys.quiz("thursday-quiz-copy", false),
      }),
    );
  });

  it("refreshes the new event's quiz after a failed copy too", async () => {
    mocks.importQuizshowQuiz.mockRejectedValue(new Error("refused"));
    const invalidateQueries = vi.spyOn(
      QueryClient.prototype,
      "invalidateQueries",
    );
    const { result } = renderPublish("thursday-quiz");
    act(() => {
      result.current.publish();
    });
    await vi.waitFor(() =>
      expect(invalidateQueries).toHaveBeenCalledWith({
        queryKey: quizshowKeys.quiz("thursday-quiz-copy", false),
      }),
    );
  });
});
