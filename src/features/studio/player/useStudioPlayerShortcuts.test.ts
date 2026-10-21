import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { popModal, pushModal } from "../../../shared/components/ui/modalStack";
import { writeListeningPreferences } from "./studioPlayerPreferences";
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
  writeListeningPreferences({ areSingleKeyShortcutsOn: true });
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
  /** A key pressed with focus on a control inside the player bar. */
  const keydownInPlayer = (key: string, init: KeyboardEventInit = {}) => {
    const target = element(
      '<section data-studio-player=""><button data-target>Shuffle</button></section>',
    );
    const event = new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
      ...init,
    });
    target.dispatchEvent(event);
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
    const event = keydownInPlayer("ArrowUp");
    expect(onShortcut).toHaveBeenCalledWith("volumeUp");
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
    const target = element(
      '<section data-studio-player=""><div tabindex="-1" data-target></div></section>',
    );
    const press = (init: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent("keydown", {
        key: " ",
        bubbles: true,
        cancelable: true,
        ...init,
      });
      target.dispatchEvent(event);
      return event;
    };
    press();
    const repeated = press({ repeat: true });
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
    keydownInPlayer("ArrowRight");
    keydownInPlayer("ArrowRight", { repeat: true });
    expect(onShortcut).toHaveBeenCalledTimes(2);
  });
});

describe("useStudioPlayerShortcuts scope and switch (DES-21)", () => {
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
  const keydownInPlayer = (key: string) => {
    const target = element(
      '<section data-studio-player=""><button data-target>Shuffle</button></section>',
    );
    const event = new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
    });
    target.dispatchEvent(event);
    return event;
  };

  it("leaves Space and the arrows to the page outside the player", () => {
    const onShortcut = vi.fn();
    renderHook(() =>
      useStudioPlayerShortcuts({
        hasQueue: true,
        isNowPlayingOpen: false,
        onShortcut,
      }),
    );
    const onBody = new KeyboardEvent("keydown", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });
    document.body.dispatchEvent(onBody);
    const link = element('<a data-target href="/forum">A post</a>');
    const onLink = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      cancelable: true,
    });
    link.dispatchEvent(onLink);
    expect(keydown("ArrowRight").defaultPrevented).toBe(false);
    expect(onShortcut).not.toHaveBeenCalled();
    expect(onBody.defaultPrevented).toBe(false);
    expect(onLink.defaultPrevented).toBe(false);
  });

  it("runs letters from the body while single-key shortcuts are on", () => {
    const onShortcut = vi.fn();
    renderHook(() =>
      useStudioPlayerShortcuts({
        hasQueue: true,
        isNowPlayingOpen: false,
        onShortcut,
      }),
    );
    const event = new KeyboardEvent("keydown", {
      key: "s",
      bubbles: true,
      cancelable: true,
    });
    document.body.dispatchEvent(event);
    expect(onShortcut).toHaveBeenCalledWith("shuffle");
    expect(event.defaultPrevented).toBe(true);
  });

  it("leaves every letter alone once single-key shortcuts are off", () => {
    writeListeningPreferences({ areSingleKeyShortcutsOn: false });
    const onShortcut = vi.fn();
    renderHook(() =>
      useStudioPlayerShortcuts({
        hasQueue: true,
        isNowPlayingOpen: false,
        onShortcut,
      }),
    );
    const letter = keydown("m");
    const help = keydown("?", { shiftKey: true });
    expect(onShortcut).not.toHaveBeenCalled();
    expect(letter.defaultPrevented).toBe(false);
    expect(help.defaultPrevented).toBe(false);
    keydownInPlayer("ArrowUp");
    expect(onShortcut).toHaveBeenCalledWith("volumeUp");
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
