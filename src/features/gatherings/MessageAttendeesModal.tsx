import { useState } from "react";
import { Button, FormField, Modal } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { GatheringSuccessPanel } from "./GatheringSuccessPanel";
import { MAX_EVENT_ANNOUNCEMENT_LENGTH } from "./api/events.api";
import { useSendEventAnnouncement } from "./api/useEventAnnouncements";
import styles from "./GatheringModals.module.css";

/**
 * "Tell everyone who's coming" (LOC-06).
 *
 * This used to set a local boolean and draw a panel saying the message had
 * gone to N people, with no request behind it. It now posts a real
 * announcement, which reaches everyone holding a live RSVP plus everyone
 * holding a standing invite.
 *
 * IN-APP AND PUSH, and nothing else. QueerPulse sends no email and never will,
 * so no line of copy here may describe a send. The subject line went with the
 * fake email framing: an announcement is a message, so it is one field.
 */
export function MessageAttendeesModal({
  slug,
  attendeeCount,
  onClose,
}: {
  slug: string;
  attendeeCount: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const sendAnnouncement = useSendEventAnnouncement(slug);
  const [body, setBody] = useState("");
  const [sentCount, setSentCount] = useState<number | null>(null);

  const trimmed = body.trim();
  const canSend =
    trimmed.length >= 5 &&
    trimmed.length <= MAX_EVENT_ANNOUNCEMENT_LENGTH &&
    !sendAnnouncement.isPending;

  const send = () => {
    if (!canSend) return;
    sendAnnouncement.mutate(trimmed, {
      // The server reports how many members the fan-out actually reached, so
      // the confirmation quotes that rather than the roster size the modal
      // happened to be opened with. Demo has no server, so it falls back.
      onSuccess: (announcement) =>
        setSentCount(announcement?.recipientCount ?? attendeeCount),
      onError: () =>
        showToast(t("gatherings:manage.messageModal.errorToast"), "error"),
    });
  };

  if (sentCount !== null) {
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
            values={{ count: sentCount }}
            components={{ b: <b /> }}
          />
        }
        meta={t("gatherings:manage.messageModal.successMeta")}
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
            {sendAnnouncement.isPending
              ? t("gatherings:manage.messageModal.sendingCta")
              : t("gatherings:manage.messageModal.sendCta", {
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
          label={t("gatherings:manage.messageModal.bodyLabel")}
          helper={t("gatherings:manage.messageModal.bodyHelper")}
          required
        >
          <textarea
            placeholder={t("gatherings:manage.writeUpdatePlaceholder")}
            value={body}
            rows={5}
            maxLength={MAX_EVENT_ANNOUNCEMENT_LENGTH}
            onChange={(event) => setBody(event.target.value)}
          />
        </FormField>
      </div>
    </Modal>
  );
}
