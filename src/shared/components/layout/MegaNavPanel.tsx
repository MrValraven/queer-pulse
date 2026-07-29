import { type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button } from "../ui";
import { linkToPath } from "../../../app/routeMap";
import { useTranslation } from "../../i18n/useTranslation";
import type { MegaMenu } from "./navMenus";
import styles from "./MegaNav.module.css";

/**
 * The dropdown panel portalled to `document.body` while a menu is open:
 * dismiss overlay, optional feature card, and the link columns. Split out of
 * `MegaNav` so each component stays under the line limit.
 */
export function MegaNavPanel({
  activeMenu,
  nudgeX,
  enterX,
  onClose,
  onPanelMouseEnter,
  onPanelMouseLeave,
}: {
  activeMenu: MegaMenu;
  nudgeX: number;
  enterX: string;
  onClose: () => void;
  onPanelMouseEnter: () => void;
  onPanelMouseLeave: () => void;
}) {
  const { t } = useTranslation();

  return createPortal(
    <>
      <div className={styles.overlay} role="presentation" onClick={onClose} />
      <div
        id="mega-panel"
        role="region"
        aria-label={t("shared:megaNav.panelAria", {
          menu: t(activeMenu.titleKey),
        })}
        className={styles.panel}
        style={{ "--nudge-x": `${nudgeX}px` } as CSSProperties}
        onMouseEnter={onPanelMouseEnter}
        onMouseLeave={onPanelMouseLeave}
      >
        <div
          key={activeMenu.key}
          className={styles.inner}
          style={{ "--enter-x": enterX } as CSSProperties}
        >
          {activeMenu.feature && (
            <Link
              to={linkToPath(activeMenu.feature.href)}
              className={styles.feature}
              onClick={onClose}
            >
              <span className={styles.featureEyebrow}>
                {t(activeMenu.feature.eyebrowKey)}
              </span>
              <span className={styles.featureTitle}>
                {t(activeMenu.feature.titleKey)}
              </span>
              <span className={styles.featureBody}>
                {t(activeMenu.feature.bodyKey)}
              </span>
              <span className={styles.featureCta}>
                {t(activeMenu.feature.ctaKey)}
                <span aria-hidden>
                  <FiArrowRight />
                </span>
              </span>
            </Link>
          )}
          {activeMenu.columns.map((column) => (
            <div className={styles.col} key={column.headKey}>
              <div className={styles.colHead}>{t(column.headKey)}</div>
              {column.links.map((link) => (
                <Link
                  key={link.labelKey}
                  to={linkToPath(link.href)}
                  className={[
                    styles.link,
                    link.featured && styles.linkFeatured,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={onClose}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              {column.cta && (
                <Button
                  to={linkToPath(column.cta.href)}
                  className={styles.cta}
                  onClick={onClose}
                >
                  {t(column.cta.labelKey)}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>,
    document.body,
  );
}
