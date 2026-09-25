import type { ReactNode } from "react";
import {
  FiBatteryCharging,
  FiChevronLeft,
  FiMoreHorizontal,
  FiWifi,
} from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  EmailClientMessageHead,
  type EmailClientMessage,
} from "./EmailClientMessageHead";
import styles from "./emailClient.module.css";

/** A phone mail app: status bar, a back-to-inbox row, the message header, then
 *  the email. The status bar and nav row are chrome only. */
export function EmailClientPhone({
  message,
  frame,
}: {
  message: EmailClientMessage;
  frame: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.phoneStage}>
      <div className={styles.phone}>
        <div className={styles.phoneScreen}>
          <div className={styles.statusBar} aria-hidden="true">
            <span className={styles.statusTime}>{message.timeLabel}</span>
            <FiWifi />
            <FiBatteryCharging />
          </div>
          <div className={styles.phoneNav} aria-hidden="true">
            <FiChevronLeft />
            {t("admin:emailTemplates.preview.inbox")}
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
