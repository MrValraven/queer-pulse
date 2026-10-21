import { useEffect, useRef, type RefObject } from "react";
import { isLongPressLiftFocus } from "./useStudioContextMenu";

/** A pause this long (ms) starts a new type-ahead word. */
const TYPEAHEAD_RESET_MS = 500;

function nextFocusIndex(
  key: string,
  current: number,
  count: number,
): number | null {
  if (key === "ArrowDown") return (current + 1) % count;
  if (key === "ArrowUp") return (current - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
}

const labelOf = (item: HTMLElement) =>
  (item.dataset.label ?? item.textContent ?? "").toLocaleLowerCase();

/** The next item whose label starts with what was typed, after the focused
 *  one. Typing one letter again and again walks through the items that
 *  start with it. */
function typeaheadMatch(
  items: HTMLElement[],
  typed: string,
  current: number,
): HTMLElement | null {
  const firstLetter = typed.charAt(0);
  const isRepeat =
    typed.length > 1 &&
    [...typed].every((character) => character === firstLetter);
  const search = isRepeat ? firstLetter : typed;
  const startOffset = isRepeat || typed.length === 1 ? 1 : 0;
  for (let step = 0; step < items.length; step += 1) {
    const item = items[(current + startOffset + step) % items.length];
    if (item && labelOf(item).startsWith(search)) return item;
  }
  return null;
}

export interface StudioMenuKeyHandlers {
  /** Escape: close and hand focus back. */
  onEscape: () => void;
  /** Tab or Shift+Tab: close and put focus back on the opener, so the
   *  browser's own Tab move carries on from there. */
  onTab: () => void;
  /** Focus went somewhere outside the panel. */
  onFocusLeave: (next: Node) => void;
}

/** The menu's keyboard: arrows, Home and End move between items (wrapping),
 *  letters jump by label, Escape and Tab close. Native listeners on the
 *  panel, so Escape stops here and never also closes a dialog around the
 *  menu. */
export function useStudioMenuKeys(
  panelRef: RefObject<HTMLElement | null>,
  handlers: StudioMenuKeyHandlers,
): void {
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    let typed = "";
    let typedAt = 0;
    const onKeyDown = (event: KeyboardEvent) => {
      const items = Array.from(
        panel.querySelectorAll<HTMLElement>('[role="menuitem"]'),
      );
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        handlersRef.current.onEscape();
        return;
      }
      if (event.key === "Tab") {
        handlersRef.current.onTab();
        return;
      }
      if (items.length === 0) return;
      const active = document.activeElement;
      const current = items.findIndex((item) => item === active);
      const nextIndex = nextFocusIndex(event.key, current, items.length);
      if (nextIndex !== null) {
        event.preventDefault();
        items[nextIndex]?.focus();
        return;
      }
      const isLetter =
        event.key.length === 1 &&
        event.key !== " " &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey;
      if (!isLetter) return;
      const now = performance.now();
      const letter = event.key.toLocaleLowerCase();
      typed = now - typedAt > TYPEAHEAD_RESET_MS ? letter : typed + letter;
      typedAt = now;
      const match = typeaheadMatch(items, typed, Math.max(current, 0));
      if (!match) return;
      event.preventDefault();
      match.focus();
    };
    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget;
      if (!(next instanceof Node) || panel.contains(next)) return;
      // The finger lifting off a long-pressed row moves focus to the row; the
      // menu it opened stays, and focus goes back to the item it left.
      if (isLongPressLiftFocus(next)) {
        const left = event.target;
        requestAnimationFrame(() => {
          if (left instanceof HTMLElement && left.isConnected)
            left.focus({ preventScroll: true });
        });
        return;
      }
      handlersRef.current.onFocusLeave(next);
    };
    panel.addEventListener("keydown", onKeyDown);
    panel.addEventListener("focusout", onFocusOut);
    return () => {
      panel.removeEventListener("keydown", onKeyDown);
      panel.removeEventListener("focusout", onFocusOut);
    };
  }, [panelRef]);
}
