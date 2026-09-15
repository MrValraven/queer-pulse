import type { ChangeEvent, RefObject } from "react";
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiImage,
  FiX,
} from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  COMPOSE_ALT_MAX_LENGTH,
  type ComposePhoto,
} from "./composeThread.types";
import styles from "./ComposePhotoGrid.module.css";

// ── Up to four staged photos, each with its description ─────────────────────
// The description is not an afterthought tucked behind a menu: it is a field
// on the tile with a flag that says out loud whether it is still missing, so a
// photo nobody can see is visibly unfinished rather than quietly published.
//
// Every control drives the `photos` controller from `useComposeThreadPage`.
// Nothing about the order or the upload lives here.

/** The file types the picker accepts. Matches the upload pipeline. */
const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

export interface ComposePhotoGridProps {
  /** The staged photos, in display order. */
  photos: readonly ComposePhoto[];
  /** Describes a photo. The controller applies `COMPOSE_ALT_MAX_LENGTH`. */
  onAltChange: (index: number, alt: string) => void;
  /** Takes a photo off the post. */
  onRemove: (index: number) => void;
  /** Moves one photo one place earlier (`-1`) or later (`1`). */
  onMove: (index: number, direction: -1 | 1) => void;
}

export function ComposePhotoGrid({
  photos,
  onAltChange,
  onRemove,
  onMove,
}: ComposePhotoGridProps) {
  const { t } = useTranslation();
  if (photos.length === 0) return null;

  return (
    <ul
      className={styles.grid}
      aria-label={t("forum:composePage.photo.gridLabel")}
    >
      {photos.map((photo, index) => (
        <ComposePhotoTile
          key={photo.key}
          photo={photo}
          index={index}
          total={photos.length}
          onAltChange={onAltChange}
          onRemove={onRemove}
          onMove={onMove}
        />
      ))}
    </ul>
  );
}

/** One staged photo: the preview, its reorder/remove controls, its alt flag
 *  and the description field that clears the flag. */
function ComposePhotoTile({
  photo,
  index,
  total,
  onAltChange,
  onRemove,
  onMove,
}: {
  photo: ComposePhoto;
  index: number;
  total: number;
  onAltChange: (index: number, alt: string) => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  const { t } = useTranslation();
  const hasAlt = !!photo.alt.trim();
  // 1-based, because every label naming this tile is read by a person.
  const position = index + 1;
  const labelValues = { position, total };

  return (
    <li className={styles.tile}>
      {/* Decorative here: the description the member is writing sits directly
          below, and repeating it as this preview's alt would read it twice. */}
      <img className={styles.preview} src={photo.previewUrl} alt="" />
      <span
        className={[styles.flag, hasAlt && styles.flagDone]
          .filter(Boolean)
          .join(" ")}
      >
        {hasAlt && <FiCheck className={styles.flagIcon} aria-hidden />}
        {hasAlt
          ? t("forum:composePage.photo.altDone")
          : t("forum:composePage.photo.altNeeded")}
      </span>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.control}
          disabled={index === 0}
          aria-label={t("forum:composePage.photo.moveEarlier", labelValues)}
          onClick={() => onMove(index, -1)}
        >
          <FiChevronLeft className={styles.controlIcon} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.control}
          disabled={index === total - 1}
          aria-label={t("forum:composePage.photo.moveLater", labelValues)}
          onClick={() => onMove(index, 1)}
        >
          <FiChevronRight className={styles.controlIcon} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.control}
          aria-label={t("forum:composePage.photo.remove", labelValues)}
          onClick={() => onRemove(index)}
        >
          <FiX className={styles.controlIcon} aria-hidden />
        </button>
      </div>
      <input
        type="text"
        className={[styles.alt, hasAlt && styles.altDone]
          .filter(Boolean)
          .join(" ")}
        value={photo.alt}
        maxLength={COMPOSE_ALT_MAX_LENGTH}
        placeholder={t("forum:composePage.photo.altPlaceholder")}
        aria-label={t("forum:composePage.photo.altLabel", labelValues)}
        onChange={(event) => onAltChange(index, event.target.value)}
      />
    </li>
  );
}

export interface ComposePhotoAttachProps {
  /** The hidden file input the picker opens. From the photos controller. */
  inputRef: RefObject<HTMLInputElement | null>;
  /** Opens the file picker. */
  onOpenPicker: () => void;
  /** Uploads whatever the picker handed back. */
  onAddFiles: (files: FileList | null) => void;
  /** True once four photos are staged. */
  hasReachedLimit: boolean;
  /** True while at least one file is still uploading. */
  isUploading: boolean;
  /** A ready-to-render error line, or null. */
  error: string | null;
}

/**
 * The "Add a photo" control, plus the hidden input it opens and the upload's
 * status line. Lives beside the grid rather than inside it because the body
 * footer is where the prototype puts the button, and the grid renders nothing
 * at all until the first photo lands.
 */
export function ComposePhotoAttach({
  inputRef,
  onOpenPicker,
  onAddFiles,
  hasReachedLimit,
  isUploading,
  error,
}: ComposePhotoAttachProps) {
  const { t } = useTranslation();

  function handlePick(event: ChangeEvent<HTMLInputElement>) {
    onAddFiles(event.target.files);
  }

  return (
    <span className={styles.attachWrap}>
      <Button
        variant="ghost"
        size="sm"
        className={styles.attachButton}
        disabled={hasReachedLimit || isUploading}
        onClick={onOpenPicker}
      >
        <FiImage className={styles.attachIcon} aria-hidden />
        {t("forum:composePage.photo.attach")}
      </Button>
      <input
        ref={inputRef}
        type="file"
        className={styles.fileInput}
        accept={ACCEPTED_IMAGE_TYPES}
        multiple
        aria-label={t("forum:composePage.photo.inputLabel")}
        onChange={handlePick}
      />
      {isUploading && (
        <span className={styles.attachNote} aria-live="polite">
          {t("forum:composePage.photo.uploading")}
        </span>
      )}
      {hasReachedLimit && !isUploading && (
        <span className={styles.attachNote}>
          {t("forum:composePage.photo.limitReached")}
        </span>
      )}
      {error && (
        <span className={styles.attachError} role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
