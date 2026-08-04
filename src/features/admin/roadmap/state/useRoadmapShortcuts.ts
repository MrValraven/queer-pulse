import { useEffect, useRef } from "react";

export interface RoadmapShortcutHandlers {
  /** `n` — open the new-item flow. */
  onNew?: () => void;
  /** `/` — focus the toolbar's filter/search field. */
  onFilter?: () => void;
  /** `j` — move focus to the next card in the current list. */
  onFocusNext?: () => void;
  /** `k` — move focus to the previous card. */
  onFocusPrev?: () => void;
  /** `e` — open the focused card's drawer. */
  onEditFocused?: () => void;
  /** `?` — open the shortcuts modal. */
  onHelp?: () => void;
  /** `Escape` — close whatever overlay is topmost (drawer, then modal). */
  onCloseTop?: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

/**
 * The prototype's keyboard shortcuts (`?` in `RoadmapModalsHost` lists them):
 * `/` filter, `n` new item, `j`/`k` move focus, `e` edit the focused card,
 * `?` help, `Escape` close the topmost overlay. Ignored while a form field
 * has focus — except `Escape`, which should still dismiss an open drawer or
 * modal even from inside its own text field.
 *
 * `handlers` is read through a ref updated every render rather than a
 * dependency the effect re-runs on, so passing a fresh object literal each
 * render (the common case) doesn't tear down and re-attach the listener.
 */
export function useRoadmapShortcuts(handlers: RoadmapShortcutHandlers): void {
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const current = handlersRef.current;

      if (isTypingTarget(event.target)) {
        if (event.key === "Escape") current.onCloseTop?.();
        return;
      }

      switch (event.key) {
        case "/":
          event.preventDefault();
          current.onFilter?.();
          break;
        case "n":
          current.onNew?.();
          break;
        case "j":
          current.onFocusNext?.();
          break;
        case "k":
          current.onFocusPrev?.();
          break;
        case "e":
          current.onEditFocused?.();
          break;
        case "?":
          current.onHelp?.();
          break;
        case "Escape":
          current.onCloseTop?.();
          break;
        default:
          break;
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
}
