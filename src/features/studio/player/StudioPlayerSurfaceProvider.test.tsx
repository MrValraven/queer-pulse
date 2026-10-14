import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudioPlayerSurfaceProvider } from "./StudioPlayerSurfaceProvider";
import { useStudioPlayerSurface } from "./studioPlayerSurface";

function asPhone(isPhone: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
    matches: isPhone && query === "(max-width: 880px)",
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
}

// renderHook passes no props to its wrapper, so the wrapper reads `live`.
function renderSurface() {
  const live = { hasQueue: true };
  const hook = renderHook(() => useStudioPlayerSurface(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <StudioPlayerSurfaceProvider hasQueue={live.hasQueue}>
        {children}
      </StudioPlayerSurfaceProvider>
    ),
  });
  const setHasQueue = (hasQueue: boolean) => {
    live.hasQueue = hasQueue;
    hook.rerender();
  };
  return { ...hook, setHasQueue };
}

afterEach(() => vi.restoreAllMocks());

describe("StudioPlayerSurfaceProvider", () => {
  it("opens Now playing on lyrics, then keeps the last tab", () => {
    asPhone(false);
    const { result } = renderSurface();
    act(() => result.current.openNowPlaying());
    expect(result.current).toMatchObject({
      isNowPlayingOpen: true,
      nowPlayingTab: "lyrics",
    });
    act(() => result.current.setNowPlayingTab("credits"));
    act(() => result.current.closeNowPlaying());
    act(() => result.current.openNowPlaying());
    expect(result.current.nowPlayingTab).toBe("credits");
  });

  it("opens the side panel for the queue on a desktop", () => {
    asPhone(false);
    const { result } = renderSurface();
    act(() => result.current.openQueue());
    expect(result.current.isQueuePanelOpen).toBe(true);
    expect(result.current.isNowPlayingOpen).toBe(false);
    act(() => result.current.toggleQueuePanel());
    expect(result.current.isQueuePanelOpen).toBe(false);
  });

  it("opens Now playing on the queue on a phone", () => {
    asPhone(true);
    const { result } = renderSurface();
    act(() => result.current.openQueue());
    expect(result.current).toMatchObject({
      isNowPlayingOpen: true,
      nowPlayingTab: "queue",
      isQueuePanelOpen: false,
    });
    act(() => result.current.toggleQueuePanel());
    expect(result.current.isNowPlayingOpen).toBe(false);
  });

  it("opens and closes the shortcut help", () => {
    asPhone(false);
    const { result } = renderSurface();
    act(() => result.current.openShortcuts());
    expect(result.current.isShortcutsOpen).toBe(true);
    act(() => result.current.closeShortcuts());
    expect(result.current.isShortcutsOpen).toBe(false);
  });

  it("closes everything when the queue empties", () => {
    asPhone(false);
    const { result, setHasQueue } = renderSurface();
    act(() => {
      result.current.openNowPlaying("queue");
      result.current.openQueue();
      result.current.openShortcuts();
    });
    setHasQueue(false);
    expect(result.current).toMatchObject({
      isNowPlayingOpen: false,
      isQueuePanelOpen: false,
      isShortcutsOpen: false,
    });
  });

  it("asks for the provider", () => {
    expect(() => renderHook(() => useStudioPlayerSurface())).toThrow(
      "useStudioPlayerSurface must be used within StudioPlayerProvider",
    );
  });
});
