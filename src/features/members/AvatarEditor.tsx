import { useRef, useState } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { ImageSlot, type ImageSlotTint } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { useToast } from "../../shared/components/feedback/useToast";
import { ImageProcessingError } from "./api/uploadProcessing";
import { useUploadImage } from "./api/useUploadImage";
import styles from "./ProfileEdit.module.css";

/**
 * The hero portrait in edit mode: shows the current photo (or initials) with a
 * "Change photo" action and, when a photo is set, a "Remove" action. A freshly
 * picked photo shows instantly via a local preview URL (this component's own
 * state, revoked on replace/remove); `onChange` is called with the persistable
 * storage key, not the preview URL — the parent's `photo` prop stays the value
 * to submit and is what renders once it's a real, saved image.
 */
export function AvatarEditor({
  photo,
  initials,
  tint,
  name,
  onChange,
  onRemove,
  variant = "card",
}: {
  photo?: string;
  initials: string;
  tint: ImageSlotTint;
  name: string;
  onChange: (key: string) => void;
  onRemove: () => void;
  variant?: "card" | "circle";
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUploadImage("avatar");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // The avatar captured from the member's Google sign-in, offered as a one-tap
  // fill whenever they have no photo set yet.
  const googlePhoto = user?.profile.avatarUrl ?? undefined;

  function applyGooglePhoto() {
    if (!googlePhoto) return;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onChange(googlePhoto);
    showToast(t("members:avatar.googleAdded"), "success");
  }

  async function pick(file: File) {
    setError(null);
    setProgress(0);
    setUploading(true);
    try {
      const { key, previewUrl: newPreviewUrl } = await uploadAvatar(file, {
        onProgress: (p) => setProgress(p),
      });
      // This editor shows one photo at a time, so the previous local preview
      // (if any) is now stale — revoke it ourselves rather than waiting for
      // the hook's unmount sweep to hold onto it for the rest of the session.
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(newPreviewUrl);
      onChange(key);
    } catch (err) {
      setError(
        err instanceof ImageProcessingError
          ? t(err.i18nKey, err.values)
          : t("members:avatar.error.generic"),
      );
    } finally {
      setUploading(false);
    }
  }

  const displayedPhoto = previewUrl ?? photo;

  const actions = (
    <>
      <button
        type="button"
        className={styles.avatarBtn}
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        <FiCamera size={15} />
        {uploading
          ? t("members:avatar.uploading", { percent: progress })
          : displayedPhoto
            ? t("members:avatar.change")
            : t("members:avatar.add")}
      </button>
      {!displayedPhoto && googlePhoto && !uploading && (
        <button
          type="button"
          className={styles.avatarBtn}
          onClick={applyGooglePhoto}
        >
          <FcGoogle size={15} />
          {t("members:avatar.useGoogle")}
        </button>
      )}
      {displayedPhoto && !uploading && (
        <button
          type="button"
          className={`${styles.avatarBtn} ${styles.avatarBtnGhost}`}
          aria-label={t("members:avatar.remove")}
          onClick={() => {
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
            }
            onRemove();
          }}
        >
          <FiTrash2 size={15} />
        </button>
      )}
    </>
  );

  const fileInput = (
    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      aria-label={t("members:avatar.change")}
      hidden
      onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) void pick(file);
        event.target.value = "";
      }}
    />
  );

  const errorNote = error && (
    <p className={styles.avatarError} role="alert">
      {error}
    </p>
  );

  if (variant === "circle") {
    return (
      <div className={styles.avatarCircleWrap}>
        <div className={styles.avatarPrideRing}>
          <div className={styles.avatarRingGap}>
            <ImageSlot
              tint={tint}
              src={displayedPhoto}
              initials={initials}
              shape="circle"
              width="100%"
              height="100%"
              srcSize={176}
              placeholder={name}
            />
          </div>
        </div>
        <div className={styles.avatarCircleActions}>{actions}</div>
        {errorNote}
        {fileInput}
      </div>
    );
  }

  return (
    <div className={styles.avatarWrap}>
      <ImageSlot
        tint={tint}
        src={displayedPhoto}
        initials={initials}
        height={430}
        radius={20}
        placeholder={name}
      />
      <div className={styles.avatarActions}>{actions}</div>
      {errorNote}
      {fileInput}
    </div>
  );
}
