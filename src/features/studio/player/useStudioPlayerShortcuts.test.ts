import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { popModal, pushModal } from "../../../shared/components/ui/modalStack";
import {
  isShortcutBlockedByTarget,
  shortcutIdOf,
  useStudioPlayerShortcuts,
} from "./useStudioPlayerShortcuts";

const press = (key: string, modifiers: Partial<KeyboardEventInit> = {}) =>
  shortcutIdOf({
    key,
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    ...modifiers,
  });

function element(html: string): HTMLElement {
  const holder = document.createElement("div");
  holder.innerHTML = html;
  document.body.append(holder);
  return holder.querySelector("[data-target]") as HTMLElement;
}

afterEach(() => {
  document.body.innerHTML = "";
  popModal("other-dialog");
  popModal("now-playing");
});

describe("shortcutIdOf", () => {
  it("maps the spec 7.9 table", () => {
    expect(press(" ")).toBe("playPause");
    expect(press("ArrowLeft")).toBe("seekBack");
    expect(press("ArrowRight")).toBe("seekForward");
    expect(press("ArrowLeft", { shiftKey: true })).toBe("previousTrack");
    expect(press("ArrowRight", { shiftKey: true })).toBe("nextTrack");
    expect(press("ArrowUp")).toBe("volumeUp");
    expect(press("ArrowDown")).toBe("volumeDown");
    expect(press("m")).toBe("mute");
    expect(press("S", { shiftKey: true })).toBe("shuffle");
    expect(press("r")).toBe("repeat");
    expect(press("l")).toBe("lyrics");
    expect(press("q")).toBe("queue");
    expect(press("?", { shiftKey: true })).toBe("help");
  });

  it("ignores Ctrl, Meta and Alt, and other keys", () => {
    expect(press("m", { ctrlKey: true })).toBeNull();
    expect(press("ArrowLeft", { metaKey: true })).toBeNull();
    expect(press(" ", { altKey: true })).toBeNull();
    expect(press("x")).toBeNull();
    expect(press("Enter")).toBeNull();
  });
});

describe("isShortcutBlockedByTarget", () => {
  it("stands down in every text field", () => {
    expect(
      isShortcutBlockedByTarget(
        element('<input data-target type="text">'),
        "mute",
      ),
    ).toBe(true);
    expect(
      isShortcutBlockedByTarget(
        element('<input data-target type="search">'),
        "seekBack",
      ),
    ).toBe(true);
    expect(
      isShortcutBlockedByTarget(
        element("<textarea data-target></textarea>"),
        "playPause",
      ),
    ).toBe(true);
    expect(
      isShortcutBlockedByTarget(
        element("<select data-target></select>"),
        "volumeUp",
      ),
    ).toBe(true);
    expect(
      isShortcutBlockedByTarget(
        element('<div contenteditable="true"><p data-target>hi</p></div>'),
        "mute",
      ),
    ).toBe(true);
  });

  it("leaves Space to buttons, links, ranges and checkboxes", () => {
    expect(
      isShortcutBlockedByTarget(
        element("<button data-target>Play</button>"),
        "playPause",
      ),
    ).toBe(true);
    expect(
      isShortcutBlockedByTarget(
        element('<a data-target href="/x">x</a>'),
        "playPause",
      ),
    ).toBe(true);
    expect(
      isShortcutBlockedByTarget(
        element('<input data-target type="range">'),
        "playPause",
      ),
    ).toBe(true);
    expect(
      isShortcutBlockedByTarget(
        element('<input data-target type="checkbox">'),
        "playPause",
      ),
    ).toBe(true);
    expect(
      isShortcutBlockedByTarget(
        element("<button data-target>Play</button>"),
        "mute",
      ),
    ).toBe(false);
  });

  it("stands down on every input, sliders and checkboxes included", () => {
    expect(
      isShortcutBlockedByTarget(
        element('<input data-target type="range">'),
        "mute",
      ),
    ).toBe(true);
    expect(
      isShortcutBlockedByTarget(
        element('<input data-target type="checkbox">'),
        "shuffle",
      ),
    ).toBe(true);
    expect(
      isShortcutBlockedByTarget(
        element('<input data-target type="button">'),
        "volumeUp",
      ),
    ).toBe(true);
  });

  it("leaves arrows to sliders, tabs and menus that use them", () => {
    expect(
      isShortcutBlockedByTarget(
        element('<input data-target type="range">'),
        "seekBack",
      ),
    ).toBe(true);
    expect(
      isShortcutBlockedByTarget(
        element(
          '<div role="tablist"><button role="tab" data-target>A</button></div>',
        ),
        "seekForward",
      ),
    ).toBe(true);
    expect(
      isShortcutBlockedByTarget(
        element('<div role="slider" data-target></div>'),
        "volumeUp",
      ),
    ).toBe(true);
    expect(
      isShortcutBlockedByTarget(
        element("<button data-target>Next</button>"),
        "seekForward",
      ),
    ).toBe(false);
  });
});

describe("useStudioPlayerShortcuts", () => {
  const keydown = (key: string, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
      ...init,
    });
    window.dispatchEvent(event);
    return event;
  };

  it("runs a shortcut while something is queued and claims the key", () => {
    const onShortcut = vi.fn();
    renderHook(() =>
      useStudioPlayerShortcuts({
        hasQueue: true,
        isNowPlayingOpen: false,
        onShortcut,
      }),
    );
    const event = keydown(" ");
    expect(onShortcut).toHaveBeenCalledWith("playPause");
    expect(event.defaultPrevented).toBe(true);
  });

  it("does nothing while nothing is queued", () => {
    const onShortcut = vi.fn();
    renderHook(() =>
      useStudioPlayerShortcuts({
        hasQueue: false,
        isNowPlayingOpen: false,
        onShortcut,
      }),
    );
    keydown("m");
    expect(onShortcut).not.toHaveBeenCalled();
  });

  it("stands down while a dialog other than Now playing is open", () => {
    const onShortcut = vi.fn();
    const { rerender } = renderHook(
      ({ isNowPlayingOpen }: { isNowPlayingOpen: boolean }) =>
        useStudioPlayerShortcuts({
          hasQueue: true,
          isNowPlayingOpen,
          onShortcut,
        }),
      { initialProps: { isNowPlayingOpen: false } },
    );
    pushModal("other-dialog");
    keydown("m");
    expect(onShortcut).not.toHaveBeenCalled();
    popModal("other-dialog");
    pushModal("now-playing");
    rerender({ isNowPlayingOpen: true });
    keydown("m");
    expect(onShortcut).toHaveBeenCalledWith("mute");
    pushModal("other-dialog");
    keydown("s");
    expect(onShortcut).toHaveBeenCalledTimes(1);
  });

  it("leaves a key another control already handled", () => {
    const onShortcut = vi.fn();
    renderHook(() =>
      useStudioPlayerShortcuts({
        hasQueue: true,
        isNowPlayingOpen: false,
        onShortcut,
      }),
    );
    const event = new KeyboardEvent("keydown", {
      key: "m",
      bubbles: true,
      cancelable: true,
    });
    event.preventDefault();
    window.dispatchEvent(event);
    expect(onShortcut).not.toHaveBeenCalled();
  });

  it("fires a held Space once", () => {
    const onShortcut = vi.fn();
    renderHook(() =>
      useStudioPlayerShortcuts({
        hasQueue: true,
        isNowPlayingOpen: false,
        onShortcut,
      }),
    );
    keydown(" ");
    const repeated = keydown(" ", { repeat: true });
    expect(onShortcut).toHaveBeenCalledTimes(1);
    expect(repeated.defaultPrevented).toBe(true);
  });

  it("seeks again on a held ArrowRight", () => {
    const onShortcut = vi.fn();
    renderHook(() =>
      useStudioPlayerShortcuts({
        hasQueue: true,
        isNowPlayingOpen: false,
        onShortcut,
      }),
    );
    keydown("ArrowRight");
    keydown("ArrowRight", { repeat: true });
    expect(onShortcut).toHaveBeenCalledTimes(2);
  });

  it("ignores a keydown that has no key", () => {
    const onShortcut = vi.fn();
    renderHook(() =>
      useStudioPlayerShortcuts({
        hasQueue: true,
        isNowPlayingOpen: false,
        onShortcut,
      }),
    );
    const event = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, "key", { value: undefined });
    expect(() => window.dispatchEvent(event)).not.toThrow();
    expect(onShortcut).not.toHaveBeenCalled();
  });

  it("leaves the arrow keys to a region marked own-arrows", () => {
    const onShortcut = vi.fn();
    renderHook(() =>
      useStudioPlayerShortcuts({
        hasQueue: true,
        isNowPlayingOpen: false,
        onShortcut,
      }),
    );
    const target = element(
      '<ol data-player-keys="own-arrows"><li><button data-target>Line</button></li></ol>',
    );
    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(event);
    expect(onShortcut).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});
