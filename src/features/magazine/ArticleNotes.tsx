import { useState } from "react";
import { FiAlertCircle, FiEdit3, FiX } from "react-icons/fi";
import { IconButton } from "../../shared/components/ui";
import { formatDate } from "../../shared/lib/date";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ArticleCorrection } from "./data/articles";
import styles from "./ArticleNotes.module.css";

/**
 * CON-06 — the care-tab content notes, shown to the reader they are for.
 *
 * A piece cannot pass the desk's publish gate without at least one note, and
 * until now the reader never saw a single one. Two decisions shape this block:
 * it is open on arrival, because a note hidden behind a click cannot warn
 * anybody; and it can be dismissed, because a reader who has taken it in should
 * be able to clear it and read. The dismissal is per visit on purpose, so a
 * note is never silently withheld from someone opening the piece fresh.
 *
 * It sits ABOVE the body, before the first line of prose.
 */
export function ArticleContentNotes({ notes }: { notes: string[] }) {
  const { t } = useTranslation();
  const [isDismissed, setIsDismissed] = useState(false);

  const visibleNotes = notes.map((note) => note.trim()).filter(Boolean);
  if (visibleNotes.length === 0 || isDismissed) return null;

  return (
    <aside className={styles.notes} aria-labelledby="article-content-notes">
      <span className={styles.notesIcon} aria-hidden>
        <FiAlertCircle />
      </span>
      <div className={styles.notesBody}>
        <h2 className={styles.notesHeading} id="article-content-notes">
          {t("magazine:article.contentNotesHeading")}
        </h2>
        <ul className={styles.notesList}>
          {visibleNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
      <IconButton
        className={styles.notesDismiss}
        size="sm"
        aria-label={t("magazine:article.contentNotesDismissAria")}
        onClick={() => setIsDismissed(true)}
      >
        <FiX aria-hidden />
      </IconButton>
    </aside>
  );
}

/**
 * CON-02 — published corrections, as a dated note at the foot of the piece.
 *
 * The desk tells its editors "A correction is published as a dated note at the
 * foot of the piece. We never edit silently." The rows have been persisting
 * since the After tab shipped; this is the half of that promise the reader was
 * missing. Newest first, exactly as the backend orders them.
 */
export function ArticleCorrections({
  corrections,
}: {
  corrections: ArticleCorrection[];
}) {
  const { t, language } = useTranslation();
  if (corrections.length === 0) return null;

  return (
    <aside className={styles.corrections} aria-labelledby="article-corrections">
      <h2 className={styles.correctionsHeading} id="article-corrections">
        <span className={styles.correctionsIcon} aria-hidden>
          <FiEdit3 />
        </span>
        {t("magazine:article.correctionsHeading")}
      </h2>
      <ol className={styles.correctionsList}>
        {corrections.map((correction) => (
          <li key={correction.id} className={styles.correction}>
            <time
              className={styles.correctionDate}
              dateTime={correction.publishedOn}
            >
              {formatDate(correction.publishedOn, language)}
            </time>
            <p className={styles.correctionText}>{correction.text}</p>
          </li>
        ))}
      </ol>
    </aside>
  );
}
