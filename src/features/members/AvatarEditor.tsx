import { useState } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { ImageSlot, type ImageSlotTint } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { useToast } from "../../shared/components/feedback/useToast";
import { PhotoPickerModal } from "./PhotoPickerModal";
import styles from "./ProfileEdit.module.css";

/**
 * The hero portrait in edit mode: shows the current photo (or initials) with a
 * "Change photo" action and, when a photo is set, a "Remove" action. Choosing
 * a source (device upload, Google photo, or a past upload) happens in the
 * `PhotoPickerModal`; this component only opens it and applies the result.
 * A freshly picked photo shows instantly via a local preview URL (this
 * component's own state, revoked on replace/remove); `onChange` is called
 * with the persistable storage key or URL, not the preview URL — the
 * parent's `photo` prop stays the value to submit and is what renders once
 * it's a real, saved image.
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
  const [pickerOpen, setPickerOpen] = useState(false);
  // A `blob:` URL from a device upload — must be revoked when replaced/removed.
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  // The URL currently shown in the hero: blob OR an absolute gallery/Google
  // URL. Only ever revoked when it equals `localPreview` (a blob).
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  // The value most recently handed to `onChange` this session (key or URL) —
  // used to tell the picker which gallery item is "currently applied", so
  // deleting it can also clear the hero. Falls back to `photo` (the value
  // already saved/applied before this editor session touched anything).
  const [appliedValue, setAppliedValue] = useState<string | undefined>();

  // The avatar captured from the member's Google sign-in, offered as a
  // one-tap fill in the picker whenever the member has one on file.
  const googlePhoto = user?.profile.avatarUrl ?? undefined;

  function handlePick(value: string, previewUrl: string) {
    if (localPreview) URL.revokeObjectURL(localPreview); // only revoke blob previews
    setLocalPreview(previewUrl.startsWith("blob:") ? previewUrl : null);
    setSelectedUrl(previewUrl); // absolute URL to show immediately for gallery picks
    setAppliedValue(value);
    onChange(value);
  }

  function handlePickGoogle(url: string) {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setSelectedUrl(url);
    setAppliedValue(url);
    onChange(url);
    showToast(t("members:avatar.googleAdded"), "success");
  }

  function handleRemove() {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setSelectedUrl(null);
    setAppliedValue(undefined);
    onRemove();
  }

  const displayedPhoto = selectedUrl ?? photo;

  const actions = (
    <>
      <button
        type="button"
        className={styles.avatarBtn}
        onClick={() => setPickerOpen(true)}
      >
        <FiCamera size={15} />
        {displayedPhoto ? t("members:avatar.change") : t("members:avatar.add")}
      </button>
      {displayedPhoto && (
        <button
          type="button"
          className={`${styles.avatarBtn} ${styles.avatarBtnGhost}`}
          aria-label={t("members:avatar.remove")}
          onClick={handleRemove}
        >
          <FiTrash2 size={15} />
        </button>
      )}
    </>
  );

  const picker = pickerOpen && (
    <PhotoPickerModal
      onClose={() => setPickerOpen(false)}
      googlePhoto={googlePhoto}
      currentValue={appliedValue ?? photo}
      onPick={handlePick}
      onPickGoogle={handlePickGoogle}
      onDeletedCurrent={handleRemove}
    />
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
        {picker}
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
      {picker}
    </div>
  );
}
