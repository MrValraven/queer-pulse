import { parsePoemHtml } from "./parsePoemHtml";

// ── Types (single source of truth — re-exported from `subprofiles.api.ts`) ──

export type PoemMark = "em" | "strong";

export interface PoemSpan {
  text: string;
  marks: PoemMark[];
}

/** One line of verse: an ordered run of marked text spans. */
export type PoemLine = PoemSpan[];

/** A run of verse lines. */
export interface PoemStanzaBlock {
  kind: "stanza";
  id: string;
  lines: PoemLine[];
}

/** A stanza/section divider (rendered as an asterism). No text of its own. */
export interface PoemBreakBlock {
  kind: "break";
  id: string;
}

/** An epigraph / dedication, set in italic and slightly recessed. */
export interface PoemNoteBlock {
  kind: "note";
  id: string;
  lines: PoemLine[];
}

/** One block of a poem body (poet `poems` section). Stored in the item's
 *  `structured` jsonb blob — no dedicated columns, no migration; round-trips
 *  untouched via `itemToView`/`itemsToInputDto` like `structured.snippet`. */
export type PoemBlock = PoemStanzaBlock | PoemBreakBlock | PoemNoteBlock;

// ── Fallback id (mirrors `nextPoemBlockId` in poemBlocks.ts) ────────────────
// Ids are PERSISTED (round-trip through `structured`), so a per-load counter
// would collide with previously-saved ids after reload — crypto.randomUUID().
function randomPoemBlockId(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `poem-${Date.now().toString(36)}-${Math.round(Math.random() * 1e9).toString(36)}`;
}

function normalizeSpan(rawSpan: unknown): PoemSpan | null {
  if (typeof rawSpan !== "object" || rawSpan === null) return null;
  const record = rawSpan as Record<string, unknown>;
  if (typeof record.text !== "string") return null;
  const marks = Array.isArray(record.marks)
    ? record.marks.filter((mark): mark is PoemMark => mark === "em" || mark === "strong")
    : [];
  return { text: record.text, marks };
}

function normalizeLine(rawLine: unknown): PoemLine {
  if (!Array.isArray(rawLine)) return [];
  const line: PoemLine = [];
  for (const rawSpan of rawLine) {
    const span = normalizeSpan(rawSpan);
    if (span) line.push(span);
  }
  return line;
}

function normalizeLines(rawLines: unknown[]): PoemLine[] {
  return rawLines.map((rawLine) => normalizeLine(rawLine));
}

function normalizeOneBlock(entry: unknown): PoemBlock | null {
  if (typeof entry !== "object" || entry === null) return null;
  const record = entry as Record<string, unknown>;
  const kind = record.kind;
  const id = typeof record.id === "string" && record.id.length > 0
    ? record.id
    : randomPoemBlockId();

  if (kind === "break") {
    return { kind: "break", id };
  }
  if (kind === "stanza" || kind === "note") {
    if (Array.isArray(record.lines)) {
      return { kind, id, lines: normalizeLines(record.lines) };
    }
    if (typeof record.html === "string") {
      return { kind, id, lines: parsePoemHtml(record.html) };
    }
  }
  return null;
}

/** Accepts legacy `{kind,id,html}` OR new `{kind,id,lines}` poem blocks (or
 *  any other junk from an untyped jsonb blob) and always returns the new
 *  `lines`-shaped form. Entries with no usable shape are dropped. */
export function normalizePoemBlocks(raw: unknown): PoemBlock[] {
  if (!Array.isArray(raw)) return [];
  const blocks: PoemBlock[] = [];
  for (const entry of raw) {
    const block = normalizeOneBlock(entry);
    if (block) blocks.push(block);
  }
  return blocks;
}

/** True when every span's text is blank (or the line has no spans). */
export function poemLineIsEmpty(line: PoemLine): boolean {
  return line.every((span) => span.text.trim() === "");
}

/** URL-safe slug for a poem title — used to deep-link a poem via `?poem=`
 *  (poem items have no stable id/slug on `SubprofileItemView`, so the title
 *  is the only stable-enough key). Lowercases, strips diacritics, collapses
 *  everything else to `-` (mirrors the repo's other ad-hoc `slugify` helpers,
 *  e.g. `listBusiness.data.ts`). */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Plain-text rendering of a poem — lines joined by `\n` within a block,
 *  blocks joined by a blank line, breaks rendered as `* * *`. Used for the
 *  reader's "copy poem" affordance. */
export function poemToPlainText(blocks: PoemBlock[]): string {
  return blocks
    .map((block) => {
      if (block.kind === "break") return "* * *";
      return block.lines
        .map((line) => line.map((span) => span.text).join(""))
        .join("\n");
    })
    .join("\n\n");
}
