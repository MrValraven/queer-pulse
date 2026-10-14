import { useId, useRef, useState, type DragEvent } from "react";
import { FiUpload } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./creator.module.css";
import tracksStyles from "./StudioUploadTracks.module.css";

const ACCEPT = ".mp3,.m4a,audio/mpeg,audio/mp4";

/** A real file input behind a visible button, so Tab, Enter and Space open
 *  the picker; dropping files anywhere on the zone adds them too. */
export function DropZone({
  onFiles,
  isDisabled,
  acceptsKey = "studio:uploadFlow.files.accepts",
  titleKey = "studio:uploadFlow.files.dropTitle",
  chooseKey = "studio:uploadFlow.files.chooseCta",
}: {
  onFiles: (files: File[]) => void;
  isDisabled: boolean;
  /** Artist kinds: the accepts line of the release's format. */
  acceptsKey?: string;
  /** The drop title, for a zone with its own wording (an episode's). */
  titleKey?: string;
  /** The choose button's label key. */
  chooseKey?: string;
}) {
  const { t } = useTranslation();
  const inputId = useId();
  const hintId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (!isDisabled) onFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <div
      className={[s.dropzone, isDragging && tracksStyles.dropActive]
        .filter(Boolean)
        .join(" ")}
      onDragOver={(event) => {
        event.preventDefault();
        if (!isDisabled && event.dataTransfer.types.includes("Files"))
          setIsDragging(true);
      }}
      onDragLeave={(event) => {
        // Moving between the zone's own children keeps the highlight.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setIsDragging(false);
      }}
      onDrop={handleDrop}
    >
      <div className={s.uploadIcon}>
        <FiUpload aria-hidden />
      </div>
      <h3>
        <Translation i18nKey={titleKey} components={{ em: <em /> }} />
      </h3>
      <p id={hintId} className={s.uploadTypes}>
        <Translation i18nKey={acceptsKey} components={{ em: <em /> }} />
      </p>
      <input
        ref={inputRef}
        id={inputId}
        className={tracksStyles.fileInput}
        type="file"
        accept={ACCEPT}
        multiple
        disabled={isDisabled}
        tabIndex={-1}
        aria-label={t(chooseKey)}
        aria-describedby={hintId}
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
      <button
        type="button"
        className={tracksStyles.chooseButton}
        data-upload-choose=""
        disabled={isDisabled}
        aria-describedby={hintId}
        onClick={() => inputRef.current?.click()}
      >
        {t(chooseKey)}
      </button>
    </div>
  );
}
