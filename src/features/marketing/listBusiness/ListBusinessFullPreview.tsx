import { ImageSlot, Modal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  catLabel,
  initials,
  PRICES,
  type ListingDraft,
} from "./listBusiness.data";
import { ListBusinessPreviewDetails } from "./ListBusinessPreviewDetails";
import styles from "./ListBusinessPage.module.css";

/** Full-page preview of the listing as it will appear once live. */
export function ListBusinessFullPreview({
  draft,
  userName,
  onClose,
}: {
  draft: ListingDraft;
  userName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const price = PRICES.find((p) => p.id === draft.price);

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
                draft.hood,
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
            placeholder={t("marketing:listBusiness.step4.gallery.wide")}
            alt={draft.alt.wide}
          />
          <ImageSlot
            tint="jade"
            radius={16}
            height={120}
            placeholder={t("marketing:listBusiness.step4.gallery.detail")}
            alt={draft.alt.d1}
          />
          <ImageSlot
            tint="plum"
            radius={16}
            height={120}
            placeholder={t("marketing:listBusiness.step4.gallery.detail")}
            alt={draft.alt.d2}
          />
          <ImageSlot
            tint="coral"
            radius={16}
            height={120}
            placeholder={t("marketing:listBusiness.step4.gallery.vibe")}
            alt={draft.alt.vibe}
          />
        </div>

        {draft.blurb && <p className={styles.fpBlurb}>{draft.blurb}</p>}

        <ListBusinessPreviewDetails draft={draft} userName={userName} />
      </div>
    </Modal>
  );
}
