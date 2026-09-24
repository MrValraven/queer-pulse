const BLOCK_TAGS = new Set([
  "P",
  "DIV",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "TR",
  "LI",
  "TABLE",
  "UL",
  "OL",
  "BLOCKQUOTE",
  "HR",
]);
const SKIPPED_TAGS = new Set(["STYLE", "SCRIPT", "TITLE", "HEAD"]);

/**
 * The `text/plain` half of a copied email, and the fallback when a browser
 * cannot put HTML on the clipboard. Links keep their address after the label,
 * so a plain-text paste still carries the invite link.
 */
export function htmlToPlainText(html: string): string {
  const document = new DOMParser().parseFromString(html, "text/html");
  const parts: string[] = [];
  collectText(document.body, parts);
  return parts
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function collectText(node: Node, parts: string[]): void {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      parts.push((child.textContent ?? "").replace(/\s+/g, " "));
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const element = child as Element;
    const tag = element.tagName;
    if (SKIPPED_TAGS.has(tag)) continue;
    if (tag === "BR") {
      parts.push("\n");
      continue;
    }
    if (tag === "IMG") {
      parts.push(element.getAttribute("alt") ?? "");
      continue;
    }
    collectText(element, parts);
    if (tag === "A") {
      const href = element.getAttribute("href");
      const label = (element.textContent ?? "").trim();
      if (href && href !== label && !href.startsWith("mailto:")) {
        parts.push(` (${href})`);
      }
    }
    if (BLOCK_TAGS.has(tag)) parts.push("\n\n");
  }
}
