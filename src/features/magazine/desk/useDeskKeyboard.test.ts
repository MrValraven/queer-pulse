import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { pushModal, popModal } from "../../../shared/components/ui/modalStack";
import type { Piece } from "../data/desk.data";
import {
  resetDeskLetterShortcutsForTests,
  setDeskLetterShortcutsEnabled,
} from "./deskLetterShortcuts";
import { useDeskKeyboard, type UseDeskKeyboardParams } from "./useDeskKeyboard";

/**
 * Pure keydown-listener test: the hook attaches one `keydown` listener to
 * `window` while `enabled`, so every case here dispatches a real
 * `KeyboardEvent` rather than calling an exposed function.
 */

function makePiece(overrides: Partial<Piece> = {}): Piece {
  return {
    id: "piece-1",
    title: "A piece",
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Someone",
    editorId: "marta",
    stage: "Edit",
    due: "",
    art: "in",
    issueId: null,
    ...overrides,
  };
}

function pressKey(key: string, init: KeyboardEventInit = {}): void {
  window.dispatchEvent(
    new KeyboardEvent("keydown", { key, cancelable: true, ...init }),
  );
}

afterEach(() => {
  resetDeskLetterShortcutsForTests();
});

function baseParams(
  overrides: Partial<UseDeskKeyboardParams> = {},
): UseDeskKeyboardParams {
  return {
    visiblePieces: [makePiece({ id: "a" }), makePiece({ id: "b" })],
    focusId: "a",
    setFocusId: vi.fn(),
    onOpen: vi.fn(),
    onChase: vi.fn(),
    onWrite: vi.fn(),
    onShortcuts: vi.fn(),
    topPitchId: "pitch-1",
    onTriageTop: vi.fn(),
    enabled: true,
    ...overrides,
  };
}

describe("useDeskKeyboard", () => {
  it("j moves focus to the next visible piece", () => {
    const params = baseParams();
    renderHook(() => useDeskKeyboard(params));

    pressKey("j");

    expect(params.setFocusId).toHaveBeenCalledWith("b");
  });

  it("k moves focus to the previous visible piece", () => {
    const params = baseParams({ focusId: "b" });
    renderHook(() => useDeskKeyboard(params));

    pressKey("k");

    expect(params.setFocusId).toHaveBeenCalledWith("a");
  });

  it("j/k also open the newly focused piece while the peek panel is open", () => {
    const params = baseParams({ isPeekOpen: true });
    renderHook(() => useDeskKeyboard(params));

    pressKey("j");

    expect(params.setFocusId).toHaveBeenCalledWith("b");
    expect(params.onOpen).toHaveBeenCalledWith(
      expect.objectContaining({ id: "b" }),
    );
  });

  it("j/k do not open the newly focused piece when the peek panel is closed", () => {
    const params = baseParams({ isPeekOpen: false });
    renderHook(() => useDeskKeyboard(params));

    pressKey("j");

    expect(params.onOpen).not.toHaveBeenCalled();
  });

  it("o opens the focused piece", () => {
    const params = baseParams();
    renderHook(() => useDeskKeyboard(params));

    pressKey("o");

    expect(params.onOpen).toHaveBeenCalledWith(
      expect.objectContaining({ id: "a" }),
    );
  });

  it("x toggles the focused piece's selection when onToggleSelect is given", () => {
    const onToggleSelect = vi.fn();
    const params = baseParams({ onToggleSelect });
    renderHook(() => useDeskKeyboard(params));

    pressKey("x");

    expect(onToggleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "a" }),
    );
  });

  it("x is a no-op when onToggleSelect is absent", () => {
    const params = baseParams({ onToggleSelect: undefined });
    expect(() => {
      renderHook(() => useDeskKeyboard(params));
      pressKey("x");
    }).not.toThrow();
  });

  it("c chases the focused piece", () => {
    const params = baseParams();
    renderHook(() => useDeskKeyboard(params));

    pressKey("c");

    expect(params.onChase).toHaveBeenCalledWith(
      expect.objectContaining({ id: "a" }),
    );
  });

  it("w starts writing a piece", () => {
    const params = baseParams();
    renderHook(() => useDeskKeyboard(params));

    pressKey("w");

    expect(params.onWrite).toHaveBeenCalled();
  });

  it("p opens the pitch triage panel when onOpenTriage is given", () => {
    const onOpenTriage = vi.fn();
    const params = baseParams({ onOpenTriage });
    renderHook(() => useDeskKeyboard(params));

    pressKey("p");

    expect(onOpenTriage).toHaveBeenCalled();
  });

  it("/ focuses the search field and prevents the browser's own quick-find", () => {
    const onFocusSearch = vi.fn();
    const params = baseParams({ onFocusSearch });
    renderHook(() => useDeskKeyboard(params));

    const event = new KeyboardEvent("keydown", {
      key: "/",
      cancelable: true,
    });
    window.dispatchEvent(event);

    expect(onFocusSearch).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  it("? opens the shortcuts sheet", () => {
    const params = baseParams();
    renderHook(() => useDeskKeyboard(params));

    pressKey("?");

    expect(params.onShortcuts).toHaveBeenCalled();
  });

  it("y/n triage the top pitch", () => {
    const params = baseParams();
    renderHook(() => useDeskKeyboard(params));

    pressKey("y");
    expect(params.onTriageTop).toHaveBeenCalledWith("maybe");

    pressKey("n");
    expect(params.onTriageTop).toHaveBeenCalledWith("no");
  });

  it("n does nothing while a modal is open", () => {
    const params = baseParams();
    renderHook(() => useDeskKeyboard(params));

    pushModal("triage-overlay");
    try {
      pressKey("n");
      expect(params.onTriageTop).not.toHaveBeenCalled();
    } finally {
      popModal("triage-overlay");
    }
  });

  it("every other key does nothing while a modal is open", () => {
    const onToggleSelect = vi.fn();
    const onFocusSearch = vi.fn();
    const onOpenTriage = vi.fn();
    const params = baseParams({ onToggleSelect, onFocusSearch, onOpenTriage });
    renderHook(() => useDeskKeyboard(params));

    pushModal("triage-overlay");
    try {
      for (const key of ["j", "o", "c", "w", "x", "p", "/", "?"]) {
        pressKey(key);
      }
      expect(params.setFocusId).not.toHaveBeenCalled();
      expect(params.onOpen).not.toHaveBeenCalled();
      expect(params.onChase).not.toHaveBeenCalled();
      expect(params.onWrite).not.toHaveBeenCalled();
      expect(onToggleSelect).not.toHaveBeenCalled();
      expect(onOpenTriage).not.toHaveBeenCalled();
      expect(onFocusSearch).not.toHaveBeenCalled();
      expect(params.onShortcuts).not.toHaveBeenCalled();
    } finally {
      popModal("triage-overlay");
    }
  });

  it("resumes handling keys once the modal that blocked them closes", () => {
    const params = baseParams();
    renderHook(() => useDeskKeyboard(params));

    pushModal("triage-overlay");
    pressKey("j");
    popModal("triage-overlay");
    pressKey("j");

    expect(params.setFocusId).toHaveBeenCalledTimes(1);
    expect(params.setFocusId).toHaveBeenCalledWith("b");
  });

  it("ignores every key while typing in a field", () => {
    const params = baseParams();
    renderHook(() => useDeskKeyboard(params));

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "j", bubbles: true }),
    );
    document.body.removeChild(input);

    expect(params.setFocusId).not.toHaveBeenCalled();
  });

  it("does nothing while disabled", () => {
    const params = baseParams({ enabled: false });
    renderHook(() => useDeskKeyboard(params));

    pressKey("j");

    expect(params.setFocusId).not.toHaveBeenCalled();
  });
});

describe("useDeskKeyboard chords, held keys and the single-key switch", () => {
  it("meta+c leaves the chase alone, so copying text stays a copy", () => {
    const params = baseParams();
    renderHook(() => useDeskKeyboard(params));

    pressKey("c", { metaKey: true });

    expect(params.onChase).not.toHaveBeenCalled();
  });

  it("ctrl+y leaves the top pitch alone, so redo stays a redo", () => {
    const params = baseParams();
    renderHook(() => useDeskKeyboard(params));

    pressKey("y", { ctrlKey: true });

    expect(params.onTriageTop).not.toHaveBeenCalled();
  });

  it("alt+n leaves the top pitch alone", () => {
    const params = baseParams();
    renderHook(() => useDeskKeyboard(params));

    pressKey("n", { altKey: true });

    expect(params.onTriageTop).not.toHaveBeenCalled();
  });

  it("an AltGr letter chord (Ctrl+Alt on Windows) leaves the top pitch alone", () => {
    const params = baseParams();
    renderHook(() => useDeskKeyboard(params));

    pressKey("n", { ctrlKey: true, altKey: true, modifierAltGraph: true });

    expect(params.onTriageTop).not.toHaveBeenCalled();
  });

  it("/ typed with AltGr (as on a Brazilian keyboard) still focuses search", () => {
    const onFocusSearch = vi.fn();
    const params = baseParams({ onFocusSearch });
    renderHook(() => useDeskKeyboard(params));

    pressKey("/", { ctrlKey: true, altKey: true, modifierAltGraph: true });

    expect(onFocusSearch).toHaveBeenCalled();
  });

  it("does nothing while a popup such as a date popover is open", () => {
    const params = baseParams();
    renderHook(() => useDeskKeyboard(params));
    const popoverTrigger = document.createElement("button");
    popoverTrigger.setAttribute("aria-haspopup", "dialog");
    popoverTrigger.setAttribute("aria-expanded", "true");
    document.body.appendChild(popoverTrigger);

    try {
      pressKey("n");
      pressKey("j");
      expect(params.onTriageTop).not.toHaveBeenCalled();
      expect(params.setFocusId).not.toHaveBeenCalled();

      popoverTrigger.setAttribute("aria-expanded", "false");
      pressKey("j");
      expect(params.setFocusId).toHaveBeenCalledWith("b");
    } finally {
      document.body.removeChild(popoverTrigger);
    }
  });

  it("an expanded disclosure (no popup) leaves the keys live", () => {
    const params = baseParams();
    renderHook(() => useDeskKeyboard(params));
    const groupToggle = document.createElement("button");
    groupToggle.setAttribute("aria-expanded", "true");
    document.body.appendChild(groupToggle);

    try {
      pressKey("j");
      expect(params.setFocusId).toHaveBeenCalledWith("b");
    } finally {
      document.body.removeChild(groupToggle);
    }
  });

  it("a held w starts one piece, and its repeats do nothing", () => {
    const params = baseParams();
    renderHook(() => useDeskKeyboard(params));

    pressKey("w");
    pressKey("w", { repeat: true });
    pressKey("w", { repeat: true });

    expect(params.onWrite).toHaveBeenCalledTimes(1);
  });

  it("with the letter shortcuts off, no single-character key fires", () => {
    const onToggleSelect = vi.fn();
    const onFocusSearch = vi.fn();
    const onOpenTriage = vi.fn();
    const params = baseParams({ onToggleSelect, onFocusSearch, onOpenTriage });
    renderHook(() => useDeskKeyboard(params));

    act(() => setDeskLetterShortcutsEnabled(false));
    for (const key of ["j", "k", "o", "x", "c", "w", "p", "y", "n", "/"]) {
      pressKey(key);
    }

    expect(params.setFocusId).not.toHaveBeenCalled();
    expect(params.onOpen).not.toHaveBeenCalled();
    expect(onToggleSelect).not.toHaveBeenCalled();
    expect(params.onChase).not.toHaveBeenCalled();
    expect(params.onWrite).not.toHaveBeenCalled();
    expect(onOpenTriage).not.toHaveBeenCalled();
    expect(params.onTriageTop).not.toHaveBeenCalled();
    expect(onFocusSearch).not.toHaveBeenCalled();
  });

  it("with the letter shortcuts off, ? still opens the shortcut sheet", () => {
    const params = baseParams();
    renderHook(() => useDeskKeyboard(params));

    act(() => setDeskLetterShortcutsEnabled(false));
    pressKey("?");

    expect(params.onShortcuts).toHaveBeenCalled();
  });
});
