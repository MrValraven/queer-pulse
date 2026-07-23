// src/features/messages/messageRuns.ts
import type { ChatMessage } from "./data";

/** A maximal run of consecutive messages from the same sender within a day group. */
export interface MessageRun {
  from: "me" | "them";
  items: ChatMessage[];
}

/**
 * Split a day-group's flat message list into runs — consecutive messages from
 * the same sender collapse into one run so the avatar renders once and inner
 * spacing can tighten. Order is preserved; an empty input yields no runs.
 */
export function groupIntoRuns(items: ChatMessage[]): MessageRun[] {
  const runs: MessageRun[] = [];
  for (const message of items) {
    const current = runs[runs.length - 1];
    if (current && current.from === message.from) {
      current.items.push(message);
    } else {
      runs.push({ from: message.from, items: [message] });
    }
  }
  return runs;
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
  const onlyEmoji =
    /^(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|\p{Regional_Indicator}|[0-9#*\u{20E3}\u{FE0F}\u{200D}\s])+$/u;
  if (!onlyEmoji.test(trimmed)) return false;
  // Cap at a short burst of code points — long emoji strings stay in a bubble.
  // Multi-codepoint emoji (flags = 2, keycaps = 3, ZWJ families = 7+) each count
  // for several, so the ceiling is deliberately generous.
  const codePoints = [...trimmed.replace(/\s/g, "")];
  return codePoints.length > 0 && codePoints.length <= 16;
}
