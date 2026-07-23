import { useEffect } from "react";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./forumModals.module.css";

export function ConfirmDeleteModal({
  busy,
  onConfirm,
  onClose,
}: {
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useScrollLock();
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

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
        aria-labelledby="forum-delete-title"
      >
        <h2 id="forum-delete-title" className={styles.title}>
          {t("forum:deleteConfirm.title")}
        </h2>
        <p className={styles.sub}>{t("forum:deleteConfirm.body")}</p>
        <div className={styles.actions}>
          <Button variant="ghost" type="button" onClick={onClose} disabled={busy}>
            {t("forum:deleteConfirm.cancel")}
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy
              ? t("forum:deleteConfirm.deleting")
              : t("forum:deleteConfirm.confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
}
