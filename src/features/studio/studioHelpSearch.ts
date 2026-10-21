import { foldForSearch } from "../../shared/lib/foldForSearch";
import type { TFunction } from "../../shared/i18n/types";
import type { HelpSectionData } from "./studioHelp.data";

const MARKUP = new RegExp("<[^>]+>", "g");

/** The words of a query: split on whitespace, folded (case- and
 *  accent-blind), blanks dropped. "save playlist" is two terms. */
export function helpSearchTerms(query: string): string[] {
  return foldForSearch(query)
    .split(/\s+/)
    .filter((term) => term.length > 0);
}

/**
 * The character ranges of `text` (in its own, unfolded indexes) that any of
 * `terms` match, accent- and case-blind. Overlapping hits merge. Each
 * character is folded on its own, so a letter that folds to a different
 * number of characters never shifts the indexes of what follows it.
 */
export function findHelpMatchRanges(
  text: string,
  terms: readonly string[],
): Array<[number, number]> {
  if (terms.length === 0) return [];
  let folded = "";
  const originalIndexOf: number[] = [];
  let originalIndex = 0;
  for (const character of text) {
    const foldedCharacter = foldForSearch(character);
    for (let offset = 0; offset < foldedCharacter.length; offset += 1)
      originalIndexOf.push(originalIndex);
    folded += foldedCharacter;
    originalIndex += character.length;
  }
  const ranges: Array<[number, number]> = [];
  for (const term of terms) {
    let from = folded.indexOf(term);
    while (from !== -1) {
      const start = originalIndexOf[from] ?? 0;
      const lastFolded = originalIndexOf[from + term.length - 1] ?? start;
      const lastCharacter = String.fromCodePoint(
        text.codePointAt(lastFolded) ?? 0,
      );
      ranges.push([start, lastFolded + lastCharacter.length]);
      from = folded.indexOf(term, from + term.length);
    }
  }
  ranges.sort((first, second) => first[0] - second[0]);
  const merged: Array<[number, number]> = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push([range[0], range[1]]);
  }
  return merged;
}

/**
 * The sections whose questions or answers hold every word of `query`,
 * case- and accent-blind and in any order, each keeping only its matching
 * entries; a section with none left is dropped. A blank query returns the
 * same array.
 */
export function filterHelpSections(
  sections: HelpSectionData[],
  query: string,
  t: TFunction,
): HelpSectionData[] {
  const terms = helpSearchTerms(query);
  if (terms.length === 0) return sections;
  const matches = (questionKey: string, answerKey: string) => {
    const haystack = foldForSearch(
      `${t(questionKey)} ${t(answerKey)}`.replace(MARKUP, " "),
    );
    return terms.every((term) => haystack.includes(term));
  };
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        matches(item.questionKey, item.answerKey),
      ),
    }))
    .filter((section) => section.items.length > 0);
}
