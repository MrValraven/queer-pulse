import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { linkToPath } from "../../../app/routeMap";
import { useTranslation } from "../../i18n/useTranslation";
import { MEGA_NAV_ART } from "./megaNavArt";
import type { MegaMenu } from "./navMenus";
import styles from "./MegaNav.module.css";

/**
 * Right preview card of the mega panel: a per-menu monoline spot illustration
 * (cream stroke + one coral accent on a solid plum ground — see `megaNavArt`)
 * over the active section's feature promo (eyebrow / serif title / body / CTA).
 * The whole card links to the feature href; with no feature it renders the
 * illustration frame alone, unlinked. The art is decorative (aria-hidden) — the
 * promo copy beneath carries the meaning.
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

  const art = (
    <div className={styles.previewArt}>{MEGA_NAV_ART[activeMenu.key]}</div>
  );

  if (!feature) {
    return <div className={styles.preview}>{art}</div>;
  }

  return (
    <Link
      to={linkToPath(feature.href)}
      className={styles.preview}
      onClick={onClose}
    >
      {art}
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
