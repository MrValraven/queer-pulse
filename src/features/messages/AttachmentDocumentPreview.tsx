// src/features/messages/AttachmentDocumentPreview.tsx
import { FiFile } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatStagedDocumentSize } from "./AttachmentStagingTypes";
import type { StagedDocumentItem } from "./AttachmentStagingTypes";
import styles from "./AttachmentDocumentPreview.module.css";

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

/**
 * DES-198's "file card with name, type icon, size" for a staged document,
 * used in the caption screen's large stage view and, at `compact` size, in
 * the thumbnail strip and the post-send pending-uploads strip. Never a real
 * download link (unlike `MessageDocumentAttachment`'s sent-bubble version):
 * a staged item isn't sent yet, so there's nothing to download.
 */
export function AttachmentDocumentPreview({
  item,
  compact = false,
}: {
  item: StagedDocumentItem;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const format =
    FORMAT_LABEL_BY_CONTENT_TYPE[item.contentType] ?? item.contentType;
  return (
    <div
      className={[styles.card, compact && styles.compact]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={styles.icon} aria-hidden>
        <FiFile />
      </span>
      <span className={styles.details}>
        <span className={styles.name}>{item.fileName}</span>
        <span className={styles.meta}>
          {t("messages:attachments.documentMeta", {
            format,
            size: formatStagedDocumentSize(item.byteSize),
          })}
        </span>
      </span>
    </div>
  );
}
