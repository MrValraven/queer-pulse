import { useId, useState } from "react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import { ConfirmDialog, ImageSlot } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PhotoPickerModal } from "../../members/PhotoPickerModal";
import styles from "./ListBusinessPage.module.css";

interface ListingPhotoFieldProps {
  height: number;
  /** A fluid frame of this ratio in place of the fixed `height`. The cover
   *  slot passes the directory card's ratio so both crop the photo alike. */
  aspectRatio?: string;
  wide?: boolean;
  placeholder: string;
  /** Standing caption above the frame. The cover slot uses it to say the photo
   *  is the one the directory card shows. The `placeholder` caption vanishes
   *  the moment a photo fills the slot, so it cannot carry that message. */
  note?: string;
  /** What the frame paints: the form's preview for this slot when it has one,
   *  else the persisted value. */
  displayValue: string;
  /** The value held in `draft.photos` for this slot: a bare storage key for a
   *  photo picked this session, or the resolved `<apiBaseUrl>/files/<key>` URL
   *  an edited listing loaded with. Compared against a deleted past upload to
   *  know when to clear the slot too. */
  persistedValue: string;
  /** True when the last submit or save came back refusing THIS slot's photo.
   *  The form clears it once the slot's photo changes, so the message never
   *  outlives the photo it was about. */
  isRejectedByServer: boolean;
  onResolved: (persist: string, preview: string) => void;
  onRemove: () => void;
}

/**
 * One wizard photo slot, built to look and behave like `ImageUploadField`: an
 * `ImageSlot` preview with an Upload/Change button and a Remove button. The
 * Upload/Change button opens the shared `PhotoPickerModal`, where the owner
 * uploads from their device (with reframe and progress) or reuses a past
 * upload from "Your photos". A pick calls `onResolved(persist, preview)`:
 * `persist` lands in `draft.photos`, `preview` in `photoPreviews`. Remove asks
 * for confirmation first.
 *
 * The form owns the previews, so a picked photo keeps showing across step
 * changes, in the live preview card and on the Review step. That is why this
 * slot drives the picker directly: `ImageUploadField` keeps its preview in
 * local state and revokes it on unmount.
 *
 * A save the server rejected because of this slot is said on the slot itself.
 */
export function ListingPhotoField({
  height,
  aspectRatio,
  wide,
  placeholder,
  note,
  displayValue,
  persistedValue,
  isRejectedByServer,
  onResolved,
  onRemove,
}: ListingPhotoFieldProps) {
  const { t } = useTranslation();
  const errorId = useId();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  function clear() {
    onRemove();
  }

  function isPersistedPhoto(deletedKey: string): boolean {
    return (
      deletedKey === persistedValue ||
      persistedValue.endsWith(`/files/${deletedKey}`)
    );
  }

  const visibleError = isRejectedByServer
    ? t("marketing:listBusiness.step4.photo.serverRejected")
    : null;

  return (
    <div
      className={[styles.photoField, wide && styles.galWide]
        .filter(Boolean)
        .join(" ")}
      aria-busy={pickerOpen || undefined}
    >
      {note && <p className={styles.photoNote}>{note}</p>}
      <ImageSlot
        tint="plum"
        radius={14}
        width="100%"
        height={aspectRatio ? "auto" : height}
        style={aspectRatio ? { aspectRatio } : undefined}
        srcSize={wide ? 1280 : 640}
        src={displayValue || undefined}
        placeholder={placeholder}
      />
      <div className={styles.photoActions}>
        <button
          type="button"
          className={styles.photoBtn}
          aria-describedby={visibleError ? errorId : undefined}
          onClick={() => setPickerOpen(true)}
        >
          <FiCamera size={14} aria-hidden />
          {displayValue
            ? t("marketing:listBusiness.step4.photo.change")
            : t("marketing:listBusiness.step4.photo.upload")}
        </button>
        {displayValue && (
          <button
            type="button"
            className={styles.photoBtn}
            aria-label={t("marketing:listBusiness.step4.photo.remove")}
            onClick={() => setConfirmRemoveOpen(true)}
          >
            <FiTrash2 size={14} aria-hidden />
          </button>
        )}
      </div>
      {visibleError && (
        <p id={errorId} className={styles.photoError} role="alert">
          {visibleError}
        </p>
      )}
      <ConfirmDialog
        open={confirmRemoveOpen}
        tone="destructive"
        onClose={() => setConfirmRemoveOpen(false)}
        onConfirm={() => {
          clear();
          setConfirmRemoveOpen(false);
        }}
        title={t("subprofiles:imageUpload.removeConfirm.title")}
        description={t("subprofiles:imageUpload.removeConfirm.body")}
        confirmLabel={t("subprofiles:imageUpload.removeConfirm.confirm")}
        cancelLabel={t("subprofiles:imageUpload.removeConfirm.cancel")}
      />
      {pickerOpen && (
        <PhotoPickerModal
          kind="listing-photo"
          onPick={(key, previewUrl) => onResolved(key, previewUrl)}
          onDeleted={(deletedKey) => {
            if (isPersistedPhoto(deletedKey)) clear();
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
