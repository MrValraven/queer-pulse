export interface PastedBlock {
  kind: "paragraph" | "listItem";
  text: string;
}

const LIST_PREFIX = /^[-*]\s+/;

/**
 * Clipboard plain text as guide blocks: blank lines separate paragraphs,
 * wrapped lines inside a paragraph are joined, and `- `/`* ` lines become list
 * items. `null` means a single line, which the caller inserts at the caret.
 */
export function splitPastedText(raw: string): PastedBlock[] | null {
  const text = raw.replace(/\r\n?/g, "\n").trim();
  if (!text.includes("\n")) return null;
  const blocks: PastedBlock[] = [];
  for (const group of text.split(/\n\s*\n/)) {
    let paragraphLines: string[] = [];
    const flushParagraph = () => {
      if (paragraphLines.length === 0) return;
      blocks.push({ kind: "paragraph", text: paragraphLines.join(" ") });
      paragraphLines = [];
    };
    const lines = group
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    for (const line of lines) {
      if (LIST_PREFIX.test(line)) {
        flushParagraph();
        blocks.push({ kind: "listItem", text: line.replace(LIST_PREFIX, "") });
      } else {
        paragraphLines.push(line);
      }
    }
    flushParagraph();
  }
  return blocks;
}
