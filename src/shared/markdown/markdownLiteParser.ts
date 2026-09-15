/**
 * Markdown-lite: the one parser behind BOTH the forum composer's preview tab
 * and the published post. Two renderers would mean the preview can lie about
 * what gets published, which is the whole reason this lives in `shared/`
 * instead of inside the composer.
 *
 * It deliberately implements the design prototype's grammar and nothing more
 * (`qp-forum-compose-v3.js`, the `md(src)` block):
 *
 *   **bold**              → a strong span
 *   *italic*              → an emphasis span (never matched inside `**`)
 *   a line of just **X**  → a heading block
 *   `- ` / `* ` lines     → an unordered list, consecutive lines grouped
 *   `1. ` lines           → an ordered list, consecutive lines grouped
 *   `> ` lines            → a quote block
 *   [text](https://…)     → a link
 *   a bare https://…      → a link whose text is the URL
 *   blank lines           → block separators, dropped
 *
 * The output is an AST, never an HTML string: nothing in this codebase uses
 * `dangerouslySetInnerHTML`, and a parser that hands back markup is one
 * refactor away from needing it. `MarkdownLite.tsx` turns the AST into
 * elements, so mentions and links stay real React nodes.
 *
 * FILE NAME: `markdownLiteParser.ts`, not `markdownLite.ts`. macOS and Windows
 * resolve module paths case-insensitively, so a `markdownLite.ts` sitting
 * beside `MarkdownLite.tsx` makes `import "./MarkdownLite"` ambiguous and TS
 * refuses the program outright (TS1149/TS1261). The `-Parser` suffix is what
 * keeps the pair addressable on every platform.
 *
 * Nesting is out of scope on purpose — the grammar above has none, and the
 * span union is flat. `*italic with **bold** inside*` therefore renders as one
 * emphasis run carrying its literal asterisks, exactly as the flat union
 * implies; no member-facing affordance produces that shape.
 */

/** An inline run inside one block. `link` is the only kind that carries a URL,
 *  and only ever an `http:`/`https:` one — see {@link isSafeHref}. */
export type MarkdownSpan =
  | { type: "text" | "strong" | "emphasis"; text: string }
  | { type: "link"; text: string; href: string };

/** One rendered block. `list` is the only shape that nests, and only one level
 *  deep: a list of items, each item a span run. */
export type MarkdownBlock =
  | { type: "paragraph"; spans: MarkdownSpan[] }
  | { type: "heading"; spans: MarkdownSpan[] }
  | { type: "quote"; spans: MarkdownSpan[] }
  | { type: "list"; ordered: boolean; items: MarkdownSpan[][] };

/** The one block the parser holds open across lines, so consecutive items land
 *  in the same list. */
type ListBlock = Extract<MarkdownBlock, { type: "list" }>;

/** `- item` / `* item`. The trailing `\s+` is what keeps `*italic*` at the
 *  start of a line from being read as a bullet. */
const UNORDERED_ITEM = /^\s*[-*]\s+/;
/** `1. item`, any run of digits. */
const ORDERED_ITEM = /^\s*\d+\.\s*/;
/** `> quoted`, with the space after the marker optional. */
const QUOTE_LINE = /^>\s?/;
/** A line that is nothing but `**…**` is a heading. `[^*]+` is what stops a
 *  paragraph containing two bold runs from being promoted to one. */
const HEADING_LINE = /^\*\*[^*]+\*\*$/;

const STRONG_RUN = /^\*\*(.+?)\*\*/;
const EMPHASIS_RUN = /^\*(?!\*)(.+?)\*(?!\*)/;
const MARKDOWN_LINK = /^\[(.+?)\]\((https?:\/\/[^\s)]+)\)/;
const BARE_URL = /^https?:\/\/[^\s<]+/;

/** True for the only two schemes this renderer will ever emit as an `<a href>`.
 *  Everything else (`javascript:`, `data:`, a relative path) is a string the
 *  member typed, and it renders as the text it is. */
export function isSafeHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/** Split one line into inline spans. Left-to-right and single-pass, so a
 *  marker is consumed once and cannot be re-read inside what it already
 *  claimed — the property the prototype got from replacing `**` before `*`. */
export function parseSpans(line: string): MarkdownSpan[] {
  const spans: MarkdownSpan[] = [];
  let pending = "";
  const flushPending = () => {
    if (pending.length > 0) spans.push({ type: "text", text: pending });
    pending = "";
  };
  let index = 0;
  while (index < line.length) {
    const rest = line.slice(index);
    const span = matchInlineSpan(rest, line[index - 1] ?? "");
    if (span) {
      flushPending();
      spans.push(span.span);
      index += span.length;
      continue;
    }
    pending += rest[0];
    index += 1;
  }
  flushPending();
  return spans;
}

/** The inline marker (if any) starting at the head of `rest`. `previousChar`
 *  is the character immediately before it, which is what the italic and
 *  bare-URL rules need to refuse a match mid-word. */
function matchInlineSpan(
  rest: string,
  previousChar: string,
): { span: MarkdownSpan; length: number } | null {
  const strong = STRONG_RUN.exec(rest);
  if (strong) {
    return {
      span: { type: "strong", text: strong[1] ?? "" },
      length: strong[0].length,
    };
  }
  if (previousChar !== "*") {
    const emphasis = EMPHASIS_RUN.exec(rest);
    if (emphasis) {
      return {
        span: { type: "emphasis", text: emphasis[1] ?? "" },
        length: emphasis[0].length,
      };
    }
  }
  const link = MARKDOWN_LINK.exec(rest);
  if (link) {
    return {
      span: { type: "link", text: link[1] ?? "", href: link[2] ?? "" },
      length: link[0].length,
    };
  }
  // A bare URL only counts at a word boundary, so `see-https://x` stays text.
  if (previousChar === "" || /\s/.test(previousChar)) {
    const bare = BARE_URL.exec(rest);
    if (bare) {
      const url = bare[0];
      return {
        span: { type: "link", text: url, href: url },
        length: url.length,
      };
    }
  }
  return null;
}

/** The block a single non-list line becomes. Ordering matters: quote before
 *  heading before paragraph, matching the prototype's if-chain. */
function blockForLine(line: string): MarkdownBlock {
  if (QUOTE_LINE.test(line)) {
    return { type: "quote", spans: parseSpans(line.replace(QUOTE_LINE, "")) };
  }
  const trimmed = line.trim();
  if (HEADING_LINE.test(trimmed)) {
    return { type: "heading", spans: parseSpans(trimmed.slice(2, -2)) };
  }
  return { type: "paragraph", spans: parseSpans(line) };
}

/**
 * Parse a raw body into blocks.
 *
 * Consecutive list lines of the same kind are grouped into ONE list block, and
 * any other line (a blank one included) closes the open list — which is what
 * makes a bullet run render as a single `<ul>` rather than a stack of
 * one-item lists.
 */
export function parseMarkdownLite(body: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let openList: ListBlock | null = null;
  for (const line of body.split("\n")) {
    // Unordered is tested first, as in the prototype: the two patterns are
    // disjoint, and the order is what keeps them that way if either grows.
    const marker = UNORDERED_ITEM.test(line)
      ? UNORDERED_ITEM
      : ORDERED_ITEM.test(line)
        ? ORDERED_ITEM
        : null;
    if (marker) {
      const ordered = marker === ORDERED_ITEM;
      if (!openList || openList.ordered !== ordered) {
        openList = { type: "list", ordered, items: [] };
        blocks.push(openList);
      }
      openList.items.push(parseSpans(line.replace(marker, "")));
      continue;
    }
    // Anything else closes the run, a blank line included.
    openList = null;
    // Blank lines separate blocks and carry nothing of their own.
    if (line.trim().length === 0) continue;
    blocks.push(blockForLine(line));
  }
  return blocks;
}

/**
 * The body with its markers stripped and whitespace collapsed — the composer's
 * readiness checklist ("enough context to answer") counts words on this, and
 * the forum list's excerpt is cut from it. Kept byte-for-byte equivalent to the
 * prototype's `plain()` so a checklist that says "ready" here says "ready"
 * there.
 *
 * Note it strips `**` and `__` but NOT a single `*`: an asterisk that is not
 * part of a bold run is usually a real one someone typed.
 */
export function toPlainText(body: string): string {
  return body
    .replace(/\*\*|__|^>\s?|^\s*[-*]\s+|^\s*\d+\.\s*/gm, "")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
