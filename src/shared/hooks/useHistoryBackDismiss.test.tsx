import { act, renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useHistoryBackDismiss } from "./useHistoryBackDismiss";

afterEach(() => vi.restoreAllMocks());

describe("useHistoryBackDismiss", () => {
  it("pushes one entry on open and closes on Back", () => {
    const push = vi.spyOn(window.history, "pushState");
    const onBack = vi.fn();
    const { rerender } = renderHook(
      ({ isOpen }) => useHistoryBackDismiss(isOpen, onBack),
      {
        initialProps: { isOpen: false },
      },
    );
    expect(push).not.toHaveBeenCalled();
    rerender({ isOpen: true });
    expect(push).toHaveBeenCalledTimes(1);
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("pops its entry when closed another way", () => {
    vi.spyOn(window.history, "pushState").mockImplementation(() => undefined);
    const back = vi
      .spyOn(window.history, "back")
      .mockImplementation(() => undefined);
    const onBack = vi.fn();
    const { rerender } = renderHook(
      ({ isOpen }) => useHistoryBackDismiss(isOpen, onBack),
      {
        initialProps: { isOpen: true },
      },
    );
    rerender({ isOpen: false });
    expect(back).toHaveBeenCalledTimes(1);
    expect(onBack).not.toHaveBeenCalled();
  });

  it("keeps exactly one entry and stays open under StrictMode", async () => {
    const push = vi
      .spyOn(window.history, "pushState")
      .mockImplementation(() => undefined);
    const back = vi
      .spyOn(window.history, "back")
      .mockImplementation(() => undefined);
    const onBack = vi.fn();
    renderHook(() => useHistoryBackDismiss(true, onBack), {
      wrapper: StrictMode,
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(push).toHaveBeenCalledTimes(1);
    expect(back).not.toHaveBeenCalled();
    expect(onBack).not.toHaveBeenCalled();
  });

  it("leaves history alone after Back closed it", () => {
    vi.spyOn(window.history, "pushState").mockImplementation(() => undefined);
    const back = vi
      .spyOn(window.history, "back")
      .mockImplementation(() => undefined);
    const { rerender } = renderHook(
      ({ isOpen }) => useHistoryBackDismiss(isOpen, vi.fn()),
      {
        initialProps: { isOpen: true },
      },
    );
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    rerender({ isOpen: false });
    expect(back).not.toHaveBeenCalled();
  });

  it("leaves history alone after a replacing navigation", () => {
    vi.spyOn(window.history, "pushState").mockImplementation(() => undefined);
    const back = vi
      .spyOn(window.history, "back")
      .mockImplementation(() => undefined);
    const { result, rerender } = renderHook(
      ({ isOpen }) => useHistoryBackDismiss(isOpen, vi.fn()),
      {
        initialProps: { isOpen: true },
      },
    );
    act(() => result.current.markNavigated());
    rerender({ isOpen: false });
    expect(back).not.toHaveBeenCalled();
  });
});
