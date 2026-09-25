/**
 * The text model of a `paragraphs` control: the stored `string[]` shown as one
 * markdown-lite text with a blank line between paragraphs, and that text cut
 * back into paragraphs on every edit.
 *
 * A paragraph keeps its single line breaks, so a markdown list (`- a\n- b`)
 * or a quote stays one paragraph. Blank chunks are dropped, so the stored
 * array only ever holds paragraphs with words in them.
 */

/** A blank line: a newline, optional spaces or tabs, and another newline. */
const BLANK_LINE = /\r?\n[ \t]*\r?\n/;
const EDGE_NEWLINES = /^[\r\n]+|[\r\n]+$/g;

/** Cut the field's text into paragraphs on blank lines. */
export function splitParagraphs(text: string): string[] {
  return text
    .split(BLANK_LINE)
    .map((chunk) => chunk.replace(EDGE_NEWLINES, ""))
    .filter((chunk) => chunk.trim() !== "");
}

/** The stored value as the field's text, one blank line between paragraphs.
 *  Anything other than an array of strings reads as an empty field. */
export function joinParagraphs(stored: unknown): string {
  if (!Array.isArray(stored)) return "";
  return stored
    .filter(
      (entry): entry is string =>
        typeof entry === "string" && entry.trim() !== "",
    )
    .join("\n\n");
}

/** Whether two paragraph lists hold the same paragraphs in the same order. */
export function haveSameParagraphs(first: string[], second: string[]) {
  return (
    first.length === second.length &&
    first.every((paragraph, index) => paragraph === second[index])
  );
}
