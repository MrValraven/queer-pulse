import { useEffect, useRef, useState, type DragEvent } from "react";
import { FiChevronDown, FiChevronUp, FiMenu } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { countSectionWords } from "./guideCardChip";
import type { DraftSection } from "./guideDraft";
import { translationFlags } from "./guideTranslation";
import styles from "./GuideRail.module.css";

/**
 * The sections of the language being edited: jump to one, reorder by drag
 * (following `RunningOrderTab`) or with Move up/down, and see which PT
 * sections still need translating.
 */
export function GuideOutline({
  sections,
  englishSections,
  activeSectionKey,
  onJump,
  onReorder,
}: {
  sections: DraftSection[];
  englishSections: DraftSection[] | null;
  activeSectionKey: string | null;
  onJump: (sectionKey: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}) {
  const { t } = useTranslation();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [moveAnnouncement, setMoveAnnouncement] = useState("");
  const announcementFrameRef = useRef(0);
  const flags = englishSections
    ? translationFlags(englishSections, sections)
    : null;
  const sectionName = (section: DraftSection) =>
    section.heading.trim() || t("admin:guideWorkspace.outline.untitledSection");

  useEffect(
    () => () => window.cancelAnimationFrame(announcementFrameRef.current),
    [],
  );

  /** Clears the live region, then writes it on the next frame, so the text
   *  always changes and an identical repeat move is still announced. */
  function announceMove(section: string, position: number) {
    const total = sections.length;
    window.cancelAnimationFrame(announcementFrameRef.current);
    setMoveAnnouncement("");
    announcementFrameRef.current = window.requestAnimationFrame(() => {
      setMoveAnnouncement(
        t("admin:guideWorkspace.outline.moved", { section, position, total }),
      );
    });
  }

  function applyMove(fromIndex: number, toIndex: number) {
    const moved = sections[fromIndex];
    if (!moved || toIndex < 0 || toIndex >= sections.length) return;
    onReorder(fromIndex, toIndex);
    announceMove(sectionName(moved), toIndex + 1);
  }

  function handleDragStart(sourceIndex: number) {
    return (event: DragEvent<HTMLLIElement>) => {
      setDraggedIndex(sourceIndex);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(sourceIndex));
    };
  }

  function handleDragOver(event: DragEvent<HTMLLIElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDrop(targetIndex: number) {
    return (event: DragEvent<HTMLLIElement>) => {
      event.preventDefault();
      // Only a row dragged from this outline moves: a dropped file or text
      // selection has no source row.
      if (draggedIndex === null) return;
      const sourceIndex = draggedIndex;
      setDraggedIndex(null);
      if (sourceIndex === targetIndex) return;
      applyMove(sourceIndex, targetIndex);
    };
  }

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>
        {t("admin:guideWorkspace.outline.title")}
      </h2>
      {sections.length === 0 ? (
        <p className={styles.panelText}>
          {t("admin:guideWorkspace.outline.empty")}
        </p>
      ) : (
        <ol className={styles.outline}>
          {sections.map((section, index) => {
            const flag = flags?.flagsByPtKey[section.key];
            const name = sectionName(section);
            return (
              <li
                key={section.key}
                className={styles.outlineRow}
                data-active={
                  section.key === activeSectionKey ? "true" : undefined
                }
                data-drag={draggedIndex === index ? "true" : undefined}
                draggable
                onDragStart={handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={handleDrop(index)}
                onDragEnd={() => setDraggedIndex(null)}
              >
                <FiMenu aria-hidden className={styles.dragHandle} />
                <Button
                  variant="ghost"
                  size="sm"
                  className={styles.outlineJump}
                  onClick={() => onJump(section.key)}
                >
                  <span className={styles.outlineName}>{name}</span>
                  <span className={styles.outlineWords}>
                    {t("admin:guideWorkspace.outline.words", {
                      count: countSectionWords([section]),
                    })}
                  </span>
                </Button>
                {flag && (
                  <span className={styles.outlineFlag}>
                    {t(`admin:guideWorkspace.outline.flag.${flag}`)}
                  </span>
                )}
                <Button
                  variant="icon"
                  size="sm"
                  aria-label={t("admin:guideWorkspace.outline.moveUp", {
                    section: name,
                  })}
                  disabled={index === 0}
                  onClick={() => applyMove(index, index - 1)}
                >
                  <FiChevronUp aria-hidden />
                </Button>
                <Button
                  variant="icon"
                  size="sm"
                  aria-label={t("admin:guideWorkspace.outline.moveDown", {
                    section: name,
                  })}
                  disabled={index === sections.length - 1}
                  onClick={() => applyMove(index, index + 1)}
                >
                  <FiChevronDown aria-hidden />
                </Button>
              </li>
            );
          })}
        </ol>
      )}
      {flags && flags.missingEnglishSections.length > 0 && (
        <p className={styles.panelWarning}>
          {t("admin:guideWorkspace.outline.missing", {
            sections: flags.missingEnglishSections.map(sectionName).join(", "),
          })}
        </p>
      )}
      <p className={styles.visuallyHidden} aria-live="polite">
        {moveAnnouncement}
      </p>
    </section>
  );
}
