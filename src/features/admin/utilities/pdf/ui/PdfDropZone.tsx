import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { FiFilePlus, FiLock, FiUploadCloud } from "react-icons/fi";
import { Button, Collapse, Spinner } from "../../../../../shared/components/ui";
import { useMediaQuery } from "../../../../../shared/hooks";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import styles from "./PdfChrome.module.css";

interface PdfDropZoneProps {
  variant: "full" | "compact";
  openingCount: number;
  onFiles: (files: File[]) => void;
}

/** True when the drag carries files from the device (a text or link drag does not). */
function isFileDrag(event: DragEvent<HTMLElement>): boolean {
  return Array.from(event.dataTransfer.types).includes("Files");
}

/**
 * Where PDFs come in: a dashed zone that takes dropped files, with a button
 * that opens the file picker. The full variant greets an empty toolkit; the
 * compact one sits above the grid once files are open, and on a touch screen
 * it is the button alone, since nothing gets dragged there.
 */
export function PdfDropZone({
  variant,
  openingCount,
  onFiles,
}: PdfDropZoneProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  // Every nested child fires its own enter and leave, so the zone counts
  // them and only goes quiet once the pointer has left all of them.
  const dragDepthRef = useRef(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const isFull = variant === "full";
  const isCoarsePointer = useMediaQuery("(pointer: coarse)");

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDragActive(true);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!isFileDrag(event)) return;
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setIsDragActive(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragActive(false);
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length > 0) onFiles(droppedFiles);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const pickedFiles = Array.from(event.target.files ?? []);
    // Cleared so picking the same file again still fires a change.
    event.target.value = "";
    if (pickedFiles.length > 0) onFiles(pickedFiles);
  }

  const chooseButton = (
    <Button
      variant={isFull ? "primary" : "ghost"}
      onClick={() => inputRef.current?.click()}
    >
      {isFull ? null : <FiFilePlus aria-hidden />}
      {t(
        isFull
          ? "admin:utilities.pdf.drop.choose"
          : "admin:utilities.pdf.drop.add",
      )}
    </Button>
  );
  const zoneClassName = isFull
    ? styles.dropZone
    : `${styles.dropZone} ${styles.dropZoneCompact}`;

  return (
    <div
      className={zoneClassName}
      data-drag-active={isDragActive}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        className="visuallyHidden"
        tabIndex={-1}
        aria-label={t("admin:utilities.pdf.drop.inputLabel")}
        onChange={handleInputChange}
      />
      {isFull && (
        <span className={styles.dropIcon} aria-hidden>
          <FiUploadCloud />
        </span>
      )}
      {isFull && (
        <p className={styles.swap}>
          <span
            className={`${styles.swapLine} ${styles.dropTitle}`}
            data-shown={!isDragActive}
            aria-hidden={isDragActive}
          >
            {t(
              isCoarsePointer
                ? "admin:utilities.pdf.drop.titleTouch"
                : "admin:utilities.pdf.drop.title",
            )}
          </span>
          <span
            className={`${styles.swapLine} ${styles.dropTitle}`}
            data-shown={isDragActive}
            aria-hidden={!isDragActive}
          >
            {t("admin:utilities.pdf.drop.active")}
          </span>
        </p>
      )}
      {isFull ? (
        chooseButton
      ) : (
        // The button and the drop line share one cell and crossfade, so the
        // line takes no room of its own while nothing is being dragged.
        <span className={styles.compactSlot}>
          <span className={styles.swapLine} data-shown={!isDragActive}>
            {chooseButton}
          </span>
          <span
            className={`${styles.swapLine} ${styles.dropActiveLine}`}
            data-shown={isDragActive}
            aria-hidden={!isDragActive}
          >
            {t("admin:utilities.pdf.drop.active")}
          </span>
        </span>
      )}
      {isFull && (
        <p className={styles.privacy}>
          <FiLock aria-hidden />
          {t("admin:utilities.pdf.drop.privacy")}
        </p>
      )}
      <div role="status">
        <Collapse isOpen={openingCount > 0}>
          <span className={styles.opening}>
            <Spinner />
            {t("admin:utilities.pdf.drop.opening", { count: openingCount })}
          </span>
        </Collapse>
      </div>
    </div>
  );
}
