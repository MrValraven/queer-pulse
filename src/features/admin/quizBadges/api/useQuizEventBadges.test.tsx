import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import type { QuizEventBadgeSetupSaveResponse } from "../../../../shared/contracts/quizWinBadges";
import { QUIZSHOW_DEMO_LIVE_SLUG } from "../../../quizshow/api/quizshowDemoStore.data";
import {
  demoQuizEventIdOf,
  QUIZ_WIN_BADGES_DEMO_LIVE_KAI_WINNER_ID,
  QUIZ_WIN_BADGES_DEMO_LIVE_VIEWER_WINNER_ID,
} from "../../../quizshow/winBadges/quizWinBadgesDemo.data";
import { resetQuizWinBadgesDemoStore } from "../../../quizshow/winBadges/quizWinBadgesDemoStore";
import { putQuizEventBadgeSetup } from "./quizBadgesAdmin.api";
import { quizBadgesAdminKeys } from "./quizBadgesAdminKeys";
import {
  useArchiveQuizBadge,
  useCreateQuizBadge,
  useDeleteQuizBadge,
  useRestoreQuizBadge,
  useUpdateQuizBadge,
} from "./useQuizBadgeLibrary";
import {
  useQuizEventBadgeSetup,
  useRevokeQuizGameWin,
  useSaveQuizEventBadgeSetup,
} from "./useQuizEventBadges";

const mockDemoMode = vi.hoisted(() => ({ current: true }));

vi.mock(
  "../../../../app/providers/DemoModeProvider",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../app/providers/DemoModeProvider")
    >()),
    useDemoMode: () => ({ demoMode: mockDemoMode.current }),
  }),
);
vi.mock("./quizBadgesAdmin.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./quizBadgesAdmin.api")>()),
  putQuizEventBadgeSetup: vi.fn(),
}));

const LIVE_EVENT_ID = demoQuizEventIdOf(QUIZSHOW_DEMO_LIVE_SLUG);

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );
  return { queryClient, wrapper };
}

beforeEach(() => {
  mockDemoMode.current = true;
  resetQuizWinBadgesDemoStore();
  vi.mocked(putQuizEventBadgeSetup).mockReset();
});

describe("quiz event badge hooks", () => {
  it("reads the demo setup of the live demo event", async () => {
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(() => useQuizEventBadgeSetup(LIVE_EVENT_ID), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.nextGameNumber).toBe(2);
    expect(
      queryClient.getQueryData(
        quizBadgesAdminKeys.eventSetup(LIVE_EVENT_ID, true),
      ),
    ).toBe(result.current.data);
  });

  it("holds the setup read back until an event id is known", () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useQuizEventBadgeSetup(undefined), {
      wrapper,
    });
    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });

  it("puts the whole setup live", async () => {
    mockDemoMode.current = false;
    vi.mocked(putQuizEventBadgeSetup).mockResolvedValue({
      awardedWinCount: 0,
    } as QuizEventBadgeSetupSaveResponse);
    const { wrapper } = setup();
    const { result } = renderHook(() => useSaveQuizEventBadgeSetup("e1"), {
      wrapper,
    });
    const body = {
      games: [{ gameNumber: 1, badgeDefinitionIds: ["d1", "d2"] }],
    };
    await act(async () => {
      await result.current.mutateAsync(body);
    });
    expect(putQuizEventBadgeSetup).toHaveBeenCalledWith("e1", body);
  });

  it("re-reads the setup, library, Badges page, Pulse Live and event page after a revoke", async () => {
    const { queryClient, wrapper } = setup();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useRevokeQuizGameWin(LIVE_EVENT_ID), {
      wrapper,
    });
    await act(async () => {
      await result.current.mutateAsync({
        winnerId: QUIZ_WIN_BADGES_DEMO_LIVE_VIEWER_WINNER_ID,
        reason: "Shared the answers with a friend",
      });
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["quiz-badges-admin"],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["recognition"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["quizshow"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["event"] });
  });

  it("surfaces a demo refusal as the mutation error", async () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useRevokeQuizGameWin(LIVE_EVENT_ID), {
      wrapper,
    });
    await act(() =>
      expect(
        result.current.mutateAsync({
          winnerId: QUIZ_WIN_BADGES_DEMO_LIVE_KAI_WINNER_ID,
          reason: "Revoked twice",
        }),
      ).rejects.toMatchObject({
        data: { code: "quiz_badge_winner_already_revoked" },
      }),
    );
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({
      data: { code: "quiz_badge_winner_already_revoked" },
    });
  });

  it("marks every mutation silent", async () => {
    const { queryClient, wrapper } = setup();
    const { result } = renderHook(
      () => ({
        save: useSaveQuizEventBadgeSetup(LIVE_EVENT_ID),
        revoke: useRevokeQuizGameWin(LIVE_EVENT_ID),
        create: useCreateQuizBadge(),
        update: useUpdateQuizBadge(),
        archive: useArchiveQuizBadge(),
        restore: useRestoreQuizBadge(),
        remove: useDeleteQuizBadge(),
      }),
      { wrapper },
    );
    // Every call below ends in a refusal or a no-op; only the options matter.
    await act(async () => {
      await Promise.allSettled([
        result.current.save.mutateAsync({ games: [] }),
        result.current.revoke.mutateAsync({ winnerId: "w", reason: "x" }),
        result.current.create.mutateAsync({
          name: { en: "" },
          description: { en: "" },
          iconKey: "",
          tint: "jade",
          rarity: "common",
        }),
        result.current.update.mutateAsync({ definitionId: "d", body: {} }),
        result.current.archive.mutateAsync({ definitionId: "d" }),
        result.current.restore.mutateAsync({ definitionId: "d" }),
        result.current.remove.mutateAsync({ definitionId: "d" }),
      ]);
    });
    const mutations = queryClient.getMutationCache().getAll();
    expect(mutations).toHaveLength(7);
    for (const mutation of mutations) {
      expect(mutation.options.meta).toEqual({ silentError: true });
    }
  });
});
