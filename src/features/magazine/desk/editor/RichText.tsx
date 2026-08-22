import {
  useLayoutEffect,
  useRef,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { sanitizeArticleHtml } from "./sanitizeArticleHtml";
import { htmlToPlainText } from "./plainText";
import styles from "./RichText.module.css";

export interface RichTextProps {
  /** Seed HTML. Written into the DOM exactly once, on mount — see the
   * caveat below. */
  html: string;
  onChange: (html: string) => void;
  className?: string;
  placeholder: string;
  /** Fired when "/" is typed while the block is empty, so a caller can open
   * the slash menu (Task 6's `SlashMenu`). Not called if omitted. */
  onSlash?: (element: HTMLElement) => void;
  onFocus?: () => void;
  /** Paste handler for callers not already covered by a paste listener on
   * some ancestor element (`ArticleDocument`'s block list has its own,
   * scoped to the blocks it wraps). Without one, the browser's default
   * paste inserts the clipboard's HTML verbatim — wrapper tags, inline
   * styles, classes and all — straight into this contentEditable's DOM,
   * and from there into the `html` this component reports via `onChange`. */
  onPaste?: (event: ClipboardEvent<HTMLDivElement>) => void;
  spellCheck?: boolean;
  /**
   * PLAIN-TEXT mode, for fields stored and rendered as text rather than
   * markup (the headline and standfirst — see `plainText.ts`). The seed is
   * decoded to the characters a reader would see, `onChange` reports
   * `textContent` instead of `innerHTML`, and Enter is swallowed so the
   * browser can never split the field into block children whose text would
   * be concatenated without a boundary. `SelectionToolbar` skips these
   * blocks, so no formatting can be applied that the saved value would
   * silently drop.
   */
  plainText?: boolean;
}

/**
 * An UNCONTROLLED contentEditable block, ported from the design prototype's
 * `Rich` component.
 *
 * CAVEAT (read before touching this component): `html` seeds the element's
 * innerHTML exactly once, in a `useLayoutEffect` with an empty dependency
 * array — React never writes innerHTML again after that, even if the `html`
 * prop changes later. This is deliberate, not an oversight. A contentEditable
 * element owns its own DOM subtree as the browser's caret/selection engine
 * sees it; if React re-renders that subtree from state on every keystroke
 * (the normal "controlled input" pattern), the browser tears down and
 * rebuilds the DOM nodes under the caret, which destroys the caret position
 * and, with a non-collapsed selection, the selection itself. So the parent
 * is the source of truth for the SAVED value (what goes over the wire /
 * into the block-list state), and the live DOM is the source of truth for
 * what's on screen while the user is typing. If a caller needs to force
 * different content into an already-mounted block (e.g. loading a different
 * article, or an undo/restore-version action), remount this component with
 * a changed `key` rather than expecting a new `html` prop to take effect.
 */
export function RichText({
  html,
  onChange,
  className,
  placeholder,
  onSlash,
  onFocus,
  onPaste,
  spellCheck = true,
  plainText = false,
}: RichTextProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    // Seed HTML is stored, potentially attacker-influenced content. Sanitize
    // it to the same allowed-tag set the reader enforces before writing it
    // into this live contentEditable, so a malicious block cannot execute
    // script the moment an editor opens it.
    // Plain-text fields (headline/standfirst) are decoded rather than parsed
    // as markup: the stored value is text by contract, and any markup left in
    // it from before that contract must show as the characters a reader sees.
    if (plainText) element.textContent = htmlToPlainText(html);
    else element.innerHTML = sanitizeArticleHtml(html);
    element.setAttribute("data-empty", String(element.textContent === ""));
    // Intentionally mount-only — see the component-level comment: this
    // effect must NOT re-run when `html` changes after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleInput(event: FormEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    element.setAttribute("data-empty", String(element.textContent === ""));
    onChange(plainText ? (element.textContent ?? "") : element.innerHTML);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    if (event.key === "/" && onSlash && element.textContent === "") {
      event.preventDefault();
      onSlash(element);
      return;
    }
    // A headline is one line: without this the browser inserts a <div>/<br>
    // whose text `textContent` would glue onto the previous line's last word.
    if (event.key === "Enter" && plainText) event.preventDefault();
  }

  const richClassName = className ? `${styles.rich} ${className}` : styles.rich;

  return (
    <div
      ref={elementRef}
      className={richClassName}
      contentEditable
      suppressContentEditableWarning
      // Stable, un-hashed hook so other primitives (SelectionToolbar) can
      // find "the nearest rich-text block" via a plain attribute selector
      // instead of depending on this module's CSS-Modules class name.
      data-rich="true"
      // Read by `SelectionToolbar`: a plain-text field takes no inline
      // formatting, since `textContent` would drop it on the next keystroke.
      data-plain-text={plainText ? "true" : undefined}
      data-ph={placeholder}
      // contentEditable has no implicit ARIA role a screen reader can rely
      // on, so it's made explicit — this is the WAI-ARIA authoring-practice
      // recommendation for contentEditable regions, not just a lint fix.
      // The placeholder doubles as the accessible name since there's no
      // native <label> to associate.
      role="textbox"
      aria-multiline="true"
      aria-label={placeholder}
      // contentEditable is natively focusable in every browser, but the
      // explicit role above needs an explicit tabIndex for static analysis
      // (and any browser oddity) to agree it's tabbable.
      tabIndex={0}
      spellCheck={spellCheck}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      onPaste={onPaste}
    />
  );
}
