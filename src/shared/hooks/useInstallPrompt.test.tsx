import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useInstallPrompt } from "./useInstallPrompt";

/** The shape Chrome fires; `prompt()` resolves once the user has chosen. */
function makeBeforeInstallPromptEvent(outcome: "accepted" | "dismissed") {
  const event = new Event("beforeinstallprompt") as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: string }>;
  };
  event.prompt = vi.fn(async () => {});
  event.userChoice = Promise.resolve({ outcome });
  return event;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useInstallPrompt", () => {
  it("cannot install before the browser offers", () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.canInstall).toBe(false);
  });

  it("becomes installable once beforeinstallprompt fires", () => {
    const { result } = renderHook(() => useInstallPrompt());
    act(() => {
      window.dispatchEvent(makeBeforeInstallPromptEvent("accepted"));
    });
    expect(result.current.canInstall).toBe(true);
  });

  it("resolves true and clears the offer when the user accepts", async () => {
    const { result } = renderHook(() => useInstallPrompt());
    act(() => {
      window.dispatchEvent(makeBeforeInstallPromptEvent("accepted"));
    });

    let accepted: boolean | undefined;
    await act(async () => {
      accepted = await result.current.promptInstall();
    });

    expect(accepted).toBe(true);
    // The event is single-use: Chrome will fire a fresh one if still eligible.
    expect(result.current.canInstall).toBe(false);
  });

  it("resolves false when the user dismisses", async () => {
    const { result } = renderHook(() => useInstallPrompt());
    act(() => {
      window.dispatchEvent(makeBeforeInstallPromptEvent("dismissed"));
    });

    let accepted: boolean | undefined;
    await act(async () => {
      accepted = await result.current.promptInstall();
    });

    expect(accepted).toBe(false);
  });

  it("resolves false when nothing has been offered", async () => {
    const { result } = renderHook(() => useInstallPrompt());
    let accepted: boolean | undefined;
    await act(async () => {
      accepted = await result.current.promptInstall();
    });
    expect(accepted).toBe(false);
  });
});
