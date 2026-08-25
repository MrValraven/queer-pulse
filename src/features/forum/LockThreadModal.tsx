import { useState } from "react";
import { Button, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./forumModals.module.css";

/** Collects an optional moderator note before closing a thread to replies —
 *  shown on the locked banner (`ThreadReplySection`) so members see WHY a
 *  thread was closed instead of an identical banner every time. Unlocking
 *  never goes through this modal (no reason needed to reopen). */
export function LockThreadModal({
  busy,
  onConfirm,
  onClose,
}: {
  busy: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  return (
    <Modal
      title={t("forum:lockReason.title")}
      onClose={onClose}
      footer={
        <>
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={busy}
          >
            {t("forum:lockReason.cancel")}
          </Button>
          <Button
            variant="primary"
            type="button"
            disabled={busy}
            onClick={() => onConfirm(reason.trim())}
          >
            {busy
              ? t("forum:lockReason.locking")
              : t("forum:lockReason.confirm")}
          </Button>
        </>
      }
    >
      <p className={styles.sub}>{t("forum:lockReason.sub")}</p>
      <label className={styles.field}>
        <span className={styles.fieldLabel}>{t("forum:lockReason.label")}</span>
        <textarea
          className={styles.textarea}
          rows={3}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t("forum:lockReason.placeholder")}
          maxLength={280}
        />
      </label>
    </Modal>
  );
}
