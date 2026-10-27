import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAdminNavFeatures } from "./useAdminNavFeatures";

const mocks = vi.hoisted(() => ({ isQuizshowVisible: false }));

vi.mock(
  "../../../features/quizshow/quizshowLaunch",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../features/quizshow/quizshowLaunch")
    >()),
    useIsQuizshowVisible: () => mocks.isQuizshowVisible,
  }),
);

describe("useAdminNavFeatures", () => {
  it("offers the quizshow feature only while Pulse Live is visible", () => {
    mocks.isQuizshowVisible = false;
    const { result, rerender } = renderHook(() => useAdminNavFeatures());
    expect(result.current).toEqual([]);

    mocks.isQuizshowVisible = true;
    rerender();
    expect(result.current).toEqual(["quizshow"]);

    const visibleAnswer = result.current;
    rerender();
    expect(result.current).toBe(visibleAnswer);
  });
});
