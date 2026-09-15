// src/features/messages/useInsertEmoji.ts
import { useEffect, useRef, type RefObject } from "react";

/**
 * Splices a picked glyph into the composer's draft at the caret and tracks
 * the caret itself across repeated picks — WITHOUT ever calling `.focus()`
 * on the textarea.
 *
 * The trap this solves: `ComposerInputRow` wires `onFocus={onClosePopover}`
 * on the textarea, so a real WhatsApp-style picker (pick several emoji in a
 * row without the panel closing between them) can never refocus the field
 * after a pick — that would instantly close itself. So this hook writes the
 * next draft through `onChange` alone (the same path a keystroke takes) and
 * keeps the caret position in a ref rather than reading it fresh off the DOM
 * each time, since the textarea won't be focused while the picker is open
 * (the search input is) and `selectionStart` on a blurred field only reflects
 * whatever it was the moment focus left, not this hook's own inserts.
 *
 * Focus returns to the textarea only when `EmojiComposerButton` closes the
 * panel — at that point the caret this hook already placed (via
 * `setSelectionRange`, which works on an unfocused textarea) is exactly
 * where typing should resume.
 */
export function useInsertEmoji(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  draft: string,
  onChange: (nextValue: string) => void,
  isPanelOpen: boolean,
): (glyph: string) => void {
  const caretPositionRef = useRef<number | null>(null);
  const lastKnownCaretRef = useRef<number | null>(null);

  // Tracks the textarea's own caret via a NATIVE DOM listener, not a React
  // prop — this is load-bearing, not decoration. Verified by driving this in
  // a real browser: clicking the trigger button moves DOM focus off the
  // textarea on `mousedown`, before React even runs the button's `onClick`
  // (let alone the open-transition effect below), so by the time anything
  // here could check `document.activeElement`, focus has already left. Every
  // pick landed at the END of the draft regardless of where the caret
  // actually was until this listener was added — `blur` fires synchronously
  // as part of that same native focus handoff, so it's the only reliable
  // place left to catch the real position.
  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    function handleBlur() {
      lastKnownCaretRef.current = node!.selectionStart;
    }
    node.addEventListener("blur", handleBlur);
    return () => node.removeEventListener("blur", handleBlur);
  }, [textareaRef]);

  // Snapshot the caret the moment the panel opens. Prefers a LIVE read off
  // the textarea on the rare chance it's still the focused element, otherwise
  // falls back to the blur-captured position above, and finally to the end
  // of the draft if the textarea was never focused this session at all —
  // matching what every other composer insert path (mentions, shortcuts)
  // already does.
  useEffect(() => {
    if (!isPanelOpen) {
      caretPositionRef.current = null;
      return;
    }
    const node = textareaRef.current;
    const isTextareaFocused = node !== null && document.activeElement === node;
    caretPositionRef.current = isTextareaFocused
      ? (node.selectionStart ?? draft.length)
      : (lastKnownCaretRef.current ?? draft.length);
    // Deliberately snapshots only on the open→true transition, not on every
    // keystroke while the panel stays open — re-running per keystroke would
    // reset the tracked caret away from wherever a prior pick just placed it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPanelOpen, textareaRef]);

  // A plain function, not `useCallback`: this hook is called fresh on every
  // render (never memoized), so `insertEmoji` always closes over the CURRENT
  // render's `draft` — no ref mirror needed for that half, only the caret
  // position genuinely has to survive across renders/picks.
  return function insertEmoji(glyph: string) {
    const position = caretPositionRef.current ?? draft.length;
    const nextDraft = draft.slice(0, position) + glyph + draft.slice(position);
    const nextPosition = position + glyph.length;
    caretPositionRef.current = nextPosition;
    onChange(nextDraft);
    // The value commits on next render, not synchronously — setting the
    // selection has to wait a frame for the textarea to actually carry the
    // new, longer string, or `setSelectionRange` clamps to the old length.
    requestAnimationFrame(() => {
      textareaRef.current?.setSelectionRange(nextPosition, nextPosition);
    });
  };
}
