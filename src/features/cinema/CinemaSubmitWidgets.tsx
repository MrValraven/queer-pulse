import { useState } from "react";
import { FiImage, FiPlus, FiX } from "react-icons/fi";
import type { SubmitForm } from "./useSubmitForm";
import styles from "./CinemaSubmitPage.module.css";

/** Editable list of content notes (topic · detail · timecode). */
export function ContentNotesBuilder({ form }: { form: SubmitForm }) {
  const { draft, setNote, addNote, removeNote } = form;
  return (
    <div className={styles.cnBuilder}>
      <div className={styles.cnbHead}>Add one row per topic — be specific</div>
      {draft.notes.map((n, i) => (
        <div key={i} className={styles.cnEntry}>
          <input
            className={styles.cnInput}
            placeholder="e.g. Grief"
            value={n.topic}
            onChange={(e) => setNote(i, { topic: e.target.value })}
            aria-label={`Content note ${i + 1} topic`}
          />
          <input
            className={styles.cnInput}
            placeholder="e.g. Discussion of bereavement and a partner's death"
            value={n.detail}
            onChange={(e) => setNote(i, { detail: e.target.value })}
            aria-label={`Content note ${i + 1} detail`}
          />
          <input
            className={styles.cnInput}
            placeholder="Timecode (opt.)"
            value={n.timecode}
            onChange={(e) => setNote(i, { timecode: e.target.value })}
            aria-label={`Content note ${i + 1} timecode`}
          />
          <button
            type="button"
            className={styles.cnRemove}
            onClick={() => removeNote(i)}
            disabled={draft.notes.length === 1}
            aria-label={`Remove content note ${i + 1}`}
          >
            <FiX size={16} aria-hidden />
          </button>
        </div>
      ))}
      <button type="button" className={styles.cnAdd} onClick={addNote}>
        <FiPlus size={16} aria-hidden />
        Add another content note
      </button>
    </div>
  );
}

/** Click-to-"upload" poster dropzone. Simulated — stores a filename only. */
export function PosterUpload({ form }: { form: SubmitForm }) {
  const { draft, set } = form;
  const [n, setN] = useState(1);
  const fill = () => {
    set("poster", `poster-${n}.jpg`);
    setN((v) => v + 1);
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
        {done ? `${draft.poster} attached` : "Drop your poster here"}
      </div>
      <div className={styles.uzSub}>
        {done
          ? "Click to replace"
          : "Or click to browse · JPG, PNG, TIFF · Max 50 MB"}
      </div>
      <div className={styles.uzNote}>
        We will not crop or filter your poster without asking.
      </div>
    </button>
  );
}
