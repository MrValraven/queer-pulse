import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useVjRemoteKeyboard } from "./useVjRemoteKeyboard";
import type { VjActionDispatch } from "./vjRemoteAction";

interface KeyboardProps {
  isEnabled: boolean;
  dispatch: VjActionDispatch;
}

function renderKeyboard(isEnabled = true) {
  const dispatch = vi.fn<VjActionDispatch>();
  const view = renderHook(
    (props: KeyboardProps) => useVjRemoteKeyboard(props),
    { initialProps: { isEnabled, dispatch } },
  );
  return { ...view, dispatch };
}

/** Fires a cancelable key event on `target` (bubbling to window). */
function fireKey(
  type: "keydown" | "keyup",
  code: string,
  init: KeyboardEventInit = {},
  target: EventTarget = window,
): KeyboardEvent {
  const event = new KeyboardEvent(type, {
    code,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  target.dispatchEvent(event);
  return event;
}

const padSlotTwo = { kind: "padSlot", slot: 1 } as const;

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("useVjRemoteKeyboard", () => {
  it("Digit3 dispatches goClipAt 2", () => {
    const { dispatch } = renderKeyboard();
    fireKey("keydown", "Digit3");
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      { kind: "goClipAt", index: 2 },
      "press",
    );
  });

  it("Shift+KeyX press and release hold pad slot 2", () => {
    const { dispatch } = renderKeyboard();
    fireKey("keydown", "KeyX", { shiftKey: true });
    expect(dispatch).toHaveBeenLastCalledWith(padSlotTwo, "press");
    fireKey("keyup", "KeyX", { shiftKey: true });
    expect(dispatch).toHaveBeenLastCalledWith(padSlotTwo, "release");
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it("releasing Shift first still releases the pad on keyup", () => {
    const { dispatch } = renderKeyboard();
    fireKey("keydown", "KeyX", { shiftKey: true });
    fireKey("keyup", "ShiftLeft");
    expect(dispatch).toHaveBeenCalledTimes(1);
    fireKey("keyup", "KeyX", { shiftKey: false });
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenLastCalledWith(padSlotTwo, "release");
  });

  it("window blur releases a held pad", () => {
    const { dispatch } = renderKeyboard();
    fireKey("keydown", "KeyX", { shiftKey: true });
    window.dispatchEvent(new Event("blur"));
    expect(dispatch).toHaveBeenLastCalledWith(padSlotTwo, "release");
    fireKey("keyup", "KeyX");
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it("a hidden tab releases a held pad", () => {
    const { dispatch } = renderKeyboard();
    fireKey("keydown", "KeyX", { shiftKey: true });
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(dispatch).toHaveBeenLastCalledWith(padSlotTwo, "release");
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it("disabling the hook releases a held pad", () => {
    const { dispatch, rerender } = renderKeyboard();
    fireKey("keydown", "KeyX", { shiftKey: true });
    rerender({ isEnabled: false, dispatch });
    expect(dispatch).toHaveBeenLastCalledWith(padSlotTwo, "release");
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it("typing in an input dispatches nothing", () => {
    const { dispatch } = renderKeyboard();
    const input = document.createElement("input");
    document.body.append(input);
    const event = fireKey("keydown", "Space", {}, input);
    fireKey("keydown", "KeyB", {}, input);
    expect(dispatch).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("Space and Enter on a focused button stay with the button", () => {
    const { dispatch } = renderKeyboard();
    const button = document.createElement("button");
    document.body.append(button);
    const spaceEvent = fireKey("keydown", "Space", {}, button);
    const enterEvent = fireKey("keydown", "Enter", {}, button);
    fireKey("keydown", "KeyB", {}, button);
    expect(spaceEvent.defaultPrevented).toBe(false);
    expect(enterEvent.defaultPrevented).toBe(false);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ kind: "blackout" }, "press");
  });

  it("an open modal blocks presses and passes releases", () => {
    const { dispatch } = renderKeyboard();
    fireKey("keydown", "KeyX", { shiftKey: true });
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    document.body.append(dialog);
    fireKey("keydown", "Digit1");
    fireKey("keydown", "KeyZ", { shiftKey: true });
    expect(dispatch).toHaveBeenCalledTimes(1);
    fireKey("keyup", "KeyX");
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(dispatch).toHaveBeenLastCalledWith(padSlotTwo, "release");
  });

  it("Space prevents the page scroll", () => {
    const { dispatch } = renderKeyboard();
    const event = fireKey("keydown", "Space");
    expect(event.defaultPrevented).toBe(true);
    expect(dispatch).toHaveBeenCalledWith({ kind: "go" }, "press");
    const repeatEvent = fireKey("keydown", "Space", { repeat: true });
    expect(repeatEvent.defaultPrevented).toBe(true);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it("disabled dispatches nothing", () => {
    const { dispatch } = renderKeyboard(false);
    const event = fireKey("keydown", "Space");
    fireKey("keydown", "KeyX", { shiftKey: true });
    fireKey("keyup", "KeyX");
    expect(dispatch).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("unmounting releases a held pad and detaches the listeners", () => {
    const { dispatch, unmount } = renderKeyboard();
    fireKey("keydown", "KeyX", { shiftKey: true });
    unmount();
    expect(dispatch).toHaveBeenLastCalledWith(padSlotTwo, "release");
    fireKey("keydown", "Digit1");
    expect(dispatch).toHaveBeenCalledTimes(2);
  });
});
