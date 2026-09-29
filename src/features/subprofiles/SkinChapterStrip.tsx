import { useEffect, useRef, type RefObject } from "react";
import { FiCheck } from "react-icons/fi";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinChapterDescriptor } from "./skinBlockFields.data";
import { chapterFill, soleListSection } from "./skinChapterFill";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import styles from "./SkinChapterEditor.module.css";

interface ChipStatus {
  /** The visible status line; none for a filled chapter of fields, which
   *  shows the jade check alone. */
  text: string | undefined;
  /** What a screen reader hears after the title. */
  spoken: string;
  isDone: boolean;
}

/** A chapter's status on its chip. A list chapter counts its items ("Empty",
 *  "3 items", "3 photos"); a chapter of fields counts what is left ("3 to
 *  fill") until every visible field is filled. */
function chipStatus(
  chapter: SkinChapterDescriptor,
  editor: SubprofileSkinBlocksEditor,
  chapters: SkinChapterDescriptor[],
  t: TFunction,
): ChipStatus {
  const listSection = soleListSection(chapter);
  if (listSection !== undefined) {
    const rowCount = editor.sectionRowCount(listSection);
    const countKey =
      listSection === "gallery"
        ? "subprofiles:skinChapter.photoCount"
        : "subprofiles:skinChapter.itemCount";
    const text =
      rowCount === 0
        ? t("subprofiles:skinChapter.listEmpty")
        : t(countKey, { count: rowCount });
    return { text, spoken: text, isDone: rowCount > 0 };
  }
  const { filled, total } = chapterFill(chapter, editor, chapters);
  const remaining = total - filled;
  if (remaining <= 0) {
    return {
      text: undefined,
      spoken: t("subprofiles:skinChapter.fillComplete"),
      isDone: true,
    };
  }
  const text = t("subprofiles:skinChapter.toFill", { count: remaining });
  return { text, spoken: text, isDone: false };
}

/** Brings the active chip into the middle of the chapter row when the row
 *  scrolls sideways (phones). It scrolls only the row, so the chapter
 *  switch's own scroll back to the map is left undisturbed. */
function scrollChipIntoRow(list: HTMLElement, behavior: ScrollBehavior) {
  const activeChip = list.querySelector<HTMLElement>('[aria-current="step"]');
  if (!activeChip || list.scrollWidth <= list.clientWidth) return;
  const listRect = list.getBoundingClientRect();
  const chipRect = activeChip.getBoundingClientRect();
  const chipStart = chipRect.left - listRect.left + list.scrollLeft;
  list.scrollTo({
    left: chipStart - (list.clientWidth - chipRect.width) / 2,
    behavior,
  });
}

/**
 * The chaptered editor's chapter map. From tablet width up, every chapter at
 * once in a grid of three per row (the last row shares its width, so no chip
 * is left alone), each cell with its numeral, title and status. On a phone,
 * one sideways row of compact chips (numeral, title, and a dot while
 * something is left), with the active chip kept in view. The zero-height
 * anchor above it is where a chapter switch scrolls back to.
 */
export function SkinChapterStrip({
  chapters,
  activeIndex,
  editor,
  onSelect,
  anchorRef,
}: {
  chapters: SkinChapterDescriptor[];
  activeIndex: number;
  editor: SubprofileSkinBlocksEditor;
  onSelect: (key: string) => void;
  anchorRef: RefObject<HTMLDivElement | null>;
}) {
  const { t } = useTranslation();
  const listRef = useRef<HTMLOListElement>(null);
  const hasPlacedRowRef = useRef(false);

  // The first placement jumps (a deep link to chapter 5 opens with it in
  // view); a switch glides unless motion is reduced.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const isFirstPlacement = !hasPlacedRowRef.current;
    hasPlacedRowRef.current = true;
    const shouldJump = isFirstPlacement || prefersReducedMotionNow();
    scrollChipIntoRow(list, shouldJump ? "auto" : "smooth");
  }, [activeIndex]);

  // `EditorPaneRouter` keeps every pane mounted and toggles the inactive
  // ones with the `hidden` attribute rather than unmounting them, so leaving
  // Page blocks for another pane and coming straight back never changes
  // `activeIndex` and the effect above never reruns. A hidden pane collapses
  // this row to zero width first, so a resize back to its real width is what
  // marks the return; re-run the placement then, jumping straight there.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let previousWidth = list.getBoundingClientRect().width;
    const resizeObserver = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? 0;
      if (previousWidth === 0 && width > 0 && hasPlacedRowRef.current) {
        scrollChipIntoRow(list, "auto");
      }
      previousWidth = width;
    });
    resizeObserver.observe(list);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <>
      <div ref={anchorRef} className={styles.anchor} aria-hidden />
      <nav
        className={styles.strip}
        aria-label={t("subprofiles:skinChapter.navLabel")}
      >
        <ol ref={listRef} className={styles.stripList}>
          {chapters.map((chapter, index) => {
            const title = t(chapter.titleKey);
            const status = chipStatus(chapter, editor, chapters, t);
            return (
              <li key={chapter.key}>
                <button
                  type="button"
                  className={styles.chip}
                  aria-current={index === activeIndex ? "step" : undefined}
                  aria-label={t("subprofiles:skinChapter.chipLabel", {
                    title,
                    status: status.spoken,
                  })}
                  onClick={() => onSelect(chapter.key)}
                >
                  <span className={styles.chipHead}>
                    <span className={styles.numeral}>{index + 1}</span>
                    <span
                      className={
                        status.isDone
                          ? `${styles.chipFill} ${styles.chipDone}`
                          : styles.chipFill
                      }
                    >
                      {status.isDone && <FiCheck size={15} aria-hidden />}
                      {status.text && (
                        <span className={styles.chipFillText}>
                          {status.text}
                        </span>
                      )}
                      {!status.isDone && (
                        <span className={styles.chipDot} aria-hidden />
                      )}
                    </span>
                  </span>
                  <span className={styles.chipTitle}>{title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
