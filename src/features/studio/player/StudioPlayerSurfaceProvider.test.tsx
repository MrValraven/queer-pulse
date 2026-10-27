import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioPlayerSurfaceProvider } from "./StudioPlayerSurfaceProvider";
import { useStudioPlayerSurface } from "./studioPlayerSurface";
import { useStudioSidePanelDockHost } from "./studioSidePanelDock";
import {
  DEFAULT_STUDIO_SIDE_PANEL_PREFERENCE,
  STUDIO_SIDE_PANEL_STORAGE_KEY,
  parseStudioSidePanelPreference,
  writeStudioSidePanelPreference,
} from "./studioSidePanelPreference";

/** Answers width queries from a window `width` px wide; `resize` moves it
 *  and tells every listening query. */
function mockViewport(initialWidth: number) {
  let width = initialWidth;
  const changeListeners = new Set<() => void>();
  const matchesAt = (query: string) => {
    const maxWidth = /\(max-width: (\d+)px\)/.exec(query);
    if (maxWidth) return width <= Number(maxWidth[1]);
    const minWidth = /\(min-width: (\d+)px\)/.exec(query);
    if (minWidth) return width >= Number(minWidth[1]);
    return false;
  };
  vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
    get matches() {
      return matchesAt(query);
    },
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (
      _type: string,
      listener: EventListenerOrEventListenerObject,
    ) => {
      changeListeners.add(listener as () => void);
    },
    removeEventListener: (
      _type: string,
      listener: EventListenerOrEventListenerObject,
    ) => {
      changeListeners.delete(listener as () => void);
    },
    dispatchEvent: () => false,
  }));
  return {
    resize: (nextWidth: number) => {
      width = nextWidth;
      act(() => changeListeners.forEach((listener) => listener()));
    },
  };
}

/** Stands in for the listener shell, the one place the panel docks. */
function DockHost() {
  useStudioSidePanelDockHost();
  return null;
}

// renderHook passes no props to its wrapper, so the wrapper reads `live`.
function renderSurface(options: { hasDockHost?: boolean } = {}) {
  const live = { hasQueue: true, hasDockHost: options.hasDockHost ?? false };
  const hook = renderHook(() => useStudioPlayerSurface(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <StudioPlayerSurfaceProvider hasQueue={live.hasQueue}>
        {live.hasDockHost ? <DockHost /> : null}
        {children}
      </StudioPlayerSurfaceProvider>
    ),
  });
  const setHasQueue = (hasQueue: boolean) => {
    live.hasQueue = hasQueue;
    hook.rerender();
  };
  const setHasDockHost = (hasDockHost: boolean) => {
    live.hasDockHost = hasDockHost;
    hook.rerender();
  };
  return { ...hook, setHasQueue, setHasDockHost };
}

function savedPreference() {
  return parseStudioSidePanelPreference(
    window.localStorage.getItem(STUDIO_SIDE_PANEL_STORAGE_KEY),
  );
}

beforeEach(() =>
  writeStudioSidePanelPreference(DEFAULT_STUDIO_SIDE_PANEL_PREFERENCE),
);
afterEach(() => vi.restoreAllMocks());

describe("StudioPlayerSurfaceProvider", () => {
  it("opens Now playing on lyrics, then keeps the last tab", () => {
    mockViewport(1400);
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
    mockViewport(1400);
    const { result } = renderSurface();
    act(() => result.current.openQueue());
    expect(result.current.isQueuePanelOpen).toBe(true);
    expect(result.current.isNowPlayingOpen).toBe(false);
    act(() => result.current.toggleQueuePanel());
    expect(result.current.isQueuePanelOpen).toBe(false);
  });

  it("opens Now playing on the queue on a phone", () => {
    mockViewport(800);
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
    mockViewport(1400);
    const { result } = renderSurface();
    act(() => result.current.openShortcuts());
    expect(result.current.isShortcutsOpen).toBe(true);
    act(() => result.current.closeShortcuts());
    expect(result.current.isShortcutsOpen).toBe(false);
  });

  it("closes everything when the queue empties", () => {
    mockViewport(1400);
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

  it("docks Now playing by default inside Studio from 1280px", () => {
    mockViewport(1400);
    const { result } = renderSurface({ hasDockHost: true });
    expect(result.current).toMatchObject({
      sidePanelPlacement: "docked",
      sidePanel: "nowPlaying",
      isQueuePanelOpen: false,
    });
  });

  it("switches the docked view and closes it from the button of the view showing", () => {
    mockViewport(1400);
    const { result } = renderSurface({ hasDockHost: true });
    act(() => result.current.toggleSidePanel("queue"));
    expect(result.current).toMatchObject({
      sidePanel: "queue",
      isQueuePanelOpen: true,
    });
    act(() => result.current.toggleSidePanel("queue"));
    expect(result.current.sidePanel).toBeNull();
    expect(savedPreference()).toEqual({ isOpen: false, view: "queue" });
  });

  it("floats between 881 and 1279px and never opens by itself", () => {
    mockViewport(1100);
    const { result } = renderSurface({ hasDockHost: true });
    expect(result.current).toMatchObject({
      sidePanelPlacement: "floating",
      sidePanel: null,
    });
    act(() => result.current.openSidePanel("nowPlaying"));
    expect(result.current.sidePanel).toBe("nowPlaying");
    expect(savedPreference()).toEqual(DEFAULT_STUDIO_SIDE_PANEL_PREFERENCE);
  });

  it("floats outside the listener shell even when the window is wide", () => {
    mockViewport(1600);
    const { result } = renderSurface();
    expect(result.current).toMatchObject({
      sidePanelPlacement: "floating",
      sidePanel: null,
    });
  });

  it("has no side panel on phones", () => {
    mockViewport(800);
    const { result } = renderSurface({ hasDockHost: true });
    expect(result.current.sidePanelPlacement).toBeNull();
    act(() => result.current.openQueue());
    expect(result.current).toMatchObject({
      isNowPlayingOpen: true,
      nowPlayingTab: "queue",
      sidePanel: null,
    });
    act(() => result.current.openSidePanel("nowPlaying"));
    expect(result.current.nowPlayingTab).toBe("artist");
  });

  it("hides the docked panel without opening a floating card when the window narrows", () => {
    const viewport = mockViewport(1400);
    const { result } = renderSurface({ hasDockHost: true });
    expect(result.current.sidePanel).toBe("nowPlaying");
    viewport.resize(1100);
    expect(result.current).toMatchObject({
      sidePanelPlacement: "floating",
      sidePanel: null,
    });
    expect(savedPreference()).toEqual(DEFAULT_STUDIO_SIDE_PANEL_PREFERENCE);
  });

  it("keeps the saved preference when the dock host unmounts and restores it on return", () => {
    mockViewport(1400);
    const { result, setHasDockHost } = renderSurface({ hasDockHost: true });
    act(() => result.current.openSidePanel("queue"));
    setHasDockHost(false);
    expect(result.current.sidePanel).toBeNull();
    setHasDockHost(true);
    expect(result.current.sidePanel).toBe("queue");
  });

  it("drops an open floating card when the placement changes", () => {
    const viewport = mockViewport(1100);
    const { result } = renderSurface({ hasDockHost: true });
    act(() => result.current.openSidePanel("queue"));
    viewport.resize(1400);
    expect(result.current.sidePanel).toBe("nowPlaying");
    viewport.resize(1100);
    expect(result.current.sidePanel).toBeNull();
  });

  it("closes the floating card when a bar popover opens and leaves the docked column open", () => {
    const viewport = mockViewport(1100);
    const { result } = renderSurface({ hasDockHost: true });
    act(() => result.current.openSidePanel("queue"));
    act(() => result.current.openPopover("settings"));
    expect(result.current.sidePanel).toBeNull();
    viewport.resize(1400);
    act(() => result.current.openPopover("sleep"));
    expect(result.current).toMatchObject({
      sidePanel: "nowPlaying",
      openPopoverId: "sleep",
    });
  });

  it("closeQueuePanel closes the floating card only", () => {
    mockViewport(1400);
    const { result } = renderSurface({ hasDockHost: true });
    act(() => result.current.closeQueuePanel());
    expect(result.current.sidePanel).toBe("nowPlaying");
    expect(savedPreference()).toEqual(DEFAULT_STUDIO_SIDE_PANEL_PREFERENCE);
  });

  it("derives no side panel once the queue empties and keeps the preference", () => {
    mockViewport(1400);
    const { result, setHasQueue } = renderSurface({ hasDockHost: true });
    setHasQueue(false);
    expect(result.current.sidePanel).toBeNull();
    expect(savedPreference().isOpen).toBe(true);
    setHasQueue(true);
    expect(result.current.sidePanel).toBe("nowPlaying");
  });

  it("asks for the provider", () => {
    expect(() => renderHook(() => useStudioPlayerSurface())).toThrow(
      "useStudioPlayerSurface must be used within StudioPlayerProvider",
    );
  });
});
