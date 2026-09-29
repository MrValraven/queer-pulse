import {
  DIRECTORY_DISCIPLINES,
  DIRECTORY_PROFESSIONS,
} from "./memberDirectoryFilter.data";
import { foldForSearch, type LabelResolver } from "./workFieldPicker.data";

/** Terms shorter than this never match a work label: two letters ("ic", "de")
 *  would pull in most of the catalog and drown the name matches. */
const MINIMUM_TERM_LENGTH = 3;

/** Anything other than a letter or digit separates two words in a label. */
const WORD_SEPARATOR = /[^\p{L}\p{N}]/u;

export interface WorkSearchIds {
  disciplineIds: string[];
  professionIds: string[];
}

/** True when `foldedTerm` starts at the beginning of any word in
 *  `foldedLabel`. A multi-word term ("graphic des") only needs its first word
 *  to sit on a boundary; the rest runs on through the label. */
function matchesAtWordStart(foldedLabel: string, foldedTerm: string): boolean {
  for (let index = 0; index < foldedLabel.length; index += 1) {
    const isWordStart =
      index === 0 || WORD_SEPARATOR.test(foldedLabel.charAt(index - 1));
    if (isWordStart && foldedLabel.startsWith(foldedTerm, index)) return true;
  }
  return false;
}

/**
 * The work fields and professions whose visible label matches the directory
 * search term, so the name box also finds "the nurse" or "someone in design".
 * Both the term and each resolved label are folded with `foldForSearch`, so
 * "saude" finds "Saúde" and "enferm" finds "Enfermagem". A label matches when
 * the term begins one of its words: "nur" finds "Nurse" while "urse" finds
 * nothing. Ids come back in catalog order.
 *
 * Matched only against `DIRECTORY_DISCIPLINES` / `DIRECTORY_PROFESSIONS`, so a
 * search for "sex worker" or "trabalho sexual" cannot surface the unlisted
 * field: see `UNLISTED_DISCIPLINE_IDS` in `memberDirectoryFilter.data.ts`.
 */
export function workIdsMatchingSearch(
  term: string,
  resolveLabel: LabelResolver,
): WorkSearchIds {
  // Inner runs of whitespace collapse to one space, so "graphic  des" still
  // lines up with the single-spaced label.
  const foldedTerm = foldForSearch(term).replace(/\s+/g, " ");
  if (foldedTerm.length < MINIMUM_TERM_LENGTH) {
    return { disciplineIds: [], professionIds: [] };
  }
  const idsMatching = (options: { id: string; labelKey: string }[]) =>
    options
      .filter((option) =>
        matchesAtWordStart(
          foldForSearch(resolveLabel(option.labelKey)),
          foldedTerm,
        ),
      )
      .map((option) => option.id);
  return {
    disciplineIds: idsMatching(DIRECTORY_DISCIPLINES),
    professionIds: idsMatching(DIRECTORY_PROFESSIONS),
  };
}
