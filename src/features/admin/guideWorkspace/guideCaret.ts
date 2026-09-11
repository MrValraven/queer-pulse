import type { MoveDirection } from "./guideDocumentOps";

export type CaretPosition = "start" | "end";

/** DOM id of a block's gutter move button, so focus can follow a moved
 *  block. */
export function guideBlockMoveButtonId(
  blockKey: string,
  direction: MoveDirection,
): string {
  return `guide-block-${blockKey}-move-${direction}`;
}

/** DOM id of a section menu's move button, so focus can follow a moved
 *  section. */
export function guideSectionMoveButtonId(
  sectionKey: string,
  direction: MoveDirection,
): string {
  return `guide-section-${sectionKey}-move-${direction}`;
}

/** The raw text content of an html string, whitespace untouched (a
 *  contentEditable's trailing space arrives as a non-breaking space). */
export function htmlTextContent(html: string): string {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.textContent ?? "";
}

/**
 * Removes everything after the caret inside `element` and returns it as
 * html, for Enter splitting a block in two. A non-collapsed selection is
 * deleted first, as typing Enter over a selection would. Returns "" when the
 * caret is not inside `element`.
 */
export function extractHtmlAfterCaret(element: HTMLElement): string {
  const selection = document.getSelection();
  if (!selection || selection.rangeCount === 0) return "";
  const caretRange = selection.getRangeAt(0);
  if (!element.contains(caretRange.endContainer)) return "";
  if (!caretRange.collapsed) caretRange.deleteContents();
  const trailingRange = document.createRange();
  trailingRange.setStart(caretRange.endContainer, caretRange.endOffset);
  trailingRange.setEnd(element, element.childNodes.length);
  const container = document.createElement("div");
  container.appendChild(trailingRange.extractContents());
  element.setAttribute("data-empty", String(element.textContent === ""));
  return container.innerHTML;
}

/**
 * Focuses the control behind a DOM id: the element itself when focusable,
 * otherwise the first rich text block, input, textarea or button inside it.
 * A rich text block also gets its caret placed at `position`.
 */
export function focusGuideTarget(
  targetId: string,
  position: CaretPosition = "end",
): void {
  const target = document.getElementById(targetId);
  if (!target) return;
  const focusableSelector = '[data-rich="true"], input, textarea, button';
  const editable = target.matches(focusableSelector)
    ? target
    : target.querySelector<HTMLElement>(focusableSelector);
  if (!editable) return;
  editable.focus();
  editable.scrollIntoView({ block: "nearest" });
  if (editable.getAttribute("data-rich") !== "true") return;
  const selection = document.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(editable);
  range.collapse(position === "start");
  selection.removeAllRanges();
  selection.addRange(range);
}
