// The guide body format (contract 8.2): plain text where a blank line ends a
// block, a `- ` line is a list item and `[label](/path)` is a link inside
// QueerPulse. Nothing else is markup, and the text is never read as HTML.

export type GuideInline =
  | { kind: "text"; text: string }
  | { kind: "link"; label: string; path: string };

export type GuideBlock =
  | { kind: "paragraph"; inlines: GuideInline[] }
  | { kind: "list"; items: GuideInline[][] };

const LIST_ITEM_PATTERN = /^\s*-\s+(.+)$/;
// The path takes one leading slash: `//host` would leave QueerPulse.
const LINK_PATTERN = /\[([^\]\n]{1,120})\]\((\/(?!\/)[^\s()]*)\)/g;

/** Appends text to the inlines, merged into a text inline that ends them. */
function pushText(inlines: GuideInline[], text: string): void {
  if (text === "") return;
  const lastInline = inlines[inlines.length - 1];
  if (lastInline?.kind === "text") lastInline.text += text;
  else inlines.push({ kind: "text", text });
}

/** One line's inlines: each in-app link, and the literal text around it. */
function inlinesOfLine(line: string): GuideInline[] {
  const inlines: GuideInline[] = [];
  let textStart = 0;
  for (const match of line.matchAll(LINK_PATTERN)) {
    const matchStart = match.index;
    pushText(inlines, line.slice(textStart, matchStart));
    inlines.push({ kind: "link", label: match[1] ?? "", path: match[2] ?? "" });
    textStart = matchStart + match[0].length;
  }
  pushText(inlines, line.slice(textStart));
  return inlines;
}

/** A paragraph's lines joined with a single space. */
function inlinesOfParagraph(lines: string[]): GuideInline[] {
  const inlines: GuideInline[] = [];
  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) pushText(inlines, " ");
    inlinesOfLine(line).forEach((inline) =>
      inline.kind === "text"
        ? pushText(inlines, inline.text)
        : inlines.push(inline),
    );
  });
  return inlines;
}

/** Splits a guide section body into paragraphs and lists. */
export function parseGuideBody(text: string): GuideBlock[] {
  const blocks: GuideBlock[] = [];
  let paragraphLines: string[] = [];
  let listItems: GuideInline[][] = [];

  const flush = () => {
    if (paragraphLines.length > 0)
      blocks.push({
        kind: "paragraph",
        inlines: inlinesOfParagraph(paragraphLines),
      });
    if (listItems.length > 0) blocks.push({ kind: "list", items: listItems });
    paragraphLines = [];
    listItems = [];
  };

  for (const rawLine of text.split("\n")) {
    const sourceLine = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
    const line = sourceLine.trim();
    if (line === "") {
      flush();
      continue;
    }
    const itemMatch = LIST_ITEM_PATTERN.exec(sourceLine);
    if (itemMatch !== null) {
      if (paragraphLines.length > 0) flush();
      listItems.push(inlinesOfLine((itemMatch[1] ?? "").trim()));
      continue;
    }
    if (listItems.length > 0) flush();
    paragraphLines.push(line);
  }
  flush();
  return blocks;
}
