import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { STUDIO_NATIVE_UNDO_ATTRIBUTE } from "../shared/quizshowNativeUndo";
import {
  STUDIO_ROOT_ATTRIBUTE,
  useStudioHistoryShortcuts,
} from "./useStudioShortcuts";

/** A studio root holding a draft field and a template card field outside the history. */
function mountStudio() {
  const root = document.createElement("div");
  root.setAttribute(STUDIO_ROOT_ATTRIBUTE, "");
  const draftField = document.createElement("input");
  const nativePanel = document.createElement("section");
  nativePanel.setAttribute(STUDIO_NATIVE_UNDO_ATTRIBUTE, "");
  const cardField = document.createElement("textarea");
  nativePanel.append(cardField);
  root.append(draftField, nativePanel);
  document.body.append(root);
  return { root, draftField, cardField };
}

/** Presses Cmd+Z (or Shift+Cmd+Z) on `target`; returns whether the press was prevented. */
function pressUndo(target: Element, options: { shiftKey?: boolean } = {}) {
  const event = new KeyboardEvent("keydown", {
    key: options.shiftKey ? "Z" : "z",
    metaKey: true,
    shiftKey: options.shiftKey ?? false,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event.defaultPrevented;
}

function renderShortcuts() {
  const handlers = { onUndo: vi.fn(), onRedo: vi.fn() };
  renderHook(() => useStudioHistoryShortcuts(handlers));
  return handlers;
}

describe("useStudioHistoryShortcuts", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("undoes and redoes from a draft field and prevents the native undo", () => {
    const { draftField } = mountStudio();
    const handlers = renderShortcuts();

    expect(pressUndo(draftField)).toBe(true);
    expect(handlers.onUndo).toHaveBeenCalledTimes(1);

    expect(pressUndo(draftField, { shiftKey: true })).toBe(true);
    expect(handlers.onRedo).toHaveBeenCalledTimes(1);
  });

  it("keeps the browser's own undo inside a part marked for it", () => {
    const { cardField } = mountStudio();
    const handlers = renderShortcuts();

    expect(pressUndo(cardField)).toBe(false);
    expect(handlers.onUndo).not.toHaveBeenCalled();
  });

  it("leaves the keys alone while a dialog is open", () => {
    const { draftField } = mountStudio();
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    document.body.append(dialog);
    const handlers = renderShortcuts();

    expect(pressUndo(draftField)).toBe(false);
    expect(handlers.onUndo).not.toHaveBeenCalled();
  });
});
