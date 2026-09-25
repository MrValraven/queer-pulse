import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import { revealSuggestList } from "./revealSuggestList";

/** A name folded for matching: no accents, lower case, trimmed, so "medis"
 *  finds "Médis". */
function foldName(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase()
    .trim();
}

/** A key press that belongs to an IME composition. Safari reports
 *  `isComposing` false on the keydown that commits one, but its keyCode is
 *  still 229. */
function isComposingKey(event: KeyboardEvent): boolean {
  return event.isComposing || event.keyCode === 229;
}

/** The type-ahead's elements, owned by the caller (the hook only reads them
 *  in effects and handlers): the input with its chevron, and the list. */
export interface SkinSuggestRefs {
  fieldRef: RefObject<HTMLDivElement | null>;
  listboxRef: RefObject<HTMLDivElement | null>;
}

export interface SkinSuggest {
  listboxId: string;
  value: string;
  /** The names the list shows: all of them, or those the text matches. */
  matches: readonly string[];
  isListVisible: boolean;
  /** The option the arrow keys reached, or -1. */
  activeIndex: number;
  optionId: (index: number) => string;
  onInputChange: (text: string) => void;
  /** A mouse click on an empty input opens the whole list (fine pointers
   *  only: on touch the chevron and typing open it). */
  onInputClick: () => void;
  onInputKeyDown: (event: ReactKeyboardEvent<HTMLInputElement>) => void;
  onFieldBlur: (event: ReactFocusEvent<HTMLDivElement>) => void;
  /** The chevron: shows the whole list, or hides it. */
  toggleList: () => void;
  pick: (name: string) => void;
}

/**
 * State of a text input with a type-ahead list of names (an ARIA 1.2
 * combobox with list autocomplete). The list filters by a case- and
 * accent-insensitive "contains" match while typing; typed text is stored as
 * written, so a name missing from the list is still an answer.
 *
 * The list opens on typing, an arrow key, the chevron, or a mouse click on
 * an empty input. Focus alone never opens it: a row refocused after a drag
 * reorder, or a field focused by "Add", stays quiet (on a phone the keyboard
 * and save bar would cover the list). It hides when nothing matches, or when
 * the text already names one entry, until the chevron or an arrow key
 * reopens it. Alt with an arrow key is left alone for the list row's reorder
 * shortcut.
 *
 * A click outside the field and the list closes it, from a `document` click
 * listener in the bubble phase, after the target's own handlers ran, so the
 * click still lands where it was aimed (another row's chevron, a field the
 * closing list would have moved). A blur while a pointer is down waits for
 * that click; a scroll gesture ends without one and leaves the list open. A
 * keyboard blur (Tab) closes it at once. While the list shows, Escape is
 * caught on `document` in the capture phase with `stopPropagation`, so it
 * closes the list and an enclosing sheet listening on `document` stays open;
 * with the list hidden, Escape passes through.
 */
export function useSkinSuggestInput(
  {
    value,
    onChange,
    suggestions,
  }: {
    value: string;
    onChange: (value: string) => void;
    suggestions: readonly string[];
  },
  { fieldRef, listboxRef }: SkinSuggestRefs,
): SkinSuggest {
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [isShowingAll, setIsShowingAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  // A pointer went down while the list showed, and its click has not landed
  // yet (a touch moves focus after pointerup, so pointerup cannot clear it).
  const isPointerPendingRef = useRef(false);

  const foldedValue = foldName(value);
  const isExactMatch = suggestions.some(
    (name) => foldName(name) === foldedValue,
  );
  const filtered =
    foldedValue === ""
      ? suggestions
      : suggestions.filter((name) => foldName(name).includes(foldedValue));
  const matches = isShowingAll ? suggestions : filtered;
  const isListVisible =
    isOpen && matches.length > 0 && (isShowingAll || !isExactMatch);
  const visibleActiveIndex =
    isListVisible && activeIndex < matches.length ? activeIndex : -1;

  function open(shouldShowAll: boolean, nextActiveIndex = -1): void {
    setIsOpen(true);
    setIsShowingAll(shouldShowAll);
    setActiveIndex(nextActiveIndex);
  }

  function close(): void {
    setIsOpen(false);
    setIsShowingAll(false);
    setActiveIndex(-1);
  }

  function isInside(target: EventTarget | null): boolean {
    return (
      target instanceof Node &&
      (Boolean(fieldRef.current?.contains(target)) ||
        Boolean(listboxRef.current?.contains(target)))
    );
  }

  // Focus goes back to the input, so it never stays on an option that
  // assistive tech focused and the closing list unmounts.
  function pick(name: string): void {
    onChange(name);
    close();
    fieldRef.current?.querySelector("input")?.focus();
  }

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>): void {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (isComposingKey(event.nativeEvent)) return;
    const isArrowDown = event.key === "ArrowDown";
    if (isArrowDown || event.key === "ArrowUp") {
      const step = isArrowDown ? 1 : -1;
      if (isListVisible) {
        event.preventDefault();
        setActiveIndex((current) =>
          current < 0 || current >= matches.length
            ? isArrowDown
              ? 0
              : matches.length - 1
            : (current + step + matches.length) % matches.length,
        );
        return;
      }
      // Opening: the names the text matches, or all of them when the text
      // already names one (the arrow starts on it) or matches none.
      const shouldShowAll = isExactMatch || filtered.length === 0;
      const names = shouldShowAll ? suggestions : filtered;
      if (names.length === 0) return;
      event.preventDefault();
      const currentIndex = names.findIndex(
        (name) => foldName(name) === foldedValue,
      );
      const firstIndex = isArrowDown ? 0 : names.length - 1;
      open(shouldShowAll, currentIndex >= 0 ? currentIndex : firstIndex);
      return;
    }
    const activeName =
      visibleActiveIndex >= 0 ? matches[visibleActiveIndex] : undefined;
    if (event.key === "Enter" && activeName !== undefined) {
      event.preventDefault();
      pick(activeName);
    }
  }

  // The active option stays in view as the arrow keys move through a list
  // that scrolls.
  useEffect(() => {
    if (visibleActiveIndex < 0) return;
    listboxRef.current?.children[visibleActiveIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [visibleActiveIndex, listboxRef]);

  // A list that just opened scrolls clear of the sticky chrome, once per
  // opening. After the effect above, so its page scroll comes last.
  useEffect(() => {
    if (!isListVisible || !listboxRef.current) return;
    revealSuggestList(listboxRef.current, fieldRef.current);
  }, [isListVisible, listboxRef, fieldRef]);

  const onDocumentClick = useEffectEvent((event: MouseEvent) => {
    isPointerPendingRef.current = false;
    if (!isInside(event.target)) close();
  });

  // Any key ends a pending pointer, so the blur of a Tab closes the list.
  const onDocumentKeyDown = useEffectEvent((event: KeyboardEvent) => {
    isPointerPendingRef.current = false;
    if (event.key !== "Escape" || isComposingKey(event)) return;
    event.preventDefault();
    event.stopPropagation();
    close();
  });

  useEffect(() => {
    if (!isListVisible) return;
    const onPointerDown = () => {
      isPointerPendingRef.current = true;
    };
    // A scroll or a drag ends without a click.
    const onPointerCancel = () => {
      isPointerPendingRef.current = false;
    };
    const onClick = (event: MouseEvent) => onDocumentClick(event);
    const onKeyDown = (event: KeyboardEvent) => onDocumentKeyDown(event);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointercancel", onPointerCancel, true);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      isPointerPendingRef.current = false;
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointercancel", onPointerCancel, true);
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [isListVisible]);

  return {
    listboxId,
    value,
    matches,
    isListVisible,
    activeIndex: visibleActiveIndex,
    optionId: (index) => `${listboxId}-option-${index}`,
    onInputChange: (text) => {
      onChange(text);
      open(false);
    },
    onInputClick: () => {
      if (foldedValue !== "" || isListVisible) return;
      if (window.matchMedia("(pointer: fine)").matches) open(false);
    },
    onInputKeyDown,
    // Focus moving into the list (assistive tech can focus an option before
    // clicking it) stays inside; a blur from a pointer waits for its click.
    onFieldBlur: (event) => {
      if (isInside(event.relatedTarget) || isPointerPendingRef.current) return;
      close();
    },
    toggleList: () => (isListVisible ? close() : open(true)),
    pick,
  };
}
