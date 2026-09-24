import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import {
  isSelectionEmphasised,
  smallestReplacement,
  toggleEmphasis,
  type EmphasisEdit,
  type TextSelectionRange,
} from "./quoteEmphasis";

/** A selection read from the textarea, with the value it was read against,
 *  so an outside change (a reset, "Discard all") retires it on its own. */
interface ReadSelection extends TextSelectionRange {
  value: string;
}

/**
 * Applies a toggle as one native edit of the smallest changed slice, so it
 * lands on the browser's undo stack (Cmd/Ctrl+Z takes it back). The edit
 * fires `input`, and the textarea's own onChange saves the new value. Then
 * the changed words are selected. Returns false where the browser refuses
 * `insertText`, and the caller writes through React state instead.
 */
function applyAsNativeEdit(
  textarea: HTMLTextAreaElement,
  before: string,
  edit: EmphasisEdit,
): boolean {
  const replacement = smallestReplacement(before, edit.value);
  textarea.setSelectionRange(replacement.start, replacement.end);
  // execCommand is deprecated, yet it is still the only way to edit a
  // textarea that the browser's undo history records.
  const isApplied = document.execCommand("insertText", false, replacement.text);
  // A browser that edited the text some other way falls back too: the state
  // write that follows puts the intended value in place.
  if (!isApplied || textarea.value !== edit.value) return false;
  textarea.setSelectionRange(edit.selection.start, edit.selection.end);
  return true;
}

export interface QuoteEmphasis {
  /** A non-empty selection is live: the Emphasise action is enabled. */
  isActionEnabled: boolean;
  /** The selection sits inside `*...*`: the action lifts the emphasis. */
  isEmphasised: boolean;
  /** Wraps or unwraps the textarea's selection and puts focus back. */
  toggle: () => void;
  /** Spread on the textarea. */
  textareaHandlers: {
    onSelect: () => void;
    onKeyUp: () => void;
    onMouseUp: () => void;
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
    onBlur: (event: FocusEvent<HTMLElement>) => void;
  };
  /** On the action button: focus leaving both the textarea and the action
   *  retires the selection, so the action rests disabled again. */
  onActionBlur: (event: FocusEvent<HTMLElement>) => void;
}

/**
 * The quote's Emphasise action: tracks the textarea's selection (select,
 * keyup, mouseup and `selectionchange` while this textarea has focus),
 * toggles `*...*` around it through `onChange`, and restores the selection
 * on the changed text once the new value has rendered. Cmd/Ctrl+I in the
 * textarea does the same as the button. The button sits in the label row,
 * before the textarea in tab order, so focus moving between the two
 * (Shift+Tab from the textarea) keeps the selection live.
 */
export function useQuoteEmphasis({
  textareaRef,
  actionRef,
  value,
  onChange,
}: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  actionRef: RefObject<HTMLButtonElement | null>;
  value: string;
  onChange: (next: string) => void;
}): QuoteEmphasis {
  const [selection, setSelection] = useState<ReadSelection | null>(null);
  const pendingSelectionRef = useRef<ReadSelection | null>(null);

  const readSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd } = textarea;
    setSelection(
      selectionStart === selectionEnd
        ? null
        : { start: selectionStart, end: selectionEnd, value: textarea.value },
    );
  }, [textareaRef]);

  useEffect(() => {
    const onSelectionChange = () => {
      if (document.activeElement === textareaRef.current) readSelection();
    };
    document.addEventListener("selectionchange", onSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", onSelectionChange);
  }, [readSelection, textareaRef]);

  // When a toggle goes through React state (the fallback path), React writes
  // the new value and the caret jumps to the end; put the selection back on
  // the changed words. It applies only to the value it was armed for, so a
  // later keystroke can never pick it up.
  useLayoutEffect(() => {
    const pending = pendingSelectionRef.current;
    const textarea = textareaRef.current;
    if (!pending || !textarea) return;
    pendingSelectionRef.current = null;
    if (pending.value !== value) return;
    textarea.setSelectionRange(pending.start, pending.end);
  }, [textareaRef, value]);

  const toggle = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const before = textarea.value;
    const edit = toggleEmphasis(before, {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    });
    textarea.focus();
    if (!edit) return;
    const target: ReadSelection = { ...edit.selection, value: edit.value };
    // Read ahead against the new value, so the action stays put (no flicker)
    // until the browser reports the restored selection.
    setSelection(target);
    if (applyAsNativeEdit(textarea, before, edit)) return;
    pendingSelectionRef.current = target;
    onChange(edit.value);
  }, [onChange, textareaRef]);

  const liveSelection =
    selection && selection.value === value ? selection : null;

  const onFocusLeave = (event: FocusEvent<HTMLElement>) => {
    const nextFocus = event.relatedTarget;
    const isStayingInQuote =
      nextFocus !== null &&
      (nextFocus === textareaRef.current || nextFocus === actionRef.current);
    if (!isStayingInQuote) setSelection(null);
  };

  return {
    isActionEnabled: liveSelection !== null,
    isEmphasised:
      liveSelection !== null && isSelectionEmphasised(value, liveSelection),
    toggle,
    textareaHandlers: {
      onSelect: readSelection,
      onKeyUp: readSelection,
      onMouseUp: readSelection,
      onKeyDown: (event) => {
        // `code` catches the I key on layouts where it types another letter.
        const isShortcut =
          (event.metaKey || event.ctrlKey) &&
          !event.altKey &&
          !event.shiftKey &&
          (event.key.toLowerCase() === "i" || event.code === "KeyI");
        if (!isShortcut || event.nativeEvent.isComposing) return;
        event.preventDefault();
        toggle();
      },
      onBlur: onFocusLeave,
    },
    onActionBlur: onFocusLeave,
  };
}
