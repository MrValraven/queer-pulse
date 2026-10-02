import { useEffect, useRef, type RefObject } from "react";
import { useSearchParams } from "react-router-dom";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import type { SkinChapterDescriptor } from "./skinBlockFields.data";
import { soleListSection } from "./skinChapterFill";
import { useSubprofileEditorContext } from "./subprofileEditorContext";

const PAGE_BLOCKS_PANE = "skinBlocks";
const FOCUS_ATTRIBUTE = "data-preview-focus";
/** Room left above the focused block, in the dock's own pixels. */
const SCROLL_MARGIN = 16;

/**
 * The preview anchors of a chapter: `section:<name>` for each section list
 * it edits and `block:<key>` for each `SkinData` block. The page tree marks
 * the matching elements with `data-preview-anchor` (`SubprofileSections`,
 * `SubprofileSpotlight`, the Quest "At the table" panel). A chapter whose
 * blocks carry no mark yet simply leaves the preview where it is.
 */
export function chapterPreviewAnchors(
  chapter: SkinChapterDescriptor,
): string[] {
  const anchors = new Set<string>();
  for (const group of chapter.groups) {
    for (const control of group.controls) {
      if (control.path.startsWith("section:")) anchors.add(control.path);
      else anchors.add(`block:${control.path.split(".")[0]}`);
    }
  }
  return [...anchors];
}

function anchorSelector(anchors: string[]): string {
  return anchors
    .map((anchor) => `[data-preview-anchor="${CSS.escape(anchor)}"]`)
    .join(",");
}

export interface PreviewChapterFocus {
  /** The chapter on screen while Page blocks is open, else undefined. */
  chapter: SkinChapterDescriptor | undefined;
  /** The chapter is one section list with nothing in it, so the page shows
   *  nothing for it yet. */
  isChapterEmpty: boolean;
}

/**
 * Points the docked preview at what the owner is editing. While Page blocks
 * is open, the blocks of the chapter on screen are marked
 * `data-preview-focus` (an accent ring in `persona-editor.css`) and the
 * preview scrolls to the first of them whenever the chapter changes, so a
 * DM on "Sessions" sees the Sessions list rather than the top of the page.
 *
 * The page re-renders on every keystroke and may remount a block (a list
 * emptied and refilled), so a MutationObserver re-marks the blocks; only a
 * chapter change, or the chapter's first block appearing, scrolls.
 */
export function usePreviewChapterFocus({
  scrollRef,
  pageRef,
}: {
  scrollRef: RefObject<HTMLDivElement | null>;
  pageRef: RefObject<HTMLDivElement | null>;
}): PreviewChapterFocus {
  const [searchParams] = useSearchParams();
  const { skinBlocks } = useSubprofileEditorContext();
  const isPageBlocks = searchParams.get("pane") === PAGE_BLOCKS_PANE;
  const requestedKey = searchParams.get("chapter");
  const chapters = skinBlocks.chapters;
  const chapter = isPageBlocks
    ? (chapters.find((candidate) => candidate.key === requestedKey) ??
      chapters[0])
    : undefined;
  const anchorKey = chapter ? chapterPreviewAnchors(chapter).join(" ") : "";
  // The anchors last scrolled to: a chapter scrolls once, and coming back
  // to it from another chapter scrolls again.
  const hasScrolledRef = useRef<string | null>(null);
  const isFirstScrollRef = useRef(true);

  useEffect(() => {
    const scroller = scrollRef.current;
    const page = pageRef.current;
    if (!scroller || !page) return;
    const anchors = anchorKey ? anchorKey.split(" ") : [];

    const mark = () => {
      const matched =
        anchors.length > 0
          ? Array.from(page.querySelectorAll(anchorSelector(anchors)))
          : [];
      page.querySelectorAll(`[${FOCUS_ATTRIBUTE}]`).forEach((element) => {
        if (!matched.includes(element))
          element.removeAttribute(FOCUS_ATTRIBUTE);
      });
      matched.forEach((element) => {
        if (!element.hasAttribute(FOCUS_ATTRIBUTE)) {
          element.setAttribute(FOCUS_ATTRIBUTE, "");
        }
      });
      const [first] = matched;
      if (!first || hasScrolledRef.current === anchorKey) return;
      hasScrolledRef.current = anchorKey;
      const top =
        first.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop -
        SCROLL_MARGIN;
      // The first placement jumps, like a deep link; a switch glides.
      const behavior =
        isFirstScrollRef.current || prefersReducedMotionNow()
          ? "instant"
          : "smooth";
      isFirstScrollRef.current = false;
      scroller.scrollTo({ top: Math.max(0, top), behavior });
    };

    let frame = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(mark);
    });
    // Attribute changes are left out: `mark` writes one itself.
    observer.observe(page, { childList: true, subtree: true });
    mark();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [anchorKey, scrollRef, pageRef]);

  const listSection = chapter ? soleListSection(chapter) : undefined;
  const isChapterEmpty =
    listSection !== undefined && skinBlocks.sectionRowCount(listSection) === 0;
  return { chapter, isChapterEmpty };
}
