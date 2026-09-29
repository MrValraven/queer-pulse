import { foldForSearch } from "../connect/connectionsFilter";
import type { SubprofileKind } from "./api/subprofiles.api";
import {
  KIND_LABELS_BY_LANGUAGE,
  KIND_SEARCH_ALIASES,
} from "./subprofile-kinds";

/**
 * Demo mode's copy of the backend's `kindsMatchingSearch`
 * (`subprofile-kind-search.ts`): a directory term that names a profession by
 * label (EN or PT) or alias matches that kind. Same folding, same word-start
 * rule, same whole-word rule for two-character needles, same stop words, so
 * demo and live agree on what "dm" finds.
 */
const MIN_TERM_LENGTH = 2;
const STOP_WORDS = new Set([
  "de",
  "da",
  "do",
  "das",
  "dos",
  "e",
  "a",
  "o",
  "and",
  "of",
  "the",
]);
/** A match counts only where a word starts: at 0, or after one of these. */
const WORD_START_AFTER = new Set([" ", "-", "/", "("]);
/** A whole-word match also needs the word to end here: at the entry's end,
 *  or before one of these. */
const WORD_END_BEFORE = new Set([" ", "-", "/", "(", ")"]);

const FOLDED_TERMS = (
  Object.keys(KIND_LABELS_BY_LANGUAGE.en) as SubprofileKind[]
).map((kind) => ({
  kind,
  entries: [
    ...Object.values(KIND_LABELS_BY_LANGUAGE).map((labels) => labels[kind]),
    ...(KIND_SEARCH_ALIASES[kind] ?? []),
  ].map(foldForSearch),
}));

function isAtWordBoundary(haystack: string, needle: string): boolean {
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    if (index === 0 || WORD_START_AFTER.has(haystack[index - 1] ?? ""))
      return true;
    index = haystack.indexOf(needle, index + 1);
  }
  return false;
}

/**
 * Same word-start rule as `isAtWordBoundary`, but also requires the needle to
 * be a WHOLE word: the character right after the match has to end the word
 * too (the end of the entry, or a word break). Reserved for two-character
 * needles, where a bare prefix match fans out to every kind with any word
 * starting with those two letters ("es" hitting Escrita, Estética, Escanção,
 * "escape rooms"...). "dm", "gm" and "dj" still match, since each is a whole
 * word in an alias or a label.
 */
function isWholeWordMatch(haystack: string, needle: string): boolean {
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    const isWordStart =
      index === 0 || WORD_START_AFTER.has(haystack[index - 1] ?? "");
    const wordEndIndex = index + needle.length;
    const isWordEnd =
      wordEndIndex === haystack.length ||
      WORD_END_BEFORE.has(haystack[wordEndIndex] ?? "");
    if (isWordStart && isWordEnd) {
      return true;
    }
    index = haystack.indexOf(needle, index + 1);
  }
  return false;
}

export function kindsMatchingSearch(term: string): SubprofileKind[] {
  const needle = foldForSearch(term.trim());
  if (needle.length < MIN_TERM_LENGTH || STOP_WORDS.has(needle)) return [];
  const matchesEntry =
    needle.length === 2
      ? (entry: string) => isWholeWordMatch(entry, needle)
      : (entry: string) => isAtWordBoundary(entry, needle);
  return FOLDED_TERMS.filter(({ entries }) => entries.some(matchesEntry)).map(
    ({ kind }) => kind,
  );
}
