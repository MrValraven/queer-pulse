import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { undoShortcutFor, useUndoShortcuts } from "./undoShortcut";

function press(
  key: string,
  modifiers: { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean } = {},
  target: EventTarget | null = null,
) {
  return undoShortcutFor({
    key,
    metaKey: modifiers.metaKey ?? false,
    ctrlKey: modifiers.ctrlKey ?? false,
    shiftKey: modifiers.shiftKey ?? false,
    target,
  });
}

function attached<ElementType extends HTMLElement>(
  element: ElementType,
): ElementType {
  document.body.append(element);
  return element;
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("undoShortcutFor", () => {
  it("reads Cmd or Ctrl+Z as undo and with Shift as redo", () => {
    expect(press("z", { metaKey: true })).toBe("undo");
    expect(press("z", { ctrlKey: true })).toBe("undo");
    expect(press("Z", { ctrlKey: true, shiftKey: true })).toBe("redo");
    expect(press("z", { metaKey: true, shiftKey: true })).toBe("redo");
    expect(press("y", { ctrlKey: true })).toBe("redo");
    expect(press("z")).toBeNull();
    expect(press("x", { metaKey: true })).toBeNull();
  });

  it("leaves typing fields alone", () => {
    const textInput = attached(document.createElement("input"));
    const textArea = attached(document.createElement("textarea"));
    const editable = attached(document.createElement("div"));
    editable.setAttribute("contenteditable", "true");
    const editableChild = document.createElement("span");
    editable.append(editableChild);

    expect(press("z", { metaKey: true }, textInput)).toBeNull();
    expect(press("z", { ctrlKey: true }, textArea)).toBeNull();
    expect(press("z", { metaKey: true }, editableChild)).toBeNull();
  });

  it("still acts on buttons and checkboxes", () => {
    const button = attached(document.createElement("button"));
    const checkbox = attached(document.createElement("input"));
    checkbox.type = "checkbox";

    expect(press("z", { metaKey: true }, button)).toBe("undo");
    expect(press("z", { metaKey: true, shiftKey: true }, checkbox)).toBe(
      "redo",
    );
  });
});

describe("useUndoShortcuts", () => {
  function pressOnWindow(init: KeyboardEventInit): KeyboardEvent {
    const event = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      ...init,
    });
    window.dispatchEvent(event);
    return event;
  }

  it("calls undo and redo and claims the key", () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    renderHook(() => useUndoShortcuts({ onUndo, onRedo, isEnabled: true }));

    const undoEvent = pressOnWindow({ key: "z", metaKey: true });
    const redoEvent = pressOnWindow({
      key: "z",
      metaKey: true,
      shiftKey: true,
    });

    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onRedo).toHaveBeenCalledTimes(1);
    expect(undoEvent.defaultPrevented).toBe(true);
    expect(redoEvent.defaultPrevented).toBe(true);
  });

  it("ignores other keys and leaves them to the browser", () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    renderHook(() => useUndoShortcuts({ onUndo, onRedo, isEnabled: true }));

    const otherEvent = pressOnWindow({ key: "a", metaKey: true });

    expect(onUndo).not.toHaveBeenCalled();
    expect(onRedo).not.toHaveBeenCalled();
    expect(otherEvent.defaultPrevented).toBe(false);
  });

  it("stays quiet while disabled and after unmount", () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    const { rerender, unmount } = renderHook(
      ({ isEnabled }: { isEnabled: boolean }) =>
        useUndoShortcuts({ onUndo, onRedo, isEnabled }),
      { initialProps: { isEnabled: false } },
    );

    pressOnWindow({ key: "z", ctrlKey: true });
    expect(onUndo).not.toHaveBeenCalled();

    rerender({ isEnabled: true });
    pressOnWindow({ key: "z", ctrlKey: true });
    expect(onUndo).toHaveBeenCalledTimes(1);

    unmount();
    pressOnWindow({ key: "z", ctrlKey: true });
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it("calls the latest handlers after a rerender", () => {
    const firstUndo = vi.fn();
    const latestUndo = vi.fn();
    const onRedo = vi.fn();
    const { rerender } = renderHook(
      ({ onUndo }: { onUndo: () => void }) =>
        useUndoShortcuts({ onUndo, onRedo, isEnabled: true }),
      { initialProps: { onUndo: firstUndo } },
    );

    rerender({ onUndo: latestUndo });
    pressOnWindow({ key: "z", metaKey: true });

    expect(firstUndo).not.toHaveBeenCalled();
    expect(latestUndo).toHaveBeenCalledTimes(1);
  });

  it("leaves a key typed into a text field to the field", () => {
    const onUndo = vi.fn();
    renderHook(() =>
      useUndoShortcuts({ onUndo, onRedo: vi.fn(), isEnabled: true }),
    );
    const textInput = attached(document.createElement("input"));

    const event = new KeyboardEvent("keydown", {
      key: "z",
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    textInput.dispatchEvent(event);

    expect(onUndo).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});
