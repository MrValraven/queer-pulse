import { useId } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { type PhotoKey } from "./listBusiness.data";
import type { ListingForm } from "./useListingForm";
import { ListingPhotoField } from "./ListingPhotoField";
import styles from "./ListBusinessPage.module.css";

/** The directory card's photo band: 168px tall (`LocalBusinessCardBody`) on a
 *  392px card (the live preview's column), so 7:3. The cover slot uses the same
 *  frame so the uploader crops the photo exactly like the card does. */
const CARD_COVER_ASPECT = "7 / 3";

const GALLERY: {
  key: PhotoKey;
  height: number;
  /** Overrides `height` with a fluid frame of this ratio. */
  aspectRatio?: string;
  wide?: boolean;
  captionKey: string;
  /** Standing note above the frame — only the cover slot carries one. */
  noteKey?: string;
}[] = [
  {
    key: "wide",
    height: 150,
    aspectRatio: CARD_COVER_ASPECT,
    wide: true,
    captionKey: "marketing:listBusiness.step4.gallery.wide",
    // The wide shot IS the directory cover: the backend's `coverPhoto` is the
    // first entry of the ordered gallery, and this slot writes it. Say so here
    // rather than leaving owners to discover it from the live grid.
    noteKey: "marketing:listBusiness.step4.gallery.wideNote",
  },
  {
    key: "d1",
    height: 110,
    captionKey: "marketing:listBusiness.step4.gallery.detail",
  },
  {
    key: "d2",
    height: 110,
    captionKey: "marketing:listBusiness.step4.gallery.detail",
  },
  {
    key: "vibe",
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

  return (
    <>
      <div className={styles.galGrid}>
        {GALLERY.map((slot) => (
          <ListingPhotoField
            key={slot.key}
            height={slot.height}
            aspectRatio={slot.aspectRatio}
            wide={slot.wide}
            placeholder={t(slot.captionKey)}
            note={slot.noteKey ? t(slot.noteKey) : undefined}
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
