import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiEdit2, FiTrash2, FiUser } from "react-icons/fi";
import {
  Button,
  Collapse,
  ConfirmDialog,
  FormField,
  IconButton,
} from "../../../shared/components/ui";
import { formatDate } from "../../../shared/lib/date";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminAvatar } from "../ui";
import { LEAD_NOTE_MAX, type LeadEntryDTO } from "./api/leads.types";
import {
  useDeleteLeadNote,
  useEditLeadNote,
  useLeadIsWriting,
} from "./api/useLeadMutations";
import {
  leadFieldErrorOf,
  localLeadFieldError,
  type LeadFieldError,
} from "./leadForm.model";
import { LeadFadeInline } from "./LeadFadeInline";
import { LEAD_UNKNOWN_AUTHOR_KEY } from "./leadHistory.model";
import { LeadRefusalLine } from "./LeadRefusalLine";
import styles from "./LeadHistory.module.css";

/** Day, month and time: the history reads as a recent timeline. */
const ENTRY_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
};

/** When a history entry was written, in the reader's language. */
export function LeadEntryTime({ at }: { at: string }) {
  const { language } = useTranslation();
  return (
    <time dateTime={at}>{formatDate(at, language, ENTRY_TIME_FORMAT)}</time>
  );
}

/** The refusal an edited note gets before anything is sent: blank, or
 *  longer than the server takes, counted in code points as it counts. */
function localEditRefusalOf(text: string): LeadFieldError | null {
  const trimmed = text.trim();
  if (trimmed === "") return localLeadFieldError("LEAD_NOTE_EMPTY");
  if (Array.from(trimmed).length > LEAD_NOTE_MAX) {
    return localLeadFieldError("LEAD_NOTE_TOO_LONG");
  }
  return null;
}

/** Up to two capitals from the author's name. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => word !== "")
    .slice(0, 2)
    .map((word) => Array.from(word)[0]?.toUpperCase() ?? "")
    .join("");
}

/** Who wrote the note and when, with "edited" once it changed. */
function LeadNoteMeta({ entry }: { entry: LeadEntryDTO }) {
  const { t } = useTranslation();
  // A missing account, or one whose profile name is blank, reads as the
  // unknown author with the anonymous avatar.
  const knownName = entry.author?.displayName.trim() ?? "";
  const hasKnownAuthor = knownName !== "";
  const authorName = hasKnownAuthor ? knownName : t(LEAD_UNKNOWN_AUTHOR_KEY);
  return (
    <div className={styles.noteMeta}>
      <span className={styles.noteAvatar} aria-hidden>
        <AdminAvatar
          size="sm"
          tone={hasKnownAuthor ? "plum" : "anon"}
          src={entry.author?.avatarUrl ?? undefined}
          alt=""
          initials={hasKnownAuthor ? initialsOf(authorName) : <FiUser />}
        />
      </span>
      <div className={styles.noteByline}>
        <span className={styles.noteAuthor}>{authorName}</span>
        <span className={styles.noteTime}>
          <LeadEntryTime at={entry.createdAt} />
          <LeadFadeInline isShown={entry.editedAt !== null}>
            <span className={styles.noteEdited}>
              {t("admin:leads.history.edited")}
            </span>
          </LeadFadeInline>
        </span>
      </div>
    </div>
  );
}

/**
 * One note in the history: author, avatar, time, "edited" once changed,
 * and the body as written. Edit note swaps the body for an editor and
 * back, each through its own fold; Delete note asks first. Both show only
 * when the server says this viewer may change the note.
 */
export function LeadNoteItem({
  leadId,
  entry,
}: {
  leadId: string;
  entry: LeadEntryDTO;
}) {
  const { t } = useTranslation();
  const editNote = useEditLeadNote(leadId);
  const deleteNote = useDeleteLeadNote(leadId);
  const isWriting = useLeadIsWriting();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(entry.body ?? "");
  const [editRefusal, setEditRefusal] = useState<LeadFieldError | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteRefusal, setDeleteRefusal] = useState<LeadFieldError | null>(
    null,
  );
  const noteRef = useRef<HTMLElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const hasOpenedEditorRef = useRef(false);
  const editorId = `lead-note-${entry.id}-editor`;
  const refusalId = `${editorId}-refusal`;

  // The editor takes focus as it opens. Once it closes (Cancel, or a save
  // that may land later), focus goes back to Edit note only when it was
  // lost: on the page itself or still in this note. A viewer who moved on
  // while the save ran keeps their place.
  useEffect(() => {
    if (isEditing) {
      hasOpenedEditorRef.current = true;
      const editor = editorRef.current;
      if (editor === null) return;
      editor.focus();
      // The caret lands after the last word, where an edit usually goes.
      const end = editor.value.length;
      editor.setSelectionRange(end, end);
      return;
    }
    if (!hasOpenedEditorRef.current) return;
    const focused = document.activeElement;
    const isFocusLost =
      focused === null ||
      focused === document.body ||
      noteRef.current?.contains(focused) === true;
    if (isFocusLost) editButtonRef.current?.focus();
  }, [isEditing]);

  const startEditing = () => {
    setDraft(entry.body ?? "");
    setEditRefusal(null);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (editNote.isPending || isWriting) return;
    if (draft.trim() === (entry.body ?? "").trim()) {
      setIsEditing(false);
      return;
    }
    const localRefusal = localEditRefusalOf(draft);
    setEditRefusal(localRefusal);
    if (localRefusal !== null) return;
    editNote.mutate(
      { entryId: entry.id, body: draft.trim() },
      {
        onSuccess: () => setIsEditing(false),
        onError: (cause) => setEditRefusal(leadFieldErrorOf(cause)),
      },
    );
  };

  const confirmDelete = () => {
    if (deleteNote.isPending) return;
    setDeleteRefusal(null);
    deleteNote.mutate(
      { entryId: entry.id },
      {
        onSuccess: () => setIsConfirmOpen(false),
        onError: (cause) => setDeleteRefusal(leadFieldErrorOf(cause)),
      },
    );
  };

  return (
    <article ref={noteRef} className={styles.note}>
      <div className={styles.noteHead}>
        <LeadNoteMeta entry={entry} />
        <Collapse isOpen={entry.canEdit && !isEditing}>
          <div className={styles.noteActions}>
            <IconButton
              ref={editButtonRef}
              aria-label={t("admin:leads.history.editNote")}
              tooltip
              onClick={startEditing}
            >
              <FiEdit2 aria-hidden />
            </IconButton>
            <IconButton
              aria-label={t("admin:leads.history.deleteNote")}
              tooltip
              onClick={() => {
                setDeleteRefusal(null);
                setIsConfirmOpen(true);
              }}
            >
              <FiTrash2 aria-hidden />
            </IconButton>
          </div>
        </Collapse>
      </div>
      <Collapse isOpen={!isEditing}>
        <p className={styles.noteBody}>{entry.body}</p>
      </Collapse>
      <Collapse isOpen={isEditing}>
        <div className={styles.noteEditor}>
          <FormField
            label={t("admin:leads.history.noteEditLabel")}
            className={styles.composerField}
          >
            <textarea
              ref={editorRef}
              id={editorId}
              rows={4}
              value={draft}
              aria-invalid={editRefusal !== null || undefined}
              aria-describedby={editRefusal !== null ? refusalId : undefined}
              onChange={(event) => {
                setDraft(event.target.value);
                setEditRefusal(null);
              }}
            />
          </FormField>
          <LeadRefusalLine error={editRefusal} id={refusalId} />
          <div className={styles.editorActions}>
            <Button
              variant="primary"
              size="sm"
              className={styles.phoneTarget}
              aria-disabled={isWriting || undefined}
              onClick={saveEdit}
            >
              {t("admin:leads.history.saveNote")}
            </Button>
            {/* Cancel waits for a save on its way, so a refusal never
                lands in a closed editor. */}
            <Button
              variant="ghost"
              size="sm"
              className={styles.phoneTarget}
              aria-disabled={editNote.isPending || undefined}
              onClick={() => {
                if (!editNote.isPending) setIsEditing(false);
              }}
            >
              {t("admin:common.cancel")}
            </Button>
          </div>
        </div>
      </Collapse>
      <AnimatePresence>
        {isConfirmOpen && (
          <ConfirmDialog
            open
            tone="destructive"
            loading={deleteNote.isPending}
            title={t("admin:leads.history.deleteConfirm.title")}
            description={t("admin:leads.history.deleteConfirm.body")}
            confirmLabel={t("admin:leads.history.deleteNote")}
            onClose={() => {
              if (!deleteNote.isPending) setIsConfirmOpen(false);
            }}
            onConfirm={confirmDelete}
          >
            <LeadRefusalLine error={deleteRefusal} />
          </ConfirmDialog>
        )}
      </AnimatePresence>
    </article>
  );
}
