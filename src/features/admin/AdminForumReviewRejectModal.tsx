import { useId, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminModal } from "./ui";
import { FORUM_REVIEW_NOTE_MAX_LENGTH } from "./api/adminForumReview.api";
import styles from "./AdminForumReviewPage.module.css";

/**
 * Declining a held thread, with an optional word to its author.
 *
 * The note rides on the notification the author receives, so the body says who
 * reads it. It stays optional to match the server: when the reason is already
 * plain in the thread, a forced note only produces "no".
 */
export function AdminForumReviewRejectModal({
  threadTitle,
  isPending,
  onSubmit,
  onClose,
}: {
  threadTitle: string;
  isPending: boolean;
  /** Receives the trimmed note, or undefined when the reviewer wrote none. */
  onSubmit: (note: string | undefined) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const noteId = useId();
  const bodyId = useId();
  const [note, setNote] = useState("");
  const trimmedNote = note.trim();

  return (
    <AdminModal
      title={t("admin:adminForumReview.rejectModal.title", {
        title: threadTitle,
      })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            {t("admin:adminForumReview.rejectModal.cancel")}
          </Button>
          <Button
            variant="danger"
            size="md"
            disabled={isPending}
            onClick={() => onSubmit(trimmedNote || undefined)}
          >
            {t("admin:adminForumReview.rejectModal.submit")}
          </Button>
        </>
      }
    >
      <p id={bodyId} className={styles.noteBody}>
        {t("admin:adminForumReview.rejectModal.body")}
      </p>
      <label className={styles.noteLabel} htmlFor={noteId}>
        {t("admin:adminForumReview.rejectModal.noteLabel")}
      </label>
      <textarea
        id={noteId}
        className={styles.noteInput}
        value={note}
        maxLength={FORUM_REVIEW_NOTE_MAX_LENGTH}
        rows={4}
        aria-describedby={bodyId}
        onChange={(event) => setNote(event.target.value)}
      />
    </AdminModal>
  );
}
