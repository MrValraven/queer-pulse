import { useRef, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad } from "../../shared/hooks";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUploadImage } from "../members/api/useUploadImage";
import { PhotoUploadModal, type RecapPhoto } from "./PhotoUploadModal";
import { GatheringRecapMain } from "./GatheringRecapSections";
import { GatheringRecapSidebar } from "./GatheringRecapSidebar";
import {
  RECAP_ATTENDED_COUNT,
  RECAP_EVENT_DATE,
  RECAP_EVENT_SUBTITLE,
  RECAP_EVENT_TITLE,
  RECAP_VENUE,
} from "./gatheringRecap.data";
import styles from "./GatheringRecapPage.module.css";

/**
 * A submitted recap photo carrying the uploaded storage key (what a real
 * submission endpoint would persist) plus the local preview URL it renders
 * with, since the key alone isn't fetchable in live mode.
 */
type SubmittedPhoto = RecapPhoto & { imageKey?: string; imagePreviewUrl?: string };

export function GatheringRecapPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const loading = useSimulatedLoad();
  const uploadPhoto = useUploadImage("gathering-photo");
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadedPhoto = useRef<{ key: string; previewUrl: string } | null>(
    null,
  );
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submittedPhotos, setSubmittedPhotos] = useState<SubmittedPhoto[]>([]);

  // "Submit yours" opens a real file picker. The picked file is validated,
  // EXIF-stripped and uploaded (durable in live mode); the caption is then
  // collected in the existing modal.
  //
  // Unlike the single-slot editors elsewhere (avatar, work image, story
  // cover), this page accumulates a *gallery* of photos: each accepted
  // upload's preview must go on staying visible in `submittedPhotos`
  // alongside every earlier one, so this component must NOT eagerly revoke a
  // preview just because a newer upload started — that would break whichever
  // earlier photo is still on screen. The only exception is an in-flight
  // pick that never gets confirmed via `addPhoto` (the modal is dismissed, or
  // a second file is picked before the first is confirmed); that abandoned
  // preview is revoked here. Anything actually added to the gallery is left
  // for `useUploadImage`'s own unmount sweep to revoke when this page goes
  // away.
  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const { key, previewUrl } = await uploadPhoto(file);
      if (uploadedPhoto.current) {
        URL.revokeObjectURL(uploadedPhoto.current.previewUrl);
      }
      uploadedPhoto.current = { key, previewUrl };
      setUploadOpen(true);
    } catch (err) {
      showToast(
        err instanceof Error && err.message
          ? err.message
          : t("gatherings:recap.uploadErrorToast"),
        "error",
      );
    } finally {
      setUploading(false);
    }
  }

  function addPhoto(photo: RecapPhoto) {
    setSubmittedPhotos((prev) => [
      ...prev,
      {
        ...photo,
        imageKey: uploadedPhoto.current?.key,
        imagePreviewUrl: uploadedPhoto.current?.previewUrl,
      },
    ]);
    uploadedPhoto.current = null;
    showToast(t("gatherings:recap.photoAddedToast"), "success");
  }

  return (
    <AppShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.eyebrow}>{t("gatherings:recap.eyebrow")}</div>
          <div className={styles.title}>
            {RECAP_EVENT_TITLE} — <em>{RECAP_EVENT_SUBTITLE}</em>
          </div>
          <div className={styles.meta}>
            {fmt.date(RECAP_EVENT_DATE, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · {RECAP_VENUE}
          </div>
          <div className={styles.attendedChip}>
            <FiCheck />{" "}
            {t("gatherings:recap.attendedCount", {
              count: RECAP_ATTENDED_COUNT,
            })}
          </div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.layout}>
            <GatheringRecapMain
              loading={loading}
              submittedPhotos={submittedPhotos}
              onSubmitPhoto={() => {
                if (!uploading) fileRef.current?.click();
              }}
            />
            <GatheringRecapSidebar
              onCopyLink={() =>
                showToast(t("gatherings:recap.linkCopiedToast"), "success")
              }
            />
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        aria-label={t("gatherings:recap.submitYoursCta")}
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {uploadOpen && (
        <PhotoUploadModal
          onClose={() => setUploadOpen(false)}
          onSubmit={addPhoto}
        />
      )}
    </AppShell>
  );
}
