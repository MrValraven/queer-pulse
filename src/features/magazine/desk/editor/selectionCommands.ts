/**
 * The DOM commands behind the floating `SelectionToolbar`, kept out of the
 * component so the component itself stays about focus, position and keyboard
 * behaviour.
 *
 * NOTE: `document.execCommand` is a deprecated web-platform API, but for an
 * arbitrary contentEditable selection it's still the only way to toggle
 * inline formatting without shipping a full rich-text engine. This is a
 * deliberate, scoped port of the design prototype's approach — swapping it
 * for something like ProseMirror/Lexical is a future upgrade.
 */

/** Walks up to the `RichText` surface (`data-rich="true"`) that owns `node`. */
export function findRichAncestor(node: Node | null): HTMLElement | null {
  let current: HTMLElement | null =
    node instanceof HTMLElement ? node : (node?.parentElement ?? null);
  while (current && current.getAttribute("data-rich") !== "true") {
    current = current.parentElement;
  }
  return current;
}

/**
 * Renames every `<oldTagName>` inside `root` to `<newTagName>`, preserving
 * children and attributes. `document.execCommand('italic'/'bold')` inserts
 * `<i>`/`<b>`, but the article's typed HTML is meant to carry semantic
 * `<em>`/`<strong>` (readers, exports, and any future rich-text migration all
 * assume that), so every command normalizes its output immediately.
 */
function replaceTag(root: HTMLElement, oldTagName: string, newTagName: string) {
  root.querySelectorAll(oldTagName).forEach((element) => {
    const replacement = document.createElement(newTagName);
    replacement.innerHTML = element.innerHTML;
    Array.from(element.attributes).forEach((attribute) => {
      replacement.setAttribute(attribute.name, attribute.value);
    });
    element.replaceWith(replacement);
  });
}

/** Re-dispatches a native `input` event on the block the selection sits in, so
 * `RichText`'s `onChange` (which only listens for `input`) re-reads the
 * mutated innerHTML. */
function notifyBlockChanged(): void {
  const selection = document.getSelection();
  findRichAncestor(selection?.anchorNode ?? null)?.dispatchEvent(
    new Event("input", { bubbles: true }),
  );
}

/**
 * Puts `range` back as the document selection and focuses the block that owns
 * it. Required on the KEYBOARD path (FE-CNT-09): reaching a toolbar button
 * with Tab moves focus off the contentEditable, and `execCommand` acts on the
 * focused editable's selection. The pointer path also benefits, since a
 * restored clone is immune to a stray selection change between hover and
 * click.
 */
export function restoreSelection(range: Range | null): void {
  if (!range) return;
  findRichAncestor(range.commonAncestorContainer)?.focus();
  const selection = document.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
}

/** Toggles emphasis on `range`, normalising `<i>` to `<em>`. */
export function applyEmphasisTo(range: Range | null): void {
  restoreSelection(range);
  document.execCommand("italic");
  const richElement = findRichAncestor(
    document.getSelection()?.anchorNode ?? null,
  );
  if (richElement) replaceTag(richElement, "i", "em");
  notifyBlockChanged();
}

/** Toggles strong on `range`, normalising `<b>` to `<strong>`. */
export function applyStrongTo(range: Range | null): void {
  restoreSelection(range);
  document.execCommand("bold");
  const richElement = findRichAncestor(
    document.getSelection()?.anchorNode ?? null,
  );
  if (richElement) replaceTag(richElement, "b", "strong");
  notifyBlockChanged();
}

/** Wraps `range` in a link to `href`. */
export function applyLinkTo(range: Range | null, href: string): void {
  restoreSelection(range);
  document.execCommand("createLink", false, href);
  notifyBlockChanged();
}
