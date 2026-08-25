import { useRef, useState } from "react";
import { FiImage } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUploadImage } from "../members/api/useUploadImage";
import { ImageProcessingError } from "../members/api/uploadProcessing";
import type { GifAttachment } from "../../shared/api/gifs";
import styles from "./MessagesPage.module.css";

interface ImageComposerButtonProps {
  /** Sends the uploaded image as its own message. `attachment` is the SEND
   *  payload (a private storage key); `localAttachment` is the upload's local
   *  blob preview, for the optimistic bubble to render instantly. */
  onSendImage: (
    attachment: GifAttachment,
    localAttachment?: GifAttachment,
  ) => void;
}

/** Reads a decoded image's intrinsic pixel size, so the bubble can reserve its
 *  box before the image paints (mirrors the GIF picker's provider-supplied
 *  dimensions — see `MessageBubbleBody`'s aspect-ratio handling). */
function readImageDimensions(
  url: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("dimension-read-failed"));
    image.src = url;
  });
}

/**
 * The composer's photo-attach affordance (MSG-8): a hidden file input behind
 * a button, uploaded through the SAME dual-mode `useUploadImage` pipeline
 * every other image surface in the app already uses — client-side EXIF/GPS
 * strip, presigned direct-to-storage PUT with progress + one retry, demo mode
 * a local blob with no network — never a bespoke messaging-only upload path.
 */
export function ImageComposerButton({ onSendImage }: ImageComposerButtonProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const uploadImage = useUploadImage("message-image");
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const { key, previewUrl } = await uploadImage(file);
      const { width, height } = await readImageDimensions(previewUrl);
      const sendAttachment: GifAttachment = {
        url: key,
        previewUrl: key,
        width,
        height,
        provider: "upload",
      };
      const localAttachment: GifAttachment = {
        url: previewUrl,
        previewUrl,
        width,
        height,
        provider: "upload",
      };
      onSendImage(sendAttachment, localAttachment);
    } catch (err) {
      const message =
        err instanceof ImageProcessingError
          ? t(err.i18nKey, err.values)
          : t("members:upload.error.retry");
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
        accept="image/jpeg,image/png,image/webp,image/gif"
        aria-label={t("messages:attachments.open")}
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
        aria-label={t("messages:attachments.open")}
        aria-busy={uploading}
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        <FiImage aria-hidden />
      </button>
    </>
  );
}
