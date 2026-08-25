import type {
  PoemBlock,
  PoemBreakBlock,
  PoemLine,
  PoemNoteBlock,
  PoemStanzaBlock,
  PoemVersion,
} from "../api/subprofiles.api";
import { normalizePoemBlocks, poemLineIsEmpty } from "./poemModel";

// Globally-unique ids for React keys + reorder. These ids are PERSISTED
// (round-trip through `structured`), so a per-page-load counter would
// collide with previously-saved ids after reload — use crypto.randomUUID()
// (already used elsewhere in this repo, e.g. `LinksSection.tsx`).
const nextPoemBlockId = (): string =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `poem-${Date.now().toString(36)}-${Math.round(Math.random() * 1e9).toString(36)}`;

export const newStanza = (lines: PoemLine[] = []): PoemStanzaBlock => ({
  kind: "stanza",
  id: nextPoemBlockId(),
  lines,
});

export const newBreak = (): PoemBreakBlock => ({
  kind: "break",
  id: nextPoemBlockId(),
});

export const newNote = (lines: PoemLine[] = []): PoemNoteBlock => ({
  kind: "note",
  id: nextPoemBlockId(),
  lines,
});

/** A fresh poem translation/version — empty label + empty body by default (the
 *  poet names it and writes into it). Ids are PERSISTED (round-trip through
 *  `structured.poemVersions`), so `crypto.randomUUID()` for the same reason as
 *  block ids above. */
export const newPoemVersion = (
  label = "",
  blocks: PoemBlock[] = [],
): PoemVersion => ({
  id: nextPoemBlockId(),
  label,
  blocks,
});

/** True when the poem has at least one stanza/note with a non-empty line (a
 *  lone break, or blocks with only blank lines, does not count as content).
 *  `raw` is normalized first — this tolerates legacy `{html}` blocks and any
 *  other malformed jsonb shape (unmigrated `structured.poem` data), not just
 *  already-normalized `PoemBlock[]`. */
export function poemHasContent(raw: unknown): boolean {
  const blocks = normalizePoemBlocks(raw);
  return blocks.some(
    (block) =>
      block.kind !== "break" &&
      block.lines.some((line) => !poemLineIsEmpty(line)),
  );
}

/** Seed one stanza from a legacy plain-text `description` (each source line
 *  becomes a verse line of plain, unmarked text). Empty input yields a
 *  single empty stanza so the editor always has one block to type into. */
export function poemFromDescription(description: string): PoemBlock[] {
  const rawLines = description.split("\n").map((line) => line.trim());
  while (rawLines.length > 0 && rawLines[rawLines.length - 1] === "") {
    rawLines.pop();
  }
  const lines: PoemLine[] = rawLines.map((line) => [{ text: line, marks: [] }]);
  return [newStanza(lines)];
}

/** First non-empty verse line as plain text — the row teaser. `raw` is
 *  normalized first (same rationale as `poemHasContent`): the row teaser is
 *  fed the item's raw `structured.poem` jsonb, which may still be legacy
 *  `{html}`-shaped or otherwise malformed since there is no migration. */
export function poemPlainFirstLine(raw: unknown): string {
  const blocks = normalizePoemBlocks(raw);
  for (const block of blocks) {
    if (block.kind === "break") continue;
    for (const line of block.lines) {
      if (poemLineIsEmpty(line)) continue;
      const text = line
        .map((span) => span.text)
        .join("")
        .trim();
      if (text.length > 0) return text;
    }
  }
  return "";
}
