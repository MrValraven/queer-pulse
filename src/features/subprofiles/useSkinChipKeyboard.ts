import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import type { SkinChipsList } from "./useSkinChipsList";

/** Focus target that names the add input. */
const ADD_INPUT_TARGET = "add-input";

/** How an in-place edit ended: Enter and Escape hand focus back to the chip,
 *  blur leaves it wherever the owner moved it. */
export type SkinChipEditEnd = "enter" | "escape" | "blur";

/**
 * Focus, typing and editing for `SkinChipsControl`: the add input's draft,
 * which chip is open for editing, and every keyboard rule of the field.
 *
 * Chips are keyed by position (`usePositionalRowKeys`), so focus is tracked by
 * key: a move or a removal re-renders the list, and the chip that should hold
 * focus is found again by key after that render (`focusAfterRender`).
 */
export function useSkinChipKeyboard(list: SkinChipsList) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const chipRefs = useRef(new Map<string, HTMLElement>());
  const pendingFocusRef = useRef<string | null>(null);
  const [draft, setDraft] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  // Read by the edit input's blur, which can fire after Enter already settled
  // the edit in this same event loop.
  const editingKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const target = pendingFocusRef.current;
    if (target === null) return;
    pendingFocusRef.current = null;
    focusTarget(target);
  });

  function focusTarget(target: string) {
    if (target === ADD_INPUT_TARGET) inputRef.current?.focus();
    else chipRefs.current.get(target)?.focus();
  }
  const focusAfterRender = (target: string) => {
    pendingFocusRef.current = target;
  };
  const registerChip = (key: string) => (element: HTMLElement | null) => {
    if (element) chipRefs.current.set(key, element);
    else chipRefs.current.delete(key);
  };

  const submitDraft = () => {
    if (list.addMany([draft])) setDraft("");
  };

  function onChipKeyDown(index: number, event: KeyboardEvent<HTMLElement>) {
    const { keys } = list;
    const key = keys[index]!;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      // Always claimed, so Alt+ArrowLeft never becomes the browser's Back.
      event.preventDefault();
      const step = event.key === "ArrowLeft" ? -1 : 1;
      if (event.altKey) {
        if (!keys[index + step]) return;
        list.swap(index, index + step);
        return focusAfterRender(key);
      }
      const neighbour = keys[index + step];
      if (neighbour) focusTarget(neighbour);
      else if (step > 0) focusTarget(ADD_INPUT_TARGET);
      return;
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      const nextTarget = keys[index + 1] ?? ADD_INPUT_TARGET;
      list.removeAt(index);
      return focusAfterRender(nextTarget);
    }
    if (event.key === "F2") {
      event.preventDefault();
      startEditing(key);
    }
  }

  function startEditing(key: string) {
    editingKeyRef.current = key;
    setEditingKey(key);
  }

  function finishEditing(index: number, text: string, how: SkinChipEditEnd) {
    const key = list.keys[index];
    if (!key || editingKeyRef.current !== key) return;
    editingKeyRef.current = null;
    setEditingKey(null);
    if (how === "escape") return focusAfterRender(key);
    const isEmptied = text.trim().length === 0;
    const nextTarget = isEmptied
      ? (list.keys[index + 1] ?? ADD_INPUT_TARGET)
      : key;
    list.replaceAt(index, text);
    if (how === "enter") focusAfterRender(nextTarget);
  }

  function onAddInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    const lastKey = list.keys[list.keys.length - 1];
    const input = event.currentTarget;
    const isCaretAtStart =
      input.selectionStart === 0 && input.selectionEnd === 0;
    if (event.key === "Enter") {
      event.preventDefault();
      submitDraft();
    } else if (
      lastKey &&
      ((event.key === "Backspace" && draft === "") ||
        (event.key === "ArrowLeft" && isCaretAtStart))
    ) {
      event.preventDefault();
      focusTarget(lastKey);
    }
  }

  /** A paste holding line breaks becomes one chip per non-blank line, with
   *  whatever was already typed joined in at the caret. */
  function onAddInputPaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text");
    if (!/[\r\n]/.test(pasted)) return;
    event.preventDefault();
    const input = event.currentTarget;
    const start = input.selectionStart ?? draft.length;
    const end = input.selectionEnd ?? draft.length;
    const combined = draft.slice(0, start) + pasted + draft.slice(end);
    list.addMany(combined.split(/\r\n|\r|\n/));
    setDraft("");
  }

  function onAddInputChange(event: ChangeEvent<HTMLInputElement>) {
    setDraft(event.target.value);
    if (list.notice) list.clearNotice();
  }

  return {
    inputRef,
    draft,
    editingKey,
    registerChip,
    startEditing,
    finishEditing,
    onChipKeyDown,
    addInputHandlers: {
      onKeyDown: onAddInputKeyDown,
      onPaste: onAddInputPaste,
      onChange: onAddInputChange,
      onBlur: submitDraft,
    },
  };
}
