import { useEffect, useRef, type KeyboardEvent, type RefObject } from "react";
import { isNavigableItem, type DeskMenuItem } from "./deskMenuItems";

/** How long a pause clears the type-ahead buffer, per the APG menu pattern. */
const TYPEAHEAD_RESET_MS = 500;

export interface UseDeskMenuKeyboardParams {
  items: DeskMenuItem[];
  /** Item buttons indexed like `items`; separators and headings stay null. */
  itemRefs: RefObject<(HTMLButtonElement | null)[]>;
  /** Closes the menu; `true` hands focus back to the trigger. */
  onClose: (shouldRestoreFocus: boolean) => void;
}

export interface DeskMenuKeyboard {
  handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  /** Focuses the first navigable item searching from `startIndex` in
   *  `direction`, wrapping at the ends. Used for the focus on open too.
   *  Returns whether an item took focus (false when none is navigable). */
  focusFrom: (startIndex: number, direction: 1 | -1) => boolean;
}

/**
 * Case- and accent-folded text for type-ahead matching, so "u" reaches
 * "Última" and "a" reaches "Área" in the Portuguese catalogue. NFD splits each
 * accented letter into its base letter plus combining marks, which are then
 * dropped.
 */
export function foldForTypeahead(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/**
 * The inside-the-menu half of the APG menu keyboard contract: Arrow Up/Down
 * rove and wrap, Home/End jump to the ends, a typed letter jumps to the next
 * item starting with it, Escape closes and hands focus back to the trigger,
 * and Tab closes too. Enter and Space need nothing here: every item is a
 * native `<button>`, so both already fire its click.
 *
 * Focus moves for real (each item is `tabIndex={-1}` and gets `.focus()`),
 * the same model as `PieceRowMenuPopover`. Disabled actions are skipped.
 */
export function useDeskMenuKeyboard({
  items,
  itemRefs,
  onClose,
}: UseDeskMenuKeyboardParams): DeskMenuKeyboard {
  const typeaheadRef = useRef({ buffer: "", timeoutId: 0 });

  useEffect(() => {
    const typeahead = typeaheadRef.current;
    return () => window.clearTimeout(typeahead.timeoutId);
  }, []);

  function focusFrom(startIndex: number, direction: 1 | -1): boolean {
    const itemCount = items.length;
    for (let step = 0; step < itemCount; step += 1) {
      const index =
        (((startIndex + step * direction) % itemCount) + itemCount) % itemCount;
      const item = items[index];
      if (item && isNavigableItem(item)) {
        itemRefs.current[index]?.focus();
        return true;
      }
    }
    return false;
  }

  function focusByTypeahead(character: string, currentIndex: number): void {
    const typeahead = typeaheadRef.current;
    window.clearTimeout(typeahead.timeoutId);
    typeahead.buffer += foldForTypeahead(character);
    typeahead.timeoutId = window.setTimeout(() => {
      typeahead.buffer = "";
    }, TYPEAHEAD_RESET_MS);
    // Pressing one letter again cycles through the items that start with it;
    // typing a longer prefix refines the match from where focus already is.
    const buffer = typeahead.buffer;
    const isRepeatedLetter = [...buffer].every(
      (letter) => letter === buffer[0],
    );
    const query = isRepeatedLetter ? buffer.charAt(0) : buffer;
    const startIndex = Math.max(currentIndex, 0) + (isRepeatedLetter ? 1 : 0);
    const itemCount = items.length;
    for (let step = 0; step < itemCount; step += 1) {
      const index = (startIndex + step) % itemCount;
      const item = items[index];
      if (
        item &&
        isNavigableItem(item) &&
        foldForTypeahead(item.label.trimStart()).startsWith(query)
      ) {
        itemRefs.current[index]?.focus();
        return;
      }
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>): void {
    // The desk binds single-letter shortcuts on `window` (j, k, o, c, w, y,
    // n, ?). React portals bubble through the React tree and the native event
    // still reaches `window`, so a type-ahead letter would also fire one.
    event.stopPropagation();
    const currentIndex = itemRefs.current.findIndex(
      (node) => node !== null && node === document.activeElement,
    );
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusFrom(currentIndex + 1, 1);
        return;
      case "ArrowUp":
        event.preventDefault();
        focusFrom(currentIndex < 0 ? items.length - 1 : currentIndex - 1, -1);
        return;
      case "Home":
        event.preventDefault();
        focusFrom(0, 1);
        return;
      case "End":
        event.preventDefault();
        focusFrom(items.length - 1, -1);
        return;
      case "Escape":
        event.preventDefault();
        onClose(true);
        return;
      case "Tab":
        // No preventDefault: focus goes back to the trigger first, so the
        // browser's own Tab then continues from the trigger's place in the
        // page. The portaled menu itself sits at the end of `<body>`.
        onClose(true);
        return;
    }
    const isTypeaheadKey =
      event.key.length === 1 &&
      event.key !== " " &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey;
    if (isTypeaheadKey) focusByTypeahead(event.key, currentIndex);
  }

  return { handleKeyDown, focusFrom };
}
