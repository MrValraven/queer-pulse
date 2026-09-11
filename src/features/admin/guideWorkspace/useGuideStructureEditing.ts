import { useEffect, useRef } from "react";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { GuideBlockKind } from "../api/adminResourceGuides.api";
import {
  guideBlockMoveButtonId,
  guideSectionMoveButtonId,
  type CaretPosition,
} from "./guideCaret";
import {
  convertBlock,
  insertBlocksAfter,
  insertSectionAfter,
  locateBlock,
  locateSection,
  moveBlock,
  moveSection,
  removeBlock,
  removeSection,
  renameSection,
  restoreBlock,
  restoreSection,
  setSectionAnchor,
  type MoveDirection,
  type SectionsUpdate,
} from "./guideDocumentOps";
import {
  createDraftKey,
  newDraftBlock,
  newDraftSection,
  type DraftSection,
} from "./guideDraft";
import {
  guideBlockDomId,
  guideSectionHeadingId,
  NEW_SECTION_OPTION_ID,
} from "./guideWorkspace.data";

export interface GuideStructureEditing {
  renameSection: (sectionKey: string, heading: string) => void;
  setSectionAnchor: (sectionKey: string, anchor: string) => void;
  moveSection: (sectionKey: string, direction: MoveDirection) => void;
  removeSection: (sectionKey: string) => void;
  appendSection: () => void;
  appendBlock: (kind: GuideBlockKind) => void;
  addBlockToSection: (sectionKey: string) => void;
  moveBlock: (
    sectionKey: string,
    blockKey: string,
    direction: MoveDirection,
  ) => void;
  removeBlock: (sectionKey: string, blockKey: string) => void;
  pickSlashOption: (
    sectionKey: string,
    blockKey: string,
    optionId: string,
  ) => void;
}

/** The move button that keeps focus after a move: the same one, unless the
 *  item lands on the edge that disables it, then the opposite one. */
function moveFocusDirection(
  fromIndex: number,
  count: number,
  direction: MoveDirection,
): MoveDirection {
  if (direction === "up") return fromIndex - 1 <= 0 ? "down" : "up";
  return fromIndex + 1 >= count - 1 ? "up" : "down";
}

/** Sections and blocks as units: add, move, remove with Undo, and the "/"
 *  menu's picks. */
export function useGuideStructureEditing({
  sections,
  onSectionsChange,
  focusLater,
}: {
  sections: DraftSection[];
  onSectionsChange: (update: SectionsUpdate) => void;
  focusLater: (targetId: string, position: CaretPosition) => void;
}): GuideStructureEditing {
  const { t } = useTranslation();
  const { showToast } = useToast();
  // The latest committed sections, for Undo toasts clicked seconds later.
  const latestSectionsRef = useRef(sections);
  useEffect(() => {
    latestSectionsRef.current = sections;
  });

  function withUndo(messageKey: string, undo: SectionsUpdate) {
    showToast(t(messageKey), "info", undefined, {
      label: t("admin:guideWorkspace.undo"),
      onClick: () => onSectionsChange(undo),
    });
  }

  function appendSection() {
    const section = newDraftSection("section");
    onSectionsChange((current) => insertSectionAfter(current, null, section));
    focusLater(guideSectionHeadingId(section.key), "start");
  }

  function appendBlock(kind: GuideBlockKind) {
    const block = newDraftBlock(kind);
    const lastSection = latestSectionsRef.current.at(-1);
    if (lastSection) {
      onSectionsChange((current) =>
        insertBlocksAfter(current, lastSection.key, null, [block]),
      );
    } else {
      const section = { ...newDraftSection("section"), blocks: [block] };
      onSectionsChange((current) => insertSectionAfter(current, null, section));
    }
    focusLater(guideBlockDomId(block.key), "start");
  }

  function addBlockToSection(sectionKey: string) {
    const block = newDraftBlock("paragraph");
    onSectionsChange((current) =>
      insertBlocksAfter(current, sectionKey, null, [block]),
    );
    focusLater(guideBlockDomId(block.key), "start");
  }

  function moveSectionAndFocus(sectionKey: string, direction: MoveDirection) {
    const fromIndex = latestSectionsRef.current.findIndex(
      (section) => section.key === sectionKey,
    );
    if (fromIndex === -1) return;
    onSectionsChange((current) => {
      const currentIndex = current.findIndex(
        (section) => section.key === sectionKey,
      );
      const toIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      return moveSection(current, currentIndex, toIndex);
    });
    const focusDirection = moveFocusDirection(
      fromIndex,
      latestSectionsRef.current.length,
      direction,
    );
    focusLater(guideSectionMoveButtonId(sectionKey, focusDirection), "start");
  }

  function moveBlockAndFocus(
    sectionKey: string,
    blockKey: string,
    direction: MoveDirection,
  ) {
    const located = locateSection(latestSectionsRef.current, sectionKey);
    const blocks = located?.section.blocks ?? [];
    const fromIndex = blocks.findIndex((block) => block.key === blockKey);
    if (fromIndex === -1) return;
    onSectionsChange((current) =>
      moveBlock(current, sectionKey, blockKey, direction),
    );
    const focusDirection = moveFocusDirection(
      fromIndex,
      blocks.length,
      direction,
    );
    focusLater(guideBlockMoveButtonId(blockKey, focusDirection), "start");
  }

  function removeBlockWithUndo(sectionKey: string, blockKey: string) {
    const located = locateBlock(
      latestSectionsRef.current,
      sectionKey,
      blockKey,
    );
    if (!located) return;
    const section = latestSectionsRef.current.find(
      (candidate) => candidate.key === sectionKey,
    );
    const previousBlock = section?.blocks[located.index - 1];
    const nextBlock = section?.blocks[located.index + 1];
    onSectionsChange((current) => removeBlock(current, sectionKey, blockKey));
    withUndo("admin:guideWorkspace.block.removedToast", (current) =>
      restoreBlock(current, sectionKey, located.index, located.block),
    );
    if (previousBlock) focusLater(guideBlockDomId(previousBlock.key), "end");
    else if (nextBlock) focusLater(guideBlockDomId(nextBlock.key), "start");
    else focusLater(guideSectionHeadingId(sectionKey), "start");
  }

  function removeSectionWithUndo(sectionKey: string) {
    const located = locateSection(latestSectionsRef.current, sectionKey);
    if (!located) return;
    const previousSection = latestSectionsRef.current[located.index - 1];
    const nextSection = latestSectionsRef.current[located.index + 1];
    const neighborSection = previousSection ?? nextSection;
    onSectionsChange((current) => removeSection(current, sectionKey));
    withUndo("admin:guideWorkspace.section.removedToast", (current) =>
      restoreSection(current, located.index, located.section),
    );
    if (neighborSection) {
      focusLater(guideSectionHeadingId(neighborSection.key), "start");
    }
  }

  function pickSlashOption(
    sectionKey: string,
    blockKey: string,
    optionId: string,
  ) {
    if (optionId === NEW_SECTION_OPTION_ID) {
      const section = newDraftSection("section");
      onSectionsChange((current) =>
        insertSectionAfter(
          removeBlock(current, sectionKey, blockKey),
          sectionKey,
          section,
        ),
      );
      focusLater(guideSectionHeadingId(section.key), "start");
      return;
    }
    const nextKey = createDraftKey();
    onSectionsChange((current) =>
      convertBlock(current, sectionKey, blockKey, optionId as GuideBlockKind, {
        nextKey,
        shouldClear: true,
      }),
    );
    focusLater(guideBlockDomId(nextKey), "start");
  }

  return {
    renameSection: (sectionKey, heading) =>
      onSectionsChange((current) =>
        renameSection(current, sectionKey, heading),
      ),
    setSectionAnchor: (sectionKey, anchor) =>
      onSectionsChange((current) =>
        setSectionAnchor(current, sectionKey, anchor),
      ),
    moveSection: moveSectionAndFocus,
    removeSection: removeSectionWithUndo,
    appendSection,
    appendBlock,
    addBlockToSection,
    moveBlock: moveBlockAndFocus,
    removeBlock: removeBlockWithUndo,
    pickSlashOption,
  };
}
