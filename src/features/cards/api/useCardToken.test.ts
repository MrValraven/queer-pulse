import { renderHook, waitFor, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCardToken } from "./useCardToken";
import * as api from "./cards.api";

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));

// @testing-library/dom's `waitFor` only drives a fake clock when it finds a
// global `jest` object (it never checks for `vi`), so under plain Vitest fake
// timers it falls back to a real `setInterval` that a faked clock never fires,
// and every `waitFor` here would hang until the suite's real-time timeout.
// Shimming the one method it calls lets `waitFor` advance Vitest's fake clock
// instead. Scoped to this file only; removed again in `afterEach`.
declare global {
  // eslint-disable-next-line no-var
  var jest: { advanceTimersByTime: typeof vi.advanceTimersByTime } | undefined;
}

describe("useCardToken", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    globalThis.jest = { advanceTimersByTime: vi.advanceTimersByTime };
  });

  afterEach(() => {
    globalThis.jest = undefined;
    vi.useRealTimers();
  });

  it("mints a token when the card becomes active", async () => {
    const mint = vi
      .spyOn(api, "mintCardToken")
      .mockResolvedValue({ token: "tok-1", expiresAt: "" });
    const { result } = renderHook(() =>
      useCardToken("card-1", { isActive: true }),
    );
    await waitFor(() => expect(result.current.token).toBe("tok-1"));
    expect(mint).toHaveBeenCalledTimes(1);
  });

  it("mints nothing while the card is inactive", () => {
    const mint = vi.spyOn(api, "mintCardToken");
    renderHook(() => useCardToken("card-1", { isActive: false }));
    expect(mint).not.toHaveBeenCalled();
  });

  it("re-mints before the 60 second token expires", async () => {
    const mint = vi
      .spyOn(api, "mintCardToken")
      .mockResolvedValue({ token: "tok-1", expiresAt: "" });
    renderHook(() => useCardToken("card-1", { isActive: true }));
    await waitFor(() => expect(mint).toHaveBeenCalledTimes(1));
    await act(async () => {
      vi.advanceTimersByTime(45_000);
    });
    await waitFor(() => expect(mint).toHaveBeenCalledTimes(2));
  });

  it("stops re-minting once the card goes inactive", async () => {
    const mint = vi
      .spyOn(api, "mintCardToken")
      .mockResolvedValue({ token: "tok-1", expiresAt: "" });
    const { rerender } = renderHook(
      ({ isActive }) => useCardToken("card-1", { isActive }),
      { initialProps: { isActive: true } },
    );
    await waitFor(() => expect(mint).toHaveBeenCalledTimes(1));
    rerender({ isActive: false });
    await act(async () => {
      vi.advanceTimersByTime(120_000);
    });
    expect(mint).toHaveBeenCalledTimes(1);
  });

  it("clears the token when the card goes inactive, so it cannot linger on screen", async () => {
    vi.spyOn(api, "mintCardToken").mockResolvedValue({
      token: "tok-1",
      expiresAt: "",
    });
    const { result, rerender } = renderHook(
      ({ isActive }) => useCardToken("card-1", { isActive }),
      { initialProps: { isActive: true } },
    );
    await waitFor(() => expect(result.current.token).toBe("tok-1"));
    rerender({ isActive: false });
    await waitFor(() => expect(result.current.token).toBeNull());
  });

  it("surfaces an error instead of a stale token when minting fails", async () => {
    vi.spyOn(api, "mintCardToken").mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() =>
      useCardToken("card-1", { isActive: true }),
    );
    await waitFor(() => expect(result.current.error).toBe(true));
    expect(result.current.token).toBeNull();
  });
});
