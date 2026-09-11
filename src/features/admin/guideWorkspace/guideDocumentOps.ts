import type { GuideBlockKind } from "../api/adminResourceGuides.api";
import { anchorForHeading } from "./guideAnchors";
import {
  isFormattedKind,
  textToHtml,
  type DraftBlock,
  type DraftSection,
} from "./guideDraft";

/** An update applied to the latest sections, so rapid edits never act on a
 *  stale copy. */
export type SectionsUpdate = (sections: DraftSection[]) => DraftSection[];
export type MoveDirection = "up" | "down";

export interface BlockLocation {
  sectionKey: string;
  blockKey: string;
}

export function moveItem<Item>(
  items: readonly Item[],
  fromIndex: number,
  toIndex: number,
): Item[] {
  const next = [...items];
  const isOutOfRange = (position: number) =>
    position < 0 || position >= next.length;
  if (isOutOfRange(fromIndex) || isOutOfRange(toIndex)) return next;
  const [moved] = next.splice(fromIndex, 1);
  if (moved !== undefined) next.splice(toIndex, 0, moved);
  return next;
}

function mapSection(
  sections: readonly DraftSection[],
  sectionKey: string,
  update: (section: DraftSection) => DraftSection,
): DraftSection[] {
  return sections.map((section) =>
    section.key === sectionKey ? update(section) : section,
  );
}

function anchorsExcept(
  sections: readonly DraftSection[],
  sectionKey: string | null,
): Set<string> {
  return new Set(
    sections
      .filter((section) => section.key !== sectionKey)
      .map((section) => section.id),
  );
}

/** Sets a heading; an unlocked anchor follows it, kept unique. */
export function renameSection(
  sections: readonly DraftSection[],
  sectionKey: string,
  heading: string,
): DraftSection[] {
  return mapSection(sections, sectionKey, (section) => ({
    ...section,
    heading,
    id: section.isAnchorLocked
      ? section.id
      : anchorForHeading(heading, anchorsExcept(sections, sectionKey)),
  }));
}

/** An anchor typed by hand stops following the heading. */
export function setSectionAnchor(
  sections: readonly DraftSection[],
  sectionKey: string,
  anchor: string,
): DraftSection[] {
  return mapSection(sections, sectionKey, (section) => ({
    ...section,
    id: anchor,
    isAnchorLocked: true,
  }));
}

/** Inserts after `afterSectionKey`, or at the end when it is null or gone. */
export function insertSectionAfter(
  sections: readonly DraftSection[],
  afterSectionKey: string | null,
  section: DraftSection,
): DraftSection[] {
  const placed = section.isAnchorLocked
    ? section
    : {
        ...section,
        id: anchorForHeading(section.heading, anchorsExcept(sections, null)),
      };
  const afterIndex =
    afterSectionKey === null
      ? -1
      : sections.findIndex((candidate) => candidate.key === afterSectionKey);
  const insertAt = afterIndex === -1 ? sections.length : afterIndex + 1;
  return [...sections.slice(0, insertAt), placed, ...sections.slice(insertAt)];
}

export function removeSection(
  sections: readonly DraftSection[],
  sectionKey: string,
): DraftSection[] {
  return sections.filter((section) => section.key !== sectionKey);
}

export function restoreSection(
  sections: readonly DraftSection[],
  index: number,
  section: DraftSection,
): DraftSection[] {
  const insertAt = Math.min(Math.max(index, 0), sections.length);
  return [...sections.slice(0, insertAt), section, ...sections.slice(insertAt)];
}

export function moveSection(
  sections: readonly DraftSection[],
  fromIndex: number,
  toIndex: number,
): DraftSection[] {
  return moveItem(sections, fromIndex, toIndex);
}

/** Inserts after `afterBlockKey`, or at the section's end when it is null. */
export function insertBlocksAfter(
  sections: readonly DraftSection[],
  sectionKey: string,
  afterBlockKey: string | null,
  blocks: readonly DraftBlock[],
): DraftSection[] {
  return mapSection(sections, sectionKey, (section) => {
    const afterIndex =
      afterBlockKey === null
        ? -1
        : section.blocks.findIndex(
            (candidate) => candidate.key === afterBlockKey,
          );
    const insertAt = afterIndex === -1 ? section.blocks.length : afterIndex + 1;
    return {
      ...section,
      blocks: [
        ...section.blocks.slice(0, insertAt),
        ...blocks,
        ...section.blocks.slice(insertAt),
      ],
    };
  });
}

export function changeBlock(
  sections: readonly DraftSection[],
  sectionKey: string,
  blockKey: string,
  changes: Partial<Pick<DraftBlock, "html" | "text">>,
): DraftSection[] {
  return mapSection(sections, sectionKey, (section) => ({
    ...section,
    blocks: section.blocks.map((block) =>
      block.key === blockKey ? { ...block, ...changes } : block,
    ),
  }));
}

/**
 * A block's kind, changed under `nextKey` so its editor remounts (a
 * subheading is a plain-text field, the others are formatted). `shouldClear`
 * empties it, for a "/" pick or a markdown prefix.
 */
export function convertBlock(
  sections: readonly DraftSection[],
  sectionKey: string,
  blockKey: string,
  kind: GuideBlockKind,
  options: { nextKey: string; shouldClear: boolean },
): DraftSection[] {
  return mapSection(sections, sectionKey, (section) => ({
    ...section,
    blocks: section.blocks.map((block) => {
      if (block.key !== blockKey) return block;
      if (options.shouldClear) {
        return { key: options.nextKey, kind, html: "", text: "" };
      }
      const html = !isFormattedKind(kind)
        ? ""
        : isFormattedKind(block.kind)
          ? block.html
          : textToHtml(block.text);
      return { key: options.nextKey, kind, html, text: block.text };
    }),
  }));
}

export function removeBlock(
  sections: readonly DraftSection[],
  sectionKey: string,
  blockKey: string,
): DraftSection[] {
  return mapSection(sections, sectionKey, (section) => ({
    ...section,
    blocks: section.blocks.filter((block) => block.key !== blockKey),
  }));
}

export function restoreBlock(
  sections: readonly DraftSection[],
  sectionKey: string,
  index: number,
  block: DraftBlock,
): DraftSection[] {
  return mapSection(sections, sectionKey, (section) => {
    const insertAt = Math.min(Math.max(index, 0), section.blocks.length);
    return {
      ...section,
      blocks: [
        ...section.blocks.slice(0, insertAt),
        block,
        ...section.blocks.slice(insertAt),
      ],
    };
  });
}

export function moveBlock(
  sections: readonly DraftSection[],
  sectionKey: string,
  blockKey: string,
  direction: MoveDirection,
): DraftSection[] {
  return mapSection(sections, sectionKey, (section) => {
    const fromIndex = section.blocks.findIndex(
      (block) => block.key === blockKey,
    );
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    return { ...section, blocks: moveItem(section.blocks, fromIndex, toIndex) };
  });
}

/** The block before this one: earlier in its section, or the last block of
 *  the nearest earlier section that has any. */
export function previousBlockLocation(
  sections: readonly DraftSection[],
  sectionKey: string,
  blockKey: string,
): BlockLocation | null {
  const sectionIndex = sections.findIndex(
    (section) => section.key === sectionKey,
  );
  const section = sections[sectionIndex];
  if (!section) return null;
  const blockIndex = section.blocks.findIndex(
    (block) => block.key === blockKey,
  );
  const earlierBlock =
    blockIndex > 0 ? section.blocks[blockIndex - 1] : undefined;
  if (earlierBlock) return { sectionKey, blockKey: earlierBlock.key };
  for (let position = sectionIndex - 1; position >= 0; position -= 1) {
    const earlierSection = sections[position];
    const lastBlock = earlierSection?.blocks[earlierSection.blocks.length - 1];
    if (earlierSection && lastBlock) {
      return { sectionKey: earlierSection.key, blockKey: lastBlock.key };
    }
  }
  return null;
}

/** Where a block sits, for an undo that puts it back. */
export function locateBlock(
  sections: readonly DraftSection[],
  sectionKey: string,
  blockKey: string,
): { index: number; block: DraftBlock } | null {
  const section = sections.find((candidate) => candidate.key === sectionKey);
  const index =
    section?.blocks.findIndex((block) => block.key === blockKey) ?? -1;
  const block = section?.blocks[index];
  return block ? { index, block } : null;
}

export function locateSection(
  sections: readonly DraftSection[],
  sectionKey: string,
): { index: number; section: DraftSection } | null {
  const index = sections.findIndex((section) => section.key === sectionKey);
  const section = sections[index];
  return section ? { index, section } : null;
}
