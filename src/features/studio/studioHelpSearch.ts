import { foldForSearch } from "../../shared/lib/foldForSearch";
import type { TFunction } from "../../shared/i18n/types";
import type { HelpSectionData } from "./studioHelp.data";

const MARKUP = new RegExp("<[^>]+>", "g");

/**
 * The sections whose questions or answers hold `query`, case- and
 * accent-blind, each keeping only its matching entries; a section with none
 * left is dropped. A blank query returns the same array.
 */
export function filterHelpSections(
  sections: HelpSectionData[],
  query: string,
  t: TFunction,
): HelpSectionData[] {
  const needle = foldForSearch(query.trim());
  if (!needle) return sections;
  const matches = (questionKey: string, answerKey: string) =>
    foldForSearch(
      `${t(questionKey)} ${t(answerKey)}`.replace(MARKUP, " "),
    ).includes(needle);
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        matches(item.questionKey, item.answerKey),
      ),
    }))
    .filter((section) => section.items.length > 0);
}
