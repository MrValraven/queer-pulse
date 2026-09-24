/**
 * The `*word*` emphasis of the therapist hero quote, as plain string logic
 * for the refined quote field (`?fields=refined`). The pattern is the one
 * `renderEmphasis` (skins/therapist/renderEmphasis.tsx) uses on the public
 * page, so the field and the page agree on what reads as emphasis.
 */
const EMPHASIS_PATTERN = /\*([^*]+)\*/g;

/** A soft length guide: past this many visible characters the field says a
 *  shorter quote lands better. It never blocks input. */
export const QUOTE_LENGTH_GUIDE = 160;

export interface TextSelectionRange {
  start: number;
  end: number;
}

/** One `*...*` span: `open` and `close` index its two asterisks. */
export interface EmphasisSpan {
  open: number;
  close: number;
}

/** A piece of the quote in reading order: plain text, or the words between
 *  a pair of asterisks. */
export interface QuoteSegment {
  text: string;
  isEmphasis: boolean;
}

export interface EmphasisEdit {
  value: string;
  selection: TextSelectionRange;
}

/** Every emphasis span, left to right, matched the way the page matches. */
export function findEmphasisSpans(value: string): EmphasisSpan[] {
  const spans: EmphasisSpan[] = [];
  for (const match of value.matchAll(EMPHASIS_PATTERN)) {
    const open = match.index;
    spans.push({ open, close: open + match[0].length - 1 });
  }
  return spans;
}

/** The quote split into plain and emphasised segments (the asterisks are
 *  left out of `text`; the caller draws them). */
export function splitQuoteSegments(value: string): QuoteSegment[] {
  // split() with one capture group alternates plain text and the captured
  // emphasis, exactly as renderEmphasis reads it.
  return value
    .split(/\*([^*]+)\*/)
    .map((text, index) => ({ text, isEmphasis: index % 2 === 1 }))
    .filter((segment) => segment.isEmphasis || segment.text !== "");
}

/** The length a reader sees on the page: the paired asterisks drop out. */
export function visibleQuoteLength(value: string): number {
  return value.trim().length - findEmphasisSpans(value.trim()).length * 2;
}

/** The span holding the whole selection (its asterisks included), if any. */
function spanAroundSelection(
  spans: EmphasisSpan[],
  selection: TextSelectionRange,
): EmphasisSpan | undefined {
  return spans.find(
    (span) => selection.start >= span.open && selection.end <= span.close + 1,
  );
}

/** Whether the selection sits inside an emphasised span. */
export function isSelectionEmphasised(
  value: string,
  selection: TextSelectionRange,
): boolean {
  return spanAroundSelection(findEmphasisSpans(value), selection) !== undefined;
}

/** The selection with the spaces at either end left out. */
function trimSelection(
  value: string,
  selection: TextSelectionRange,
): TextSelectionRange {
  let start = selection.start;
  let end = selection.end;
  while (start < end && /\s/.test(value.charAt(start))) start += 1;
  while (end > start && /\s/.test(value.charAt(end - 1))) end -= 1;
  return { start, end };
}

/** Whether `value` reads `*...*` exactly from `open` to `close`. */
function hasSpan(value: string, open: number, close: number): boolean {
  return findEmphasisSpans(value).some(
    (span) => span.open === open && span.close === close,
  );
}

/** Removes the asterisks of `span`; the freed words come back selected. */
function unwrapSpan(value: string, span: EmphasisSpan): EmphasisEdit {
  const inner = value.slice(span.open + 1, span.close);
  return {
    value: value.slice(0, span.open) + inner + value.slice(span.close + 1),
    selection: { start: span.open, end: span.open + inner.length },
  };
}

/**
 * Emphasise the selection, or lift the emphasis when the selection already
 * sits inside `*...*` (spaces at either end of the selection aside). A
 * selection that reaches into a span grows to cover it, so the result is
 * always one clean pair. A collapsed caret inside a span lifts that span.
 * Anything that would leave the text unchanged, or that the page would not
 * read as the intended pair (a stray asterisk earlier in the text claiming
 * the new one), returns `null`: nothing happens.
 */
export function toggleEmphasis(
  value: string,
  selection: TextSelectionRange,
): EmphasisEdit | null {
  const spans = findEmphasisSpans(value);
  const enclosing = spanAroundSelection(spans, selection);
  if (enclosing) return unwrapSpan(value, enclosing);
  if (selection.start === selection.end) return null;

  const trimmed = trimSelection(value, selection);
  if (trimmed.start === trimmed.end) return null;
  const enclosingTrimmed = spanAroundSelection(spans, trimmed);
  if (enclosingTrimmed) return unwrapSpan(value, enclosingTrimmed);

  let start = trimmed.start;
  let end = trimmed.end;
  for (const span of spans) {
    if (span.open < end && span.close + 1 > start) {
      start = Math.min(start, span.open);
      end = Math.max(end, span.close + 1);
    }
  }
  const exactSpan = spans.find(
    (span) => span.open === start && span.close + 1 === end,
  );
  if (exactSpan) return unwrapSpan(value, exactSpan);

  const inner = value.slice(start, end).replace(/\*/g, "");
  if (inner.trim() === "") return null;
  const next = `${value.slice(0, start)}*${inner}*${value.slice(end)}`;
  if (next === value || !hasSpan(next, start, start + inner.length + 1)) {
    return null;
  }
  return {
    value: next,
    selection: { start: start + 1, end: start + 1 + inner.length },
  };
}

/**
 * The smallest single replacement that turns `before` into `after`: the
 * range `start..end` of `before` gives way to `text`. Lets the textarea
 * apply a toggle as one native edit, which keeps it on the undo stack.
 */
export function smallestReplacement(
  before: string,
  after: string,
): { start: number; end: number; text: string } {
  const shorterLength = Math.min(before.length, after.length);
  let prefixLength = 0;
  while (
    prefixLength < shorterLength &&
    before.charAt(prefixLength) === after.charAt(prefixLength)
  ) {
    prefixLength += 1;
  }
  let suffixLength = 0;
  while (
    suffixLength < shorterLength - prefixLength &&
    before.charAt(before.length - 1 - suffixLength) ===
      after.charAt(after.length - 1 - suffixLength)
  ) {
    suffixLength += 1;
  }
  return {
    start: prefixLength,
    end: before.length - suffixLength,
    text: after.slice(prefixLength, after.length - suffixLength),
  };
}
