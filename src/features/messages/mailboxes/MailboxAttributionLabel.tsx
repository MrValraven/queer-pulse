import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ChatMessage } from "../data";
import styles from "./MailboxAttributionLabel.module.css";

export interface MailboxAttributionLabelProps {
  /** The first message of the run; a run never mixes staff senders. */
  message: ChatMessage;
  /** Which side of the thread the run sits on. */
  side: "me" | "them";
  /** The business name when the message carries no `senderName`. */
  businessName?: string;
}

/**
 * The optional staff attribution over a run sent as a business. The customer
 * reads "Rui from Café Lisboa"; the staff read "Sent by Rui" over a reply a
 * colleague typed. A reply the member typed themselves reads as their own
 * bubble and carries nothing. Without a first name the business alone speaks,
 * and the header already names it, so the label renders nothing. The first
 * name is plain text with no link: it names a person without exposing their
 * profile.
 */
export function MailboxAttributionLabel({
  message,
  side,
  businessName,
}: MailboxAttributionLabelProps) {
  const { t } = useTranslation();
  const firstName = message.senderStaffFirstName;
  if (!firstName || !message.senderIdentityId) return null;
  if (side === "me") {
    // `isSentByViewer` absent is an older cached bubble: the first-name line
    // is the safe reading, since it never claims the member typed it.
    if (message.isSentByViewer === true) return null;
    return (
      <span className={`${styles.label} ${styles.labelMine}`}>
        {t("messages:mailbox.attribution.staffLine", { name: firstName })}
      </span>
    );
  }
  const business = message.senderName ?? businessName;
  if (!business) return null;
  return (
    <span className={styles.label}>
      {t("messages:mailbox.attribution.customerLine", {
        name: firstName,
        business,
      })}
    </span>
  );
}
