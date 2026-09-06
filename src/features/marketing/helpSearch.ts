import type { TFunction } from "../../shared/i18n/types";
import type { HelpCategory, HelpQuestion } from "./help.data";

/** Combining accents left behind by an NFD decomposition. */
const COMBINING_MARKS = /[\u0300-\u036f]/g;
/** The `<em>` / `<strong>` / `<settingsLink>` placeholders inside a catalog value. */
const MARKUP_TAG = /<\/?[a-zA-Z][a-zA-Z0-9]*>/g;
const WHITESPACE = /\s+/;
/** Characters of context kept on either side of the first answer hit. */
const EXCERPT_RADIUS = 72;
const ELLIPSIS = "…";

export interface HelpSearchResult {
  category: HelpCategory;
  question: HelpQuestion;
  questionText: string;
  /** Answer text with the markup placeholders removed. */
  answerText: string;
  /** A window around the first answer hit, present only when the answer matched. */
  answerExcerpt?: string;
}

export interface MatchRange {
  start: number;
  end: number;
}

interface FoldedText {
  folded: string;
  /**
   * `sourceIndexes[foldedIndex]` is the index in the original string that the
   * folded character came from, with a final sentinel at the source length, so
   * a folded range maps straight back onto the text a reader actually sees.
   */
  sourceIndexes: number[];
}

/**
 * Lowercase and strip diacritics while keeping a folded-to-source index map, so
 * a Portuguese reader typing `duvida` matches `dúvida` and the highlight still
 * lands on the accented characters.
 */
function foldWithIndexMap(text: string): FoldedText {
  let folded = "";
  const sourceIndexes: number[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    const character = String.fromCodePoint(text.codePointAt(cursor)!);
    const foldedCharacter =
      character.normalize("NFD").replace(COMBINING_MARKS, "").toLowerCase() ||
      character;
    for (let offset = 0; offset < foldedCharacter.length; offset += 1) {
      sourceIndexes.push(cursor);
    }
    folded += foldedCharacter;
    cursor += character.length;
  }
  sourceIndexes.push(text.length);
  return { folded, sourceIndexes };
}

/** Case- and diacritic-insensitive form of a string, for plain comparisons. */
export function foldForSearch(text: string): string {
  return foldWithIndexMap(text).folded;
}

/** The folded words a search query is made of. Every one of them must match. */
export function toSearchTerms(searchQuery: string): string[] {
  return foldForSearch(searchQuery.trim())
    .split(WHITESPACE)
    .filter((term) => term.length > 0);
}

/** Catalog values carry inline tag placeholders; searching wants the words only. */
export function stripMarkupTags(value: string): string {
  return value.replace(MARKUP_TAG, "");
}

/** Every place a term occurs in `text`, in source indexes, sorted and merged. */
export function findMatchRanges(text: string, terms: string[]): MatchRange[] {
  if (terms.length === 0) return [];
  const { folded, sourceIndexes } = foldWithIndexMap(text);
  const ranges: MatchRange[] = [];
  for (const term of terms) {
    let hitIndex = folded.indexOf(term);
    while (hitIndex !== -1) {
      ranges.push({
        start: sourceIndexes[hitIndex]!,
        end: sourceIndexes[hitIndex + term.length]!,
      });
      hitIndex = folded.indexOf(term, hitIndex + term.length);
    }
  }
  ranges.sort((left, right) => left.start - right.start);
  const merged: MatchRange[] = [];
  for (const range of ranges) {
    const previous = merged[merged.length - 1];
    if (previous && range.start <= previous.end) {
      previous.end = Math.max(previous.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}

/** A readable window of the answer around its first hit, snapped to word edges. */
function buildExcerpt(answerText: string, firstHit: MatchRange): string {
  let start = Math.max(0, firstHit.start - EXCERPT_RADIUS);
  let end = Math.min(answerText.length, firstHit.end + EXCERPT_RADIUS);
  if (start > 0) {
    const spaceAfter = answerText.indexOf(" ", start);
    if (spaceAfter !== -1 && spaceAfter < firstHit.start)
      start = spaceAfter + 1;
  }
  if (end < answerText.length) {
    const spaceBefore = answerText.lastIndexOf(" ", end);
    if (spaceBefore > firstHit.end) end = spaceBefore;
  }
  const body = answerText.slice(start, end).trim();
  return [
    start > 0 ? ELLIPSIS : "",
    body,
    end < answerText.length ? ELLIPSIS : "",
  ].join("");
}

/**
 * Search every question of every category at once, against the strings as the
 * reader sees them in the active locale, so a hit in a tab they are not looking
 * at still surfaces. A question matches when all terms appear across its
 * question and answer text together.
 */
export function searchHelpCategories(
  categories: HelpCategory[],
  translate: TFunction,
  terms: string[],
): HelpSearchResult[] {
  if (terms.length === 0) return [];
  const results: HelpSearchResult[] = [];
  for (const category of categories) {
    for (const question of category.questions) {
      const questionText = stripMarkupTags(translate(question.questionKey));
      const answerText = stripMarkupTags(translate(question.answerKey));
      const haystack = foldForSearch(`${questionText} ${answerText}`);
      if (!terms.every((term) => haystack.includes(term))) continue;
      const answerHits = findMatchRanges(answerText, terms);
      results.push({
        category,
        question,
        questionText,
        answerText,
        ...(answerHits[0]
          ? { answerExcerpt: buildExcerpt(answerText, answerHits[0]) }
          : {}),
      });
    }
  }
  return results;
}
