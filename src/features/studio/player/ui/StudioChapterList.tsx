import type { StudioChapterView } from "../../api/studio.adapters";
import styles from "./StudioChapterList.module.css";

/** Chapter buttons: time, title, artist. Shared by Now playing, the track
 *  page and the release page (spec 7.6). */
export function StudioChapterList({
  chapters,
  activeIndex,
  onSelect,
  label,
}: {
  chapters: readonly StudioChapterView[];
  activeIndex: number | null;
  onSelect: (chapter: StudioChapterView) => void;
  label: string;
}) {
  return (
    <ol className={styles.list} aria-label={label}>
      {chapters.map((chapter, index) => (
        <li key={chapter.startSeconds}>
          <button
            type="button"
            className={styles.item}
            aria-current={index === activeIndex ? "true" : undefined}
            onClick={() => onSelect(chapter)}
          >
            <span className={styles.time}>{chapter.timeLabel}</span>
            <span className={styles.titles}>
              <span className={styles.title}>{chapter.title}</span>
              {chapter.artist && (
                <span className={styles.artist}>{chapter.artist}</span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
