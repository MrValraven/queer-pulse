import { useEffect, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
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
  useScrollLock();
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialTitle);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const trimmedTitle = title.trim();
  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="forum-edit-title"
      >
        <h2 id="forum-edit-title" className={styles.title}>
          {t("forum:opEdit.title")}
        </h2>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{t("forum:opEdit.titleLabel")}</span>
          <input
            className={styles.input}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
          />
        </label>
        <div className={styles.actions}>
          <Button variant="ghost" type="button" onClick={onClose} disabled={busy}>
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
        </div>
      </div>
    </div>
  );
}
