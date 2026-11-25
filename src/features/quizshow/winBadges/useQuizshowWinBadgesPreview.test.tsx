import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { QUIZSHOW_DEMO_LIVE_SLUG } from "../api/quizshowDemoStore.data";
import { resetQuizWinBadgesDemoStore } from "./quizWinBadgesDemoStore";
import { useQuizshowWinBadgesPreview } from "./useQuizshowWinBadgesPreview";

const mocks = vi.hoisted(() => ({
  getQuizshowWinBadgesPreview: vi.fn(),
  /** When set, every `useDemoMode` reader sees this mode. */
  demoOverride: { demoMode: null as boolean | null },
}));

vi.mock("./quizWinBadges.api", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getQuizshowWinBadgesPreview: mocks.getQuizshowWinBadgesPreview,
}));

vi.mock("../../../app/providers/DemoModeProvider", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("../../../app/providers/DemoModeProvider")
    >();
  return {
    ...original,
    useDemoMode: () => {
      const value = original.useDemoMode();
      const overrideMode = mocks.demoOverride.demoMode;
      return overrideMode === null
        ? value
        : { ...value, demoMode: overrideMode };
    },
  };
});

beforeEach(() => {
  mocks.getQuizshowWinBadgesPreview.mockReset();
  mocks.demoOverride.demoMode = null;
  resetQuizWinBadgesDemoStore();
});

describe("useQuizshowWinBadgesPreview", () => {
  it("reads the demo preview for the live demo event", async () => {
    mocks.demoOverride.demoMode = true;
    const { result } = renderHook(
      () => useQuizshowWinBadgesPreview(QUIZSHOW_DEMO_LIVE_SLUG),
      { wrapper: TestProviders },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.preview?.gameNumber).toBe(2);
    expect(mocks.getQuizshowWinBadgesPreview).not.toHaveBeenCalled();
  });

  it("asks the event's win-badges route live", async () => {
    mocks.demoOverride.demoMode = false;
    mocks.getQuizshowWinBadgesPreview.mockResolvedValue({ preview: null });
    const { result } = renderHook(
      () => useQuizshowWinBadgesPreview("pride-brunch-jun"),
      { wrapper: TestProviders },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mocks.getQuizshowWinBadgesPreview).toHaveBeenCalledTimes(1);
    expect(mocks.getQuizshowWinBadgesPreview).toHaveBeenCalledWith(
      "pride-brunch-jun",
    );
    expect(result.current.data).toEqual({ preview: null });
  });

  it("leaves data undefined and reports an error when the live read fails", async () => {
    mocks.demoOverride.demoMode = false;
    mocks.getQuizshowWinBadgesPreview.mockRejectedValue(new Error("down"));
    const { result } = renderHook(
      () => useQuizshowWinBadgesPreview("pride-brunch-jun"),
      { wrapper: TestProviders },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(mocks.getQuizshowWinBadgesPreview).toHaveBeenCalledTimes(1);
  });

  it("stays idle without a slug or when disabled", () => {
    mocks.demoOverride.demoMode = false;
    const withoutSlug = renderHook(() => useQuizshowWinBadgesPreview(null), {
      wrapper: TestProviders,
    });
    const whenDisabled = renderHook(
      () =>
        useQuizshowWinBadgesPreview("pride-brunch-jun", { isEnabled: false }),
      { wrapper: TestProviders },
    );

    expect(withoutSlug.result.current.fetchStatus).toBe("idle");
    expect(whenDisabled.result.current.fetchStatus).toBe("idle");
    expect(mocks.getQuizshowWinBadgesPreview).not.toHaveBeenCalled();
  });
});
