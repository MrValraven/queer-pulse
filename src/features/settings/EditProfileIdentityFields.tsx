import { useRef, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUploadImage } from "../members/api/useUploadImage";
import { ImageProcessingError } from "../members/api/uploadProcessing";
import { leadingInitials } from "../../shared/lib/initials";
import { safeHref } from "../../shared/lib/safeHref";
import styles from "./EditProfilePage.module.css";

interface IdentityPhotoFieldProps {
  displayName: string;
  photo?: string;
  /** Avatar from the member's social login, offered as a one-tap restore. */
  googlePhoto?: string;
  /** Called with the persistable storage key once an uploaded photo resolves. */
  onPhotoChange: (storageKey: string) => void;
  onUseGooglePhoto: () => void;
  onRemove: () => void;
}

/**
 * Avatar preview + upload / restore / remove controls for the identity section.
 * Owns its upload state so the parent section stays under the line budget.
 */
export function IdentityPhotoField({
  displayName,
  photo,
  googlePhoto,
  onPhotoChange,
  onUseGooglePhoto,
  onRemove,
}: IdentityPhotoFieldProps) {
  const { t } = useTranslation();
  const initials = leadingInitials(displayName);
  const uploadAvatar = useUploadImage("avatar");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // A freshly picked photo shows instantly via this local object URL; `photo`
  // (the persisted storage key / resolved URL) stays the value to submit.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function clearPreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }

  async function handlePickPhoto(file: File) {
    setUploadError(null);
    setUploadProgress(0);
    setUploading(true);
    try {
      const { key, previewUrl: newPreviewUrl } = await uploadAvatar(file, {
        onProgress: (percent) => setUploadProgress(percent),
      });
      // One photo at a time here — the previous local preview is now stale.
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(newPreviewUrl);
      onPhotoChange(key);
    } catch (error) {
      setUploadError(
        error instanceof ImageProcessingError
          ? t(error.i18nKey, error.values)
          : t("members:avatar.error.generic"),
      );
    } finally {
      setUploading(false);
    }
  }

  // Guard the photo URL before dropping it into CSS `url(...)`. A local preview
  // is a blob: URL we created ourselves (safe, but `safeHref` only passes
  // http(s)/mailto), so it bypasses the guard; a persisted `photo` still must
  // be an http(s) link with no `)` / whitespace, else fall back to initials.
  const displayedPhoto = previewUrl ?? photo;
  const safePhoto = safeHref(displayedPhoto);
  const photoUrl = previewUrl
    ? previewUrl
    : safePhoto && !/[)\s]/.test(safePhoto)
      ? safePhoto
      : null;

  return (
    <>
      <div className={styles.photoRow}>
        <div
          className={styles.photoAv}
          style={
            photoUrl
              ? {
                  backgroundImage: `url(${photoUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: "transparent",
                }
              : undefined
          }
        >
          {photoUrl ? "" : initials}
        </div>
        <div>
          <div className={styles.photoActions}>
            <Button
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{ fontSize: "13.5px", padding: "9px 18px" }}
            >
              {uploading
                ? t("members:avatar.uploading", { percent: uploadProgress })
                : t("settings:editProfile.identity.uploadPhoto")}
            </Button>
            {photo ? (
              <Button
                variant="ghost"
                onClick={() => {
                  clearPreview();
                  onRemove();
                }}
                style={{
                  fontSize: "13.5px",
                  padding: "9px 18px",
                  color: "var(--ink-40)",
                }}
              >
                {t("settings:editProfile.identity.removePhoto")}
              </Button>
            ) : googlePhoto ? (
              <Button
                variant="ghost"
                onClick={() => {
                  clearPreview();
                  onUseGooglePhoto();
                }}
                style={{ fontSize: "13.5px", padding: "9px 18px" }}
              >
                {t("settings:editProfile.identity.useGooglePhoto")}
              </Button>
            ) : null}
          </div>
          {uploadError && (
            <div
              role="alert"
              className={styles.photoHint}
              style={{ color: "var(--accent)" }}
            >
              {uploadError}
            </div>
          )}
          <div className={styles.photoHint}>
            {photo
              ? t("settings:editProfile.identity.photoHint.default")
              : googlePhoto
                ? t("settings:editProfile.identity.photoHint.google")
                : t("settings:editProfile.identity.photoHint.default")}
          </div>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        aria-label={t("settings:editProfile.identity.uploadPhoto")}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handlePickPhoto(file);
          e.target.value = "";
        }}
      />
    </>
  );
}
