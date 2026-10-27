import { useEffect, useEffectEvent } from "react";

export type UndoCommand = "undo" | "redo";

type UndoKeyPress = Pick<
  KeyboardEvent,
  "key" | "metaKey" | "ctrlKey" | "shiftKey" | "target"
>;

/** Input types that hold no typed text, so the grid keeps the shortcut there. */
const NON_TEXT_INPUT_TYPES: ReadonlySet<string> = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

const EDITABLE_SELECTOR = '[contenteditable=""], [contenteditable="true"]';

/** Text fields keep Cmd+Z for their own typing history. */
function isTypingField(target: EventTarget | null): boolean {
  if (typeof Element === "undefined" || !(target instanceof Element)) {
    return false;
  }
  if (target instanceof HTMLElement && target.isContentEditable) return true;
  if (target.closest(EDITABLE_SELECTOR)) return true;
  if (target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLSelectElement) return true;
  return (
    target instanceof HTMLInputElement && !NON_TEXT_INPUT_TYPES.has(target.type)
  );
}

/** Cmd or Ctrl+Z undoes, with Shift it redoes, and Ctrl+Y redoes too. */
export function undoShortcutFor(event: UndoKeyPress): UndoCommand | null {
  if (typeof event.key !== "string") return null;
  if (!event.metaKey && !event.ctrlKey) return null;
  if (isTypingField(event.target)) return null;
  const key = event.key.toLowerCase();
  if (key === "z") return event.shiftKey ? "redo" : "undo";
  if (key === "y" && event.ctrlKey && !event.shiftKey) return "redo";
  return null;
}

/** Listens on window while enabled and claims the key on a match. */
export function useUndoShortcuts(options: {
  onUndo: () => void;
  onRedo: () => void;
  isEnabled: boolean;
}): void {
  const { onUndo, onRedo, isEnabled } = options;

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    const command = undoShortcutFor(event);
    if (!command) return;
    event.preventDefault();
    if (command === "undo") onUndo();
    else onRedo();
  });

  useEffect(() => {
    if (!isEnabled) return;
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [isEnabled]);
}
