/* ===========================================================
   Word-level text diff.

   The listing editor's "review unsaved changes" modal shows a before/after
   diff for every field a draft touched. Diffing whole fields character by
   character reads as noise (every edit rewrites half the surrounding words
   through re-encoding), and diffing whole fields as a single replaced block
   loses the part that stayed the same. This sits between the two: it tokenises
   on word boundaries and reports which words moved, so a one-word edit in a
   long paragraph highlights that one word.
   =========================================================== */

export type DiffSegmentKind = "same" | "added" | "removed";

export interface DiffSegment {
  kind: DiffSegmentKind;
  text: string;
}

/**
 * Upper bound on `beforeTokens.length * afterTokens.length` (after trimming
 * the common prefix and suffix) before `wordDiff` gives up on the full LCS
 * table and falls back to reporting the whole remaining middle as one
 * replacement. The DP table is one cell per pair, so this also bounds the
 * memory `wordDiff` allocates.
 */
export const WORD_DIFF_MAX_CELLS = 250_000;

/**
 * Splits text into alternating word and whitespace runs, preserving every
 * character (including newlines) across the two kinds of run. Concatenating
 * every returned token reproduces `text` exactly, which is what lets
 * `wordDiff` reconstruct `before` and `after` from its output segments.
 */
function tokenize(text: string): string[] {
  return text.split(/(\s+)/).filter((token) => token.length > 0);
}

function isWhitespaceOnlyToken(token: string): boolean {
  return /^\s+$/.test(token);
}

/**
 * Whether two tokens should anchor the diff. Whitespace-only tokens are
 * excluded even when they are textually identical: a single matching space
 * sitting between two otherwise-changed words would split what a reader
 * experiences as one replacement into a "removed, same space, added" flicker.
 * Keeping it out of the match set lets that space fall into the surrounding
 * removed and added runs instead, on both sides, which keeps the
 * reconstruction invariant intact (each side still carries its own copy of
 * the token).
 */
function isMatchingTokenPair(beforeToken: string, afterToken: string): boolean {
  return beforeToken === afterToken && !isWhitespaceOnlyToken(beforeToken);
}

function commonPrefixLength(
  beforeTokens: readonly string[],
  afterTokens: readonly string[],
): number {
  const maxLength = Math.min(beforeTokens.length, afterTokens.length);
  let length = 0;
  while (length < maxLength && beforeTokens[length] === afterTokens[length]) {
    length += 1;
  }
  return length;
}

function commonSuffixLength(
  beforeTokens: readonly string[],
  afterTokens: readonly string[],
  prefixLength: number,
): number {
  const maxLength =
    Math.min(beforeTokens.length, afterTokens.length) - prefixLength;
  let length = 0;
  while (
    length < maxLength &&
    beforeTokens[beforeTokens.length - 1 - length] ===
      afterTokens[afterTokens.length - 1 - length]
  ) {
    length += 1;
  }
  return length;
}

/**
 * Appends `text` as a segment of `kind`, merging into the previous segment
 * when it is the same kind and dropping the call entirely when `text` is
 * empty. Every push in this module goes through here, which is what
 * guarantees the output never holds an empty-text segment or two adjacent
 * segments of the same kind.
 */
function pushSegment(
  segments: DiffSegment[],
  kind: DiffSegmentKind,
  text: string,
): void {
  if (text === "") {
    return;
  }
  const lastSegment = segments[segments.length - 1];
  if (lastSegment && lastSegment.kind === kind) {
    lastSegment.text += text;
    return;
  }
  segments.push({ kind, text });
}

function pushSame(segments: DiffSegment[], text: string): void {
  pushSegment(segments, "same", text);
}

function pushRemoved(segments: DiffSegment[], text: string): void {
  pushSegment(segments, "removed", text);
}

function pushAdded(segments: DiffSegment[], text: string): void {
  pushSegment(segments, "added", text);
}

/**
 * Reads a table cell by its flat index. Every index this module computes
 * falls inside `[0, table.length)` by construction: row and column bounds
 * are derived from the same `beforeTokens.length` / `afterTokens.length`
 * used to size the table, so the cell is never actually absent. The `!`
 * only silences `noUncheckedIndexedAccess`, which can't see that invariant
 * from the call site.
 */
function readCell(table: Uint32Array, index: number): number {
  return table[index]!;
}

/**
 * Reads a token by index. Every call site in this module has already
 * established the index is within `tokens.length`, either as a loop bound
 * (`backtrackMatches`'s `while` guard) or as an index `backtrackMatches`
 * itself recorded from that same within-bounds walk (`diffMiddle`). The `!`
 * only silences `noUncheckedIndexedAccess`.
 */
function tokenAt(tokens: readonly string[], index: number): string {
  return tokens[index]!;
}

/**
 * Classic LCS table over token arrays, flattened into a typed array
 * (`beforeTokens.length + 1` rows of `afterTokens.length + 1` cells) to keep
 * memory to one 32-bit integer per cell rather than an array of arrays.
 */
function buildLcsTable(
  beforeTokens: readonly string[],
  afterTokens: readonly string[],
): Uint32Array {
  const rowWidth = afterTokens.length + 1;
  const table = new Uint32Array((beforeTokens.length + 1) * rowWidth);

  for (const [beforeOffset, beforeToken] of beforeTokens.entries()) {
    const beforeIndex = beforeOffset + 1;
    const currentRow = beforeIndex * rowWidth;
    const previousRow = (beforeIndex - 1) * rowWidth;
    for (const [afterOffset, afterToken] of afterTokens.entries()) {
      const afterIndex = afterOffset + 1;
      if (isMatchingTokenPair(beforeToken, afterToken)) {
        table[currentRow + afterIndex] =
          readCell(table, previousRow + afterIndex - 1) + 1;
      } else {
        table[currentRow + afterIndex] = Math.max(
          readCell(table, previousRow + afterIndex),
          readCell(table, currentRow + afterIndex - 1),
        );
      }
    }
  }

  return table;
}

interface TokenMatch {
  beforeIndex: number;
  afterIndex: number;
}

/** Walks the LCS table back from its final cell into the list of matched token pairs, in reading order. */
function backtrackMatches(
  table: Uint32Array,
  beforeTokens: readonly string[],
  afterTokens: readonly string[],
): TokenMatch[] {
  const rowWidth = afterTokens.length + 1;
  const matches: TokenMatch[] = [];
  let beforeIndex = beforeTokens.length;
  let afterIndex = afterTokens.length;

  while (beforeIndex > 0 && afterIndex > 0) {
    // The while guard above keeps beforeIndex/afterIndex in [1, length], so
    // index - 1 is always a valid position in the corresponding token array.
    const beforeToken = tokenAt(beforeTokens, beforeIndex - 1);
    const afterToken = tokenAt(afterTokens, afterIndex - 1);
    if (isMatchingTokenPair(beforeToken, afterToken)) {
      matches.push({
        beforeIndex: beforeIndex - 1,
        afterIndex: afterIndex - 1,
      });
      beforeIndex -= 1;
      afterIndex -= 1;
    } else if (
      readCell(table, (beforeIndex - 1) * rowWidth + afterIndex) >=
      readCell(table, beforeIndex * rowWidth + (afterIndex - 1))
    ) {
      beforeIndex -= 1;
    } else {
      afterIndex -= 1;
    }
  }

  matches.reverse();
  return matches;
}

/**
 * Diffs the two middle token arrays (everything left after the common prefix
 * and suffix are trimmed) and appends the result to `segments`. Between each
 * pair of matched tokens, unmatched `beforeTokens` are emitted as one
 * "removed" run before unmatched `afterTokens` are emitted as one "added"
 * run, which is both the natural order for an LCS gap and the order a reader
 * expects: what left, then what replaced it.
 */
function diffMiddle(
  segments: DiffSegment[],
  beforeTokens: readonly string[],
  afterTokens: readonly string[],
): void {
  if (beforeTokens.length === 0 && afterTokens.length === 0) {
    return;
  }
  if (beforeTokens.length === 0) {
    pushAdded(segments, afterTokens.join(""));
    return;
  }
  if (afterTokens.length === 0) {
    pushRemoved(segments, beforeTokens.join(""));
    return;
  }

  const table = buildLcsTable(beforeTokens, afterTokens);
  const matches = backtrackMatches(table, beforeTokens, afterTokens);

  let beforeCursor = 0;
  let afterCursor = 0;
  for (const match of matches) {
    pushRemoved(
      segments,
      beforeTokens.slice(beforeCursor, match.beforeIndex).join(""),
    );
    pushAdded(
      segments,
      afterTokens.slice(afterCursor, match.afterIndex).join(""),
    );
    // match.beforeIndex was recorded by backtrackMatches from a within-bounds walk over this same array.
    pushSame(segments, tokenAt(beforeTokens, match.beforeIndex));
    beforeCursor = match.beforeIndex + 1;
    afterCursor = match.afterIndex + 1;
  }
  pushRemoved(segments, beforeTokens.slice(beforeCursor).join(""));
  pushAdded(segments, afterTokens.slice(afterCursor).join(""));
}

/**
 * Word-level diff turning `before` into `after`.
 *
 * The result reconstructs both inputs: concatenating every "same" and
 * "removed" segment's text, in order, reproduces `before` exactly, and doing
 * the same for "same" and "added" reproduces `after` exactly. Callers that
 * only need one side (the modal renders both) can rely on that rather than
 * re-deriving it.
 */
export function wordDiff(before: string, after: string): DiffSegment[] {
  if (before === after) {
    return before === "" ? [] : [{ kind: "same", text: before }];
  }
  if (before === "") {
    return [{ kind: "added", text: after }];
  }
  if (after === "") {
    return [{ kind: "removed", text: before }];
  }

  const beforeTokens = tokenize(before);
  const afterTokens = tokenize(after);

  const prefixLength = commonPrefixLength(beforeTokens, afterTokens);
  const suffixLength = commonSuffixLength(
    beforeTokens,
    afterTokens,
    prefixLength,
  );

  const beforeMiddle = beforeTokens.slice(
    prefixLength,
    beforeTokens.length - suffixLength,
  );
  const afterMiddle = afterTokens.slice(
    prefixLength,
    afterTokens.length - suffixLength,
  );

  const segments: DiffSegment[] = [];
  pushSame(segments, beforeTokens.slice(0, prefixLength).join(""));

  if (beforeMiddle.length * afterMiddle.length > WORD_DIFF_MAX_CELLS) {
    pushRemoved(segments, beforeMiddle.join(""));
    pushAdded(segments, afterMiddle.join(""));
  } else {
    diffMiddle(segments, beforeMiddle, afterMiddle);
  }

  pushSame(
    segments,
    beforeTokens.slice(beforeTokens.length - suffixLength).join(""),
  );

  return segments;
}
