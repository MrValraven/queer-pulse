import { useId } from "react";
import { FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ANCHOR, coverPhotoOf } from "./listBusiness.data";
import { listingKindOf } from "./listingMobile.data";
import type { ListingForm } from "./useListingForm";
import { ListingPhotoField } from "./ListingPhotoField";
import styles from "./ListBusinessPage.module.css";

/** The directory card's photo band, 392x168 (`LocalBusinessCardBody`). */
const CARD_COVER_ASPECT = "7 / 3";

/**
 * The listing's own cover for its directory card: one compact 7:3 slot and
 * its alt text, above the gallery. Optional: without a cover, the card shows
 * the wide shot (a place) or the first photo (online and out-and-about).
 * Carries `ANCHOR.cover`, so the alt-text chip and a refused upload can jump
 * straight here.
 */
export function ListingCoverPhotoField({ form }: { form: ListingForm }) {
  const { t } = useTranslation();
  const altInputId = useId();
  const helperId = useId();
  const {
    draft,
    coverPreview,
    setCoverPreview,
    setCoverPhoto,
    setCoverAlt,
    rejectedPhotoSlots,
  } = form;
  const coverPhoto = coverPhotoOf(draft);
  const hasCover = Boolean(coverPreview || coverPhoto.image);
  const isAltMissing = hasCover && !coverPhoto.alt.trim();
  const helperKey =
    listingKindOf(draft) === "place"
      ? "marketing:listBusiness.step4.coverHelper"
      : "marketing:listBusiness.step4.coverHelperFirstPhoto";

  return (
    <FormField
      className={styles.lbField}
      id={ANCHOR.cover}
      label={t("marketing:listBusiness.step4.coverLabel")}
      helper={t(helperKey)}
      helperId={helperId}
    >
      <div className={styles.coverSlot}>
        <ListingPhotoField
          kind="listing-cover"
          accessibleName={t("marketing:listBusiness.step4.coverLabel")}
          describedBy={helperId}
          height={150}
          aspectRatio={CARD_COVER_ASPECT}
          placeholder={t("marketing:listBusiness.step4.cover.placeholder")}
          displayValue={coverPreview || coverPhoto.image}
          persistedValue={coverPhoto.image}
          isRejectedByServer={rejectedPhotoSlots.includes("cover")}
          onResolved={(persist, preview) => {
            setCoverPhoto(persist);
            setCoverPreview(preview);
          }}
          onRemove={() => {
            setCoverPhoto("");
            setCoverPreview("");
            setCoverAlt("");
          }}
        />
      </div>
      <div className={styles.altList}>
        <div className={styles.altRow}>
          <label className={styles.altK} htmlFor={altInputId}>
            {t("marketing:listBusiness.step4.alt.cover")}
            {hasCover && (
              <span className={styles.altReq} aria-hidden>
                {" *"}
              </span>
            )}
          </label>
          <input
            id={altInputId}
            type="text"
            maxLength={100}
            required={hasCover}
            aria-required={hasCover}
            aria-invalid={isAltMissing}
            aria-describedby={helperId}
            placeholder={t(
              hasCover
                ? "marketing:listBusiness.step4.altPlaceholderRequired"
                : "marketing:listBusiness.step4.altPlaceholder",
            )}
            value={coverPhoto.alt}
            onChange={(event) => setCoverAlt(event.target.value)}
          />
        </div>
      </div>
    </FormField>
  );
}
