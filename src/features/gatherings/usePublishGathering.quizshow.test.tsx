import { QueryClient } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
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

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

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
    act(() => {
      result.current.publish();
    });
    await vi.waitFor(() =>
      expect(mocks.showToast).toHaveBeenCalledWith(
        "gatherings:create.toast.quizshowCopyFailed",
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
    act(() => {
      result.current.publish();
    });
    await vi.waitFor(() =>
      expect(mocks.showToast).toHaveBeenCalledWith(
        "gatherings:create.toast.quizshowCopyNeedsAdultsEvent",
        "warning",
      ),
    );
    expect(mocks.showToast).not.toHaveBeenCalledWith(
      "gatherings:create.toast.quizshowCopyFailed",
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
