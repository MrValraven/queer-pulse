// src/features/messages/stickerSearch.ts
import type {
  StickerPackResponse,
  StickerResponse,
} from "../../shared/contracts/contracts";
import type { Language } from "../../shared/i18n/types";
import { stickerLabelIn } from "../stickers/stickerLocale";

/** Lowercased, trimmed, and stripped of accents (NFD, then every combining
 *  mark dropped), so "coracao" finds "coração" and "Olá" finds "ola". */
export function normalizeStickerSearchText(rawText: string): string {
  return rawText.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

/** True when the sticker's name in `language`, or one of its keywords in
 *  `language`, contains the already-normalized query. */
export function stickerMatchesQuery(
  sticker: StickerResponse,
  normalizedQuery: string,
  language: Language,
): boolean {
  if (!normalizedQuery) return true;
  const searchableTexts = [
    stickerLabelIn(sticker, language),
    ...(sticker.keywords?.[language] ?? []),
  ];
  return searchableTexts.some((text) =>
    normalizeStickerSearchText(text).includes(normalizedQuery),
  );
}

/**
 * Every sticker across `packs` that matches the query, in pack order then
 * sticker order, each listed once. An empty query matches nothing: the
 * picker shows its normal pack sections then, and calls this only while a
 * search is active.
 */
export function searchStickers(
  packs: StickerPackResponse[],
  rawQuery: string,
  language: Language,
): StickerResponse[] {
  const normalizedQuery = normalizeStickerSearchText(rawQuery);
  if (!normalizedQuery) return [];
  const seenStickerIds = new Set<string>();
  const matches: StickerResponse[] = [];
  for (const pack of packs) {
    for (const sticker of pack.stickers) {
      if (seenStickerIds.has(sticker.id)) continue;
      if (!stickerMatchesQuery(sticker, normalizedQuery, language)) continue;
      seenStickerIds.add(sticker.id);
      matches.push(sticker);
    }
  }
  return matches;
}
