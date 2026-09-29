import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinChapterDescriptor } from "./skinBlockFields.data";
import { useSkinChapter } from "./useSkinChapter";
import styles from "./EditorPaneChapters.module.css";

/**
 * The Page blocks chapters, listed under that pane's row in the desktop rail
 * (`EditorRail`) and in the mobile pane sheet (`EditorPaneSheet`): numeral and
 * title, in the chapter map's order. So a DJ sees "Mixes" in the navigation
 * before guessing which pane holds it.
 *
 * Shown at all times, whichever pane is open: the point is that an owner
 * finds their sections without opening Page blocks first. The active chapter
 * is marked only while Page blocks is the open pane, since the `?chapter=`
 * the URL keeps on another pane is not on screen.
 *
 * Each row asks the caller to open the pane and the chapter together
 * (`useEditorPane`'s `selectPane(pane, chapterKey)`), one history entry per
 * click. In the rail, clicking the chapter already on screen does nothing, as
 * the chapter map does. In the sheet it still reports the choice, so the
 * sheet closes the way a tap on the current pane closes it.
 *
 * On the folded rail (`isFolded`) the list shrinks to nothing and is `inert`,
 * so the icon strip keeps one icon per pane and no hidden row takes focus.
 */
export function EditorPaneChapters({
  chapters,
  isPaneActive,
  variant,
  isFolded = false,
  onSelect,
}: {
  chapters: SkinChapterDescriptor[];
  isPaneActive: boolean;
  variant: "rail" | "sheet";
  isFolded?: boolean;
  onSelect: (chapterKey: string) => void;
}) {
  const { t } = useTranslation();
  const { activeChapter } = useSkinChapter(chapters);
  const activeChapterKey = isPaneActive ? activeChapter?.key : undefined;

  const choose = (chapterKey: string) => {
    const isAlreadyOpen = chapterKey === activeChapterKey;
    if (isAlreadyOpen && variant === "rail") return;
    onSelect(chapterKey);
  };

  return (
    <div
      className={styles.fold}
      data-variant={variant}
      data-folded={isFolded ? "true" : "false"}
      inert={isFolded}
    >
      <div className={styles.clip}>
        <ol
          className={styles.list}
          aria-label={t("subprofiles:skinChapter.navLabel")}
        >
          {chapters.map((chapter, index) => {
            const isCurrent = chapter.key === activeChapterKey;
            return (
              <li key={chapter.key}>
                <button
                  type="button"
                  className={styles.row}
                  aria-current={isCurrent ? "step" : undefined}
                  onClick={() => choose(chapter.key)}
                >
                  <span className={styles.numeral} aria-hidden>
                    {index + 1}
                  </span>
                  <span className={styles.title}>{t(chapter.titleKey)}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
