import { useState } from "react";
import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./forumModals.module.css";

export function EditOpModal({
  initialTitle,
  initialBody,
  busy,
  onSave,
  onClose,
}: {
  initialTitle: string;
  initialBody: string;
  busy: boolean;
  onSave: (next: { title: string; body: string }) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);

  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();
  const unchanged =
    trimmedTitle === initialTitle && trimmedBody === initialBody;
  const invalid = !trimmedTitle || !trimmedBody;

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
            disabled={busy || unchanged || invalid}
            onClick={() => onSave({ title: trimmedTitle, body: trimmedBody })}
          >
            {busy ? t("forum:opEdit.saving") : t("forum:opEdit.save")}
          </Button>
        </>
      }
    >
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
      <label className={styles.field}>
        <span className={styles.fieldLabel}>{t("forum:opEdit.bodyLabel")}</span>
        <textarea
          className={styles.textarea}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={6}
        />
      </label>
    </Modal>
  );
}
