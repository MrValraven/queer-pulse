import { useState } from "react";
import { FiImage, FiPlus, FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SubmitForm } from "./useSubmitForm";
import styles from "./CinemaSubmitPage.module.css";

/** Editable list of content notes (topic · detail · timecode). */
export function ContentNotesBuilder({ form }: { form: SubmitForm }) {
  const { t } = useTranslation();
  const { draft, setNote, addNote, removeNote } = form;
  return (
    <div className={styles.cnBuilder}>
      <div className={styles.cnbHead}>
        {t("cinema:submit.widgets.contentNotes.head")}
      </div>
      {draft.notes.map((note, noteIndex) => (
        <div key={noteIndex} className={styles.cnEntry}>
          <input
            className={styles.cnInput}
            placeholder={t(
              "cinema:submit.widgets.contentNotes.topicPlaceholder",
            )}
            value={note.topic}
            onChange={(e) => setNote(noteIndex, { topic: e.target.value })}
            aria-label={t("cinema:submit.widgets.contentNotes.topicAriaLabel", {
              index: noteIndex + 1,
            })}
          />
          <input
            className={styles.cnInput}
            placeholder={t(
              "cinema:submit.widgets.contentNotes.detailPlaceholder",
            )}
            value={note.detail}
            onChange={(e) => setNote(noteIndex, { detail: e.target.value })}
            aria-label={t(
              "cinema:submit.widgets.contentNotes.detailAriaLabel",
              { index: noteIndex + 1 },
            )}
          />
          <input
            className={styles.cnInput}
            placeholder={t(
              "cinema:submit.widgets.contentNotes.timecodePlaceholder",
            )}
            value={note.timecode}
            onChange={(e) => setNote(noteIndex, { timecode: e.target.value })}
            aria-label={t(
              "cinema:submit.widgets.contentNotes.timecodeAriaLabel",
              { index: noteIndex + 1 },
            )}
          />
          <button
            type="button"
            className={styles.cnRemove}
            onClick={() => removeNote(noteIndex)}
            disabled={draft.notes.length === 1}
            aria-label={t(
              "cinema:submit.widgets.contentNotes.removeAriaLabel",
              { index: noteIndex + 1 },
            )}
          >
            <FiX size={16} aria-hidden />
          </button>
        </div>
      ))}
      <button type="button" className={styles.cnAdd} onClick={addNote}>
        <FiPlus size={16} aria-hidden />
        {t("cinema:submit.widgets.contentNotes.addCta")}
      </button>
    </div>
  );
}

/** Click-to-"upload" poster dropzone. Simulated — stores a filename only. */
export function PosterUpload({ form }: { form: SubmitForm }) {
  const { t } = useTranslation();
  const { draft, set } = form;
  const [fillCount, setFillCount] = useState(1);
  const fill = () => {
    set("poster", `poster-${fillCount}.jpg`);
    setFillCount((previousCount) => previousCount + 1);
  };
  const done = Boolean(draft.poster);
  return (
    <button
      type="button"
      onClick={fill}
      className={[styles.uploadZone, done && styles.uzFilled]
        .filter(Boolean)
        .join(" ")}
    >
      <FiImage size={32} aria-hidden />
      <div className={styles.uzTitle}>
        {done
          ? t("cinema:submit.widgets.poster.attached", {
              filename: draft.poster ?? "",
            })
          : t("cinema:submit.widgets.poster.dropTitle")}
      </div>
      <div className={styles.uzSub}>
        {done
          ? t("cinema:submit.widgets.poster.replaceHint")
          : t("cinema:submit.widgets.poster.browseHint")}
      </div>
      <div className={styles.uzNote}>
        {t("cinema:submit.widgets.poster.note")}
      </div>
    </button>
  );
}
