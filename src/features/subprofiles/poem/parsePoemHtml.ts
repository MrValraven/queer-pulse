import type { PoemLine, PoemMark, PoemSpan } from "./poemModel";

/** Inline marks the poem editor allows, keyed by their DOM tag name. `I`/`B`
 *  map onto the same `em`/`strong` marks as `EM`/`STRONG`: `execCommand`
 *  ("bold"/"italic", used by the Cmd/Ctrl+B/I shortcut) emits `<b>`/`<i>` in
 *  this environment — `PoemSelectionToolbar` already works around this for
 *  its mouse path by renaming tags post-command; here we instead widen the
 *  parser's allowlist so the shortcut's output normalizes at commit time
 *  without a separate DOM rewrite. Rich paste sources (Word, Docs, ...) also
 *  commonly emit `<b>`/`<i>`, so this doubles as a paste-correctness fix. */
const INLINE_MARK_TAGS: Record<string, PoemMark> = {
  EM: "em",
  STRONG: "strong",
  I: "em",
  B: "strong",
};

// Block-level tags whose boundary is a visible line break. Pasted / rich
// verse content represents each line as a `<div>`/`<p>` (or similar); a
// boundary here starts a new `PoemLine`, matching `<br>` and `\n`.
const LINE_BREAKING_TAGS = new Set([
  "DIV",
  "P",
  "LI",
  "BLOCKQUOTE",
  "PRE",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
]);

/**
 * Parses a poem block's rich-text HTML (from the contentEditable editor, or
 * pasted content) into structured `PoemLine[]`. Allowlists inline emphasis
 * (`em`/`strong`) only — every other tag unwraps to plain text. Every
 * `<br>`, block-boundary element (`div`/`p`/`li`/`blockquote`/`pre`/`h1`-`h6`),
 * and literal `\n` starts a new line. Never throws — worst case `[]`.
 *
 * This is the structured successor to `sanitizePoemHtml` (which returns an
 * HTML string); both currently coexist until every caller has moved.
 */
export function parsePoemHtml(html: string): PoemLine[] {
  const lines: PoemLine[] = [];
  let currentLine: PoemSpan[] = [];
  const activeMarks: PoemMark[] = [];

  const pushSpan = (text: string): void => {
    if (text.length === 0) return;
    currentLine.push({ text, marks: [...activeMarks] });
  };

  const forceNewLine = (): void => {
    lines.push(currentLine);
    currentLine = [];
  };

  // Only starts a new line if the current one has content — avoids stray
  // blank lines when adjacent block wrappers sit back to back.
  const boundaryNewLine = (): void => {
    if (currentLine.length > 0) forceNewLine();
  };

  const walk = (node: ChildNode): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      const segments = text.split("\n");
      segments.forEach((segment, index) => {
        pushSpan(segment);
        if (index < segments.length - 1) forceNewLine();
      });
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const element = node as Element;
    const tagName = element.tagName;

    if (tagName === "BR") {
      forceNewLine();
      return;
    }

    const mark = INLINE_MARK_TAGS[tagName];
    if (mark) {
      activeMarks.push(mark);
      Array.from(element.childNodes).forEach(walk);
      activeMarks.pop();
      return;
    }

    if (LINE_BREAKING_TAGS.has(tagName)) {
      boundaryNewLine();
      Array.from(element.childNodes).forEach(walk);
      boundaryNewLine();
      return;
    }

    // Any other element (links, spans, images, …) unwraps: keep its text,
    // drop the tag and every attribute (attributes are never read).
    Array.from(element.childNodes).forEach(walk);
  };

  const template = document.createElement("template");
  template.innerHTML = html;
  Array.from(template.content.childNodes).forEach(walk);

  lines.push(currentLine);
  while (lines.length > 0 && lines[lines.length - 1]?.length === 0) {
    lines.pop();
  }

  return lines;
}
