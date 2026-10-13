import { useId } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { type PhotoKey } from "./listBusiness.data";
import { listingKindOf } from "./listingMobile.data";
import { PHOTO_CAPTION_KEYS } from "./listingPhotoCaptions.data";
import type { ListingForm } from "./useListingForm";
import { ListingPhotoField } from "./ListingPhotoField";
import styles from "./ListBusinessPage.module.css";

const GALLERY: {
  key: PhotoKey;
  height: number;
  wide?: boolean;
}[] = [
  { key: "wide", height: 150, wide: true },
  {
    key: "d1",
    height: 110,
  },
  {
    key: "d2",
    height: 110,
  },
  {
    key: "vibe",
    height: 110,
  },
];

const ALT_LABEL_KEYS: Record<PhotoKey, string> = {
  wide: "marketing:listBusiness.step4.alt.wide",
  d1: "marketing:listBusiness.step4.alt.d1",
  d2: "marketing:listBusiness.step4.alt.d2",
  vibe: "marketing:listBusiness.step4.alt.vibe",
};

/** Step-4 photo gallery: four photo slots + their alt-text inputs. */
export function ListingPhotoGallery({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const fieldId = useId();
  const {
    draft,
    photoPreviews,
    rejectedPhotoSlots,
    setPhoto,
    setPhotoPreview,
    setAlt,
  } = form;
  const kind = listingKindOf(draft);

  return (
    <>
      <div className={styles.galGrid}>
        {GALLERY.map((slot) => (
          <ListingPhotoField
            key={slot.key}
            height={slot.height}
            wide={slot.wide}
            placeholder={t(PHOTO_CAPTION_KEYS[slot.key][kind])}
            displayValue={photoPreviews[slot.key] || draft.photos[slot.key]}
            persistedValue={draft.photos[slot.key]}
            isRejectedByServer={rejectedPhotoSlots.includes(slot.key)}
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
                {kind === "mobile"
                  ? t("marketing:listBusiness.step4.alt.forCaption", {
                      caption: t(PHOTO_CAPTION_KEYS[slot.key][kind]),
                    })
                  : t(ALT_LABEL_KEYS[slot.key])}
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
