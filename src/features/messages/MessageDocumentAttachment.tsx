// src/features/messages/MessageDocumentAttachment.tsx
import { useState, type MouseEvent, type ReactNode } from "react";
import { FiFile } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";
import { useMessageSafetyContext } from "./MessageSafetyContext";
import { OpenExternalConfirmDialog } from "./OpenExternalConfirmDialog";
import styles from "./MessagesPage.module.css";

/** The neutral stand-in for a restored outbox entry (page reload) whose local
 *  `blob:` preview was stripped before persisting — shared by the gif/image
 *  and document branches of `MessageBubbleBody` so the two never drift. */
export function AttachmentPreviewUnavailable({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div
      className={styles.imagePreviewUnavailable}
      role="img"
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

/** Short, human format label per content type — mirrors the backend's
 *  `DOCUMENT_UPLOAD_TYPES` (PRD-226). Falls back to the bare content type
 *  (e.g. an unexpected but server-accepted future addition) rather than
 *  hiding the format entirely. */
const FORMAT_LABEL_BY_CONTENT_TYPE: Record<string, string> = {
  "application/pdf": "PDF",
  "text/plain": "Text",
  "text/csv": "CSV",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    "Spreadsheet",
};

function formatLabel(contentType: string): string {
  return FORMAT_LABEL_BY_CONTENT_TYPE[contentType] ?? contentType;
}

/** `1.2 MB` / `340 KB` / `48 B` — no i18n needed (units are the same word in
 *  EN/PT: "KB"/"MB"). */
function formatSize(byteSize: number): string {
  if (byteSize < 1024) return `${byteSize} B`;
  if (byteSize < 1024 * 1024) return `${(byteSize / 1024).toFixed(1)} KB`;
  return `${(byteSize / (1024 * 1024)).toFixed(1)} MB`;
}

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
 * The file-card bubble for a `kind:"document"` message (PRD-226): the
 * original file name, its format and size, and a real, keyboard-reachable
 * download link with an accessible name — split out of `MessageBubbleBody`
 * to keep that file's growth minimal (it already sits at the line cap).
 * Visually a bordered card rather than the inline-image treatment
 * `MessageBubbleBody` gives a gif/image, since a document has no pixels to
 * preview.
 *
 * `download` hints the browser to save rather than navigate — the backend
 * (T7) additionally serves message documents with a `Content-Disposition:
 * attachment` header, but demo mode has no such header on its static asset,
 * so the attribute is what keeps demo behaviour matching live.
 *
 * PRD-369: an INBOUND document (`!isSent`) from someone who isn't yet an
 * accepted connection (`useMessageSafetyContext`) pauses on
 * `OpenExternalConfirmDialog` before opening — the same confirm component
 * PRD-371's suspicious links use. Your own uploads and a connection's
 * documents open directly, exactly as before.
 */
export function MessageDocumentAttachment({
  attachment,
  isSent,
}: {
  attachment: DocumentAttachment;
  isSent: boolean;
}) {
  const { t } = useTranslation();
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
    <>
      <a
        className={styles.documentCard}
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        download={attachment.fileName}
        aria-label={t("messages:attachments.download", {
          fileName: attachment.fileName,
        })}
        onClick={handleClick}
      >
        <span className={styles.documentIcon} aria-hidden>
          <FiFile />
        </span>
        <span className={styles.documentDetails}>
          <span className={styles.documentName}>{attachment.fileName}</span>
          <span className={styles.documentMeta}>
            {t("messages:attachments.documentMeta", {
              format: formatLabel(attachment.contentType),
              size: formatSize(attachment.byteSize),
            })}
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
              format: formatLabel(attachment.contentType),
              size: formatSize(attachment.byteSize),
            })}
          </p>
        </OpenExternalConfirmDialog>
      )}
    </>
  );
}
