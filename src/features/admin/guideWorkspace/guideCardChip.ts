import type { DraftSection, GuideDraft } from "./guideDraft";
import { WORDS_PER_MINUTE } from "./guideWorkspace.data";

export const CHIP_FORMATS = [
  "guide",
  "checklist",
  "template",
  "directory",
  "toolkit",
] as const;
export type ChipFormat = (typeof CHIP_FORMATS)[number];
/** `keep` leaves the stored chip untouched until the editor picks a format. */
export type ChipChoice = ChipFormat | "keep";

/** The chip is stored in English, the way `resources.meta` always has been. */
const CHIP_FORMAT_WORDS: Record<ChipFormat, string> = {
  guide: "Guide",
  checklist: "Checklist",
  template: "Template",
  directory: "Directory",
  toolkit: "Toolkit",
};

const CHIP_SEPARATOR = " · ";

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function countSectionWords(sections: readonly DraftSection[]): number {
  return sections.reduce(
    (total, section) =>
      total +
      countWords(section.heading) +
      section.blocks.reduce(
        (blockTotal, block) => blockTotal + countWords(block.text),
        0,
      ),
    0,
  );
}

export function readMinutes(sections: readonly DraftSection[]): number {
  return Math.max(1, Math.ceil(countSectionWords(sections) / WORDS_PER_MINUTE));
}

export function hasPortugueseProse(
  sectionsPt: readonly DraftSection[],
): boolean {
  return sectionsPt.some((section) =>
    section.blocks.some((block) => block.text.trim() !== ""),
  );
}

/** "Guide · 12 min · PT / EN": format, English read time, languages. */
export function composeChip(
  format: ChipFormat,
  sections: readonly DraftSection[],
  sectionsPt: readonly DraftSection[],
): string {
  const parts = [CHIP_FORMAT_WORDS[format], `${readMinutes(sections)} min`];
  if (hasPortugueseProse(sectionsPt)) parts.push("PT / EN");
  return parts.join(CHIP_SEPARATOR);
}

/** The format a stored chip starts with, or `keep` when it matches none. */
export function parseChipFormat(meta: string | null): ChipChoice {
  if (!meta) return "keep";
  const firstPart = meta.split(CHIP_SEPARATOR)[0]?.trim().toLowerCase() ?? "";
  const match = CHIP_FORMATS.find(
    (format) => CHIP_FORMAT_WORDS[format].toLowerCase() === firstPart,
  );
  return match ?? "keep";
}

/** What `meta` should hold for this draft. */
export function chipForDraft(
  draft: Pick<GuideDraft, "chipFormat" | "sections" | "sectionsPt">,
  storedMeta: string | null,
): string | null {
  if (draft.chipFormat === "keep") return storedMeta;
  return composeChip(draft.chipFormat, draft.sections, draft.sectionsPt);
}
