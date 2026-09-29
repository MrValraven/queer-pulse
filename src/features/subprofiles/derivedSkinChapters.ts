import type { SubprofileKind, SubprofileSection } from "./api/subprofiles.api";
import { SECTION_META, sectionsForKind } from "./subprofile-kinds";
import { skinFor } from "./subprofile-skins";
import {
  SKIN_BLOCKS_BY_FAMILY,
  type SkinBlockControl,
  type SkinBlockDescriptor,
  type SkinChapterDescriptor,
} from "./skinBlockFields.data";
import {
  PAGE_OUTLINE_BY_FAMILY,
  type PageOutlineEntry,
} from "./skinPageOutline.data";

const derivedKey = (key: string, part: "title" | "lede"): string =>
  `subprofiles:skinChapter.derived.${key}.${part}`;

/** One chapter per section: its label as the title, and its whole item list
 *  as the chapter's only control. The lede is one shared line (the gallery
 *  has its own), so it never has to fit a section's name into a sentence. */
function sectionChapter(section: SubprofileSection): SkinChapterDescriptor {
  const labelKey = SECTION_META[section].labelKey;
  const isGallery = section === "gallery";
  return {
    key: section,
    titleKey: labelKey,
    ledeKey: derivedKey(isGallery ? "gallery" : "section", "lede"),
    groups: [
      {
        controls: [
          {
            path: `section:${section}`,
            kind: "sectionList",
            section,
            labelKey,
          },
        ],
      },
    ],
  };
}

/** A retired list with `moveTargets`, fitted to the kind: it moves into the
 *  first target section the kind has, and its helper names that section. A
 *  kind with none of them keeps the list as a live field (its own
 *  `helperKey`), since the list is then the only place for that fact. */
export function fitControlToSections(
  control: SkinBlockControl,
  sections: SubprofileSection[],
): SkinBlockControl {
  if (!control.moveTargets) return control;
  const target = control.moveTargets.find((candidate) =>
    sections.includes(candidate.section),
  );
  if (!target) {
    return { ...control, isRetired: false, moveTargets: undefined };
  }
  return {
    ...control,
    helperKey: target.helperKey,
    moveToSection: target.section,
  };
}

/** A chapter of `SkinData` blocks, one card per block. A single block names
 *  the chapter; several share the outline entry's own title. A single block's
 *  helper line, when it has one, says more about it than the position lede
 *  ("What visitors read first"), so it becomes the chapter lede and leaves
 *  the card. */
function blocksChapter(
  entry: Extract<PageOutlineEntry, { kind: "blocks" }>,
  familyBlocks: SkinBlockDescriptor[],
  sections: SubprofileSection[],
): SkinChapterDescriptor | null {
  const blocks = entry.blockKeys
    .map((blockKey) =>
      familyBlocks.find((block) => block.blockKey === blockKey),
    )
    .filter((block): block is SkinBlockDescriptor => block !== undefined);
  const [onlyBlock] = blocks;
  if (!onlyBlock) return null;
  const isSingleBlockChapter = blocks.length === 1;
  const helperLedeKey = isSingleBlockChapter ? onlyBlock.helperKey : undefined;
  return {
    key: entry.key,
    titleKey: isSingleBlockChapter
      ? onlyBlock.titleKey
      : derivedKey(entry.key, "title"),
    ledeKey: helperLedeKey ?? derivedKey(entry.key, "lede"),
    // A single-block chapter's card has no heading of its own: the chapter
    // title above it already names the block, so the group carries no
    // `titleKey`, and no `helperKey` once the lede carries it. Several
    // blocks each keep their own titled card and helper.
    groups: blocks.map((block) => ({
      titleKey: isSingleBlockChapter ? undefined : block.titleKey,
      helperKey: helperLedeKey ? undefined : block.helperKey,
      controls: block.controls.map((control) =>
        fitControlToSections(control, sections),
      ),
    })),
  };
}

/**
 * The Page blocks chapters of a kind without hand-written ones: its family's
 * page outline, with `sections` expanded to one chapter per content section
 * (in `KIND_SECTIONS` order), `gallery` to the photo gallery, and each
 * `blocks` entry to a chapter of those blocks (skipped when the family has
 * none of them), each retired list fitted to the kind's sections
 * (`fitControlToSections`).
 */
export function deriveSkinChapters(
  kind: SubprofileKind,
): SkinChapterDescriptor[] {
  const family = skinFor(kind);
  const familyBlocks = SKIN_BLOCKS_BY_FAMILY[family] ?? [];
  const sections = sectionsForKind(kind);
  const contentSections = sections.filter((section) => section !== "gallery");
  const chapters: SkinChapterDescriptor[] = [];
  for (const entry of PAGE_OUTLINE_BY_FAMILY[family]) {
    if (entry.kind === "sections") {
      chapters.push(...contentSections.map(sectionChapter));
    } else if (entry.kind === "gallery") {
      if (sections.includes("gallery"))
        chapters.push(sectionChapter("gallery"));
    } else {
      const chapter = blocksChapter(entry, familyBlocks, sections);
      if (chapter) chapters.push(chapter);
    }
  }
  return chapters;
}
