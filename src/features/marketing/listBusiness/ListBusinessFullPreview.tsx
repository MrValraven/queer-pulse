import { ImageSlot, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  catLabel,
  initials,
  PRICES,
  type ListingDraft,
  type PhotoKey,
} from "./listBusiness.data";
import {
  isMobileWithoutMeetingPoint,
  listingKindOf,
  mobileCardAreaLine,
  normalizeMobileDetails,
} from "./listingMobile.data";
import { normalizeOwnedBy, OWNED_BY_TAG_KEYS } from "./listingOwnedBy.data";
import { PHOTO_CAPTION_KEYS } from "./listingPhotoCaptions.data";
import { ListBusinessPreviewDetails } from "./ListBusinessPreviewDetails";
import styles from "./ListBusinessPage.module.css";

/** Full-page preview of the listing as it will appear once live. */
export function ListBusinessFullPreview({
  draft,
  userName,
  photoPreviews,
  onClose,
}: {
  draft: ListingDraft;
  userName: string;
  photoPreviews: Record<PhotoKey, string>;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const price = PRICES.find((p) => p.id === draft.price);
  // An online-only listing reads "Online" or "Online · {city}" where a place
  // names its neighbourhood, the same way its card will.
  const basedIn = (draft.city ?? "").trim();
  const onlineLocation = basedIn
    ? t("marketing:directory.card.onlineIn", { city: basedIn })
    : t("marketing:directory.card.online");
  // An out-and-about listing reads its area line, and a stale hood from a
  // place answer never shows while there is no meeting point.
  const kind = listingKindOf(draft);
  const isMobile = kind === "mobile";
  const hood = isMobileWithoutMeetingPoint(draft) ? "" : draft.hood;
  const areaLine = isMobile
    ? mobileCardAreaLine({
        hood,
        isAtMeetingPoint: !isMobileWithoutMeetingPoint(draft),
        details: normalizeMobileDetails(draft.mobileDetails),
      })
    : null;
  const locationText = areaLine
    ? t(areaLine.key, areaLine.values)
    : draft.online
      ? onlineLocation
      : hood;

  return (
    <Modal
      wide
      eyebrow={t("marketing:listBusiness.fullPreview.eyebrow")}
      title={draft.name || t("marketing:listBusiness.preview.placeholderName")}
      sub={t("marketing:listBusiness.fullPreview.sub")}
      onClose={onClose}
    >
      <div className={styles.fp}>
        <div className={styles.fpHeadRow}>
          <span className={styles.dirAv}>
            {draft.name ? initials(draft.name) : "+"}
          </span>
          <div>
            <div className={styles.fpMeta}>
              {[
                draft.cats.map((c) => catLabel(t, c)).join(", "),
                locationText,
                price ? t(price.labelKey) : "",
              ]
                .filter(Boolean)
                .join(" · ") ||
                t("marketing:listBusiness.preview.placeholderMeta")}
            </div>
            <div className={styles.dirBadgeRow}>
              {draft.badge === "owned" && (
                <span className={`${styles.dirBadge} ${styles.dirBadgeJade}`}>
                  {t("marketing:listBusiness.step1.owned.tag")}
                </span>
              )}
              {draft.badge === "friendly" && (
                <span className={`${styles.dirBadge} ${styles.dirBadgeCoral}`}>
                  {t("marketing:listBusiness.step1.friendly.tag")}
                </span>
              )}
              {normalizeOwnedBy(draft.ownedBy).map((value) => (
                <span
                  key={value}
                  className={`${styles.dirBadge} ${styles.dirBadgeViolet}`}
                >
                  {t(OWNED_BY_TAG_KEYS[value])}
                </span>
              ))}
              {price && (
                <span className={`${styles.dirBadge} ${styles.dirBadgePrice}`}>
                  {price.sym}
                </span>
              )}
            </div>
          </div>
        </div>

        {draft.tagline && <p className={styles.fpTagline}>{draft.tagline}</p>}

        <div className={styles.fpGallery}>
          <ImageSlot
            className={styles.fpGalWide}
            tint="coral"
            radius={16}
            height={200}
            src={photoPreviews.wide || draft.photos.wide || undefined}
            placeholder={t(PHOTO_CAPTION_KEYS.wide[kind])}
            alt={draft.alt.wide}
          />
          <ImageSlot
            tint="jade"
            radius={16}
            height={120}
            src={photoPreviews.d1 || draft.photos.d1 || undefined}
            placeholder={t(PHOTO_CAPTION_KEYS.d1[kind])}
            alt={draft.alt.d1}
          />
          <ImageSlot
            tint="plum"
            radius={16}
            height={120}
            src={photoPreviews.d2 || draft.photos.d2 || undefined}
            placeholder={t(PHOTO_CAPTION_KEYS.d2[kind])}
            alt={draft.alt.d2}
          />
          <ImageSlot
            tint="coral"
            radius={16}
            height={120}
            src={photoPreviews.vibe || draft.photos.vibe || undefined}
            placeholder={t(PHOTO_CAPTION_KEYS.vibe[kind])}
            alt={draft.alt.vibe}
          />
        </div>

        {draft.blurb && <p className={styles.fpBlurb}>{draft.blurb}</p>}

        <ListBusinessPreviewDetails draft={draft} userName={userName} />
      </div>
    </Modal>
  );
}
