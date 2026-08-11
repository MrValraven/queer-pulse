import type {
  PoemBlock,
  PoemBreakBlock,
  PoemNoteBlock,
  PoemStanzaBlock,
} from "../api/subprofiles.api";

// Globally-unique ids for React keys + reorder. These ids are PERSISTED
// (round-trip through `structured`), so a per-page-load counter would
// collide with previously-saved ids after reload — use crypto.randomUUID()
// (already used elsewhere in this repo, e.g. `LinksSection.tsx`).
const nextPoemBlockId = (): string =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `poem-${Date.now().toString(36)}-${Math.round(Math.random() * 1e9).toString(36)}`;

export const newStanza = (html = ""): PoemStanzaBlock => ({
  kind: "stanza",
  id: nextPoemBlockId(),
  html,
});

export const newBreak = (): PoemBreakBlock => ({
  kind: "break",
  id: nextPoemBlockId(),
});

export const newNote = (html = ""): PoemNoteBlock => ({
  kind: "note",
  id: nextPoemBlockId(),
  html,
});

/** True when the poem has at least one stanza/note with real text (a lone
 *  break, or empty blocks, does not count as content). */
export function poemHasContent(blocks: PoemBlock[] | null | undefined): boolean {
  if (!blocks) return false;
  return blocks.some(
    (block) =>
      block.kind !== "break" && stripToText(block.html).trim().length > 0,
  );
}

/** Seed one stanza from a legacy plain-text `description` (each source line
 *  becomes a `<br>`-joined verse line). Empty input yields a single empty
 *  stanza so the editor always has one block to type into. */
export function poemFromDescription(description: string): PoemBlock[] {
  const lines = description.split("\n").map((line) => escapeHtml(line.trim()));
  const trimmed = [...lines];
  while (trimmed.length > 0 && trimmed[trimmed.length - 1] === "") trimmed.pop();
  return [newStanza(trimmed.join("<br>"))];
}

/** First non-empty verse line as plain text — the row teaser. */
export function poemPlainFirstLine(
  blocks: PoemBlock[] | null | undefined,
): string {
  if (!blocks) return "";
  for (const block of blocks) {
    if (block.kind === "break") continue;
    const firstLine = block.html
      .split(/<br\s*\/?>/i)
      .map((line) => stripToText(line).trim())
      .find((line) => line.length > 0);
    if (firstLine) return firstLine;
  }
  return "";
}

/** Strip all tags to text content (for length/teaser checks only — never for
 *  rendering; rendering goes through `sanitizePoemHtml`). */
function stripToText(html: string): string {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.textContent ?? "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
