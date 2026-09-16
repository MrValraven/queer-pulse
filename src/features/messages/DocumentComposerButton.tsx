import { useRef } from "react";
import { FiFileText } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import menu from "./ComposerAttachButton.module.css";

interface DocumentComposerButtonProps {
  /** Hands the picked files (one or several, the input carries `multiple`)
   *  straight to `useAttachmentStaging`, which stages each immediately with
   *  a file card preview and starts its upload in the background
   *  (DES-198/DES-199). Never resolves an upload itself: the actual
   *  `useUploadDocument` call lives in `useAttachmentUploadQueue`. */
  onFilesPicked: (files: File[]) => void;
  /** Closes the attach menu this row lives in, see `ImageComposerButton`'s
   *  own doc for why it fires at dialog-open, not at upload-resolve. */
  onPicked: () => void;
}

/**
 * The composer's document-attach affordance (PRD-226): a lease PDF, a flyer,
 * a spreadsheet, or a plain-text file, staged through the SAME caption
 * screen a photo goes through (DES-198), uploaded through the same
 * presigned direct-to-storage pipeline every other upload in the app uses
 * (`message-document` kind), reusing the app's real storage/upload
 * infrastructure rather than a bespoke messaging-only path. Its upload
 * pipeline deliberately stays separate from `ImageComposerButton`'s own: an
 * image is re-encoded through a `<canvas>` (which strips EXIF as a side
 * effect of decoding pixels); a document has no pixels, so there is no
 * equivalent free strip.
 *
 * DOCUMENT METADATA IS NOT STRIPPED. A PDF's Author/Producer/CreationDate
 * properties (and an XLSX's core.xml equivalent) ship to the recipient
 * exactly as the source file carried them, the same class of risk EXIF
 * poses for a photo, just for a different container format. Removing it
 * safely needs a real PDF/OOXML parser (e.g. `pdf-lib`), a new dependency
 * this task deliberately did not add: flagged here, at the point of upload,
 * for the maintainer to weigh, rather than silently shipped.
 */
export function DocumentComposerButton({
  onFilesPicked,
  onPicked,
}: DocumentComposerButtonProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf,text/plain,.txt,text/csv,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx"
        multiple
        aria-label={t("messages:attachments.openDocument")}
        hidden
        onChange={(event) => {
          const files = event.target.files
            ? Array.from(event.target.files)
            : [];
          // Reset so picking the SAME file(s) twice in a row still fires
          // `onChange`.
          event.target.value = "";
          if (files.length > 0) onFilesPicked(files);
        }}
      />
      <button
        type="button"
        className={menu.row}
        onClick={() => {
          inputRef.current?.click();
          onPicked();
        }}
      >
        <span className={menu.rowIcon} aria-hidden>
          <FiFileText />
        </span>
        <span>{t("messages:attachments.openDocument")}</span>
      </button>
    </>
  );
}
