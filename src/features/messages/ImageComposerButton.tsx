import { useRef } from "react";
import { FiCamera, FiImage } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import menu from "./ComposerAttachButton.module.css";

interface ImageComposerButtonProps {
  /** Hands the picked files (one or several, the gallery input carries
   *  `multiple`) straight to `useAttachmentStaging`, which stages each
   *  immediately with a local preview and starts its upload in the
   *  background (DES-198/DES-199). Never resolves an upload itself: the
   *  actual `useUploadImage` call lives in `useAttachmentUploadQueue`. */
  onFilesPicked: (files: File[]) => void;
  /** Closes the attach menu this row lives in. Fired as soon as a file
   *  dialog opens: the upload itself resolves long after, and leaving the
   *  menu hanging over the thread until then reads as a stuck panel. */
  onPicked: () => void;
}

/** PRD-350: a coarse-pointer-only second row that opens the device camera
 *  directly (`capture="environment"`) instead of the OS gallery/file picker.
 *  On the mobile PWA, the primary surface, "take a photo" would otherwise be
 *  one extra tap behind the gallery. Recomputed on every render rather than
 *  cached in state: pointer type essentially never changes mid-session, and
 *  this mirrors the same inline `matchMedia` check `Composer` and
 *  `AttachmentCaptionScreen` already use for Enter-vs-newline. */
function isCoarsePointer(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean(window.matchMedia?.("(pointer: coarse)").matches)
  );
}

/**
 * The composer's photo-attach affordance (MSG-8): two hidden file inputs
 * behind two menu rows, the OS gallery (always) and, on a coarse pointer
 * only, the device camera (PRD-350), both feeding the SAME `onFilesPicked`
 * staging path, so a photo taken live and a photo picked from the gallery
 * get identical preview/caption/progress treatment.
 *
 * Renders as rows of `ComposerAttachButton`'s menu rather than a standalone
 * circle beside the input: the composer's controls moved INSIDE the pill,
 * and one paperclip opening a menu is what keeps that pill uncrowded.
 */
export function ImageComposerButton({
  onFilesPicked,
  onPicked,
}: ImageComposerButtonProps) {
  const { t } = useTranslation();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files ? Array.from(event.target.files) : [];
    // Reset so picking the SAME file(s) twice in a row still fires `onChange`.
    event.target.value = "";
    if (files.length > 0) onFilesPicked(files);
  }

  return (
    <>
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        aria-label={t("messages:attachments.open")}
        hidden
        onChange={handleChange}
      />
      <button
        type="button"
        className={menu.row}
        onClick={() => {
          galleryInputRef.current?.click();
          onPicked();
        }}
      >
        <span className={menu.rowIcon} aria-hidden>
          <FiImage />
        </span>
        <span>{t("messages:attachments.open")}</span>
      </button>
      {isCoarsePointer() && (
        <>
          {/* `accept` deliberately stays the broad `image/*` here rather than
              the gallery input's exact allow-list above: several mobile
              browsers (notably older Android WebViews) only honour
              `capture="environment"` and open the camera UI at all when
              `accept` is the generic `image/*`, silently falling back to a
              plain file picker for a narrower list. The camera itself only
              ever produces a JPEG, and `validateTypeAndSize` (run before
              staging, see `useAttachmentSendQueue`) still rejects anything
              outside the real allow-list regardless of what this attribute
              let through. */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            aria-label={t("messages:attachments.openCamera")}
            hidden
            onChange={handleChange}
          />
          <button
            type="button"
            className={menu.row}
            onClick={() => {
              cameraInputRef.current?.click();
              onPicked();
            }}
          >
            <span className={menu.rowIcon} aria-hidden>
              <FiCamera />
            </span>
            <span>{t("messages:attachments.openCamera")}</span>
          </button>
        </>
      )}
    </>
  );
}
