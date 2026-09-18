import { useRef, useState } from "react";
import { FiCamera, FiImage } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ChatCameraCapture } from "./ChatCameraCapture";
import menu from "./ComposerAttachButton.module.css";

/** Whether the in-app camera sheet (`ChatCameraCapture`) has anything to work
 *  with at all. Checked once per Camera-row tap rather than cached, since a
 *  permission prompt answered mid-session could in principle change this,
 *  and the check itself is cheap (a property read, no I/O). */
function hasCameraStreamSupport(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function"
  );
}

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
  // PRD-350 follow-up: the in-app camera sheet (`ChatCameraCapture`), shown
  // instead of the hidden `capture="environment"` input below whenever the
  // browser can actually stream from the camera. That input never goes away:
  // it's still `hasCameraStreamSupport`'s own fallback, and the sheet's own
  // `onFallback` reaches for it too if the live stream is denied or fails.
  const [isCameraSheetOpen, setIsCameraSheetOpen] = useState(false);

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
              // No live-stream support at all (no `getUserMedia`, an old
              // WebView): skip the in-app sheet entirely and go straight to
              // the OS camera, same as before this sheet existed.
              if (hasCameraStreamSupport()) setIsCameraSheetOpen(true);
              else cameraInputRef.current?.click();
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
      {isCameraSheetOpen && (
        <ChatCameraCapture
          onCapture={(file) => {
            setIsCameraSheetOpen(false);
            onFilesPicked([file]);
          }}
          onClose={() => setIsCameraSheetOpen(false)}
          onFallback={() => {
            setIsCameraSheetOpen(false);
            cameraInputRef.current?.click();
          }}
        />
      )}
    </>
  );
}
