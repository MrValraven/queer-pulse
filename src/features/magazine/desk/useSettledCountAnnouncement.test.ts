import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  COUNT_SETTLE_DELAY_MS,
  useSettledCountAnnouncement,
} from "./useSettledCountAnnouncement";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function renderAnnouncement(initialCount: number) {
  return renderHook(({ count }) => useSettledCountAnnouncement(count), {
    initialProps: { count: initialCount },
  });
}

describe("useSettledCountAnnouncement", () => {
  it("stays quiet on first load", () => {
    const { result } = renderAnnouncement(12);

    act(() => {
      vi.advanceTimersByTime(COUNT_SETTLE_DELAY_MS * 2);
    });

    expect(result.current).toBeNull();
  });

  it("announces a new count once it has held still", () => {
    const { result, rerender } = renderAnnouncement(12);

    rerender({ count: 4 });
    act(() => {
      vi.advanceTimersByTime(COUNT_SETTLE_DELAY_MS - 1);
    });
    expect(result.current).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(4);
  });

  it("announces only the last count of a quick burst", () => {
    const { result, rerender } = renderAnnouncement(12);

    rerender({ count: 9 });
    act(() => {
      vi.advanceTimersByTime(COUNT_SETTLE_DELAY_MS / 2);
    });
    rerender({ count: 3 });
    act(() => {
      vi.advanceTimersByTime(COUNT_SETTLE_DELAY_MS);
    });

    expect(result.current).toBe(3);
  });

  it("says nothing when a burst lands back on the settled count", () => {
    const { result, rerender } = renderAnnouncement(12);

    rerender({ count: 5 });
    rerender({ count: 12 });
    act(() => {
      vi.advanceTimersByTime(COUNT_SETTLE_DELAY_MS * 2);
    });

    expect(result.current).toBeNull();
  });
});
