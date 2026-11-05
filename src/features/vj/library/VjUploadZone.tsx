import { useId, useRef, useState, type DragEvent } from "react";
import { FiUpload } from "react-icons/fi";
import { VJ_LIMITS } from "../../../shared/contracts/vj";
import { Button, Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { VjClipUploads } from "../upload/useVjClipUploads";
import { formatVjBytes } from "../vjFormat";
import styles from "./VjUpload.module.css";

/** A MOV or an HEVC file can still be picked, so its row names the cause. */
const VJ_UPLOAD_ACCEPT = "video/*,.gif,image/gif";

interface VjUploadZoneProps {
  uploads: VjClipUploads;
  packId: string | null;
  packName: string | null;
}

function isFileDrag(event: DragEvent<HTMLDivElement>): boolean {
  return Array.from(event.dataTransfer.types).includes("Files");
}

/**
 * Where clips come in: a real file input behind a visible "Upload clips"
 * button, so Tab, Enter and Space open the picker, and the whole zone takes
 * dropped files. Every file goes to the queue, which names any it refuses.
 */
export function VjUploadZone({ uploads, packId, packName }: VjUploadZoneProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const acceptsId = useId();
  const destinationId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const destinationText =
    packId === null
      ? t("vj:upload.destinationLibrary")
      : packName === null
        ? null
        : t("vj:upload.destinationPack", { pack: packName });
  const describedBy =
    destinationText === null ? acceptsId : `${acceptsId} ${destinationId}`;

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    uploads.addFiles(Array.from(event.dataTransfer.files), packId);
  }

  return (
    <div
      className={styles.zone}
      data-vj-drop-zone=""
      data-dragging={isDragging ? "true" : "false"}
      onDragOver={(event) => {
        if (!isFileDrag(event)) return;
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        // Moving between the zone's own children keeps the highlight.
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setIsDragging(false);
      }}
      onDrop={handleDrop}
    >
      <span className={styles.zoneIcon}>
        <FiUpload aria-hidden="true" focusable="false" fill="none" />
      </span>
      <p className={styles.zoneTitle}>{t("vj:upload.dropTitle")}</p>
      <input
        ref={inputRef}
        className={styles.fileInput}
        type="file"
        accept={VJ_UPLOAD_ACCEPT}
        multiple
        tabIndex={-1}
        aria-label={t("vj:upload.cta")}
        aria-describedby={describedBy}
        onChange={(event) => {
          uploads.addFiles(Array.from(event.target.files ?? []), packId);
          event.target.value = "";
        }}
      />
      <Button
        variant="soft"
        aria-describedby={describedBy}
        onClick={() => inputRef.current?.click()}
      >
        <FiUpload aria-hidden="true" focusable="false" fill="none" />
        {t("vj:upload.cta")}
      </Button>
      <div className={styles.zoneNotes}>
        <p id={acceptsId} className={styles.zoneNote}>
          {t("vj:upload.accepts", {
            max: formatVjBytes(VJ_LIMITS.clipMaxBytes),
          })}
        </p>
        <Collapse isOpen={destinationText !== null}>
          <p id={destinationId} className={styles.zoneNote}>
            {destinationText}
          </p>
        </Collapse>
      </div>
    </div>
  );
}
