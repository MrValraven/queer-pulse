import { useRef, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import {
  Button,
  ConfirmDialog,
  IconButton,
  LoadErrorState,
  PhotoReframeModal,
  SkeletonLine,
} from "../../shared/components/ui";
import type { CropRect } from "../../shared/components/ui/cropGeometry";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { ReportSubjectControl } from "../safety/ReportSubjectControl";
import { useUploadImage } from "../members/api/useUploadImage";
import { safeHref } from "../../shared/lib/safeHref";
import type { EventPhotoDTO } from "./api/events.api";
import {
  useAttachEventPhoto,
  useEventPhotos,
  useRemoveEventPhoto,
} from "./api/useEventPhotos";
import styles from "./GatheringPhotosPage.module.css";

const IMG_FILL: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

/**
 * One album tile: the photo itself (opening the presigned original in a new
 * tab) plus, for whoever the backend would let remove it, an always-visible
 * take-down control, and for everyone who did not upload it, an always-visible
 * report control. Always visible on purpose: a hover-only control does not
 * exist on a touch screen, and these are the affordances someone reaches for
 * when they realise a photo of them is up. Both are real buttons in the tab
 * order with their own accessible name, so keyboard and touch reach them the
 * same way a pointer does.
 *
 * The two controls answer different questions and sit in opposite corners so
 * they never read as one pair. Remove erases the photograph; report routes it
 * to platform moderators, whose takedown the album honours for everyone
 * (`EventPhotosService.excludeModeratedPhotos`) including the organizers.
 */
function GatheringPhotoTile({
  photo,
  canRemove,
  canReport,
  gatheringTitle,
  onRequestRemove,
}: {
  photo: EventPhotoDTO;
  canRemove: boolean;
  canReport: boolean;
  gatheringTitle: string;
  onRequestRemove: (photo: EventPhotoDTO) => void;
}) {
  const { t } = useTranslation();
  const caption = photo.caption?.trim() ?? "";
  return (
    <div className={styles.pic}>
      <a
        className={styles.picLink}
        href={safeHref(photo.url) ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={
          photo.caption
            ? t("gatherings:photos.openCaptionedPhotoAriaLabel", {
                caption: photo.caption,
              })
            : t("gatherings:photos.openPhotoAriaLabel")
        }
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
      {canRemove && (
        <IconButton
          className={styles.removePhoto}
          aria-label={t("gatherings:photos.removeAriaLabel")}
          onClick={() => onRequestRemove(photo)}
        >
          <FiTrash2 aria-hidden />
        </IconButton>
      )}
      {canReport && (
        <div className={styles.reportPhoto}>
          <ReportSubjectControl
            subjectType="event_photo"
            subjectId={photo.id}
            subjectName={
              caption ||
              t("gatherings:photos.reportSubjectName", {
                gathering: gatheringTitle,
              })
            }
            label={t("gatherings:photos.reportCta")}
            ariaLabel={
              caption
                ? t("gatherings:photos.reportCaptionedAriaLabel", { caption })
                : t("gatherings:photos.reportAriaLabel")
            }
          />
        </div>
      )}
    </div>
  );
}

/**
 * Live-mode photo mosaic for `/gatherings/:slug/photos`. Renders the real
 * uploaded photos the backend authorized for this participant, and, for the
 * event's organizers (`isOrganizer`), an upload control that runs the shared
 * `useUploadImage('gathering-photo')` flow then attaches the returned key.
 * Demo mode never mounts this; the page keeps its prototype tiles there.
 *
 * Removal mirrors the backend rule exactly (`EventPhotosService.remove`): an
 * organizer can take down any photo in the album, and the member who uploaded
 * a photo can take down their own. Showing it any wider would ship a button
 * that 403s.
 *
 * Reporting is the other half, and it is deliberately NOT the mirror image of
 * removal. See `canReportPhoto` below.
 */
export function GatheringPhotosLive({
  slug,
  isOrganizer,
  gatheringTitle,
}: {
  slug: string;
  isOrganizer: boolean;
  /** The gathering's own title, used to name the subject of a photo report. */
  gatheringTitle: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { demoMode } = useDemoMode();
  const { photos, isLoading, isError, refetch } = useEventPhotos(slug);
  const attachPhoto = useAttachEventPhoto(slug);
  const removePhoto = useRemoveEventPhoto(slug);
  const uploadImage = useUploadImage("gathering-photo");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [photoPendingRemoval, setPhotoPendingRemoval] =
    useState<EventPhotoDTO | null>(null);

  // The photo view carries its uploader as a member ref, so "is this mine?" is
  // a profile-slug match against the signed-in member.
  const viewerSlug = user?.profile.slug ?? null;
  const isUploadedByViewer = (photo: EventPhotoDTO) =>
    viewerSlug !== null && photo.uploader?.slug === viewerSlug;
  const canRemovePhoto = (photo: EventPhotoDTO) =>
    isOrganizer || isUploadedByViewer(photo);

  /**
   * Who gets the report control: everybody except the member who put the photo
   * there. Reporting your own upload is not a thing anyone needs, and the
   * person in a photograph is almost never the person who posted it.
   *
   * That deliberately includes organizers who did not upload it, even though
   * they also hold the remove button. The two are different acts. Removing is
   * local, silent and leaves no record; reporting reaches platform moderators,
   * and a moderator takedown withholds the photo from every viewer, organizers
   * included. Organizers are also the people photo reports are most often
   * ABOUT, so a co-host who finds themselves in a photo their co-host posted
   * needs the escalation path and not only the delete key.
   *
   * Demo mode gets nothing: the demo album is a static fixture whose ids
   * (`demo-photo-0`) are not uuids, so the report would be a control that
   * cannot work. `GatheringPhotosPage` never mounts this component in demo
   * mode either; this is the belt to that braces.
   */
  const canReportPhoto = (photo: EventPhotoDTO) =>
    !demoMode && !isUploadedByViewer(photo);

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

  /**
   * The tile is already gone by the time this resolves (the mutation removes it
   * optimistically). A failure puts it back and says so, so a photo never
   * reappears without an explanation.
   */
  async function handleRemoveConfirmed() {
    const photo = photoPendingRemoval;
    if (!photo) return;
    try {
      await removePhoto.mutateAsync({ photoId: photo.id });
      showToast(t("gatherings:photos.removedToast"), "success");
    } catch {
      showToast(t("gatherings:photos.removeError"), "error");
    } finally {
      setPhotoPendingRemoval(null);
    }
  }

  return (
    <div>
      {isOrganizer && (
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

      {isError ? (
        <LoadErrorState onRetry={refetch} />
      ) : (
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
              <GatheringPhotoTile
                key={photo.id}
                photo={photo}
                canRemove={canRemovePhoto(photo)}
                canReport={canReportPhoto(photo)}
                gatheringTitle={gatheringTitle}
                onRequestRemove={setPhotoPendingRemoval}
              />
            ))
          )}
        </div>
      )}

      {pendingFile && (
        <PhotoReframeModal
          file={pendingFile}
          kind="gathering-photo"
          onCancel={() => setPendingFile(null)}
          onConfirm={(crop) => void handleCropConfirmed(crop)}
        />
      )}

      <ConfirmDialog
        open={photoPendingRemoval !== null}
        onClose={() => setPhotoPendingRemoval(null)}
        onConfirm={() => void handleRemoveConfirmed()}
        tone="destructive"
        loading={removePhoto.isPending}
        title={t("gatherings:photos.removeConfirmTitle")}
        description={t("gatherings:photos.removeConfirmBody")}
        confirmLabel={t("gatherings:photos.removeConfirmCta")}
      />
    </div>
  );
}
