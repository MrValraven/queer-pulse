import { useState } from "react";
import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./forumModals.module.css";

export function EditTitleModal({
  initialTitle,
  busy,
  onSave,
  onClose,
}: {
  initialTitle: string;
  busy: boolean;
  onSave: (title: string) => void;
  onClose: () => void;
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
