import { useId, useRef } from "react";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  SkinChapterDescriptor,
  SkinChapterGroup,
} from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import {
  useChapterArrival,
  useSkinChapter,
  useSwitchBarOffset,
} from "./useSkinChapter";
import { SkinChapterStrip } from "./SkinChapterStrip";
import { SkinChapterGroupCard } from "./SkinChapterGroupCard";
import styles from "./SkinChapterEditor.module.css";

/** Groups gathered into cards: a group with no heading that follows another
 *  continues the previous card. A chapter's first group always opens one. */
function foldGroupsIntoCards(groups: SkinChapterGroup[]): SkinChapterGroup[][] {
  const cards: SkinChapterGroup[][] = [];
  for (const group of groups) {
    const currentCard = cards[cards.length - 1];
    if (currentCard && group.titleKey === undefined) currentCard.push(group);
    else cards.push([group]);
  }
  return cards;
}

/** Back to the previous chapter (absent on the first), on to the next one,
 *  named so the owner knows where it leads. The last chapter hands on to the
 *  publish pane ("Get it live"). */
function ChapterFooter({
  previousChapter,
  nextChapter,
  onSelect,
  onPublish,
}: {
  previousChapter: SkinChapterDescriptor | undefined;
  nextChapter: SkinChapterDescriptor | undefined;
  onSelect: (key: string) => void;
  onPublish: () => void;
}) {
  const { t } = useTranslation();
  const nextTitle = nextChapter
    ? t(nextChapter.titleKey)
    : t("subprofiles:editorRail.getItLive");

  return (
    <div className={styles.footer}>
      {previousChapter && (
        <Button
          variant="ghost"
          type="button"
          onClick={() => onSelect(previousChapter.key)}
        >
          {t("subprofiles:skinChapter.back")}
        </Button>
      )}
      <Button
        variant="primary"
        type="button"
        className={styles.footerNext}
        onClick={() => (nextChapter ? onSelect(nextChapter.key) : onPublish())}
      >
        {t("subprofiles:skinChapter.next", { title: nextTitle })}
        <FiArrowRight aria-hidden />
      </Button>
    </div>
  );
}

/**
 * The chaptered "Page blocks" editor (therapist today): a map of every
 * chapter, then the active chapter alone, held in `?chapter=`. Every control
 * writes the shared draft, so switching chapters never loses an edit, and all
 * of it saves with the global "Save all".
 *
 * A switch scrolls back up to the chapter map when it has scrolled away, and
 * moves focus to the chapter heading (`useChapterArrival`); the first render
 * does neither.
 */
export function SkinChapterEditor({
  editor,
}: {
  editor: SubprofileSkinBlocksEditor;
}) {
  const { t } = useTranslation();
  const chapters = editor.chapters;
  const { activeChapter, activeIndex, selectChapter, goToPublish } =
    useSkinChapter(chapters);
  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  useSwitchBarOffset(rootRef);
  useChapterArrival(activeChapter?.key, { anchorRef, headingRef });

  if (!activeChapter) return null;

  return (
    <div ref={rootRef} className={styles.editor}>
      <SkinChapterStrip
        chapters={chapters}
        activeIndex={activeIndex}
        editor={editor}
        onSelect={selectChapter}
        anchorRef={anchorRef}
      />
      <section
        key={activeChapter.key}
        className={styles.chapter}
        aria-labelledby={headingId}
      >
        <p className={styles.eyebrow}>
          {t("subprofiles:skinChapter.position", {
            index: activeIndex + 1,
            total: chapters.length,
          })}
        </p>
        <h3
          ref={headingRef}
          id={headingId}
          tabIndex={-1}
          className={styles.chapterTitle}
        >
          {t(activeChapter.titleKey)}
        </h3>
        <p className={styles.chapterLede}>{t(activeChapter.ledeKey)}</p>
        <div className={styles.groups}>
          {foldGroupsIntoCards(activeChapter.groups).map(
            (groups, cardIndex) => (
              <SkinChapterGroupCard
                key={`${activeChapter.key}-${cardIndex}`}
                groups={groups}
                editor={editor}
                chapters={chapters}
              />
            ),
          )}
        </div>
        <ChapterFooter
          previousChapter={chapters[activeIndex - 1]}
          nextChapter={chapters[activeIndex + 1]}
          onSelect={selectChapter}
          onPublish={goToPublish}
        />
      </section>
    </div>
  );
}
