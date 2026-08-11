import {
  useLayoutEffect,
  useRef,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { sanitizePoemHtml } from "./sanitizePoemHtml";
import styles from "./PoemRichLine.module.css";

export interface PoemRichLineProps {
  /** Seed HTML — written to the DOM once on mount only (see caret caveat in
   *  magazine `RichText.tsx`). Remount with a changed `key` to force new
   *  content into an already-mounted line. */
  html: string;
  onChange: (html: string) => void;
  placeholder: string;
  className?: string;
}

/**
 * An UNCONTROLLED contentEditable verse line/stanza. `html` seeds innerHTML
 * exactly once on mount; the live DOM owns the caret thereafter, the parent
 * owns the saved value. `Enter` inserts a `<br>` (a verse line break) instead
 * of the browser's default block split. Poem-scoped sibling of the magazine
 * `RichText`; kept separate so the magazine feature is untouched.
 */
export function PoemRichLine({
  html,
  onChange,
  placeholder,
  className,
}: PoemRichLineProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    element.innerHTML = sanitizePoemHtml(html);
    element.setAttribute("data-empty", String(element.textContent === ""));
    // Mount-only by design — must NOT re-run when `html` changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleInput(event: FormEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    element.setAttribute("data-empty", String(element.textContent === ""));
    onChange(element.innerHTML);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter") {
      // A verse line break, not a new block. execCommand keeps the caret
      // correct across browsers; the input event below re-reads innerHTML.
      event.preventDefault();
      document.execCommand("insertLineBreak");
      event.currentTarget.dispatchEvent(new Event("input", { bubbles: true }));
    }
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
      aria-label={placeholder}
      tabIndex={0}
      spellCheck
      onInput={handleInput}
      onKeyDown={handleKeyDown}
    />
  );
}
