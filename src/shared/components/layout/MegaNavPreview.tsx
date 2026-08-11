import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { ImageSlot } from "../ui";
import { linkToPath } from "../../../app/routeMap";
import { useTranslation } from "../../i18n/useTranslation";
import type { MegaMenu } from "./navMenus";
import styles from "./MegaNav.module.css";

/**
 * Right preview card of the mega panel: a tinted `<ImageSlot>` placeholder over
 * the active section's feature promo (eyebrow / serif title / body / CTA). The
 * whole card links to the feature href; with no feature it renders the image
 * frame alone, unlinked.
 */
export function MegaNavPreview({
  activeMenu,
  onClose,
}: {
  activeMenu: MegaMenu;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const feature = activeMenu.feature;

  const image = (
    <ImageSlot
      tint="plum"
      height={150}
      placeholder={t(activeMenu.previewCaptionKey)}
      className={styles.previewImage}
    />
  );

  if (!feature) {
    return <div className={styles.preview}>{image}</div>;
  }

  return (
    <Link
      to={linkToPath(feature.href)}
      className={styles.preview}
      onClick={onClose}
    >
      {image}
      <span className={styles.previewEyebrow}>{t(feature.eyebrowKey)}</span>
      <span className={styles.previewTitle}>{t(feature.titleKey)}</span>
      <span className={styles.previewBody}>{t(feature.bodyKey)}</span>
      <span className={styles.previewCta}>
        {t(feature.ctaKey)}
        <span aria-hidden>
          <FiArrowRight />
        </span>
      </span>
    </Link>
  );
}
