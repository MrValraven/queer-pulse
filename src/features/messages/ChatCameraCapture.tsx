// src/features/messages/ChatCameraCapture.tsx
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiRefreshCw, FiX } from "react-icons/fi";
import { useDismiss } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useChatCameraStream } from "./useChatCameraStream";
import styles from "./ChatCameraCapture.module.css";

/** `toBlob`'s own JPEG quality argument. High enough that a message photo
 *  taken in-app doesn't look worse than the OS camera's own JPEG output. */
const CAPTURED_PHOTO_QUALITY = 0.9;

interface ChatCameraCaptureProps {
  /** Hands the captured photo straight to the SAME `onFilesPicked` staging
   *  path a gallery or system-camera pick already uses (see
   *  `ImageComposerButton`), so it gets identical preview/caption/upload
   *  treatment regardless of where the photo came from. */
  onCapture: (file: File) => void;
  onClose: () => void;
  /** The camera couldn't start (no `getUserMedia` support, permission
   *  denied, or any other stream failure) and the member asked to fall back
   *  to the OS camera instead; wired by `ImageComposerButton` to the hidden
   *  `capture="environment"` input it already owns. */
  onFallback: () => void;
}

/**
 * An in-app camera sheet (PRD-350 follow-up): on Android, the hidden
 * `capture="environment"` file input opens the OS camera, which shows its
 * OWN review screen before handing the file back, landing the member on a
 * second, smaller review inside `AttachmentCaptionScreen` right after. This
 * sheet replaces that hand-off with a single in-app flow: a full-screen live
 * `getUserMedia` viewfinder filling the screen edge to edge on black, a round
 * shutter bottom-centre that grabs the current video frame onto a canvas at
 * the stream's native resolution and hands it to `onCapture` as a `File`,
 * exactly as a picked file would arrive. Tap shutter, land straight on the
 * (now bigger) caption screen: a single in-app flow from camera to send.
 *
 * Falls back to the OS camera (`onFallback`) once the stream reports it's
 * denied or failed; `ImageComposerButton` also skips this sheet entirely
 * when the browser has no `getUserMedia` at all. Either way the member always
 * ends up with a working camera, never stuck on a blank sheet.
 */
export function ChatCameraCapture({
  onCapture,
  onClose,
  onFallback,
}: ChatCameraCaptureProps) {
  const { t } = useTranslation();
  const dialogRef = useDismiss(onClose);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );
  const { videoRef, state } = useChatCameraStream(facingMode);

  const handleShutter = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    // `readyState < 2` (HAVE_CURRENT_DATA) means no frame has decoded yet; a
    // capture attempted that early would draw a blank canvas.
    if (!video || !canvas || video.readyState < 2) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCapture(
          new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" }),
        );
      },
      "image/jpeg",
      CAPTURED_PHOTO_QUALITY,
    );
  }, [onCapture, videoRef]);

  return createPortal(
    <div className={styles.scrim} role="presentation">
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={t("messages:attachments.cameraSheetLabel")}
        tabIndex={-1}
      >
        <video
          ref={videoRef}
          className={styles.viewfinder}
          autoPlay
          muted
          playsInline
        />
        {/* Never rendered visibly: the shutter draws straight onto this to
            read back a still frame, then discards it once `toBlob` resolves. */}
        <canvas ref={canvasRef} hidden />
        <button
          type="button"
          className={styles.closeButton}
          aria-label={t("messages:attachments.cameraClose")}
          onClick={onClose}
        >
          <FiX aria-hidden size={22} />
        </button>
        {(state === "denied" || state === "failed") && (
          <div className={styles.errorPanel} role="alert">
            <p className={styles.errorText}>
              {t(
                state === "denied"
                  ? "messages:attachments.cameraDenied"
                  : "messages:attachments.cameraFailed",
              )}
            </p>
            <button
              type="button"
              className={styles.fallbackButton}
              onClick={onFallback}
            >
              {t("messages:attachments.cameraUseSystem")}
            </button>
          </div>
        )}
        {state === "live" && (
          <>
            <button
              type="button"
              className={styles.flipButton}
              aria-label={t("messages:attachments.cameraFlip")}
              onClick={() =>
                setFacingMode((previous) =>
                  previous === "environment" ? "user" : "environment",
                )
              }
            >
              <FiRefreshCw aria-hidden size={20} />
            </button>
            <button
              type="button"
              className={styles.shutterButton}
              aria-label={t("messages:attachments.cameraShutter")}
              onClick={handleShutter}
            />
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
