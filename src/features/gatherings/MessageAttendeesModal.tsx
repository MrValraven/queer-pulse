import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { Button, FormField } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GatheringSuccessPanel } from "./GatheringSuccessPanel";
import styles from "./GatheringModals.module.css";

export function MessageAttendeesModal({
  attendeeCount,
  onClose,
}: {
  attendeeCount: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [done, setDone] = useState(false);

  const canSend = subject.trim().length > 0 && body.trim().length >= 5;

  const send = () => {
    if (!canSend) return;
    setDone(true);
  };

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {done ? (
        <GatheringSuccessPanel
          title={
            <Translation
              i18nKey="gatherings:manage.messageModal.successTitle"
              components={{ em: <em /> }}
            />
          }
          sub={
            <Translation
              i18nKey="gatherings:manage.messageModal.successSub"
              values={{ subject, count: attendeeCount }}
              components={{ b: <b /> }}
            />
          }
          meta={t("gatherings:manage.messageModal.successMeta", {
            count: attendeeCount,
          })}
          onClose={onClose}
        />
      ) : (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("gatherings:manage.messageModal.title")}
          className={styles.modal}
        >
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t("gatherings:manage.closeAria")}
          >
            <FiX />
          </button>
          <div className={styles.eye}>
            {t("gatherings:manage.messageModal.eyebrow")}
          </div>
          <div className={styles.title}>
            {t("gatherings:manage.messageModal.title")}
          </div>
          <p className={styles.sub}>
            {t("gatherings:manage.messageModal.sub")}
          </p>

          <div className={styles.fields}>
            <FormField
              label={t("gatherings:manage.messageModal.subjectLabel")}
              required
            >
              <input
                type="text"
                placeholder={t(
                  "gatherings:manage.messageModal.subjectPlaceholder",
                )}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </FormField>
            <FormField
              label={t("gatherings:manage.messageModal.bodyLabel")}
              required
            >
              <textarea
                placeholder={t("gatherings:manage.writeUpdatePlaceholder")}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </FormField>
          </div>

          <div className={styles.actions}>
            <Button variant="primary" onClick={send} disabled={!canSend}>
              {t("gatherings:manage.messageModal.sendCta", {
                count: attendeeCount,
              })}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              {t("gatherings:manage.cancelCta")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
