import { useState } from "react";
import {
  CREATE_GATHERING_CHAPTERS,
  REVIEW_CHAPTER_INDEX,
  chapterHeadId,
  chapterSectionId,
} from "./createGathering.data";
import {
  afterRender,
  isChapterComplete,
  jumpToAnchor,
  revealSection,
  revealSectionIfAbove,
} from "./createGatheringChapters";
import type { GatheringForm } from "./useGatheringForm";
import styles from "./CreateGatheringShell.module.css";

function noChapterFlags(): boolean[] {
  return CREATE_GATHERING_CHAPTERS.map(() => false);
}

function withChapterFlag(flags: boolean[], chapterIndex: number): boolean[] {
  return flags.map((flag, index) => (index === chapterIndex ? true : flag));
}

/**
 * Which chapter is open, and what the host has done in each.
 *
 * One chapter is open at a time, and pressing an open head closes it.
 * Continue checks the chapter's gate (`createGatheringChapters.ts`): unmet, it
 * lists what is missing and reports back so the button shakes; met, it opens
 * the next chapter with focus on its head. Continue on Care opens the review
 * chapter, which has no Continue of its own: it ends with Publish.
 */
export function useCreateGatheringChapterFlow(form: GatheringForm) {
  const [openChapterIndex, setOpenChapterIndex] = useState<number | null>(0);
  const [continuedChapters, setContinuedChapters] = useState(noChapterFlags);
  const [attemptedChapters, setAttemptedChapters] = useState(noChapterFlags);
  const [isOpeningAfterResume, setIsOpeningAfterResume] = useState(false);
  // A resume restores the form in the same batch that sets this flag, so this
  // render already reads the restored values: open the first of the five
  // asking chapters still missing something, or the review once all five are
  // complete. Every asking chapter the draft already completes counts as
  // continued, so its head shows the jade tick and Edit.
  if (isOpeningAfterResume) {
    setIsOpeningAfterResume(false);
    setContinuedChapters((previous) =>
      previous.map(
        (hasBeenContinued, chapterIndex) =>
          hasBeenContinued ||
          (chapterIndex !== REVIEW_CHAPTER_INDEX &&
            isChapterComplete(form, chapterIndex)),
      ),
    );
    const firstIncompleteIndex = CREATE_GATHERING_CHAPTERS.findIndex(
      (_chapter, chapterIndex) =>
        chapterIndex !== REVIEW_CHAPTER_INDEX &&
        !isChapterComplete(form, chapterIndex),
    );
    setOpenChapterIndex(
      firstIncompleteIndex === -1 ? REVIEW_CHAPTER_INDEX : firstIncompleteIndex,
    );
  }

  /** Open a chapter from its head, or close it when it is already open. A
   *  long chapter closing above can leave the one just opened starting above
   *  the viewport, so its top is brought back into view. */
  const toggleChapter = (chapterIndex: number) => {
    const isOpening = openChapterIndex !== chapterIndex;
    setOpenChapterIndex(isOpening ? chapterIndex : null);
    if (isOpening) {
      afterRender(() =>
        revealSectionIfAbove(
          chapterSectionId(chapterIndex),
          chapterHeadId(chapterIndex),
        ),
      );
    }
  };

  /** Open a chapter, bring its top into view and put focus on its head. For
   *  controls that hide themselves by opening another chapter (Continue, a
   *  review group's Edit, the mobile bar's Review). */
  const openChapter = (chapterIndex: number) => {
    setOpenChapterIndex(chapterIndex);
    afterRender(() =>
      revealSection(
        chapterSectionId(chapterIndex),
        chapterHeadId(chapterIndex),
      ),
    );
  };

  const continueFromChapter = (chapterIndex: number): boolean => {
    if (!isChapterComplete(form, chapterIndex)) {
      setAttemptedChapters((previous) =>
        withChapterFlag(previous, chapterIndex),
      );
      return false;
    }
    setContinuedChapters((previous) => withChapterFlag(previous, chapterIndex));
    const nextIndex = Math.min(
      chapterIndex + 1,
      CREATE_GATHERING_CHAPTERS.length - 1,
    );
    openChapter(nextIndex);
    return true;
  };

  /** Open a chapter and send the host to one of its fields, flashing it. */
  const openChapterAtField = (chapterIndex: number, anchor: string) => {
    setOpenChapterIndex(chapterIndex);
    afterRender(() => jumpToAnchor(anchor, styles.gateFlash));
  };

  return {
    openChapterIndex,
    continuedChapters,
    attemptedChapters,
    toggleChapter,
    openChapter,
    continueFromChapter,
    openChapterAtField,
    openAfterResume: () => setIsOpeningAfterResume(true),
  };
}

export type CreateGatheringChapterFlow = ReturnType<
  typeof useCreateGatheringChapterFlow
>;
