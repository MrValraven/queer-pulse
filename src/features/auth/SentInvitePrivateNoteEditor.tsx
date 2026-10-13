import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { FiLock } from "react-icons/fi";
import { Button, Collapse, Sending } from "../../shared/components/ui";
import type { TFunction } from "../../shared/i18n/types";
import { INVITE_PRIVATE_NOTE_MAX_LENGTH } from "./api/invite.api";
import type { SentInviteView } from "./api/useSentInvites";
import type { SentInvitePrivateNoteState } from "./useSentInvitePrivateNote";
import styles from "./SentInvitesList.module.css";

/** Any line break, including the ones a paste brings: the note is a one-line
 *  label, so breaks become spaces. */
const LINE_BREAKS = /[\r\n]+/g;

/** The member's private note, leading a sent-invite row. It is their own
 *  label for who the invite is for, so it reads plainly with no quotes; the
 *  lock and a screen-reader prefix say it stays with them and our team. It
 *  folds in and out with the note, and keeps showing the last text it had
 *  while it folds shut so the line never goes blank mid-animation. */
export function SentInvitePrivateNoteLabel({
  privateNote,
  t,
}: {
  privateNote?: string;
  t: TFunction;
}) {
  const [shownNote, setShownNote] = useState(privateNote ?? "");
  if (privateNote && privateNote !== shownNote) setShownNote(privateNote);

  return (
    <Collapse isOpen={Boolean(privateNote)}>
      <div className={styles.privateNote}>
        <FiLock aria-hidden className={styles.privateNoteIcon} />
        <span className={styles.privateNoteText}>
          <span className="visuallyHidden">
            {t("auth:invite.sentList.privateNote.srPrefix")}{" "}
          </span>
          {shownNote}
        </span>
      </div>
    </Collapse>
  );
}

/** The row's "Add private note" / "Edit private note" toggle: a quiet text
 *  action under the row's details, present whatever the invite's status.
 *  While a save is in flight it holds the editor as it is. */
export function SentInvitePrivateNoteToggle({
  invite,
  inviteLabel,
  toggleRef,
  noteState,
  t,
}: {
  invite: SentInviteView;
  /** What the invite is called out loud: its address, or its code. */
  inviteLabel: string;
  /** Where focus returns once the editor folds away. */
  toggleRef: RefObject<HTMLButtonElement | null>;
  noteState: SentInvitePrivateNoteState;
  t: TFunction;
}) {
  const hasPrivateNote = Boolean(invite.privateNote);
  return (
    <button
      ref={toggleRef}
      type="button"
      className={styles.privateNoteToggle}
      aria-expanded={noteState.isEditorOpen}
      aria-controls={noteState.editorId}
      aria-disabled={noteState.isSaving || undefined}
      aria-label={t(
        hasPrivateNote
          ? "auth:invite.sentList.privateNote.editAriaLabel"
          : "auth:invite.sentList.privateNote.addAriaLabel",
        { invite: inviteLabel },
      )}
      onClick={noteState.toggleEditor}
    >
      <FiLock aria-hidden className={styles.privateNoteToggleIcon} />
      {t(
        hasPrivateNote
          ? "auth:invite.sentList.privateNote.editCta"
          : "auth:invite.sentList.privateNote.addCta",
      )}
    </button>
  );
}

/** The inline editor the toggle opens, full width under the row's details.
 *  The fold's wrapper reaches a small gutter past the card's content edge so
 *  the field's focus ring is never clipped while it opens. */
export function SentInvitePrivateNoteEditor({
  invite,
  noteState,
  t,
}: {
  invite: SentInviteView;
  noteState: SentInvitePrivateNoteState;
  t: TFunction;
}) {
  return (
    <Collapse
      isOpen={noteState.isEditorOpen}
      className={styles.privateNoteCollapse}
    >
      <PrivateNoteEditorForm
        id={noteState.editorId}
        invite={invite}
        t={t}
        isSaving={noteState.isSaving}
        isDeleting={noteState.isDeleting}
        onSave={noteState.savePrivateNote}
        onClose={noteState.closeEditor}
      />
    </Collapse>
  );
}

/** The editor itself: a labelled textarea seeded with the current note, the
 *  same help line as the compose field, and Save / Cancel / Delete. Esc and
 *  Cancel close it untouched; Enter saves, since the note is one line. The
 *  save itself lives on the row, so it finishes even if this form is gone. */
function PrivateNoteEditorForm({
  id,
  invite,
  t,
  isSaving,
  isDeleting,
  onSave,
  onClose,
}: {
  id: string;
  invite: SentInviteView;
  t: TFunction;
  isSaving: boolean;
  isDeleting: boolean;
  onSave: (nextNote: string | null) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(invite.privateNote ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fieldId = `${id}-field`;
  const helpId = `${id}-help`;
  const hasPrivateNote = Boolean(invite.privateNote);

  // Focus the field as the editor opens, caret after the existing text.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSaving) onSave(draft);
  }

  /** Esc cancels from the field or any of the editor's buttons. Each control
   *  carries it, since a key handler on the form wrapper is not allowed. */
  function cancelOnEscape(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "Escape" || event.nativeEvent.isComposing) return;
    if (isSaving) return;
    event.preventDefault();
    event.stopPropagation();
    onClose();
  }

  function handleFieldKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    cancelOnEscape(event);
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form id={id} className={styles.privateNoteEditor} onSubmit={handleSubmit}>
      <label htmlFor={fieldId} className={styles.privateNoteFieldLabel}>
        {t("auth:invite.compose.privateNote.label")}
      </label>
      <textarea
        ref={textareaRef}
        id={fieldId}
        className={styles.privateNoteInput}
        rows={2}
        maxLength={INVITE_PRIVATE_NOTE_MAX_LENGTH}
        placeholder={t("auth:invite.compose.privateNote.placeholder")}
        value={draft}
        onChange={(event) =>
          setDraft(event.target.value.replace(LINE_BREAKS, " "))
        }
        onKeyDown={handleFieldKeyDown}
        aria-describedby={helpId}
        // Read-only while saving, so focus stays put if the request fails.
        readOnly={isSaving}
      />
      <div className={styles.privateNoteMeta}>
        <p id={helpId} className={styles.privateNoteHelp}>
          {t("auth:invite.compose.privateNote.help")}
        </p>
        <span className={styles.privateNoteCount}>
          {draft.length}/{INVITE_PRIVATE_NOTE_MAX_LENGTH}
        </span>
      </div>
      <div className={styles.privateNoteActions}>
        <Button
          type="submit"
          size="md"
          className={styles.privateNoteAction}
          disabled={isSaving}
          aria-busy={isSaving && !isDeleting}
          onKeyDown={cancelOnEscape}
        >
          {isSaving && !isDeleting ? (
            <Sending label={t("auth:invite.sentList.privateNote.saving")} />
          ) : (
            t("auth:invite.sentList.privateNote.saveCta")
          )}
        </Button>
        <Button
          variant="ghost"
          size="md"
          className={styles.privateNoteAction}
          disabled={isSaving}
          onClick={onClose}
          onKeyDown={cancelOnEscape}
        >
          {t("auth:invite.sentList.privateNote.cancelCta")}
        </Button>
        {hasPrivateNote && (
          <Button
            variant="ghost"
            size="md"
            className={`${styles.privateNoteAction} ${styles.privateNoteDelete}`}
            disabled={isSaving}
            aria-busy={isDeleting}
            onClick={() => onSave(null)}
            onKeyDown={cancelOnEscape}
          >
            {isDeleting ? (
              <Sending label={t("auth:invite.sentList.privateNote.deleting")} />
            ) : (
              t("auth:invite.sentList.privateNote.deleteCta")
            )}
          </Button>
        )}
      </div>
    </form>
  );
}
