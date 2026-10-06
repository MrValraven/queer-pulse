import { useState } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { PhotoPickerModal } from "../members/PhotoPickerModal";
import s from "./DirectorySpacePage.module.css";

interface Props {
  /** What to show right now: the review's existing photo, a fresh local
   *  preview, or null for "no photo attached". */
  previewUrl: string | null;
  /** The storage key the composer currently holds for this review's photo,
   *  once one was picked this session. Compared against a deleted past upload
   *  to know when to clear the field too. */
  currentValue?: string;
  /** `key` is the private storage key to persist, `previewUrl` a URL safe to
   *  render immediately (a local blob for a fresh upload). */
  onUploaded: (key: string, previewUrl: string) => void;
  onRemove: () => void;
  isDisabled?: boolean;
}

/**
 * The optional photo on a review, in the composer, built to behave like every
 * other photo slot on the platform. The Add/Change button opens the shared
 * `PhotoPickerModal`, where the member uploads from their device or reuses a
 * past upload from "Your photos". Remove asks for confirmation first.
 *
 * Device uploads still go through `useUploadImage("listing-photo")` inside the
 * picker, the same presigned direct-to-storage path the listing wizard uses.
 * That helper is the ONLY place image metadata is stripped anywhere in the
 * product (the backend never sees the bytes), so a review photo must always
 * reach storage through it. A reused past upload was stripped when it was
 * first uploaded.
 *
 * Review photos store no crop, so the picker skips the reframe step here.
 */
export function DirectoryReviewPhotoField({
  previewUrl,
  currentValue,
  onUploaded,
  onRemove,
  isDisabled = false,
}: Props) {
  const { t } = useTranslation();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);

  /** Whether a past upload just deleted from "Your photos" is the photo this
   *  review shows. A fresh pick is held as its bare key in `currentValue`; a
   *  review opened for editing shows its stored photo as the resolved
   *  `<apiBaseUrl>/files/<key>` URL, so the key is matched against that too. */
  function isShownPhoto(deletedKey: string): boolean {
    return (
      deletedKey === currentValue ||
      Boolean(previewUrl?.endsWith(`/files/${deletedKey}`))
    );
  }

  return (
    <div className={s.reviewPhotoField} aria-busy={isPickerOpen || undefined}>
      {previewUrl && (
        <img
          className={s.reviewPhotoPreview}
          src={previewUrl}
          alt={t("marketing:directory.detail.review.photo.previewAlt")}
          referrerPolicy="no-referrer"
        />
      )}
      <div className={s.reviewPhotoActions}>
        <button
          type="button"
          className={s.reviewPhotoBtn}
          onClick={() => setIsPickerOpen(true)}
          disabled={isDisabled}
        >
          <FiCamera size={14} aria-hidden />
          {previewUrl
            ? t("marketing:directory.detail.review.photo.change")
            : t("marketing:directory.detail.review.photo.add")}
        </button>
        {previewUrl && (
          <button
            type="button"
            className={s.reviewPhotoBtn}
            onClick={() => setIsConfirmRemoveOpen(true)}
            disabled={isDisabled}
          >
            <FiTrash2 size={14} aria-hidden />
            {t("marketing:directory.detail.review.photo.remove")}
          </button>
        )}
      </div>
      <ConfirmDialog
        open={isConfirmRemoveOpen}
        tone="destructive"
        onClose={() => setIsConfirmRemoveOpen(false)}
        onConfirm={() => {
          onRemove();
          setIsConfirmRemoveOpen(false);
        }}
        title={t("subprofiles:imageUpload.removeConfirm.title")}
        description={t("subprofiles:imageUpload.removeConfirm.body")}
        confirmLabel={t("subprofiles:imageUpload.removeConfirm.confirm")}
        cancelLabel={t("subprofiles:imageUpload.removeConfirm.cancel")}
      />
      {isPickerOpen && (
        <PhotoPickerModal
          kind="listing-photo"
          shouldReframe={false}
          onPick={(key, pickedPreviewUrl) => onUploaded(key, pickedPreviewUrl)}
          onDeleted={(deletedKey) => {
            if (isShownPhoto(deletedKey)) onRemove();
          }}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </div>
  );
}
