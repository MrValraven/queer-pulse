import {
  parseMarkdownLite,
  type MarkdownBlock,
  type MarkdownSpan,
} from "./markdownLiteParser";

/** The words of one inline run as a reader sees them: a link keeps its label,
 *  and bold or italic text keeps its words without the asterisks. */
function spanRunText(spans: MarkdownSpan[]): string {
  return spans.map((span) => span.text).join("");
}

/** One block as plain lines. A list gives one line per item, without its
 *  bullet or number. */
function blockLines(block: MarkdownBlock): string[] {
  if (block.type === "list") return block.items.map(spanRunText);
  return [spanRunText(block.spans)];
}

/**
 * A markdown-lite body as the plain words {@link MarkdownLite} would show,
 * for every short preview of a body: a thread heading, a snippet card, a
 * feed card's quote.
 *
 * It reads the body through the same {@link parseMarkdownLite} the renderer
 * uses, so it strips exactly the marks the renderer turns into formatting:
 * bold and italic asterisks, a heading's `**`, list bullets and numbers, a
 * quote's `> `, and a link's `[text](url)` down to `text`. Anything the
 * renderer leaves as written (a lone `*`, an `@name`, a `c/slug`) stays as
 * written here too.
 *
 * Each block, and each list item, ends up on its own line, joined with `\n`.
 * Blank lines between blocks are dropped, as the renderer drops them.
 */
export function markdownLitePlainText(text: string): string {
  return parseMarkdownLite(text.replace(/\r\n/g, "\n"))
    .flatMap(blockLines)
    .join("\n");
}
