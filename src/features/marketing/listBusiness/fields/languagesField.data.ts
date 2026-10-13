import type { TFunction } from "../../../../shared/i18n/types";
import {
  COMMON_LISTING_LANGUAGE_CODES,
  languageLabel,
  LISTING_LANGUAGE_CODES,
  type ListingLanguageCode,
} from "../listingFacts.data";

/** The codes behind "More languages": everything but the common five. */
export const MORE_LANGUAGE_CODES: readonly ListingLanguageCode[] =
  LISTING_LANGUAGE_CODES.filter(
    (code) => !COMMON_LISTING_LANGUAGE_CODES.includes(code),
  );

/** What an owner might type for each code besides its own name, in English
 *  and Portuguese, so "ukrainian" finds Українська. Search data alone; the
 *  page prints none of it. */
const LANGUAGE_SEARCH_WORDS: Record<ListingLanguageCode, string> = {
  pt: "portuguese português",
  "pt-BR": "brazilian portuguese português do brasil",
  en: "english inglês",
  es: "spanish espanhol castellano",
  fr: "french francês",
  it: "italian italiano",
  de: "german alemão",
  uk: "ukrainian ucraniano",
  ru: "russian russo",
  zh: "chinese mandarin chinês mandarim",
  hi: "hindi",
  ne: "nepali nepalês",
  bn: "bengali bangla bengalês",
  ar: "arabic árabe",
  kea: "cape verdean creole crioulo cabo-verdiano kabuverdianu",
  lgp: "portuguese sign language língua gestual portuguesa",
  ils: "international sign sinais internacionais",
};

function foldForSearch(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** The "More languages" matches: codes outside the common five that are
 *  still unpicked, whose own name, code or search words hold the query. A
 *  blank query matches nothing, so the list stays closed until the owner
 *  types. */
export function moreLanguageMatches(
  query: string,
  selected: readonly string[],
  t: TFunction,
): ListingLanguageCode[] {
  const needle = foldForSearch(query.trim());
  if (!needle) return [];
  return MORE_LANGUAGE_CODES.filter(
    (code) =>
      !selected.includes(code) &&
      [code, languageLabel(t, code), LANGUAGE_SEARCH_WORDS[code]].some(
        (haystack) => foldForSearch(haystack).includes(needle),
      ),
  );
}
