import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Button, FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { JOIN_REQUEST_NOTE_MAX_LENGTH } from "../auth/api/joinRequest.api";
import styles from "./AdminVerifyDecided.module.css";

interface JoinRequestDeclineNoteEditorProps {
  /** The saved note, or "" when there is none. The draft starts from it. */
  initialNote: string;
  isSaving: boolean;
  /** The last save's failure, already in words, or null. */
  errorMessage: string | null;
  /** Called with the draft as typed; the hook trims it. "" clears the note. */
  onSave: (draft: string) => void;
  onCancel: () => void;
}

/**
 * The open editor for a declined request's staff note: one labelled textarea
 * with a live count against the backend's limit, then Save and Cancel.
 *
 * The draft lives here, so a failed save keeps every word the reviewer typed:
 * the parent only swaps in an error line and leaves this mounted. Saving an
 * emptied box is how a note is removed, so there is no separate delete.
 *
 * Focus lands in the textarea with the caret after the existing text, since
 * opening an existing note is nearly always to add to it. Escape cancels,
 * like the other inline editors in the admin.
 */
export function JoinRequestDeclineNoteEditor({
  initialNote,
  isSaving,
  errorMessage,
  onSave,
  onCancel,
}: JoinRequestDeclineNoteEditorProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(initialNote);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    const end = textarea.value.length;
    textarea.setSelectionRange(end, end);
  }, []);

  const isUnchanged = draft.trim() === initialNote.trim();
  const isSaveDisabled = isSaving || isUnchanged;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaveDisabled) return;
    onSave(draft);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Escape" || event.nativeEvent.isComposing) return;
    if (isSaving) return;
    event.preventDefault();
    event.stopPropagation();
    onCancel();
  }

  return (
    <form className={styles.staffNoteEditor} onSubmit={submit}>
      <FormField
        className={styles.staffNoteField}
        label={t("admin:members.verify.decided.note.label")}
        labelAside={`${draft.length}/${JOIN_REQUEST_NOTE_MAX_LENGTH}`}
        helper={t("admin:members.verify.decided.note.hint")}
      >
        <textarea
          ref={textareaRef}
          value={draft}
          rows={4}
          maxLength={JOIN_REQUEST_NOTE_MAX_LENGTH}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </FormField>
      <div className={styles.staffNoteActions}>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSaveDisabled}
        >
          {isSaving
            ? t("admin:members.verify.decided.note.saving")
            : t("admin:members.verify.decided.note.save")}
        </Button>
        {/* Held while a save is in flight: the save would still land, and
            its toast would contradict the cancel. */}
        <Button
          type="button"
          variant="ghost"
          size="md"
          disabled={isSaving}
          onClick={onCancel}
        >
          {t("admin:members.verify.decided.note.cancel")}
        </Button>
      </div>
      {errorMessage && (
        <p className={styles.staffNoteError} role="status">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
