import { useState, type ChangeEvent } from "react";
import { FiArrowLeft, FiCamera } from "react-icons/fi";
import { Button, ImageSlot, PhotoReframeModal } from "../../shared/components/ui";
import type { CropRect } from "../../shared/components/ui/cropGeometry";
import { useAuth } from "../../app/providers/authContext";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromParts } from "../../shared/lib/initials";
import { useUploadImage } from "../members/api/useUploadImage";
import { ImageProcessingError } from "../members/api/uploadProcessing";
import { useUpdateProfile } from "../members/api/useUpdateProfile";
import type { UpdateProfileDTO } from "../members/api/members.api";
import { IdentityFields } from "./StepPhotoIdentityFields";
import { SkipLink, type StepProps } from "./OnboardingStepChrome";
import styles from "./OnboardingPage.module.css";

export function StepPhoto({ onNext, onBack, stepLabel }: StepProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const uploadAvatar = useUploadImage("avatar");
  const updateProfile = useUpdateProfile();

  const googlePhoto = user?.profile.avatarUrl ?? undefined;
  const initials = user
    ? initialsFromParts(user.profile.firstName, user.profile.lastName)
    : "S";

  // A locally-previewable image the member just picked, plus the storage `key`
  // to persist. `key` stays null until an upload succeeds; Continue only saves
  // when there's a new key, so Skip (or an untouched Google photo) writes nothing.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pronouns and a short bio: the two identity fields signup never asks for
  // (only what Google OAuth supplies), added to this step rather than an extra
  // wizard step. Both are optional and, like the photo, saved only when the
  // member actually typed something — an untouched field writes nothing, so a
  // replay of onboarding can never clobber a value set elsewhere (e.g. in
  // Settings) with a blank one. Pronouns pre-fill from the session (already on
  // `useAuth().user`) so a returning member sees what's already saved.
  const initialPronouns = user?.profile.pronouns ?? "";
  const [pronouns, setPronouns] = useState(initialPronouns);
  const [bio, setBio] = useState("");

  /** Shared tail of both upload paths (direct GIF path + post-reframe path). */
  async function uploadAndApply(file: File, crop?: CropRect) {
    setError(null);
    setUploading(true);
    try {
      const { key, previewUrl: nextPreviewUrl } = await uploadAvatar(file, {
        crop,
      });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(nextPreviewUrl);
      setPendingKey(key);
    } catch (uploadFailure) {
      setError(
        uploadFailure instanceof ImageProcessingError
          ? t(uploadFailure.i18nKey, uploadFailure.values)
          : t("auth:onboarding.stepPhoto.uploadError"),
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    // GIFs bypass the reframer entirely (animation would be destroyed by the
    // crop/re-encode path) and upload directly, as before.
    if (file.type === "image/gif") {
      await uploadAndApply(file);
      return;
    }
    setPendingFile(file);
  }

  async function handleCropConfirmed(crop: CropRect) {
    if (!pendingFile) return;
    const fileToUpload = pendingFile;
    setPendingFile(null);
    await uploadAndApply(fileToUpload, crop);
  }

  async function handleContinue() {
    const trimmedPronouns = pronouns.trim();
    const trimmedBio = bio.trim();
    const updates: UpdateProfileDTO = {};
    if (pendingKey) updates.avatarUrl = pendingKey;
    if (trimmedPronouns && trimmedPronouns !== initialPronouns) {
      updates.pronouns = trimmedPronouns;
    }
    if (trimmedBio) updates.bio = trimmedBio;

    if (Object.keys(updates).length === 0) {
      onNext();
      return;
    }
    setError(null);
    try {
      await updateProfile.mutateAsync(updates);
      onNext();
    } catch {
      setError(t("auth:onboarding.stepPhoto.saveError"));
    }
  }

  const shownPhoto = previewUrl ?? googlePhoto;
  const caption = previewUrl
    ? t("auth:onboarding.stepPhoto.captionPreview")
    : googlePhoto
      ? t("auth:onboarding.stepPhoto.captionGoogle")
      : t("auth:onboarding.stepPhoto.captionUpload");
  const saving = updateProfile.isPending;

  return (
    <>
      <div className={styles.eye}>{stepLabel}</div>
      <div className={styles.h}>
        <Translation
          i18nKey="auth:onboarding.stepPhoto.heading"
          components={{ em: <em /> }}
        />
      </div>
      <div className={styles.p}>{t("auth:onboarding.stepPhoto.body")}</div>
      <div className={styles.photoWrap}>
        <label className={styles.photoFrame}>
          <input
            type="file"
            accept="image/*"
            className={styles.photoInput}
            onChange={(event) => void handleFile(event)}
            disabled={uploading || saving}
            aria-label={t("auth:onboarding.stepPhoto.uploadAriaLabel")}
          />
          <ImageSlot
            shape="circle"
            tint="coral"
            width={132}
            height={132}
            placeholder={t("auth:onboarding.stepPhoto.placeholder")}
            src={shownPhoto}
            initials={initials}
            alt={t("auth:onboarding.stepPhoto.photoAlt")}
          />
          <span className={styles.photoEdit} aria-hidden>
            <FiCamera />
          </span>
        </label>
        <p className={styles.photoCaption}>{caption}</p>
        {error && (
          <p className={styles.photoCaption} role="alert">
            {error}
          </p>
        )}
      </div>
      <IdentityFields
        pronouns={pronouns}
        onPronounsChange={setPronouns}
        bio={bio}
        onBioChange={setBio}
      />
      <div className={styles.nav}>
        <Button onClick={() => void handleContinue()} disabled={uploading || saving}>
          {t("auth:onboarding.stepPhoto.continue")}
        </Button>
        <SkipLink onSkip={onNext} />
        <button type="button" className={styles.back} onClick={onBack}>
          <FiArrowLeft aria-hidden /> {t("auth:onboarding.stepPhoto.back")}
        </button>
      </div>
      {pendingFile && (
        <PhotoReframeModal
          file={pendingFile}
          kind="avatar"
          onCancel={() => setPendingFile(null)}
          onConfirm={(crop) => void handleCropConfirmed(crop)}
        />
      )}
    </>
  );
}
