import { useId, useState } from "react";
import { FiSend } from "react-icons/fi";
import { Button, EmptyState } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { PREVIOUS_MESSAGES, ATTENDEE_COUNT } from "./manageGathering.data";
import { ManageAnnouncements } from "./ManageAnnouncements";
import { messageRelativeTime } from "./manageGatheringDates";
import styles from "./ManageGatheringPage.module.css";

const Check = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M1 6l3 3 7-7"
      stroke="var(--jade)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface SentMessage {
  id: string;
  subject: string;
  sentAt: Date;
  preview: string;
  openedCount: number;
}

export function MessagesTab({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const composerLabelId = useId();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<SentMessage[]>([]);

  const messages = [...sent, ...PREVIOUS_MESSAGES];

  // Live mode drives the real announcements endpoint (LOC-06). This used to
  // be an honest "not available yet" panel, because the only alternative was
  // a composer that set a boolean and claimed a send. Demo keeps the
  // prototype's own composer + mock history below.
  if (!demoMode) return <ManageAnnouncements slug={slug} />;

  const send = () => {
    const text = message.trim();
    if (!text) return;
    const subject = text.length > 48 ? `${text.slice(0, 45)}…` : text;
    setSent((prev) => [
      {
        id: `sent-${prev.length}-${text.length}-${text.slice(0, 8)}`,
        subject,
        sentAt: new Date(),
        preview: text,
        openedCount: 0,
      },
      ...prev,
    ]);
    setMessage("");
    showToast(
      t("gatherings:manage.messages.sentToast", { count: ATTENDEE_COUNT }),
      "success",
    );
  };

  return (
    <div>
      <div className={styles.composerCard}>
        <div className={styles.compLabel} id={composerLabelId}>
          {t("gatherings:manage.messages.composerLabel", {
            count: ATTENDEE_COUNT,
          })}
        </div>
        <textarea
          aria-labelledby={composerLabelId}
          className={styles.compTa}
          placeholder={t("gatherings:manage.writeUpdatePlaceholder")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className={styles.compFooter}>
          <div className={styles.compHint}>
            {t("gatherings:manage.messages.sentHint", {
              count: ATTENDEE_COUNT,
            })}
          </div>
          <Button variant="primary" disabled={!message.trim()} onClick={send}>
            {t("gatherings:manage.messages.sendCta")}
          </Button>
        </div>
      </div>
      <div className={styles.prevLabel}>
        {t("gatherings:manage.messages.previousHeading")}
      </div>
      <div className={styles.msgList}>
        {messages.length === 0 && (
          <EmptyState
            compact
            icon={<FiSend />}
            title={t("gatherings:manage.messages.emptyTitle")}
            description={t("gatherings:manage.messages.emptyDescription")}
          />
        )}
        {messages.map((sentMessage) => (
          <div className={styles.msgCard} key={sentMessage.id}>
            <div className={styles.msgHeader}>
              <div className={styles.msgSubject}>{sentMessage.subject}</div>
              <div className={styles.msgTime}>
                {messageRelativeTime(sentMessage.sentAt, t, fmt)}
              </div>
            </div>
            <div className={styles.msgPreview}>{sentMessage.preview}</div>
            <div className={styles.openRate}>
              <Check />
              {t("gatherings:manage.messages.openedOf", {
                opened: sentMessage.openedCount,
                total: ATTENDEE_COUNT,
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
