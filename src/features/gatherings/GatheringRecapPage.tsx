import { useEffect, useRef, useState } from "react";
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

/** A submitted recap photo carrying the real uploaded URL (used in live mode). */
type SubmittedPhoto = RecapPhoto & { image?: string };

export function GatheringRecapPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const loading = useSimulatedLoad();
  const uploadPhoto = useUploadImage("gathering-photo");
  const fileRef = useRef<HTMLInputElement>(null);
  const createdUrl = useRef<string | null>(null);
  const uploadedUrl = useRef<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submittedPhotos, setSubmittedPhotos] = useState<SubmittedPhoto[]>([]);

  useEffect(
    () => () => {
      if (createdUrl.current) URL.revokeObjectURL(createdUrl.current);
    },
    [],
  );

  // "Submit yours" opens a real file picker. The picked file is validated,
  // EXIF-stripped and uploaded (durable in live mode); the caption is then
  // collected in the existing modal.
  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(file);
      if (createdUrl.current) URL.revokeObjectURL(createdUrl.current);
      createdUrl.current = url.startsWith("blob:") ? url : null;
      uploadedUrl.current = url;
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
      { ...photo, image: uploadedUrl.current ?? undefined },
    ]);
    uploadedUrl.current = null;
    showToast(t("gatherings:recap.photoAddedToast"), "success");
  }

  return (
    <AppShell unreadCount={3}>
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
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
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
