import { useRef, useState } from "react";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUploadImage } from "../members/api/useUploadImage";
import { useAttachEventPhoto, useEventPhotos } from "./api/useEventPhotos";
import styles from "./GatheringPhotosPage.module.css";

const IMG_FILL: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

/**
 * Live-mode photo mosaic for `/gatherings/:slug/photos`. Renders the real
 * uploaded photos the backend authorized for this participant, and — for the
 * event host (`canUpload`) — an upload control that runs the shared
 * `useUploadImage('gathering-photo')` flow then attaches the returned key.
 * Demo mode never mounts this; the page keeps its prototype tiles there.
 */
export function GatheringPhotosLive({
  slug,
  canUpload,
}: {
  slug: string;
  canUpload: boolean;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { photos, isLoading } = useEventPhotos(slug);
  const attachPhoto = useAttachEventPhoto(slug);
  const uploadImage = useUploadImage("gathering-photo");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onPickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { key } = await uploadImage(file);
      await attachPhoto.mutateAsync({ key });
    } catch {
      showToast(t("gatherings:photos.uploadError"), "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {canUpload && (
        <div className={styles.controls}>
          <div className={styles.controlsInner}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => void onPickFile(event)}
            />
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading
                ? t("gatherings:photos.uploadingCta")
                : t("gatherings:photos.addCta")}
            </Button>
          </div>
        </div>
      )}

      <div className={styles.mosaic}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={styles.pic} aria-hidden>
              <SkeletonLine
                width="100%"
                height="100%"
                style={{ borderRadius: 8 }}
              />
            </div>
          ))
        ) : photos.length === 0 ? (
          <p>{t("gatherings:photos.emptyLive")}</p>
        ) : (
          photos.map((photo) => (
            <a
              key={photo.id}
              className={styles.pic}
              href={photo.url}
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={photo.url}
                alt={photo.caption ?? ""}
                loading="lazy"
                style={IMG_FILL}
              />
            </a>
          ))
        )}
      </div>
    </div>
  );
}
