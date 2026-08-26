import { useEffect, useRef, useState } from "react";
import { FiEdit3, FiLock, FiPlus } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useConnectionNote } from "./api/useConnectionNote";
import type { ConnectionView } from "./connections.data";
import styles from "./ConnectionsPage.module.css";

/** How long a note may be, matching the server's own bound. */
const NOTE_MAX_LENGTH = 500;

/**
 * The viewer's private note about one connection.
 *
 * This is the half of an address book a platform usually forgets: "met at the
 * harm-reduction workshop, works nights". It belongs to whoever wrote it, and
 * the other member never sees it. That is enforced on the server (a note is
 * only ever read back under its own author's id), so this component has no
 * visibility rule of its own to get wrong.
 */
export function ConnectionNoteEditor({ view }: { view: ConnectionView }) {
  const { t } = useTranslation();
  const { note, saveNote } = useConnectionNote(
    view.slug,
    view.meta.id,
    view.meta.note,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) textareaRef.current?.focus();
  }, [isEditing]);

  function startEditing() {
    setDraft(note);
    setIsEditing(true);
  }

  function handleSave() {
    if (isSaving) return;
    setIsSaving(true);
    void saveNote(draft).then((isSaved) => {
      setIsSaving(false);
      if (isSaved) setIsEditing(false);
    });
  }

  if (isEditing) {
    return (
      <div className={styles.noteEditor}>
        <textarea
          ref={textareaRef}
          className={styles.noteInput}
          value={draft}
          maxLength={NOTE_MAX_LENGTH}
          rows={3}
          disabled={isSaving}
          onChange={(event) => setDraft(event.target.value)}
          aria-label={t("connect:note.inputAria", { name: view.name })}
          placeholder={t("connect:note.placeholder")}
        />
        <p className={styles.notePrivacy}>
          <FiLock aria-hidden /> {t("connect:note.privacy")}
        </p>
        <div className={styles.noteActions}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isSaving}
            onClick={() => setIsEditing(false)}
          >
            {t("connect:note.cancel")}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? t("connect:note.saving") : t("connect:note.save")}
          </Button>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <button
        type="button"
        className={styles.noteAdd}
        onClick={startEditing}
        aria-label={t("connect:note.addAria", { name: view.name })}
      >
        <FiPlus aria-hidden /> {t("connect:note.add")}
      </button>
    );
  }

  return (
    <div className={styles.noteRow}>
      <p className={styles.noteBody}>
        <FiLock aria-hidden className={styles.noteLock} />
        <span>{note}</span>
      </p>
      <button
        type="button"
        className={styles.noteEdit}
        onClick={startEditing}
        aria-label={t("connect:note.editAria", { name: view.name })}
      >
        <FiEdit3 aria-hidden />
      </button>
    </div>
  );
}
