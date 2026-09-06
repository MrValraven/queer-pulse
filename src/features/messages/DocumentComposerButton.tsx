import { useRef, useState } from "react";
import { FiPaperclip } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUploadDocument } from "./useUploadDocument";
import { DocumentProcessingError } from "./documentUploadProcessing";
import type { DocumentAttachment } from "../../shared/api/documentAttachment";
import styles from "./MessagesPage.module.css";

interface DocumentComposerButtonProps {
  /** Sends the uploaded document as its own message. `attachment` is the SEND
   *  payload (a private storage key); `localAttachment` is the upload's local
   *  blob preview, for the optimistic bubble's download link to work before
   *  the server round-trip resolves it. */
  onSendDocument: (
    attachment: DocumentAttachment,
    localAttachment?: DocumentAttachment,
  ) => void;
}

/**
 * The composer's document-attach affordance (PRD-226): a lease PDF, a flyer,
 * a spreadsheet, or a plain-text file, uploaded through the SAME presigned
 * direct-to-storage pipeline every other upload in the app uses
 * (`message-document` kind) — never a bespoke messaging-only path. Beside
 * `ImageComposerButton`, which it deliberately does NOT share an upload
 * pipeline with: an image is re-encoded through a `<canvas>` (which strips
 * EXIF as a side effect of decoding pixels); a document has no pixels, so
 * there is no equivalent free strip.
 *
 * DOCUMENT METADATA IS NOT STRIPPED. A PDF's Author/Producer/CreationDate
 * properties (and an XLSX's core.xml equivalent) ship to the recipient
 * exactly as the source file carried them — the same class of risk EXIF
 * poses for a photo, just for a different container format. Removing it
 * safely needs a real PDF/OOXML parser (e.g. `pdf-lib`), which is a new
 * dependency this task deliberately did not add — see the messaging
 * engineer's report for the explicit call this needs from the maintainer.
 * Flagged here, at the point of upload, rather than silently shipped.
 */
export function DocumentComposerButton({
  onSendDocument,
}: DocumentComposerButtonProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const uploadDocument = useUploadDocument();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const { key, previewUrl } = await uploadDocument(file);
      const sendAttachment: DocumentAttachment = {
        url: key,
        fileName: file.name,
        byteSize: file.size,
        contentType: file.type,
        provider: "upload",
      };
      const localAttachment: DocumentAttachment = {
        url: previewUrl,
        fileName: file.name,
        byteSize: file.size,
        contentType: file.type,
        provider: "upload",
      };
      onSendDocument(sendAttachment, localAttachment);
    } catch (err) {
      const message =
        err instanceof DocumentProcessingError
          ? t(err.i18nKey, err.values)
          : t("messages:attachments.documentError.retry");
      showToast(message, "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf,text/plain,.txt,text/csv,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx"
        aria-label={t("messages:attachments.openDocument")}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Reset so picking the SAME file twice in a row still fires `onChange`.
          event.target.value = "";
          if (file) void handleFile(file);
        }}
      />
      <button
        type="button"
        className={styles.gifBtn}
        aria-label={t("messages:attachments.openDocument")}
        aria-busy={uploading}
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        <FiPaperclip aria-hidden />
      </button>
    </>
  );
}
