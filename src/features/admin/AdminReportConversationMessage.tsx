import {
  FiAlertTriangle,
  FiBriefcase,
  FiFileText,
  FiImage,
  FiSlash,
  FiSmile,
} from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatBytes } from "./adminMedia.format";
import type { ConversationContextMessageDTO } from "./api/moderation.api";
import { sentAsIdentityLabel } from "./sentAsIdentityLabel";
import styles from "./AdminReportEvidence.module.css";

const ATTACHMENT_LABEL_KEY: Partial<
  Record<ConversationContextMessageDTO["kind"], string>
> = {
  image: "admin:moderation.reportDrawer.conversationContext.photoLabel",
  gif: "admin:moderation.reportDrawer.conversationContext.gifLabel",
  document: "admin:moderation.reportDrawer.conversationContext.documentLabel",
  // No admin key names a sticker; the chat's own kind word is the same one
  // the member-facing message info sheet uses.
  sticker: "messages:sticker.attachmentLabel",
};

/**
 * One message in the staff conversation viewer. Backend-fetched content, shown
 * as stored: the reported message is marked, a deleted message says so (with
 * no body unless it is the reported one), and a sender who erased their
 * account reads as a former member.
 */
export function ConversationContextMessage({
  message,
}: {
  message: ConversationContextMessageDTO;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const sentAt = new Date(message.sentAt);
  const className = [
    styles.contextMessage,
    message.isReportedMessage && styles.contextMessageReported,
    message.kind === "system" && styles.contextMessageSystem,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li
      className={className}
      aria-current={message.isReportedMessage ? "true" : undefined}
    >
      <div className={styles.contextMeta}>
        <span
          className={
            message.senderId ? styles.contextSender : styles.contextSenderFormer
          }
        >
          {message.senderDisplayName ??
            t("admin:moderation.reportDrawer.conversationContext.formerMember")}
        </span>
        {/* Business mailboxes, design section 9 (I2): the identity this
            message was sent as, beside the human sender above, whatever
            either attribution switch says a customer sees. */}
        {message.sentAsIdentity && (
          <span className={styles.contextSentAsIdentity}>
            <FiBriefcase aria-hidden />
            {sentAsIdentityLabel(message.sentAsIdentity, t)}
          </span>
        )}
        <time className={styles.contextTime} dateTime={message.sentAt}>
          {format.date(sentAt, { day: "numeric", month: "short" })}{" "}
          {format.time(sentAt)}
        </time>
        {message.editedAt && (
          <span className={styles.contextTag}>
            {t("admin:moderation.reportDrawer.conversationContext.editedTag")}
          </span>
        )}
        {message.isDeleted && (
          <span className={styles.contextTag}>
            <FiSlash aria-hidden />
            {t("admin:moderation.reportDrawer.conversationContext.deletedTag")}
          </span>
        )}
        {message.isReportedMessage && (
          <span className={styles.contextReportedTag}>
            <FiAlertTriangle aria-hidden />
            {t("admin:moderation.reportDrawer.conversationContext.reportedTag")}
          </span>
        )}
      </div>
      <ConversationContextBody message={message} />
    </li>
  );
}

function ConversationContextBody({
  message,
}: {
  message: ConversationContextMessageDTO;
}) {
  const { t } = useTranslation();
  const attachmentLabelKey = ATTACHMENT_LABEL_KEY[message.kind];

  if (message.body === null && message.attachment === null) {
    return (
      <p className={styles.contextBodyMuted}>
        {t("admin:moderation.reportDrawer.conversationContext.deletedBody")}
      </p>
    );
  }

  // An attachment message's `body` is only its send-time fallback word, so the
  // attachment line stands in for it.
  if (attachmentLabelKey) {
    const facts = message.attachment;
    const meta = [
      facts?.mimeType,
      facts?.sizeBytes != null ? formatBytes(facts.sizeBytes) : null,
    ]
      .filter(Boolean)
      .join(" · ");
    // A sticker's body is empty unless a pre-fix edit wrote text into it;
    // staff keep seeing that stored text under the label.
    const legacyStickerText =
      message.kind === "sticker" && message.body ? message.body : null;
    return (
      <>
        <p className={styles.attachmentLine}>
          {message.kind === "document" ? (
            <FiFileText aria-hidden />
          ) : message.kind === "sticker" ? (
            <FiSmile aria-hidden />
          ) : (
            <FiImage aria-hidden />
          )}
          <span>{facts?.fileName ?? t(attachmentLabelKey)}</span>
          {meta && <span className={styles.attachmentMeta}>{meta}</span>}
        </p>
        {legacyStickerText && (
          <p className={styles.contextBody}>{legacyStickerText}</p>
        )}
      </>
    );
  }

  return message.kind === "system" ? (
    <p className={styles.contextBodyMuted}>{message.body}</p>
  ) : (
    <p className={styles.contextBody}>{message.body}</p>
  );
}
