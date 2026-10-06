import { useEffect, useRef, useState } from "react";
import { FiEdit2, FiLock, FiPlus } from "react-icons/fi";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { ApiError } from "../../shared/api/client";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import type { JoinRequestView } from "./api/useJoinRequests";
import {
  DEMO_EDITOR_ID,
  useUpdateJoinRequestNote,
} from "./api/useUpdateJoinRequestNote";
import { JoinRequestDeclineNoteEditor } from "./JoinRequestDeclineNoteEditor";
import styles from "./AdminVerifyDecided.module.css";

/** Turn a failed note save into an honest, no-blame line. The backend 403s a
 *  caller without the moderator role, 404s an unknown request, 409s one that
 *  is no longer declined and 400s a note over the limit: each gets its own
 *  message; anything else falls through. */
function noteErrorMessage(error: unknown, t: TFunction): string {
  const status = error instanceof ApiError ? error.status : 0;
  switch (status) {
    case 400:
      return t("admin:members.verify.decided.note.error.tooLong");
    case 403:
      return t("admin:members.verify.decided.note.error.forbidden");
    case 404:
      return t("admin:members.verify.decided.note.error.notFound");
    case 409:
      return t("admin:members.verify.decided.note.error.notDeclined");
    default:
      return t("admin:members.verify.decided.note.error.generic");
  }
}

/**
 * The staff-only note on a declined request, shown under the decline reason
 * in the expanded decided row. It holds what the reason key cannot: why this
 * one was declined, or what to look for if the same person asks again. The
 * applicant never sees it, and the section says so every time it is shown.
 *
 * Closed, it shows the note with who last edited it and when, or only an
 * "Add a note" button. Open, it swaps in {@link JoinRequestDeclineNoteEditor}.
 * When the editor closes, after a save or a cancel, focus goes back to the
 * Add or Edit button, so a keyboard user lands where they started. That
 * button keeps its place whether or not there is a note, so the refetch that
 * follows a save swaps its label without remounting it or dropping focus.
 */
export function JoinRequestDeclineNote({ item }: { item: JoinRequestView }) {
  const { t } = useTranslation();
  const format = useFormat();
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const updateNote = useUpdateJoinRequestNote();
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const shouldRestoreFocusRef = useRef(false);

  // Runs only on the way out of the editor, and only when this section asked
  // for it, so a refetch that re-renders the row never moves focus.
  useEffect(() => {
    if (isEditing || !shouldRestoreFocusRef.current) return;
    shouldRestoreFocusRef.current = false;
    openButtonRef.current?.focus();
  }, [isEditing]);

  function openEditor() {
    setErrorMessage(null);
    setIsEditing(true);
  }

  function closeEditor() {
    shouldRestoreFocusRef.current = true;
    setErrorMessage(null);
    setIsEditing(false);
  }

  function save(draft: string) {
    if (updateNote.isPending) return;
    setErrorMessage(null);
    const isRemoving = draft.trim().length === 0;
    updateNote.mutate(
      { id: item.id, note: draft },
      {
        onSuccess: () => {
          showToast(
            t(
              isRemoving
                ? "admin:members.verify.decided.note.removedToast"
                : "admin:members.verify.decided.note.savedToast",
            ),
            "success",
          );
          closeEditor();
        },
        onError: (error) => setErrorMessage(noteErrorMessage(error, t)),
      },
    );
  }

  const note = item.internalNote;
  const signedInId = user?.id ?? (demoMode ? DEMO_EDITOR_ID : null);
  const isEditedByMe =
    item.internalNoteUpdatedBy !== null &&
    item.internalNoteUpdatedBy === signedInId;
  const editorName = isEditedByMe
    ? t("admin:members.verify.decided.note.editorYou")
    : (item.internalNoteUpdatedByName ??
      t("admin:members.verify.decided.note.editorUnknown"));
  const editedAt = item.internalNoteUpdatedAt
    ? new Date(item.internalNoteUpdatedAt)
    : null;
  const editedOn =
    editedAt && !Number.isNaN(editedAt.getTime())
      ? format.date(editedAt, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;
  const editedLine = editedOn
    ? t("admin:members.verify.decided.note.editedBy", {
        name: editorName,
        date: editedOn,
      })
    : t("admin:members.verify.decided.note.editedByUndated", {
        name: editorName,
      });

  if (isEditing) {
    return (
      <div className={styles.staffNote}>
        <JoinRequestDeclineNoteEditor
          initialNote={note ?? ""}
          isSaving={updateNote.isPending}
          errorMessage={errorMessage}
          onSave={save}
          onCancel={closeEditor}
        />
      </div>
    );
  }

  return (
    <div className={styles.staffNote}>
      <p className={styles.staffNoteLabel}>
        <FiLock aria-hidden />
        {t("admin:members.verify.decided.note.label")}
      </p>
      <p className={styles.staffNoteHint}>
        {t("admin:members.verify.decided.note.hint")}
      </p>
      {note && <p className={styles.staffNoteText}>{note}</p>}
      {note && <p className={styles.staffNoteMeta}>{editedLine}</p>}
      <div className={styles.staffNoteActions}>
        <Button
          ref={openButtonRef}
          type="button"
          variant="ghost"
          size="md"
          onClick={openEditor}
        >
          {note ? <FiEdit2 aria-hidden /> : <FiPlus aria-hidden />}
          {note
            ? t("admin:members.verify.decided.note.edit")
            : t("admin:members.verify.decided.note.add")}
        </Button>
      </div>
    </div>
  );
}
