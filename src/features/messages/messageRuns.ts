// src/features/messages/messageRuns.ts
import type { ChatMessage } from "./data";

/** A maximal run of consecutive messages from the same sender within a day group. */
export interface MessageRun {
  from: "me" | "them";
  items: ChatMessage[];
}

/**
 * Split a day-group's flat message list into runs — consecutive messages from
 * the same sender collapse into one run so the timestamp renders once and inner
 * spacing can tighten. A run also breaks when two consecutive messages both have
 * `at` and differ by more than `maxGapMs` (default 15 minutes), and — when
 * `breakBefore` is given — immediately before that exact message object, so the
 * unread divider always sits at the head of a run even when the read/unread
 * boundary falls mid-burst. Order is preserved; an empty input yields no runs.
 */
export function groupIntoRuns(
  items: ChatMessage[],
  maxGapMs = 15 * 60_000,
  breakBefore?: ChatMessage,
): MessageRun[] {
  const runs: MessageRun[] = [];
  for (const message of items) {
    const currentRun = runs[runs.length - 1];
    const previousMessage = currentRun?.items[currentRun.items.length - 1];
    const gapTooLarge =
      !!previousMessage?.at &&
      !!message.at &&
      new Date(message.at).getTime() - new Date(previousMessage.at).getTime() >
        maxGapMs;
    const forcedBreak = breakBefore !== undefined && message === breakBefore;
    if (
      currentRun &&
      currentRun.from === message.from &&
      !gapTooLarge &&
      !forcedBreak
    ) {
      currentRun.items.push(message);
    } else {
      runs.push({ from: message.from, items: [message] });
    }
  }
  return runs;
}

/**
 * One block of a rendered timeline: either a same-sender `run` of ordinary
 * bubbles, or a standalone `system` message (rendered as a centred pill). System
 * messages never join a sender run — they break the flow on both sides.
 */
export type TimelineItem =
  { kind: "run"; run: MessageRun } | { kind: "system"; message: ChatMessage };

/**
 * Splits a day-group's flat list into ordered timeline blocks: contiguous
 * non-system messages are grouped into sender runs (via `groupIntoRuns`, so the
 * gap/`breakBefore` semantics are shared, not re-implemented), and each
 * `kind: "system"` message becomes its own centred-pill block. Order is
 * preserved; a group with no system messages yields exactly the runs
 * `groupIntoRuns` would produce.
 */
export function buildTimeline(
  items: ChatMessage[],
  maxGapMs = 15 * 60_000,
  breakBefore?: ChatMessage,
): TimelineItem[] {
  const blocks: TimelineItem[] = [];
  let segment: ChatMessage[] = [];
  const flushSegment = () => {
    if (segment.length === 0) return;
    for (const run of groupIntoRuns(segment, maxGapMs, breakBefore)) {
      blocks.push({ kind: "run", run });
    }
    segment = [];
  };
  for (const message of items) {
    if (message.kind === "system") {
      flushSegment();
      blocks.push({ kind: "system", message });
    } else {
      segment.push(message);
    }
  }
  flushSegment();
  return blocks;
}

/**
 * True when a message body is only emoji (plus whitespace / ZWJ / variation
 * selectors) and short — those render without a bubble, at a larger glyph size,
 * per modern chat convention. Handles pictographs, skin-tone modifiers, ZWJ
 * sequences, country flags (regional indicators), and keycap sequences.
 */
export function isEmojiOnly(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  // A "signal" character appears only in emoji: a pictograph, a regional
  // indicator (country flags), or the combining enclosing keycap (keycap
  // sequences like 1️⃣). Requiring at least one keeps plain text, punctuation,
  // and bare digits from ever qualifying.
  const signal = /[\p{Extended_Pictographic}\p{Regional_Indicator}\u{20E3}]/u;
  if (!signal.test(trimmed)) return false;
  // The whole string must be emoji constituents only: pictographs, skin-tone
  // modifiers, regional indicators, keycap bases (0-9 # *), the keycap combiner,
  // ZWJ, variation selectors, and whitespace.
  // The keycap combiner (U+20E3), variation selector (U+FE0F) and ZWJ (U+200D)
  // are kept as standalone alternatives rather than inside the character class:
  // a combining mark sitting next to the keycap bases (0-9 # *) inside a class
  // reads as a single combined glyph (no-misleading-character-class). As bare
  // single-code-point alternatives under the `+` the match set is identical.
  const onlyEmoji =
    /^(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Regional_Indicator}|[0-9#*]|\u{20E3}|\u{FE0F}|\u{200D}|\s)+$/u;
  if (!onlyEmoji.test(trimmed)) return false;
  // Cap at a short burst of code points — long emoji strings stay in a bubble.
  // Multi-codepoint emoji (flags = 2, keycaps = 3, ZWJ families = 7+) each count
  // for several, so the ceiling is deliberately generous.
  const codePoints = [...trimmed.replace(/\s/g, "")];
  return codePoints.length > 0 && codePoints.length <= 16;
}
