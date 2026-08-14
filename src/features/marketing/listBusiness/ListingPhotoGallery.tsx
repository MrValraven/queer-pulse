import { useId } from "react";
import { type ImageSlotTint } from "../../../shared/components/ui";
import type { CropRect } from "../../../shared/components/ui/cropGeometry";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { type PhotoKey } from "./listBusiness.data";
import type { ListingForm } from "./useListingForm";
import { ListingPhotoField } from "./ListingPhotoField";
import styles from "./ListBusinessPage.module.css";

const GALLERY: {
  key: PhotoKey;
  tint: ImageSlotTint;
  height: number;
  wide?: boolean;
  captionKey: string;
}[] = [
  {
    key: "wide",
    tint: "coral",
    height: 150,
    wide: true,
    captionKey: "marketing:listBusiness.step4.gallery.wide",
  },
  {
    key: "d1",
    tint: "jade",
    height: 110,
    captionKey: "marketing:listBusiness.step4.gallery.detail",
  },
  {
    key: "d2",
    tint: "plum",
    height: 110,
    captionKey: "marketing:listBusiness.step4.gallery.detail",
  },
  {
    key: "vibe",
    tint: "coral",
    height: 110,
    captionKey: "marketing:listBusiness.step4.gallery.vibe",
  },
];

const ALT_LABEL_KEYS: Record<PhotoKey, string> = {
  wide: "marketing:listBusiness.step4.alt.wide",
  d1: "marketing:listBusiness.step4.alt.d1",
  d2: "marketing:listBusiness.step4.alt.d2",
  vibe: "marketing:listBusiness.step4.alt.vibe",
};

/** Step-4 photo gallery: four upload/URL slots + their alt-text inputs. */
export function ListingPhotoGallery({
  form,
  uploadPhoto,
}: {
  form: ListingForm;
  uploadPhoto: (
    file: File,
    options?: { crop?: CropRect },
  ) => Promise<{ key: string; previewUrl: string }>;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const { draft, photoPreviews, setPhoto, setPhotoPreview, setAlt } = form;

  return (
    <>
      <div className={styles.galGrid}>
        {GALLERY.map((slot) => (
          <ListingPhotoField
            key={slot.key}
            tint={slot.tint}
            height={slot.height}
            wide={slot.wide}
            placeholder={t(slot.captionKey)}
            displayValue={photoPreviews[slot.key] || draft.photos[slot.key]}
            uploadPhoto={uploadPhoto}
            onResolved={(persist, preview) => {
              setPhoto(slot.key, persist);
              setPhotoPreview(slot.key, preview);
            }}
            onRemove={() => {
              setPhoto(slot.key, "");
              setPhotoPreview(slot.key, "");
            }}
          />
        ))}
      </div>
      <div className={styles.altList}>
        {GALLERY.map((slot) => {
          const hasPhoto = Boolean(
            photoPreviews[slot.key] || draft.photos[slot.key],
          );
          // A photo with no alt text is inaccessible in the directory, so alt
          // becomes required the moment a slot is filled (item #8). Empty slots
          // never nag.
          const needsAlt = hasPhoto && !draft.alt[slot.key].trim();
          return (
            <div key={slot.key} className={styles.altRow}>
              <label className={styles.altK} htmlFor={`${fieldId}-${slot.key}`}>
                {t(ALT_LABEL_KEYS[slot.key])}
                {hasPhoto && (
                  <span className={styles.altReq} aria-hidden>
                    {" *"}
                  </span>
                )}
              </label>
              <input
                id={`${fieldId}-${slot.key}`}
                type="text"
                maxLength={100}
                required={hasPhoto}
                aria-required={hasPhoto}
                aria-invalid={needsAlt}
                placeholder={t(
                  hasPhoto
                    ? "marketing:listBusiness.step4.altPlaceholderRequired"
                    : "marketing:listBusiness.step4.altPlaceholder",
                )}
                value={draft.alt[slot.key]}
                onChange={(event) => setAlt(slot.key, event.target.value)}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
