import { useState, type ChangeEvent } from "react";
import { FiCamera } from "react-icons/fi";
import { Button, ImageSlot } from "../../shared/components/ui";
import { useAuth } from "../../app/providers/authContext";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromParts } from "../../shared/lib/initials";
import { useUploadImage } from "../members/api/useUploadImage";
import { ImageProcessingError } from "../members/api/uploadProcessing";
import { useUpdateProfile } from "../members/api/useUpdateProfile";
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const { key, previewUrl: nextPreviewUrl } = await uploadAvatar(file);
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

  async function handleContinue() {
    if (!pendingKey) {
      onNext();
      return;
    }
    setError(null);
    try {
      await updateProfile.mutateAsync({ avatarUrl: pendingKey });
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
      <div className={styles.nav}>
        <Button onClick={() => void handleContinue()} disabled={uploading || saving}>
          {t("auth:onboarding.stepPhoto.continue")}
        </Button>
        <SkipLink onSkip={onNext} />
        <button type="button" className={styles.back} onClick={onBack}>
          {t("auth:onboarding.stepPhoto.back")}
        </button>
      </div>
    </>
  );
}
