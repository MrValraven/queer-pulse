import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { EMAIL_WORDMARK } from "../emailTheme";
import styles from "./emailClient.module.css";

/** What the mock mail app shows about the message around the email itself. */
export interface EmailClientMessage {
  subject: string;
  /** The grey snippet an inbox row shows after the subject; may be empty. */
  preheader: string;
  recipientName: string;
  /** Today's time in the admin's language, the stamp a fresh email carries. */
  timeLabel: string;
}

/** The subject line, or a muted stand-in while the subject field is empty. */
export function EmailClientSubjectText({ subject }: { subject: string }) {
  const { t } = useTranslation();
  if (subject.trim()) return <>{subject}</>;
  return (
    <span className={styles.subjectEmpty}>
      {t("admin:emailTemplates.preview.noSubject")}
    </span>
  );
}

/** Subject and its preheader snippet, then the sender row: avatar, sender,
 *  recipient and time. The snippet stands in for the inbox row, so it hides
 *  whenever the desktop window has room to show that row. */
export function EmailClientMessageHead({
  message,
}: {
  message: EmailClientMessage;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.messageHead}>
      <div className={styles.subjectGroup}>
        <p className={styles.subject}>
          <EmailClientSubjectText subject={message.subject} />
        </p>
        {message.preheader.trim() && (
          <p className={styles.headSnippet}>{message.preheader}</p>
        )}
      </div>
      <div className={styles.sender}>
        <span className={styles.avatar} aria-hidden="true">
          {EMAIL_WORDMARK.charAt(0)}
        </span>
        <span className={styles.senderText}>
          <span className={styles.senderName}>{EMAIL_WORDMARK}</span>
          {message.recipientName && (
            <span className={styles.recipient}>
              {t("admin:emailTemplates.preview.toRecipient", {
                name: message.recipientName,
              })}
            </span>
          )}
        </span>
        <span className={styles.time}>{message.timeLabel}</span>
      </div>
    </div>
  );
}
