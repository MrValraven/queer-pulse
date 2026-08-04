import { useState } from "react";
import { Button, FormField, Modal } from "../../shared/components/ui";
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
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [done, setDone] = useState(false);

  const canSend = subject.trim().length > 0 && body.trim().length >= 5;

  const send = () => {
    if (!canSend) return;
    setDone(true);
  };

  if (done) {
    return (
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
    );
  }

  return (
    <Modal
      eyebrow={t("gatherings:manage.messageModal.eyebrow")}
      title={t("gatherings:manage.messageModal.title")}
      sub={t("gatherings:manage.messageModal.sub")}
      onClose={onClose}
      footer={
        <>
          <Button variant="primary" onClick={send} disabled={!canSend}>
            {t("gatherings:manage.messageModal.sendCta", {
              count: attendeeCount,
            })}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t("gatherings:manage.cancelCta")}
          </Button>
        </>
      }
    >
      <div className={styles.fields}>
        <FormField
          label={t("gatherings:manage.messageModal.subjectLabel")}
          required
        >
          <input
            type="text"
            placeholder={t("gatherings:manage.messageModal.subjectPlaceholder")}
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
          />
        </FormField>
        <FormField
          label={t("gatherings:manage.messageModal.bodyLabel")}
          required
        >
          <textarea
            placeholder={t("gatherings:manage.writeUpdatePlaceholder")}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </FormField>
      </div>
    </Modal>
  );
}
