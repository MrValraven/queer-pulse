import { useCallback, useMemo, useRef, useState } from "react";
import { FiDownload, FiShare2 } from "react-icons/fi";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { downloadBlobFile } from "../../../shared/lib/downloadBlob";
import { STORY_IMAGE_MIME_TYPE } from "./shareKit.data";
import { storyImageFileName } from "./shareLinks";
import { STORY_CANVAS_HEIGHT, STORY_CANVAS_WIDTH } from "./storyImage.data";
import styles from "./StoryImagePreviewModal.module.css";

/**
 * Points an <img> at an object URL of `blob` for as long as the element is
 * mounted. The URL is made and revoked inside one ref callback, so React 19
 * StrictMode's mount, unmount and mount again leaves a live URL on the image
 * and releases every earlier one.
 */
function useObjectUrlImageRef(blob: Blob) {
  return useCallback(
    (image: HTMLImageElement | null) => {
      if (!image) return;
      const objectUrl = URL.createObjectURL(blob);
      image.src = objectUrl;
      return () => URL.revokeObjectURL(objectUrl);
    },
    [blob],
  );
}

/** True when the user dismissed the native share sheet themselves. */
function isShareDismissal(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

/**
 * Shows the rendered story image before it leaves the page. The host sees the
 * exact PNG, then downloads it or hands it to the native share sheet where the
 * browser can share files. Share stays hidden on browsers that cannot.
 */
export function StoryImagePreviewModal({
  blob,
  slug,
  gatheringTitle,
  onClose,
}: {
  /** The PNG already rendered by the share row; shown and saved as is. */
  blob: Blob;
  /** The gathering's slug, which names the saved file. */
  slug: string;
  gatheringTitle: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const downloadButtonRef = useRef<HTMLButtonElement>(null);
  const imageRef = useObjectUrlImageRef(blob);
  const [isSharing, setIsSharing] = useState(false);
  const fileName = storyImageFileName(slug);
  // Built once per opened dialog, so the share check runs a single time.
  const { storyFile, isFileShareable } = useMemo(() => {
    const file = new File([blob], fileName, { type: STORY_IMAGE_MIME_TYPE });
    return {
      storyFile: file,
      isFileShareable:
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] }),
    };
  }, [blob, fileName]);

  const downloadImage = () => {
    downloadBlobFile(fileName, blob);
    showToast(t("gatherings:create.v2.success.storyDownloaded"), "success");
    onClose();
  };

  const shareImage = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      await navigator.share({ files: [storyFile], title: gatheringTitle });
      onClose();
    } catch (error) {
      // A dismissed share sheet already told the host what happened. Any
      // other failure keeps the dialog up so Download is one tap away.
      if (!isShareDismissal(error)) {
        showToast(t("gatherings:create.v2.success.storyShareFailed"), "error");
      }
      setIsSharing(false);
    }
  };

  return (
    <Modal
      title={t("gatherings:create.v2.success.storyPreviewTitle")}
      sub={t("gatherings:create.v2.success.storyPreviewSub")}
      onClose={onClose}
      initialFocusRef={downloadButtonRef}
      footer={
        <>
          <Button
            variant="ghost"
            className={`${styles.footerButton} ${styles.closeButton}`}
            onClick={onClose}
          >
            {t("gatherings:create.v2.success.storyClose")}
          </Button>
          {isFileShareable && (
            <Button
              variant="ghost"
              className={styles.footerButton}
              onClick={() => void shareImage()}
              aria-disabled={isSharing}
            >
              <FiShare2 aria-hidden />{" "}
              {t("gatherings:create.v2.success.storyShare")}
            </Button>
          )}
          <Button
            ref={downloadButtonRef}
            className={styles.footerButton}
            onClick={downloadImage}
          >
            <FiDownload aria-hidden />{" "}
            {t("gatherings:create.v2.success.storyDownload")}
          </Button>
        </>
      }
    >
      <img
        ref={imageRef}
        className={styles.image}
        alt={t("gatherings:create.v2.success.storyPreviewAlt", {
          title: gatheringTitle,
        })}
        width={STORY_CANVAS_WIDTH}
        height={STORY_CANVAS_HEIGHT}
      />
    </Modal>
  );
}
