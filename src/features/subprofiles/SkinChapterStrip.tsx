import type { RefObject } from "react";
import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinChapterDescriptor } from "./skinBlockFields.data";
import { chapterFill } from "./skinChapterFill";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import styles from "./SkinChapterEditor.module.css";

/**
 * The chaptered editor's chapter map: every chapter at once in a three-column
 * grid, each cell with its numeral, title and what is left ("3 to fill"), or a
 * jade check once every visible field is filled. The zero-height anchor above
 * it is where a chapter switch scrolls back to.
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

  return (
    <>
      <div ref={anchorRef} className={styles.anchor} aria-hidden />
      <nav
        className={styles.strip}
        aria-label={t("subprofiles:skinChapter.navLabel")}
      >
        <ol className={styles.stripList}>
          {chapters.map((chapter, index) => {
            const { filled, total } = chapterFill(chapter, editor, chapters);
            const remaining = total - filled;
            const isComplete = remaining <= 0;
            const title = t(chapter.titleKey);
            const toFill = t("subprofiles:skinChapter.toFill", {
              count: remaining,
            });
            const status = isComplete
              ? t("subprofiles:skinChapter.fillComplete")
              : toFill;
            return (
              <li key={chapter.key}>
                <button
                  type="button"
                  className={styles.chip}
                  aria-current={index === activeIndex ? "step" : undefined}
                  aria-label={t("subprofiles:skinChapter.chipLabel", {
                    title,
                    status,
                  })}
                  onClick={() => onSelect(chapter.key)}
                >
                  <span className={styles.chipHead}>
                    <span className={styles.numeral}>{index + 1}</span>
                    {isComplete ? (
                      <span className={`${styles.chipFill} ${styles.chipDone}`}>
                        <FiCheck size={15} aria-hidden />
                      </span>
                    ) : (
                      <span className={styles.chipFill}>{toFill}</span>
                    )}
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
