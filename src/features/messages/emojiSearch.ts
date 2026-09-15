// src/features/messages/emojiSearch.ts
import type { EmojiEntry } from "./emoji.data";

/** Lowercases and strips diacritics, the same normalisation
 *  `scripts/generate-emoji-data.mjs` already baked into every entry's
 *  `terms` field, so a query for "coracao" matches a term stored as
 *  "coracao" (from "coração") rather than needing an accent-perfect match. */
export function normalizeEmojiQuery(rawQuery: string): string {
  return rawQuery
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

/** Every entry whose `terms` contains the normalized query, in dataset order
 *  (Unicode order within each group) — a single substring test per entry
 *  since `terms` already carries both EN and PT search words. */
export function filterEmojiEntries(
  entries: EmojiEntry[],
  normalizedQuery: string,
): EmojiEntry[] {
  if (!normalizedQuery) return entries;
  return entries.filter((entry) => entry.terms.includes(normalizedQuery));
}
