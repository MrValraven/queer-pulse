import { useRef, useState } from "react";
import { Button, PhotoReframeModal, SkeletonLine } from "../../shared/components/ui";
import type { CropRect } from "../../shared/components/ui/cropGeometry";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUploadImage } from "../members/api/useUploadImage";
import { safeHref } from "../../shared/lib/safeHref";
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
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  /** Shared tail of both upload paths (direct GIF path + post-reframe path). */
  async function uploadAndAttach(file: File, crop?: CropRect) {
    setUploading(true);
    try {
      const { key } = await uploadImage(file, { crop });
      await attachPhoto.mutateAsync({ key });
    } catch {
      showToast(t("gatherings:photos.uploadError"), "error");
    } finally {
      setUploading(false);
    }
  }

  function onPickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    // GIFs bypass the reframer entirely (animation would be destroyed by the
    // crop/re-encode path) and upload directly, as before.
    if (file.type === "image/gif") {
      void uploadAndAttach(file);
      return;
    }
    setPendingFile(file);
  }

  async function handleCropConfirmed(crop: CropRect) {
    if (!pendingFile) return;
    const fileToUpload = pendingFile;
    setPendingFile(null);
    await uploadAndAttach(fileToUpload, crop);
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
              aria-label={t("gatherings:photos.addCta")}
              onChange={onPickFile}
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
              href={safeHref(photo.url) ?? undefined}
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={photo.url}
                alt={photo.caption ?? ""}
                loading="lazy"
                // The API never returns intrinsic dimensions for an uploaded
                // photo, so this is a fallback intrinsic-size hint (matches
                // the tile's 1:1 `.pic` aspect-ratio in the CSS module) —
                // belt-and-suspenders on top of the real CLS guard, which is
                // `.pic`'s CSS `aspect-ratio` reserving the box before the
                // absolutely-positioned (IMG_FILL) image ever paints.
                width={400}
                height={400}
                style={IMG_FILL}
              />
            </a>
          ))
        )}
      </div>

      {pendingFile && (
        <PhotoReframeModal
          file={pendingFile}
          kind="gathering-photo"
          onCancel={() => setPendingFile(null)}
          onConfirm={(crop) => void handleCropConfirmed(crop)}
        />
      )}
    </div>
  );
}
