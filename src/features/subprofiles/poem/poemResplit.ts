import type { PoemBlock, PoemLine } from "../api/subprofiles.api";

/* The legacy "re-split into lines?" hint of the poem editor
   (PoemBodyEditor, PoemResplitHint): spotting a poem whose line breaks were
   flattened, and cutting it back into candidate lines. */

/** A merged-stanza line past this length is treated as a candidate for the
 *  legacy "re-split into lines?" hint. Short single-stanza poems (haiku,
 *  couplets) never trip it. */
const RESPLIT_LENGTH_THRESHOLD = 120;
/** Sentence/clause punctuation the re-split regex below also splits on. Its
 *  presence is what distinguishes "one very long verse line" (leave alone)
 *  from "old data whose line breaks were flattened into prose" (offer to fix). */
const RESPLIT_PUNCTUATION_PATTERN = /[.,;]/;

/** Detects the legacy shape this hint targets: the whole poem is exactly one
 *  stanza with exactly one line, and that line's plain text (marks ignored:
 *  legacy merged data never carries formatting) is long enough with enough
 *  punctuation to plausibly be several flattened verse lines. Returns the
 *  target block id + its plain text, or `null` when the hint doesn't apply. */
export function detectMergedStanzaLine(
  blocks: PoemBlock[],
): { blockId: string; lineText: string } | null {
  if (blocks.length !== 1) return null;
  const [onlyBlock] = blocks;
  if (
    !onlyBlock ||
    onlyBlock.kind !== "stanza" ||
    onlyBlock.lines.length !== 1
  ) {
    return null;
  }
  const [onlyLine] = onlyBlock.lines;
  const lineText = (onlyLine ?? []).map((span) => span.text).join("");
  if (lineText.length <= RESPLIT_LENGTH_THRESHOLD) return null;
  if (!RESPLIT_PUNCTUATION_PATTERN.test(lineText)) return null;
  return { blockId: onlyBlock.id, lineText };
}

/** Splits a flattened line's text into candidate verse lines on sentence/
 *  clause punctuation, discarding any blank segments left by extra
 *  whitespace. Candidate lines are plain (unmarked) spans: a suggestion the
 *  poet reviews and can re-edit. */
export function splitMergedLineIntoLines(lineText: string): PoemLine[] {
  return lineText
    .split(/(?<=[.,;])\s+/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .map((segment) => [{ text: segment, marks: [] }]);
}
