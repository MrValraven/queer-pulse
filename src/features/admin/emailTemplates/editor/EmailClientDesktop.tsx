import type { ReactNode } from "react";
import {
  FiArchive,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiMoreHorizontal,
  FiTrash2,
} from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { EMAIL_WORDMARK } from "../emailTheme";
import {
  EmailClientMessageHead,
  EmailClientSubjectText,
  type EmailClientMessage,
} from "./EmailClientMessageHead";
import styles from "./emailClient.module.css";

const PLACEHOLDER_ROW_COUNT = 4;

/** The inbox column: this email selected, then blank rows drawn as bars. It
 *  repeats what the message header says, so it is hidden from assistive tech. */
function EmailClientMessageList({ message }: { message: EmailClientMessage }) {
  const { t } = useTranslation();
  return (
    <div className={styles.messageList} aria-hidden="true">
      <span className={styles.listLabel}>
        {t("admin:emailTemplates.preview.inbox")}
      </span>
      <div className={`${styles.listRow} ${styles.listRowSelected}`}>
        <span className={styles.listRowTop}>
          {EMAIL_WORDMARK}
          <span className={styles.time}>{message.timeLabel}</span>
        </span>
        <span className={styles.listSubject}>
          <EmailClientSubjectText subject={message.subject} />
        </span>
        {message.preheader.trim() && (
          <span className={styles.listSnippet}>{message.preheader}</span>
        )}
      </div>
      {Array.from({ length: PLACEHOLDER_ROW_COUNT }, (_, rowIndex) => (
        <div key={rowIndex} className={styles.listRow}>
          <span className={styles.skeletonBar} />
          <span className={styles.skeletonBar} />
          <span className={styles.skeletonBar} />
        </div>
      ))}
    </div>
  );
}

/** A desktop mail window: title bar, toolbar, message header, then the email.
 *  The toolbar icons are chrome only, so they are spans and never focusable. */
export function EmailClientDesktop({
  message,
  frame,
}: {
  message: EmailClientMessage;
  frame: ReactNode;
}) {
  return (
    <div className={styles.window}>
      <div className={styles.titleBar} aria-hidden="true">
        <span className={styles.windowDot} />
        <span className={styles.windowDot} />
        <span className={styles.windowDot} />
      </div>
      <div className={styles.windowBody}>
        <EmailClientMessageList message={message} />
        <div className={styles.message}>
          <div className={styles.toolbar} aria-hidden="true">
            <span className={styles.toolIcon}>
              <FiArchive />
            </span>
            <span className={styles.toolIcon}>
              <FiTrash2 />
            </span>
            <span className={styles.toolGap} />
            <span className={styles.toolIcon}>
              <FiCornerUpLeft />
            </span>
            <span className={styles.toolIcon}>
              <FiCornerUpRight />
            </span>
            <span className={styles.toolIcon}>
              <FiMoreHorizontal />
            </span>
          </div>
          <EmailClientMessageHead message={message} />
          <div className={styles.messageBody}>{frame}</div>
        </div>
      </div>
    </div>
  );
}
