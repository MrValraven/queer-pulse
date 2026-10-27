import type { ReactNode } from "react";
import { Avatar } from "../../../../shared/components/ui/Avatar";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { initialsFromName } from "../../../../shared/lib/initials";
import { MailboxAttributionLabel } from "../../../messages/mailboxes/MailboxAttributionLabel";
import type { ChatMessage } from "../../../messages/data";
import type { SampleThreadMessage } from "./businessesSample.data";
import styles from "./SampleMailboxThread.module.css";

/** The identity a sample business reply was sent as. Any non-empty id makes
 *  the real attribution label speak; nothing reads it beyond that. */
const SAMPLE_LISTING_IDENTITY_ID = "sample-listing-identity";

/** A sample message in the shape the real attribution label reads. A run
 *  with a staff first name was sent as the business by a colleague. */
function toChatMessage(message: SampleThreadMessage): ChatMessage {
  const hasStaffName = message.staffFirstName !== undefined;
  return {
    from: message.side,
    text: message.text,
    senderStaffFirstName: message.staffFirstName,
    senderIdentityId: hasStaffName ? SAMPLE_LISTING_IDENTITY_ID : undefined,
    senderIdentityKind: hasStaffName ? "listing" : undefined,
    isSentByViewer: hasStaffName ? false : undefined,
  };
}

/**
 * A short business-inbox conversation, drawn without the messages tree (its
 * stylesheets are heavy) and with the real `MailboxAttributionLabel` over
 * each business reply, so the "Duarte from Café Andorinha" and "Sent by
 * Leonor" lines are the product's own. The header names the business and its
 * mailbox kind; `footer` carries an optional line under the thread.
 */
export function SampleMailboxThread({
  businessName,
  messages,
  footer,
}: {
  businessName: string;
  messages: readonly SampleThreadMessage[];
  footer?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.thread}>
      <div className={styles.header}>
        <Avatar
          initials={initialsFromName(businessName, "?")}
          tint="coral"
          size={34}
          aria-hidden="true"
        />
        <div className={styles.headerText}>
          <span className={styles.name}>{businessName}</span>
          <span className={styles.kind}>
            {t("messages:mailbox.kind.listing")}
          </span>
        </div>
      </div>
      <ol className={styles.messages}>
        {messages.map((message) => (
          <li
            key={message.messageId}
            className={styles.run}
            data-side={message.side}
          >
            <MailboxAttributionLabel
              message={toChatMessage(message)}
              side={message.side}
              businessName={businessName}
            />
            <p className={styles.bubble}>{message.text}</p>
          </li>
        ))}
      </ol>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
