import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useResendCountdown } from "./useResendCountdown";

const NOW = new Date("2026-10-26T10:00:00.000Z");

describe("useResendCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 0 for null", () => {
    const { result } = renderHook(() => useResendCountdown(null));
    expect(result.current).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("counts down to zero and stops", () => {
    const inSixtySeconds = new Date(NOW.getTime() + 60_000).toISOString();
    const { result } = renderHook(() => useResendCountdown(inSixtySeconds));
    expect(result.current).toBe(60);

    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(result.current).toBe(59);

    act(() => {
      vi.advanceTimersByTime(59_000);
    });
    expect(result.current).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
