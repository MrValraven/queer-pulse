import { FiImage, FiX } from "react-icons/fi";
import { IconButton } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { usePostImageAttach } from "../communities/usePostImageAttach";
import styles from "./ThreadPage.module.css";

/** The staged-image state a forum composer holds. */
export type ForumImageAttachState = ReturnType<typeof usePostImageAttach>;

/**
 * "Attach a photo" for the forum composers (SOC-13): a hidden file input, the
 * button that opens it, the staged preview with a remove control, and the
 * upload/validation error line.
 *
 * The pipeline is `usePostImageAttach`, the same hook the community Pulse and
 * Discussion composers use, which is itself the shared `useUploadImage`
 * presigned path (client-side EXIF/GPS strip and downscale, presigned direct
 * PUT, a local blob in demo mode). Nothing about uploading is reimplemented
 * here: this file is the forum's rendering of it, so the two surfaces cannot
 * drift the way the two community composers once did.
 *
 * The caller owns the hook, because it also needs `attach.image.key` at submit
 * time and `attach.remove()` once the post has landed.
 */
export function ForumImageAttach({
  attach,
  /** Accessible name for the attach button, so the two composers can say what
   *  the photo is going onto. */
  buttonLabel,
}: {
  attach: ForumImageAttachState;
  buttonLabel: string;
}) {
  const { t } = useTranslation();
  const { image, uploading: isUploading, error, inputRef, handleFile } = attach;

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        aria-label={buttonLabel}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Reset so picking the SAME file twice in a row still fires onChange.
          event.target.value = "";
          void handleFile(file);
        }}
      />
      <button
        type="button"
        className={styles.attachBtn}
        aria-label={buttonLabel}
        aria-busy={isUploading}
        disabled={isUploading}
        onClick={attach.openPicker}
      >
        <FiImage aria-hidden="true" />
        <span>
          {isUploading
            ? t("forum:compose.imageUploading")
            : t("forum:compose.imageAttachCta")}
        </span>
      </button>
      {image && (
        <div className={styles.stagedImage}>
          <img src={image.previewUrl} alt="" />
          <IconButton
            className={styles.stagedImageRemove}
            size="sm"
            aria-label={t("forum:compose.imageRemoveAria")}
            onClick={attach.remove}
          >
            <FiX aria-hidden />
          </IconButton>
        </div>
      )}
      {error && (
        <p className={styles.attachError} role="alert">
          {error}
        </p>
      )}
    </>
  );
}

/**
 * A photo attached to a published post or reply. Kept next to the attach
 * control so the staged preview and the published rendering stay one pair.
 */
export function ForumPostImage({ src }: { src: string | undefined }) {
  const { t } = useTranslation();
  if (!src) return null;
  return (
    <img
      className={styles.postImage}
      src={src}
      // Decorative-adjacent: the member wrote no caption, so an invented
      // description would be a guess read aloud as fact. The generic label says
      // what it is and no more.
      alt={t("forum:post.imageAlt")}
      loading="lazy"
    />
  );
}
