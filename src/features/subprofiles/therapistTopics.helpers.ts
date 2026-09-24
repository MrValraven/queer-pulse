import type { SpecialtyTone } from "./skins/therapist/therapistView";

// ── Pure line model for TherapistTopicsControl ─────────────────────────────
//
// A topic is one `specialisms` item: `title` is its heading and `description`
// holds its lines, joined with "\n". The page splits the description on line
// breaks and drops blank lines, so the editor may keep a blank line while the
// owner is still writing it.

/** Backend caps on one section item (replace-items.dto.ts). */
export const TOPIC_HEADING_MAX_LENGTH = 200;
export const TOPIC_DESCRIPTION_MAX_LENGTH = 5000;

/** The page's bullet tones, cycling per topic (`SPECIALTY_TONES` in
 *  therapistView.helpers.ts). */
const TOPIC_TONES: readonly SpecialtyTone[] = ["accent", "jade", "violet"];

export function topicTone(topicIndex: number): SpecialtyTone {
  return TOPIC_TONES[topicIndex % TOPIC_TONES.length] ?? "accent";
}

const LINE_BREAK = /\r?\n/;

/** A bullet or number a pasted list line starts with ("- ", "2. ", or a
 *  typographic bullet from a document). */
const LIST_MARKER =
  /^(?:[-*+\u2022\u2023\u2043\u2219\u25e6\u00b7]|\d{1,3}[.)])\s+/;

/** The lines the editor shows. Never empty: a topic without a description
 *  shows one blank line, ready to type in. */
export function descriptionToLines(description: string): string[] {
  return description.split(LINE_BREAK);
}

export function linesToDescription(lines: readonly string[]): string {
  return lines.join("\n").slice(0, TOPIC_DESCRIPTION_MAX_LENGTH);
}

/** The longest line `lineIndex` may grow to before the whole description
 *  reaches the backend's cap. */
export function lineMaxLength(
  lines: readonly string[],
  lineIndex: number,
): number {
  const ownLength = lines[lineIndex]?.length ?? 0;
  const othersLength = lines.join("\n").length - ownLength;
  return Math.max(ownLength, TOPIC_DESCRIPTION_MAX_LENGTH - othersLength);
}

/** Pasted text as clean lines: each trimmed, a leading list marker dropped,
 *  blank lines left out. */
export function splitPastedLines(text: string): string[] {
  return text
    .split(LINE_BREAK)
    .map((line) => line.trim().replace(LIST_MARKER, "").trim())
    .filter((line) => line !== "");
}

export function hasLineBreak(text: string): boolean {
  return LINE_BREAK.test(text);
}

/** How the stable line keys follow an edit: new lines inserted at `index`,
 *  or the line at `index` dropped. */
export type LineKeyChange =
  | { kind: "insert"; index: number; count: number }
  | { kind: "remove"; index: number };

/** A line edit: the topic's new lines and where the caret lands. */
export interface LineEdit {
  lines: string[];
  focusIndex: number;
  caret: number;
  keyChange: LineKeyChange | null;
}

/** Enter: the text after the caret moves onto a new line below, so Enter at
 *  the end of a line opens an empty one. */
export function splitLineAt(
  lines: readonly string[],
  lineIndex: number,
  selectionStart: number,
  selectionEnd: number,
): LineEdit {
  const line = lines[lineIndex] ?? "";
  const next = [...lines];
  next.splice(
    lineIndex,
    1,
    line.slice(0, selectionStart),
    line.slice(selectionEnd),
  );
  return {
    lines: next,
    focusIndex: lineIndex + 1,
    caret: 0,
    keyChange: { kind: "insert", index: lineIndex + 1, count: 1 },
  };
}

/** Drop one line. The last one left is cleared instead, so the topic keeps
 *  a line to type in. */
export function removeLineAt(
  lines: readonly string[],
  lineIndex: number,
): LineEdit {
  if (lines.length <= 1) {
    return { lines: [""], focusIndex: 0, caret: 0, keyChange: null };
  }
  const next = lines.filter((_, index) => index !== lineIndex);
  const focusIndex = Math.min(lineIndex, next.length - 1);
  return {
    lines: next,
    focusIndex,
    caret: next[focusIndex]?.length ?? 0,
    keyChange: { kind: "remove", index: lineIndex },
  };
}

/** Backspace at the start of a line: it joins the end of the line above,
 *  the caret at the seam. */
export function mergeWithPrevious(
  lines: readonly string[],
  lineIndex: number,
): LineEdit {
  const previous = lines[lineIndex - 1] ?? "";
  const next = lines.filter((_, index) => index !== lineIndex);
  next[lineIndex - 1] = previous + (lines[lineIndex] ?? "");
  return {
    lines: next,
    focusIndex: lineIndex - 1,
    caret: previous.length,
    keyChange: { kind: "remove", index: lineIndex },
  };
}

/** Pasted pieces as whole lines of their own at `insertIndex`, the caret at
 *  the end of the last one. `pieces` is never empty. */
function insertPastedLines(
  lines: readonly string[],
  insertIndex: number,
  pieces: readonly string[],
): LineEdit {
  const next = [...lines];
  next.splice(insertIndex, 0, ...pieces);
  const lastIndex = insertIndex + pieces.length - 1;
  return {
    lines: next,
    focusIndex: lastIndex,
    caret: next[lastIndex]?.length ?? 0,
    keyChange: { kind: "insert", index: insertIndex, count: pieces.length },
  };
}

/** Multi-line text pasted into a line at the caret. With the caret at the end
 *  of a written line the pieces become new lines after it, and at its start
 *  new lines before it. Anywhere else the first piece joins the text before
 *  the caret, the last one the text after it, and the pieces in between
 *  become lines of their own. */
export function pasteIntoLine(
  lines: readonly string[],
  lineIndex: number,
  selectionStart: number,
  selectionEnd: number,
  pieces: readonly string[],
): LineEdit {
  const line = lines[lineIndex] ?? "";
  const isCaret = selectionStart === selectionEnd;
  if (pieces.length > 0 && isCaret && line !== "") {
    if (selectionStart === line.length) {
      return insertPastedLines(lines, lineIndex + 1, pieces);
    }
    if (selectionStart === 0) {
      return insertPastedLines(lines, lineIndex, pieces);
    }
  }
  const before = line.slice(0, selectionStart);
  const after = line.slice(selectionEnd);
  const pasted = pieces.length > 0 ? [...pieces] : [""];
  pasted[0] = before + pasted[0];
  const lastIndex = pasted.length - 1;
  const caret = pasted[lastIndex]!.length;
  pasted[lastIndex] = pasted[lastIndex] + after;
  const next = [...lines];
  next.splice(lineIndex, 1, ...pasted);
  return {
    lines: next,
    focusIndex: lineIndex + lastIndex,
    caret,
    keyChange:
      lastIndex > 0
        ? { kind: "insert", index: lineIndex + 1, count: lastIndex }
        : null,
  };
}

/** Multi-line text pasted into a heading: the lines after its first go
 *  under the heading, in place of a lone blank line or above the lines
 *  already there. `pieces` is never empty. */
export function pasteUnderHeading(
  lines: readonly string[],
  pieces: readonly string[],
): LineEdit {
  const isBlank = lines.length === 1 && lines[0] === "";
  const lastIndex = pieces.length - 1;
  return {
    lines: isBlank ? [...pieces] : [...pieces, ...lines],
    focusIndex: lastIndex,
    caret: pieces[lastIndex]?.length ?? 0,
    keyChange: isBlank
      ? lastIndex > 0
        ? { kind: "insert", index: 1, count: lastIndex }
        : null
      : { kind: "insert", index: 0, count: pieces.length },
  };
}

/** "Add a line": a blank line at the end, caret in it. */
export function appendLine(lines: readonly string[]): LineEdit {
  return {
    lines: [...lines, ""],
    focusIndex: lines.length,
    caret: 0,
    keyChange: { kind: "insert", index: lines.length, count: 1 },
  };
}
