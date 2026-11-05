import { useEffect, useRef } from "react";

export interface StudioShortcutHandlers {
  /** N: a new question after the selected one. */
  onNewQuestion: () => void;
  /** Arrow up: the previous question in the rail. */
  onPrevious: () => void;
  /** Arrow down: the next question in the rail. */
  onNext: () => void;
  /** Cmd/Ctrl+D: duplicate the selected question. */
  onDuplicate: () => void;
  /** Delete or Backspace on a focused thumbnail; the caller asks to confirm. */
  onDelete: () => void;
  /** Cmd/Ctrl+S: save now. */
  onSave: () => void;
  /** ?: open the shortcuts sheet. */
  onShowShortcuts: () => void;
  /**
   * Additive. With focus in the rail, arrow up and down walk every rail item
   * (the settings row, round headers, thumbnails) and Home and End jump to
   * its ends; from the page body the arrows stay question to question.
   * Left out, the rail's arrows walk questions as before.
   */
  onRailStep?: (step: StudioRailStep) => void;
}

/** Where a key in the rail moves the selection. */
export type StudioRailStep = "previous" | "next" | "first" | "last";

const RAIL_STEP_BY_KEY: Partial<Record<string, StudioRailStep>> = {
  ArrowUp: "previous",
  ArrowDown: "next",
  // The narrow filmstrip runs sideways.
  ArrowLeft: "previous",
  ArrowRight: "next",
  Home: "first",
  End: "last",
};

/**
 * The rail's thumbnails carry this attribute, so Delete and Backspace act
 * only while one has focus: `<button {...{ [STUDIO_THUMBNAIL_ATTRIBUTE]: "" }}>`.
 */
export const STUDIO_THUMBNAIL_ATTRIBUTE = "data-studio-thumbnail";
/**
 * The rail's container carries this attribute: arrow up and down move the
 * selection while focus is inside it (or on the page body), and the rail may
 * be a listbox without losing Delete or the arrows.
 */
export const STUDIO_RAIL_ATTRIBUTE = "data-studio-rail";
/**
 * The studio's own root, if it is ever marked `aria-modal`: it does not count
 * as an open dialog.
 */
export const STUDIO_ROOT_ATTRIBUTE = "data-studio-root";

const RAIL_SELECTOR = `[${STUDIO_THUMBNAIL_ATTRIBUTE}], [${STUDIO_RAIL_ATTRIBUTE}]`;
/** A dialog over the studio (the try-out, a confirm, the shortcuts sheet). */
const OPEN_DIALOG_SELECTOR = `[aria-modal="true"]:not([${STUDIO_ROOT_ATTRIBUTE}]), [role="alertdialog"]`;

/** Text entry, where every key belongs to the field. */
const TEXT_FIELD_SELECTOR =
  'input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]';
/**
 * Widgets that read the arrow keys and letters themselves (menus, radio
 * groups, tabs, sliders, listboxes) and open dialogs (the try-out, confirms),
 * where the studio's keys would act behind them.
 */
const OWN_KEYS_SELECTOR =
  '[role="menu"], [role="menubar"], [role="listbox"], [role="radiogroup"], [role="tablist"], [role="slider"], [role="grid"], [role="dialog"], [role="alertdialog"]';

function elementOf(target: EventTarget | null): Element | null {
  return target instanceof Element ? target : null;
}

function isInTextField(element: Element | null): boolean {
  if (element === null) return false;
  if (element instanceof HTMLElement && element.isContentEditable) return true;
  return element.closest(TEXT_FIELD_SELECTOR) !== null;
}

function hasCommandKey(event: KeyboardEvent): boolean {
  return (event.metaKey || event.ctrlKey) && !event.altKey;
}

function hasNoModifier(event: KeyboardEvent): boolean {
  return !event.metaKey && !event.ctrlKey && !event.altKey;
}

function isOnBody(element: Element | null): boolean {
  return (
    element === null ||
    element === document.body ||
    element === document.documentElement
  );
}

function isDialogOpen(): boolean {
  return document.querySelector(OPEN_DIALOG_SELECTOR) !== null;
}

/** The arrow and delete keys: from the rail (or the body for the arrows) only. */
function railHandlerFor(
  event: KeyboardEvent,
  element: Element | null,
  handlers: StudioShortcutHandlers,
): (() => void) | null {
  const isInRail = (element?.closest(RAIL_SELECTOR) ?? null) !== null;
  const railStep = RAIL_STEP_BY_KEY[event.key];
  const { onRailStep } = handlers;
  if (isInRail && railStep !== undefined && onRailStep !== undefined) {
    return () => onRailStep(railStep);
  }
  if (event.key === "ArrowUp" || event.key === "ArrowDown") {
    if (!isInRail && !isOnBody(element)) return null;
    return event.key === "ArrowUp" ? handlers.onPrevious : handlers.onNext;
  }
  const isDeleteKey = event.key === "Delete" || event.key === "Backspace";
  if (isDeleteKey && element?.closest(`[${STUDIO_THUMBNAIL_ATTRIBUTE}]`)) {
    return event.repeat ? null : handlers.onDelete;
  }
  return null;
}

/** The handler for this key press, or null when the studio leaves it alone. */
function handlerFor(
  event: KeyboardEvent,
  handlers: StudioShortcutHandlers,
): (() => void) | null {
  // A dialog over the studio owns every key, Cmd/Ctrl+S included.
  if (isDialogOpen()) return null;
  const element = elementOf(event.target);
  const key = event.key.toLowerCase();
  // Save works from a text field too, so typing never meets the browser's Save page.
  if (hasCommandKey(event) && key === "s") {
    return event.repeat ? null : handlers.onSave;
  }
  if (isInTextField(element)) return null;
  // The rail comes first, so a rail built as a listbox keeps its keys.
  if (hasNoModifier(event) && !event.shiftKey) {
    const railHandler = railHandlerFor(event, element, handlers);
    if (railHandler !== null) return railHandler;
  }
  // A focused thumbnail keeps N, Cmd/Ctrl+D and ? too, inside a listbox rail.
  const isOnThumbnail =
    (element?.closest(`[${STUDIO_THUMBNAIL_ATTRIBUTE}]`) ?? null) !== null;
  if (!isOnThumbnail && element?.closest(OWN_KEYS_SELECTOR)) return null;
  if (hasCommandKey(event) && key === "d") {
    return event.repeat ? null : handlers.onDuplicate;
  }
  if (event.key === "?" && !event.metaKey && !event.ctrlKey) {
    return event.repeat ? null : handlers.onShowShortcuts;
  }
  if (!hasNoModifier(event) || event.shiftKey) return null;
  if (key === "n") return event.repeat ? null : handlers.onNewQuestion;
  return null;
}

/**
 * The studio's keyboard: N, arrow up and down (from the rail or the page
 * body), Cmd/Ctrl+D, Delete or Backspace on a focused thumbnail, Cmd/Ctrl+S
 * and ?. Keys typed in an input, textarea, select or contenteditable are left
 * to the field (Cmd/Ctrl+S excepted), keys a menu or radio group reads itself
 * are left to it, and an open dialog over the studio silences every key.
 */
export function useStudioShortcuts(handlers: StudioShortcutHandlers): void {
  const handlersRef = useRef(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;
      const handler = handlerFor(event, handlersRef.current);
      if (handler === null) return;
      event.preventDefault();
      handler();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
}
