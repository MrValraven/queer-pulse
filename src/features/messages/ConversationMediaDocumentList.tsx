// src/features/messages/ConversationMediaDocumentList.tsx
import { useId, useState, type MouseEvent } from "react";
import { FiFile } from "react-icons/fi";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";
import { activeLocale } from "../../shared/i18n/locale";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  documentAttachmentOf,
  entryDateLabel,
  formatDocumentSize,
  type ConversationMediaEntry,
} from "./conversationMediaFilters";
import { useMessageSafetyContext } from "./MessageSafetyContext";
import { OpenExternalConfirmDialog } from "./OpenExternalConfirmDialog";
import styles from "./ConversationMediaGallery.module.css";

/** The Docs shelf: one row per file shared, newest first. */
export function ConversationMediaDocumentList({
  entries,
}: {
  entries: ConversationMediaEntry[];
}) {
  const locale = activeLocale();
  return (
    <ul className={styles.rows}>
      {entries.map((entry, index) => {
        const attachment = documentAttachmentOf(entry.message);
        if (!attachment) return null;
        return (
          <ConversationMediaDocumentRow
            key={
              entry.message.id ??
              entry.message.localId ??
              `${index}-${attachment.url}`
            }
            attachment={attachment}
            date={entryDateLabel(entry.at, locale)}
            isSent={entry.message.from === "me"}
          />
        );
      })}
    </ul>
  );
}

/** Short, human format label per content type, mirrors
 *  `MessageDocumentAttachment`'s own (backend `DOCUMENT_UPLOAD_TYPES`,
 *  PRD-226), duplicated here rather than imported since that component isn't
 *  in this task's file scope. */
const FORMAT_LABEL_BY_CONTENT_TYPE: Record<string, string> = {
  "application/pdf": "PDF",
  "text/plain": "Text",
  "text/csv": "CSV",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    "Spreadsheet",
};

/** A plain left-click with no modifier held. A modified click (open in a new
 *  tab/window) is left to the browser's native anchor handling. */
function isPlainLeftClick(event: MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

/**
 * Opens the file exactly the way the document bubble does
 * (`MessageDocumentAttachment`): the resolved `/files/<key>` URL in a new tab
 * with `noopener noreferrer`, named "Download lease.pdf", with the size and
 * date read as its description. PRD-369: shares that component's same
 * inbound-from-a-non-connection confirm gate, via the same shared context and
 * confirm dialog — see its own doc for why.
 */
function ConversationMediaDocumentRow({
  attachment,
  date,
  isSent,
}: {
  attachment: DocumentAttachment;
  date: string;
  isSent: boolean;
}) {
  const { t } = useTranslation();
  const metaId = useId();
  const size = formatDocumentSize(attachment.byteSize);
  const { isPendingConnection } = useMessageSafetyContext();
  const needsConfirm = !isSent && isPendingConnection;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!needsConfirm) return;
    if (event.defaultPrevented || !isPlainLeftClick(event)) return;
    event.preventDefault();
    setIsConfirmOpen(true);
  }

  function openAnyway() {
    setIsConfirmOpen(false);
    window.open(attachment.url, "_blank", "noopener,noreferrer");
  }

  return (
    <li className={styles.row}>
      <a
        className={styles.rowLink}
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        download={attachment.fileName}
        aria-label={t("messages:attachments.download", {
          fileName: attachment.fileName,
        })}
        aria-describedby={metaId}
        onClick={handleClick}
      >
        <span className={styles.rowIcon} aria-hidden="true">
          <FiFile />
        </span>
        <span className={styles.rowText}>
          <span className={styles.rowTitle}>{attachment.fileName}</span>
          <span id={metaId} className={styles.rowMeta}>
            {date
              ? t("messages:mediaGallery.documentMeta", { size, date })
              : size}
          </span>
        </span>
      </a>
      {needsConfirm && (
        <OpenExternalConfirmDialog
          open={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={openAnyway}
          title={t("messages:attachments.confirmOpenTitle")}
        >
          <p>{t("messages:attachments.confirmOpenBody")}</p>
          <p>
            {t("messages:attachments.confirmOpenFileLabel", {
              fileName: attachment.fileName,
              format:
                FORMAT_LABEL_BY_CONTENT_TYPE[attachment.contentType] ??
                attachment.contentType,
              size,
            })}
          </p>
        </OpenExternalConfirmDialog>
      )}
    </li>
  );
}
