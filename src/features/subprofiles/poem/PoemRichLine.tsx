import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type ClipboardEvent,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { PoemLine } from "./poemModel";
import { parsePoemHtml } from "./parsePoemHtml";
import { serializePoemLines } from "./serializePoemLines";
import styles from "./PoemRichLine.module.css";

/** How long to wait after the last keystroke before parsing the DOM back
 *  into the model — keeps the `input` handler light while still committing
 *  during a long typing session (not just on blur). */
const COMMIT_IDLE_DELAY_MS = 600;

/** Imperative handle exposed to `PoemBodyEditor` so it can move focus onto a
 *  just-added block (add bar / double-Enter split) or back onto the previous
 *  block after a backspace-merge — none of which the uncontrolled DOM here
 *  can express through props alone. */
export interface PoemRichLineHandle {
  /** Focuses the editable surface and places the caret at its end. */
  focus(): void;
  /**
   * Overwrite the field's DOM with `lines`.
   *
   * The seed effect below is mount-only, so a parent that rewrites a block's
   * lines in the MODEL (the legacy re-split hint) leaves this contentEditable
   * showing the old text; the next blur then re-parses that stale DOM and
   * reverts the change. Call this alongside the model update so both sides
   * agree. Only for a wholesale, non-keystroke rewrite: it replaces the
   * content outright and drops the caret.
   */
  setLines(lines: PoemLine[]): void;
}

export interface PoemRichLineProps {
  /** Seed lines — serialized to HTML and written to the DOM once on mount
   *  only (see caret caveat in magazine `RichText.tsx`). Remount with a
   *  changed `key` to force new content into an already-mounted line. */
  lines: PoemLine[];
  onChange: (lines: PoemLine[]) => void;
  placeholder: string;
  className?: string;
  /** Screen-reader name for this field, distinct from the visual
   *  `placeholder` (e.g. "Stanza 2 of 4"). Falls back to `placeholder`. */
  ariaLabel?: string;
  /** Enter pressed on an empty trailing line: the parent should insert a new
   *  stanza block after this one and focus it, instead of a line break. */
  onSplitBlock?: () => void;
  /** Backspace at the start of an already-empty block: the parent should
   *  remove this block and focus the end of the previous one. */
  onMergeBack?: () => void;
}

/** True when nothing follows the caret anywhere in `element` — i.e. the
 *  caret sits at the very end of the field's content. Both structural-key
 *  checks below need this: a "trailing" empty line only counts as trailing
 *  when there's nothing after it. */
function isCaretAtEnd(element: HTMLElement, range: Range): boolean {
  const afterCaret = document.createRange();
  afterCaret.setStart(range.endContainer, range.endOffset);
  afterCaret.setEnd(element, element.childNodes.length);
  return afterCaret.toString().length === 0;
}

/** True when the caret is on an empty trailing line: nothing after the caret
 *  in the whole field, and nothing but whitespace between the caret and the
 *  start of its line (the position right after the last `<br>`, or the start
 *  of the field if there is none). Conservative by construction — a line
 *  with real text before the caret never matches, so a normal Enter mid-line
 *  always falls through to `insertLineBreak`. */
function isCaretAtEmptyTrailingLine(element: HTMLElement): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
    return false;
  }
  const range = selection.getRangeAt(0);
  if (!element.contains(range.startContainer)) return false;
  if (!isCaretAtEnd(element, range)) return false;

  const lastBreak = element.querySelector("br:last-of-type");
  const lineStart = document.createRange();
  if (lastBreak && lastBreak.parentNode) {
    const indexInParent = Array.from(lastBreak.parentNode.childNodes).indexOf(
      lastBreak,
    );
    lineStart.setStart(lastBreak.parentNode, indexInParent + 1);
  } else {
    lineStart.setStart(element, 0);
  }
  lineStart.setEnd(range.startContainer, range.startOffset);
  return lineStart.toString().trim().length === 0;
}

/** True when the whole block is empty (no visible text anywhere) — the
 *  precondition for a Backspace-at-start merge-back. */
function isBlockEmpty(element: HTMLElement): boolean {
  return (element.textContent ?? "").trim().length === 0;
}

/** Places the caret at the absolute end of `element`'s content. */
function collapseCaretToEnd(element: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * An UNCONTROLLED contentEditable verse line/stanza. `lines` seeds the DOM
 * (via `serializePoemLines`) exactly once on mount; the live DOM owns the
 * caret thereafter, the parent owns the saved value. Commits happen on
 * `blur` and on a debounced typing idle — each re-parses the DOM
 * (`parsePoemHtml`) back into `PoemLine[]`. A single `Enter` inserts a
 * `<br>` (a verse line break); `Enter` on an already-empty trailing line
 * instead asks the parent to start a new block (`onSplitBlock`); `Backspace`
 * at the start of an empty block asks the parent to merge back into the
 * previous one (`onMergeBack`). Cmd/Ctrl+B/I toggle bold/italic; paste is
 * normalized through the same `parsePoemHtml`/`serializePoemLines` bridge so
 * multi-line pasted poems keep their line breaks. Poem-scoped sibling of the
 * magazine `RichText`; kept separate so the magazine feature is untouched.
 */
export const PoemRichLine = forwardRef<PoemRichLineHandle, PoemRichLineProps>(
  function PoemRichLine(
    {
      lines,
      onChange,
      placeholder,
      className,
      ariaLabel,
      onSplitBlock,
      onMergeBack,
    },
    forwardedRef,
  ) {
    const elementRef = useRef<HTMLDivElement | null>(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useImperativeHandle(
      forwardedRef,
      () => ({
        focus() {
          const element = elementRef.current;
          if (!element) return;
          element.focus();
          collapseCaretToEnd(element);
        },
        setLines(next: PoemLine[]) {
          const element = elementRef.current;
          if (!element) return;
          // Drop any pending debounce first, or it would fire afterwards and
          // commit a parse of the DOM we are about to replace.
          if (idleTimeoutRef.current) {
            clearTimeout(idleTimeoutRef.current);
            idleTimeoutRef.current = null;
          }
          element.innerHTML = serializePoemLines(next);
          element.setAttribute("data-empty", String(element.textContent === ""));
        },
      }),
      [],
    );

    useLayoutEffect(() => {
      const element = elementRef.current;
      if (!element) return;
      element.innerHTML = serializePoemLines(lines);
      element.setAttribute("data-empty", String(element.textContent === ""));
      // Mount-only by design — must NOT re-run when `lines` changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      // Capture the node now, while the ref is populated. React 19 detaches
      // object refs (`elementRef.current = null`) during the mutation phase,
      // which runs BEFORE this passive effect's cleanup on unmount — so
      // re-reading `elementRef.current` inside the cleanup below would
      // already be `null`. Closing over `element` here (stable for the
      // component's life; the ref is set once on mount) is what makes the
      // flush actually reach the DOM.
      const element = elementRef.current;
      return () => {
        // Flush, don't discard: if the debounce timer is still pending when
        // this line unmounts for a reason other than blur (breakpoint
        // crossing mid-typing, drawer closing, ...), the last keystrokes
        // haven't been committed yet. Guarding on a pending timer means the
        // blur path (which already cleared the timer and committed) never
        // double-commits.
        if (idleTimeoutRef.current) {
          clearTimeout(idleTimeoutRef.current);
          idleTimeoutRef.current = null;
          if (element) onChangeRef.current(parsePoemHtml(element.innerHTML));
        }
      };
       
    }, []);

    function commit() {
      const element = elementRef.current;
      if (!element) return;
      onChangeRef.current(parsePoemHtml(element.innerHTML));
    }

    function handleInput(event: FormEvent<HTMLDivElement>) {
      const element = event.currentTarget;
      element.setAttribute("data-empty", String(element.textContent === ""));
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = setTimeout(commit, COMMIT_IDLE_DELAY_MS);
    }

    function handleBlur(_event: FocusEvent<HTMLDivElement>) {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }
      commit();
    }

    function dispatchInput(element: HTMLDivElement) {
      element.dispatchEvent(new Event("input", { bubbles: true }));
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
      const element = event.currentTarget;
      const key = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && key === "b") {
        event.preventDefault();
        document.execCommand("bold");
        dispatchInput(element);
        return;
      }
      if ((event.metaKey || event.ctrlKey) && key === "i") {
        event.preventDefault();
        document.execCommand("italic");
        dispatchInput(element);
        return;
      }

      if (event.key === "Enter") {
        if (onSplitBlock && isCaretAtEmptyTrailingLine(element)) {
          event.preventDefault();
          onSplitBlock();
          return;
        }
        // A verse line break, not a new block. execCommand keeps the caret
        // correct across browsers; the input event below re-reads innerHTML.
        event.preventDefault();
        document.execCommand("insertLineBreak");
        dispatchInput(element);
        return;
      }

      if (
        event.key === "Backspace" &&
        onMergeBack &&
        isBlockEmpty(element) &&
        window.getSelection()?.isCollapsed
      ) {
        event.preventDefault();
        onMergeBack();
      }
    }

    function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
      event.preventDefault();
      const clipboardHtml = event.clipboardData.getData("text/html");
      const clipboardText = event.clipboardData.getData("text/plain");
      // `parsePoemHtml` expects markup, not arbitrary untrusted text — a
      // plain-text fallback containing `<`/`>`/`&` would otherwise be
      // misread as tags when written into a template's `innerHTML`. Escape
      // it first so `\n` still splits into lines (parsePoemHtml treats a
      // literal newline in a text node as a line break) without risking
      // stray markup.
      const sourceHtml = clipboardHtml
        ? clipboardHtml
        : clipboardText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
      const normalizedHtml = serializePoemLines(parsePoemHtml(sourceHtml));
      document.execCommand("insertHTML", false, normalizedHtml);
      dispatchInput(event.currentTarget);
    }

    const lineClassName = className ? `${styles.line} ${className}` : styles.line;

    return (
      <div
        ref={elementRef}
        className={lineClassName}
        contentEditable
        suppressContentEditableWarning
        data-rich="true"
        data-ph={placeholder}
        role="textbox"
        aria-multiline="true"
        aria-label={ariaLabel ?? placeholder}
        tabIndex={0}
        spellCheck
        onInput={handleInput}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
      />
    );
  },
);
