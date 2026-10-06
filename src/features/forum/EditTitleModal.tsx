import { useState } from "react";
import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./forumModals.module.css";

export function EditTitleModal({
  initialTitle,
  busy,
  onSave,
  onClose,
  shouldShowAskReviewNote = false,
}: {
  initialTitle: string;
  busy: boolean;
  onSave: (title: string) => void;
  onClose: () => void;
  /** The author of a fundraiser: any edit of theirs sends it back to
   *  moderators, so the modal says so before they save. */
  shouldShowAskReviewNote?: boolean;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialTitle);
  const trimmedTitle = title.trim();
  return (
    <Modal
      title={t("forum:opEdit.title")}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={busy}
          >
            {t("forum:opEdit.cancel")}
          </Button>
          <Button
            variant="primary"
            type="button"
            disabled={busy || !trimmedTitle || trimmedTitle === initialTitle}
            onClick={() => onSave(trimmedTitle)}
          >
            {busy ? t("forum:opEdit.saving") : t("forum:opEdit.save")}
          </Button>
        </>
      }
    >
      {shouldShowAskReviewNote && (
        <p className={styles.sub}>{t("forum:funding.edit.askReviewNote")}</p>
      )}
      <label className={styles.field}>
        <span className={styles.fieldLabel}>
          {t("forum:opEdit.titleLabel")}
        </span>
        <input
          className={styles.input}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
        />
      </label>
    </Modal>
  );
}
