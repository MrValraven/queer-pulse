import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FiCamera, FiCheck } from "react-icons/fi";
import { AppShell } from "../../shared/components/layout";
import {
  EmptyState,
  PhotoReframeModal,
  SkeletonLine,
} from "../../shared/components/ui";
import type { CropRect } from "../../shared/components/ui/cropGeometry";
import { useToast } from "../../shared/components/feedback/useToast";
import { useSimulatedLoad } from "../../shared/hooks";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { useUploadImage } from "../members/api/useUploadImage";
import { PhotoUploadModal, type RecapPhoto } from "./PhotoUploadModal";
import { GatheringRecapMain } from "./GatheringRecapSections";
import { GatheringRecapSidebar } from "./GatheringRecapSidebar";
import { GatheringPhotosLive } from "./GatheringPhotosLive";
import { MoreFromHost } from "./MoreFromHost";
import { useEvent } from "./api/useEvent";
import type { GatheringDetail } from "./data";
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

/**
 * The recap route. Demo renders the full static prototype below; live resolves
 * the real event off `:slug` and, since the only real recap surface the backend
 * exposes is the event photo album, renders a minimal real header + the
 * already-wired live photo album (`GatheringPhotosLive`) whose uploads attach to
 * the real event id via `useAttachEventPhoto`. The static write-up / attendee
 * roster have no live source, so they stay demo-only rather than leak.
 */
export function GatheringRecapPage() {
  const { slug: param } = useParams();
  const { demoMode } = useDemoMode();
  const { data, isLoading } = useEvent(param);

  if (demoMode) return <DemoGatheringRecap />;

  const gathering = data?.gathering ?? null;
  if (!gathering) return <RecapUnavailable loading={isLoading} />;
  return <LiveGatheringRecap gathering={gathering} />;
}

/** Live loading / not-found frame — live has no recap until the fetch resolves. */
function RecapUnavailable({ loading }: { loading: boolean }) {
  const { t } = useTranslation();
  return (
    <AppShell>
      <div className={styles.body}>
        <div className="wrap">
          {loading ? (
            <>
              <SkeletonLine width="30%" height={18} />
              <SkeletonLine width="70%" height={40} style={{ marginTop: 16 }} />
              <SkeletonLine width="90%" height={16} style={{ marginTop: 16 }} />
            </>
          ) : (
            <EmptyState
              icon={<FiCamera />}
              title={t("gatherings:gathering.notFoundTitle")}
              description={t("gatherings:gathering.notFoundDescription")}
              action={{
                label: t("gatherings:prototypeComingSoon.browseCta"),
                to: routes.events,
              }}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}

/** Live recap: real event header + the live photo album (real photos + attach). */
function LiveGatheringRecap({ gathering }: { gathering: GatheringDetail }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  // Attach is organizer-only server-side (mirrors GatheringPhotosLive).
  const canUpload = Boolean(gathering.viewerIsOrganizer);
  return (
    <AppShell>
      <div className={styles.hero}>
        <div className="wrap">
          <div className={styles.eyebrow}>{t("gatherings:recap.eyebrow")}</div>
          <div className={styles.title}>{gathering.title}</div>
          <div className={styles.meta}>
            {fmt.date(gathering.date, {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · {gathering.hood}
          </div>
        </div>
      </div>
      <div className={styles.body}>
        <div className="wrap">
          <GatheringPhotosLive slug={gathering.slug} canUpload={canUpload} />
          <MoreFromHost
            hostSlug={gathering.hostSlug}
            hostName={gathering.host}
            excludeSlug={gathering.slug}
            seriesId={gathering.series?.id ?? null}
          />
        </div>
      </div>
    </AppShell>
  );
}

/** The full static recap prototype — unchanged demo experience. */
function DemoGatheringRecap() {
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
  const [pendingFile, setPendingFile] = useState<File | null>(null);

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
  /** Shared tail of both upload paths (direct GIF path + post-reframe path). */
  async function uploadAndStage(file: File, crop?: CropRect) {
    setUploading(true);
    try {
      const { key, previewUrl } = await uploadPhoto(file, { crop });
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

  function handleFile(file: File | undefined) {
    if (!file) return;
    // GIFs bypass the reframer entirely (animation would be destroyed by the
    // crop/re-encode path) and upload directly, as before.
    if (file.type === "image/gif") {
      void uploadAndStage(file);
      return;
    }
    setPendingFile(file);
  }

  async function handleCropConfirmed(crop: CropRect) {
    if (!pendingFile) return;
    const fileToUpload = pendingFile;
    setPendingFile(null);
    await uploadAndStage(fileToUpload, crop);
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
            {RECAP_EVENT_TITLE}: <em>{RECAP_EVENT_SUBTITLE}</em>
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

      {pendingFile && (
        <PhotoReframeModal
          file={pendingFile}
          kind="gathering-photo"
          onCancel={() => setPendingFile(null)}
          onConfirm={(crop) => void handleCropConfirmed(crop)}
        />
      )}
    </AppShell>
  );
}
